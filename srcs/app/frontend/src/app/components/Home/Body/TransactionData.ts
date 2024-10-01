/*
PDAアカウント構造体のサイズ = 8bytes(Anchor's internal discriminator) + sizeof(RefundableEscrow)

#[account]
pub struct RefundableEscrow {
    pub seller_pubkey: Pubkey,     // 32
    pub buyer_pubkey: Pubkey,      // 32
    pub transaction_id: u64,       // 8
    pub amount_lamports: u64,      // 8
    pub create_at: i64,            // 8 (unix_timestamp)
    pub refund_deadline: i64,      // 8 (unix_timestamp)
    pub is_canceled: bool,         // 1
    pub user_defined_data: String, // 4 + 100(variable_size)
}
*/

export enum TransactionData {
  ANCHOR_INTERNAL_DESCRIMINATOR = 0,
  SELLER_PUBKEY = 8,
  BUYER_PUBKEY = 40,
  TRANSACTION_ID = 72,
  AMOUNT_LAMPORTS = 80,
  CREATE_AT = 88,
  REFUND_DEADLINE = 96,
  IS_CANCELED = 104,
  USER_DEFINED_DATA = 109,
}
