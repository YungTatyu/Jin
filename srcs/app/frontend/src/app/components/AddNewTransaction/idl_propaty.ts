interface Instruction {
    name: string;
    accounts: Account[];
    args: Arg[];
  }
  
  interface Account {
    name: string;
    isMut: boolean;
    isSigner: boolean;
  }
  
  interface Arg {
    name: string;
    type: string;
  }
  
  interface AccountTypeField {
    name: string;
    type: string;
  }
  
  interface AccountType {
    kind: string;
    fields: AccountTypeField[];
  }
  
  interface AccountDefinition {
    name: string;
    type: AccountType;
  }
  
  interface ErrorDefinition {
    code: number;
    name: string;
    msg: string;
  }
  
  interface Metadata {
    address: string;
  }
  
  interface IDL {
    version: string;
    name: string;
    instructions: Instruction[];
    accounts: AccountDefinition[];
    errors: ErrorDefinition[];
    metadata: Metadata;
  }
  
  // 使用例
  const idl: IDL = {
    version: "0.1.0",
    name: "refundable_escrow",
    instructions: [
      {
        name: "createRefundableEscrow",
        accounts: [
          { name: "buyer", isMut: true, isSigner: true },
          { name: "seller", isMut: false, isSigner: false },
          { name: "escrow", isMut: true, isSigner: false },
          { name: "systemProgram", isMut: false, isSigner: false }
        ],
        args: [
          { name: "transactionId", type: "u64" },
          { name: "amountLamports", type: "u64" },
          { name: "refundableSeconds", type: "i64" },
          { name: "userDefinedData", type: "string" }
        ]
      },
      {
        name: "settleLamports",
        accounts: [
          { name: "requestor", isMut: true, isSigner: true },
          { name: "escrow", isMut: true, isSigner: false }
        ],
        args: []
      }
    ],
    accounts: [
      {
        name: "RefundableEscrow",
        type: {
          kind: "struct",
          fields: [
            { name: "sellerPubkey", type: "publicKey" },
            { name: "buyerPubkey", type: "publicKey" },
            { name: "transactionId", type: "u64" },
            { name: "amountLamports", type: "u64" },
            { name: "createAt", type: "i64" },
            { name: "refundDeadline", type: "i64" },
            { name: "isCanceled", type: "bool" },
            { name: "userDefinedData", type: "string" }
          ]
        }
      }
    ],
    errors: [
      { code: 6000, name: "BuyerUnderfundedError", msg: "Buyer doesn't hold the required lamports." },
      { code: 6001, name: "InvalidAccountError", msg: "Invalid account provided." },
      { code: 6002, name: "RefundError", msg: "Refund period has expired." },
      { code: 6003, name: "FundraisingError", msg: "Withdrawals are not available during thr refund period." },
      { code: 6004, name: "CashShortageError", msg: "There are no funds available to withdraw." },
      { code: 6005, name: "UserDefinedDataTooLarge", msg: "User defined data size is too large." },
      { code: 6006, name: "RefundableSecondsError", msg: "Refundable seconds is invalid." },
      { code: 6007, name: "AmountTooSmall", msg: "Transaction amount is too small." }
    ],
    metadata: {
      address: "5KYyXFWczLi5LxCxBYrNyh9zAWto9qzganr2yen4W2LC"
    }
  };
  