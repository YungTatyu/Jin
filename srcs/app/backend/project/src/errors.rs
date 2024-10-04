use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Buyer doesn't hold the required lamports.")]
    BuyerUnderfundedError,
    #[msg("Invalid account provided.")]
    InvalidAccountError,
    #[msg("Refund period has expired.")]
    RefundError,
    #[msg("Withdrawals are not available during thr refund period.")]
    FundraisingError,
    #[msg("There are no funds available to withdraw.")]
    CashShortageError,
    #[msg("User defined data size is too large.")]
    UserDefinedDataTooLarge,
    #[msg("Refundable seconds is invalid.")]
    RefundableSecondsError,
    #[msg("Transaction amount is too small.")]
    AmountTooSmall,
    #[msg("SOL cannot be transferred to the same account.")]
    SamePublicKeyError,
}
