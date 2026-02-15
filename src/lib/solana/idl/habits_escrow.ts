/**
 * Program IDL in camelCase format for the habits_escrow program.
 *
 * Note: This is automatically generated, do not edit.
 */
export type HabitsEscrow = {
  address: string;
  metadata: {
    name: "habitsEscrow";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Habits betting escrow smart contract";
  };
  instructions: [
    {
      name: "completeBet";
      docs: ["Complete a bet as won (admin only) - returns SOL to user"];
      discriminator: [9, 186, 23, 8, 143, 112, 165, 147];
      accounts: [
        { name: "config" },
        { name: "bet"; writable: true },
        { name: "user"; writable: true },
        { name: "admin"; signer: true }
      ];
      args: [];
    },
    {
      name: "createBet";
      docs: ["Create a new bet with escrow"];
      discriminator: [197, 42, 153, 2, 59, 63, 143, 246];
      accounts: [
        { name: "config" },
        { name: "bet"; writable: true },
        { name: "user"; writable: true; signer: true },
        { name: "systemProgram" }
      ];
      args: [
        { name: "betId"; type: { array: ["u8", 32] } },
        { name: "amount"; type: "u64" },
        { name: "habitId"; type: "string" },
        { name: "startDate"; type: "i64" },
        { name: "endDate"; type: "i64" },
        { name: "targetStreak"; type: "u32" }
      ];
    },
    {
      name: "forfeitBet";
      docs: ["Forfeit a bet as lost (admin only) - sends SOL to treasury"];
      discriminator: [93, 202, 254, 108, 74, 139, 228, 2];
      accounts: [
        { name: "config" },
        { name: "bet"; writable: true },
        { name: "treasury"; writable: true },
        { name: "admin"; signer: true }
      ];
      args: [];
    },
    {
      name: "initialize";
      docs: ["Initialize the admin config. Can only be called once."];
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        { name: "config"; writable: true },
        { name: "admin"; writable: true; signer: true },
        { name: "systemProgram" }
      ];
      args: [{ name: "treasury"; type: "pubkey" }];
    },
    {
      name: "updateConfig";
      docs: ["Update admin config (admin only)"];
      discriminator: [29, 158, 252, 191, 10, 83, 219, 99];
      accounts: [
        { name: "config"; writable: true },
        { name: "admin"; signer: true }
      ];
      args: [
        { name: "newAdmin"; type: { option: "pubkey" } },
        { name: "newTreasury"; type: { option: "pubkey" } }
      ];
    }
  ];
  accounts: [
    {
      name: "Bet";
      discriminator: [147, 23, 35, 59, 15, 75, 155, 32];
    },
    {
      name: "Config";
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130];
    }
  ];
  errors: [
    { code: 6000; name: "Unauthorized"; msg: "Unauthorized: Only admin can perform this action" },
    { code: 6001; name: "InvalidAmount"; msg: "Invalid amount: Must be greater than 0" },
    { code: 6002; name: "InvalidDates"; msg: "Invalid dates: End date must be after start date" },
    { code: 6003; name: "HabitIdTooLong"; msg: "Habit ID too long: Maximum 64 characters" },
    { code: 6004; name: "InvalidTargetStreak"; msg: "Invalid target streak: Must be greater than 0" },
    { code: 6005; name: "BetNotActive"; msg: "Bet not active: Already resolved" },
    { code: 6006; name: "InvalidUser"; msg: "Invalid user: Account does not match bet user" },
    { code: 6007; name: "InvalidTreasury"; msg: "Invalid treasury: Account does not match config treasury" },
    { code: 6008; name: "Overflow"; msg: "Arithmetic overflow" }
  ];
  types: [
    {
      name: "Bet";
      type: {
        kind: "struct";
        fields: [
          { name: "user"; type: "pubkey" },
          { name: "betId"; type: { array: ["u8", 32] } },
          { name: "amount"; type: "u64" },
          { name: "habitId"; type: "string" },
          { name: "startDate"; type: "i64" },
          { name: "endDate"; type: "i64" },
          { name: "targetStreak"; type: "u32" },
          { name: "status"; type: { defined: { name: "BetStatus" } } },
          { name: "bump"; type: "u8" },
          { name: "createdAt"; type: "i64" }
        ];
      };
    },
    {
      name: "BetStatus";
      type: {
        kind: "enum";
        variants: [{ name: "Active" }, { name: "Won" }, { name: "Lost" }];
      };
    },
    {
      name: "Config";
      type: {
        kind: "struct";
        fields: [
          { name: "admin"; type: "pubkey" },
          { name: "treasury"; type: "pubkey" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
};

// Account types
export interface BetAccount {
  user: string;
  betId: number[];
  amount: bigint;
  habitId: string;
  startDate: bigint;
  endDate: bigint;
  targetStreak: number;
  status: BetStatus;
  bump: number;
  createdAt: bigint;
}

export interface ConfigAccount {
  admin: string;
  treasury: string;
  bump: number;
}

export type BetStatus = { active: {} } | { won: {} } | { lost: {} };

// IDL JSON for runtime usage
export const IDL: HabitsEscrow = {
  address: "93KHLZAXkWKy6yAqoH8NNFDngShAr61sea3nVCnFJxCE",
  metadata: {
    name: "habitsEscrow",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Habits betting escrow smart contract",
  },
  instructions: [
    {
      name: "completeBet",
      docs: ["Complete a bet as won (admin only) - returns SOL to user"],
      discriminator: [9, 186, 23, 8, 143, 112, 165, 147],
      accounts: [
        { name: "config" },
        { name: "bet", writable: true },
        { name: "user", writable: true },
        { name: "admin", signer: true },
      ],
      args: [],
    },
    {
      name: "createBet",
      docs: ["Create a new bet with escrow"],
      discriminator: [197, 42, 153, 2, 59, 63, 143, 246],
      accounts: [
        { name: "config" },
        { name: "bet", writable: true },
        { name: "user", writable: true, signer: true },
        { name: "systemProgram" },
      ],
      args: [
        { name: "betId", type: { array: ["u8", 32] } },
        { name: "amount", type: "u64" },
        { name: "habitId", type: "string" },
        { name: "startDate", type: "i64" },
        { name: "endDate", type: "i64" },
        { name: "targetStreak", type: "u32" },
      ],
    },
    {
      name: "forfeitBet",
      docs: ["Forfeit a bet as lost (admin only) - sends SOL to treasury"],
      discriminator: [93, 202, 254, 108, 74, 139, 228, 2],
      accounts: [
        { name: "config" },
        { name: "bet", writable: true },
        { name: "treasury", writable: true },
        { name: "admin", signer: true },
      ],
      args: [],
    },
    {
      name: "initialize",
      docs: ["Initialize the admin config. Can only be called once."],
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        { name: "config", writable: true },
        { name: "admin", writable: true, signer: true },
        { name: "systemProgram" },
      ],
      args: [{ name: "treasury", type: "pubkey" }],
    },
    {
      name: "updateConfig",
      docs: ["Update admin config (admin only)"],
      discriminator: [29, 158, 252, 191, 10, 83, 219, 99],
      accounts: [
        { name: "config", writable: true },
        { name: "admin", signer: true },
      ],
      args: [
        { name: "newAdmin", type: { option: "pubkey" } },
        { name: "newTreasury", type: { option: "pubkey" } },
      ],
    },
  ],
  accounts: [
    { name: "Bet", discriminator: [147, 23, 35, 59, 15, 75, 155, 32] },
    { name: "Config", discriminator: [155, 12, 170, 224, 30, 250, 204, 130] },
  ],
  errors: [
    { code: 6000, name: "Unauthorized", msg: "Unauthorized: Only admin can perform this action" },
    { code: 6001, name: "InvalidAmount", msg: "Invalid amount: Must be greater than 0" },
    { code: 6002, name: "InvalidDates", msg: "Invalid dates: End date must be after start date" },
    { code: 6003, name: "HabitIdTooLong", msg: "Habit ID too long: Maximum 64 characters" },
    { code: 6004, name: "InvalidTargetStreak", msg: "Invalid target streak: Must be greater than 0" },
    { code: 6005, name: "BetNotActive", msg: "Bet not active: Already resolved" },
    { code: 6006, name: "InvalidUser", msg: "Invalid user: Account does not match bet user" },
    { code: 6007, name: "InvalidTreasury", msg: "Invalid treasury: Account does not match config treasury" },
    { code: 6008, name: "Overflow", msg: "Arithmetic overflow" },
  ],
  types: [
    {
      name: "Bet",
      type: {
        kind: "struct",
        fields: [
          { name: "user", type: "pubkey" },
          { name: "betId", type: { array: ["u8", 32] } },
          { name: "amount", type: "u64" },
          { name: "habitId", type: "string" },
          { name: "startDate", type: "i64" },
          { name: "endDate", type: "i64" },
          { name: "targetStreak", type: "u32" },
          { name: "status", type: { defined: { name: "BetStatus" } } },
          { name: "bump", type: "u8" },
          { name: "createdAt", type: "i64" },
        ],
      },
    },
    {
      name: "BetStatus",
      type: {
        kind: "enum",
        variants: [{ name: "Active" }, { name: "Won" }, { name: "Lost" }],
      },
    },
    {
      name: "Config",
      type: {
        kind: "struct",
        fields: [
          { name: "admin", type: "pubkey" },
          { name: "treasury", type: "pubkey" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
};
