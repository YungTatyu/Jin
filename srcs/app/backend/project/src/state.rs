use anchor_lang::prelude::*;

pub const USER_DEFINED_DATA_SIZE: usize = 100;

#[account]
pub struct RefundableEscrow {
    pub seller_pubkey: Pubkey,     // 32
    pub buyer_pubkey: Pubkey,      // 32
    pub transaction_id: u64,       // 8
    pub amount_lamports: u64,      // 8
    pub create_at: i64,            // 8 (unix_timestamp)
    pub refund_deadline: i64,      // 8 (unix_timestamp)
    pub is_canceled: bool,         // 1
    pub user_defined_data: String, // 4 + variable_size
}

impl RefundableEscrow {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 1 + 4 + USER_DEFINED_DATA_SIZE;
}
