import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { HabitsEscrow } from "../target/types/habits_escrow";
import * as crypto from "crypto";

describe("habits_escrow", () => {
  // Configure the client to use the devnet cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HabitsEscrow as Program<HabitsEscrow>;
  
  // Admin wallet (the deploy wallet)
  const admin = provider.wallet;
  
  // Treasury wallet for receiving forfeited bets
  const treasury = Keypair.generate();
  
  // Test user wallet
  const user = Keypair.generate();
  
  // Config PDA
  let configPda: PublicKey;
  let configBump: number;
  
  // Test bet data
  const betAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL
  const habitId = "test-habit-123";
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 7 * 24 * 60 * 60; // 7 days
  const targetStreak = 7;

  // Generate a unique bet ID
  function generateBetId(): Uint8Array {
    return Uint8Array.from(crypto.randomBytes(32));
  }

  // Get bet PDA
  function getBetPda(userKey: PublicKey, betId: Uint8Array): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), userKey.toBuffer(), Buffer.from(betId)],
      program.programId
    );
  }

  before(async () => {
    // Find config PDA
    [configPda, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    // Airdrop SOL to test user
    const airdropSig = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig, "confirmed");

    // Airdrop SOL to treasury for rent
    const treasuryAirdropSig = await provider.connection.requestAirdrop(
      treasury.publicKey,
      0.1 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(treasuryAirdropSig, "confirmed");

    console.log("Program ID:", program.programId.toString());
    console.log("Admin:", admin.publicKey.toString());
    console.log("Treasury:", treasury.publicKey.toString());
    console.log("User:", user.publicKey.toString());
    console.log("Config PDA:", configPda.toString());
  });

  describe("initialize", () => {
    it("initializes the config", async () => {
      try {
        await program.methods
          .initialize(treasury.publicKey)
          .accounts({
            config: configPda,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        const config = await program.account.config.fetch(configPda);
        expect(config.admin.toString()).to.equal(admin.publicKey.toString());
        expect(config.treasury.toString()).to.equal(treasury.publicKey.toString());
        console.log("Config initialized successfully");
      } catch (e: any) {
        // If already initialized, that's fine for re-running tests
        if (!e.message.includes("already in use")) {
          throw e;
        }
        console.log("Config already initialized");
      }
    });
  });

  describe("create_bet", () => {
    let betId: Uint8Array;
    let betPda: PublicKey;

    before(() => {
      betId = generateBetId();
      [betPda] = getBetPda(user.publicKey, betId);
    });

    it("creates a bet with escrow", async () => {
      const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
      
      await program.methods
        .createBet(
          Array.from(betId) as number[],
          new anchor.BN(betAmount),
          habitId,
          new anchor.BN(startDate),
          new anchor.BN(endDate),
          targetStreak
        )
        .accounts({
          config: configPda,
          bet: betPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const bet = await program.account.bet.fetch(betPda);
      expect(bet.user.toString()).to.equal(user.publicKey.toString());
      expect(bet.amount.toNumber()).to.equal(betAmount);
      expect(bet.habitId).to.equal(habitId);
      expect(bet.targetStreak).to.equal(targetStreak);
      expect(bet.status).to.deep.equal({ active: {} });

      const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
      // Balance should be reduced by bet amount + rent
      expect(userBalanceBefore - userBalanceAfter).to.be.greaterThan(betAmount);
      
      console.log("Bet created successfully");
      console.log("Bet PDA:", betPda.toString());
      console.log("Amount escrowed:", betAmount / LAMPORTS_PER_SOL, "SOL");
    });

    it("fails to create bet with zero amount", async () => {
      const newBetId = generateBetId();
      const [newBetPda] = getBetPda(user.publicKey, newBetId);

      try {
        await program.methods
          .createBet(
            Array.from(newBetId) as number[],
            new anchor.BN(0),
            habitId,
            new anchor.BN(startDate),
            new anchor.BN(endDate),
            targetStreak
          )
          .accounts({
            config: configPda,
            bet: newBetPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.error.errorMessage).to.equal("Invalid amount: Must be greater than 0");
      }
    });

    it("fails to create bet with invalid dates", async () => {
      const newBetId = generateBetId();
      const [newBetPda] = getBetPda(user.publicKey, newBetId);

      try {
        await program.methods
          .createBet(
            Array.from(newBetId) as number[],
            new anchor.BN(betAmount),
            habitId,
            new anchor.BN(endDate), // start after end
            new anchor.BN(startDate),
            targetStreak
          )
          .accounts({
            config: configPda,
            bet: newBetPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.error.errorMessage).to.equal("Invalid dates: End date must be after start date");
      }
    });
  });

  describe("complete_bet", () => {
    let betId: Uint8Array;
    let betPda: PublicKey;

    before(async () => {
      // Create a new bet to complete
      betId = generateBetId();
      [betPda] = getBetPda(user.publicKey, betId);

      await program.methods
        .createBet(
          Array.from(betId) as number[],
          new anchor.BN(betAmount),
          habitId,
          new anchor.BN(startDate),
          new anchor.BN(endDate),
          targetStreak
        )
        .accounts({
          config: configPda,
          bet: betPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    });

    it("completes bet and returns SOL to user (admin only)", async () => {
      const userBalanceBefore = await provider.connection.getBalance(user.publicKey);

      await program.methods
        .completeBet()
        .accounts({
          config: configPda,
          bet: betPda,
          user: user.publicKey,
          admin: admin.publicKey,
        })
        .rpc();

      const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
      // User should get back the bet amount + rent
      expect(userBalanceAfter).to.be.greaterThan(userBalanceBefore);

      // Bet account should be closed
      const betAccount = await provider.connection.getAccountInfo(betPda);
      expect(betAccount).to.be.null;
      
      console.log("Bet completed successfully");
      console.log("User balance increased by:", (userBalanceAfter - userBalanceBefore) / LAMPORTS_PER_SOL, "SOL");
    });

    it("fails when non-admin tries to complete", async () => {
      // Create another bet
      const newBetId = generateBetId();
      const [newBetPda] = getBetPda(user.publicKey, newBetId);

      await program.methods
        .createBet(
          Array.from(newBetId) as number[],
          new anchor.BN(betAmount),
          habitId,
          new anchor.BN(startDate),
          new anchor.BN(endDate),
          targetStreak
        )
        .accounts({
          config: configPda,
          bet: newBetPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      try {
        await program.methods
          .completeBet()
          .accounts({
            config: configPda,
            bet: newBetPda,
            user: user.publicKey,
            admin: user.publicKey, // User trying to be admin
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.error.errorMessage).to.equal("Unauthorized: Only admin can perform this action");
      }
    });
  });

  describe("forfeit_bet", () => {
    let betId: Uint8Array;
    let betPda: PublicKey;

    before(async () => {
      // Create a new bet to forfeit
      betId = generateBetId();
      [betPda] = getBetPda(user.publicKey, betId);

      await program.methods
        .createBet(
          Array.from(betId) as number[],
          new anchor.BN(betAmount),
          habitId,
          new anchor.BN(startDate),
          new anchor.BN(endDate),
          targetStreak
        )
        .accounts({
          config: configPda,
          bet: betPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    });

    it("forfeits bet and sends SOL to treasury (admin only)", async () => {
      const treasuryBalanceBefore = await provider.connection.getBalance(treasury.publicKey);

      await program.methods
        .forfeitBet()
        .accounts({
          config: configPda,
          bet: betPda,
          treasury: treasury.publicKey,
          admin: admin.publicKey,
        })
        .rpc();

      const treasuryBalanceAfter = await provider.connection.getBalance(treasury.publicKey);
      // Treasury should receive the bet amount + rent
      expect(treasuryBalanceAfter).to.be.greaterThan(treasuryBalanceBefore);

      // Bet account should be closed
      const betAccount = await provider.connection.getAccountInfo(betPda);
      expect(betAccount).to.be.null;
      
      console.log("Bet forfeited successfully");
      console.log("Treasury balance increased by:", (treasuryBalanceAfter - treasuryBalanceBefore) / LAMPORTS_PER_SOL, "SOL");
    });

    it("fails with wrong treasury account", async () => {
      // Create another bet
      const newBetId = generateBetId();
      const [newBetPda] = getBetPda(user.publicKey, newBetId);
      const fakeTreasury = Keypair.generate();

      await program.methods
        .createBet(
          Array.from(newBetId) as number[],
          new anchor.BN(betAmount),
          habitId,
          new anchor.BN(startDate),
          new anchor.BN(endDate),
          targetStreak
        )
        .accounts({
          config: configPda,
          bet: newBetPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      try {
        await program.methods
          .forfeitBet()
          .accounts({
            config: configPda,
            bet: newBetPda,
            treasury: fakeTreasury.publicKey, // Wrong treasury
            admin: admin.publicKey,
          })
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.error.errorMessage).to.equal("Invalid treasury: Account does not match config treasury");
      }
    });
  });

  describe("update_config", () => {
    it("updates admin (admin only)", async () => {
      const newAdmin = Keypair.generate();
      
      await program.methods
        .updateConfig(newAdmin.publicKey, null)
        .accounts({
          config: configPda,
          admin: admin.publicKey,
        })
        .rpc();

      let config = await program.account.config.fetch(configPda);
      expect(config.admin.toString()).to.equal(newAdmin.publicKey.toString());

      // Revert back to original admin
      await program.methods
        .updateConfig(admin.publicKey, null)
        .accounts({
          config: configPda,
          admin: newAdmin.publicKey,
        })
        .signers([newAdmin])
        .rpc();

      config = await program.account.config.fetch(configPda);
      expect(config.admin.toString()).to.equal(admin.publicKey.toString());
      
      console.log("Config admin updated and reverted successfully");
    });

    it("updates treasury (admin only)", async () => {
      const newTreasury = Keypair.generate();
      
      await program.methods
        .updateConfig(null, newTreasury.publicKey)
        .accounts({
          config: configPda,
          admin: admin.publicKey,
        })
        .rpc();

      let config = await program.account.config.fetch(configPda);
      expect(config.treasury.toString()).to.equal(newTreasury.publicKey.toString());

      // Revert back to original treasury
      await program.methods
        .updateConfig(null, treasury.publicKey)
        .accounts({
          config: configPda,
          admin: admin.publicKey,
        })
        .rpc();

      config = await program.account.config.fetch(configPda);
      expect(config.treasury.toString()).to.equal(treasury.publicKey.toString());
      
      console.log("Config treasury updated and reverted successfully");
    });
  });
});
