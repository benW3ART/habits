use anchor_lang::prelude::*;

declare_id!("93KHLZAXkWKy6yAqoH8NNFDngShAr61sea3nVCnFJxCE");

#[program]
pub mod habits_escrow {
    use super::*;

    /// Initialize the admin config. Can only be called once.
    pub fn initialize(ctx: Context<Initialize>, treasury: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.treasury = treasury;
        config.bump = ctx.bumps.config;
        
        msg!("Config initialized. Admin: {}, Treasury: {}", config.admin, config.treasury);
        Ok(())
    }

    /// Update admin config (admin only)
    pub fn update_config(ctx: Context<UpdateConfig>, new_admin: Option<Pubkey>, new_treasury: Option<Pubkey>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        if let Some(admin) = new_admin {
            config.admin = admin;
            msg!("Admin updated to: {}", admin);
        }
        
        if let Some(treasury) = new_treasury {
            config.treasury = treasury;
            msg!("Treasury updated to: {}", treasury);
        }
        
        Ok(())
    }

    /// Create a new bet with escrow
    pub fn create_bet(
        ctx: Context<CreateBet>,
        bet_id: [u8; 32],
        amount: u64,
        habit_id: String,
        start_date: i64,
        end_date: i64,
        target_streak: u32,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(end_date > start_date, ErrorCode::InvalidDates);
        require!(habit_id.len() <= 64, ErrorCode::HabitIdTooLong);
        require!(target_streak > 0, ErrorCode::InvalidTargetStreak);

        // Get keys before borrowing mutably
        let user_key = ctx.accounts.user.key();
        let bet_key = ctx.accounts.bet.key();
        let user_info = ctx.accounts.user.to_account_info();
        let bet_info = ctx.accounts.bet.to_account_info();
        let system_info = ctx.accounts.system_program.to_account_info();
        let bet_bump = ctx.bumps.bet;
        let created_at = Clock::get()?.unix_timestamp;

        // Transfer SOL from user to bet PDA (escrow)
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &user_key,
            &bet_key,
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                user_info,
                bet_info,
                system_info,
            ],
        )?;

        // Now mutably borrow bet to set fields
        let bet = &mut ctx.accounts.bet;
        bet.user = user_key;
        bet.bet_id = bet_id;
        bet.amount = amount;
        bet.habit_id = habit_id.clone();
        bet.start_date = start_date;
        bet.end_date = end_date;
        bet.target_streak = target_streak;
        bet.status = BetStatus::Active;
        bet.bump = bet_bump;
        bet.created_at = created_at;

        msg!("Bet created: user={}, amount={} lamports, habit_id={}", 
            user_key, amount, habit_id);
        
        Ok(())
    }

    /// Complete a bet as won (admin only) - returns SOL to user
    pub fn complete_bet(ctx: Context<CompleteBet>) -> Result<()> {
        let bet = &ctx.accounts.bet;
        require!(bet.status == BetStatus::Active, ErrorCode::BetNotActive);

        let amount = bet.amount;
        let user_key = bet.user;
        
        // Transfer SOL from bet PDA back to user
        // Get the full lamport balance to close the account
        let bet_lamports = ctx.accounts.bet.to_account_info().lamports();
        
        **ctx.accounts.bet.to_account_info().try_borrow_mut_lamports()? = 0;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .user
            .to_account_info()
            .lamports()
            .checked_add(bet_lamports)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Bet completed as WON. {} lamports returned to user {}", amount, user_key);
        
        Ok(())
    }

    /// Forfeit a bet as lost (admin only) - sends SOL to treasury
    pub fn forfeit_bet(ctx: Context<ForfeitBet>) -> Result<()> {
        let bet = &ctx.accounts.bet;
        require!(bet.status == BetStatus::Active, ErrorCode::BetNotActive);

        let amount = bet.amount;
        let user_key = bet.user;
        
        // Transfer SOL from bet PDA to treasury
        // Get the full lamport balance to close the account
        let bet_lamports = ctx.accounts.bet.to_account_info().lamports();
        
        **ctx.accounts.bet.to_account_info().try_borrow_mut_lamports()? = 0;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .treasury
            .to_account_info()
            .lamports()
            .checked_add(bet_lamports)
            .ok_or(ErrorCode::Overflow)?;

        msg!("Bet forfeited. {} lamports sent to treasury. User: {}", amount, user_key);
        
        Ok(())
    }
}

// ============ ACCOUNTS ============

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, Config>,
    
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(bet_id: [u8; 32])]
pub struct CreateBet<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", user.key().as_ref(), &bet_id],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteBet<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, Config>,
    
    #[account(
        mut,
        seeds = [b"bet", bet.user.as_ref(), &bet.bet_id],
        bump = bet.bump,
        close = user
    )]
    pub bet: Account<'info, Bet>,
    
    /// CHECK: This is the user who created the bet, verified by bet.user constraint
    #[account(
        mut,
        constraint = user.key() == bet.user @ ErrorCode::InvalidUser
    )]
    pub user: AccountInfo<'info>,
    
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct ForfeitBet<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = admin @ ErrorCode::Unauthorized,
        has_one = treasury @ ErrorCode::InvalidTreasury
    )]
    pub config: Account<'info, Config>,
    
    #[account(
        mut,
        seeds = [b"bet", bet.user.as_ref(), &bet.bet_id],
        bump = bet.bump,
        close = treasury
    )]
    pub bet: Account<'info, Bet>,
    
    /// CHECK: This is the treasury wallet from config
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    pub admin: Signer<'info>,
}

// ============ STATE ============

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub user: Pubkey,
    pub bet_id: [u8; 32],
    pub amount: u64,
    #[max_len(64)]
    pub habit_id: String,
    pub start_date: i64,
    pub end_date: i64,
    pub target_streak: u32,
    pub status: BetStatus,
    pub bump: u8,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum BetStatus {
    Active,
    Won,
    Lost,
}

impl Default for BetStatus {
    fn default() -> Self {
        BetStatus::Active
    }
}

// ============ ERRORS ============

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only admin can perform this action")]
    Unauthorized,
    #[msg("Invalid amount: Must be greater than 0")]
    InvalidAmount,
    #[msg("Invalid dates: End date must be after start date")]
    InvalidDates,
    #[msg("Habit ID too long: Maximum 64 characters")]
    HabitIdTooLong,
    #[msg("Invalid target streak: Must be greater than 0")]
    InvalidTargetStreak,
    #[msg("Bet not active: Already resolved")]
    BetNotActive,
    #[msg("Invalid user: Account does not match bet user")]
    InvalidUser,
    #[msg("Invalid treasury: Account does not match config treasury")]
    InvalidTreasury,
    #[msg("Arithmetic overflow")]
    Overflow,
}
