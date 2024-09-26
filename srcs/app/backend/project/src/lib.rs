use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

// Specify program ID
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const USER_DEFINED_DATA_SIZE: usize = 100;
const MAX_REFUNDABLE_SECONDS: i64 = 60 * 60 * 24 * 365;

#[program]
pub mod refundable_escrow {
    use super::*;

    // Initialize RefundableEscrowPDA and transfer lamports from buyer to PDA
    pub fn create_refundable_escrow(
        ctx: Context<CreateRefundableEscrow>,
        transaction_id: u64,
        lamports: u64,
        refundable_seconds: i64,
        user_defined_data: String,
    ) -> Result<()> {
        // init RefundableEscrowPDA
        let escrow = &mut ctx.accounts.escrow;
        escrow.seller_pubkey = ctx.accounts.seller.key();
        escrow.buyer_pubkey = ctx.accounts.buyer.key();
        escrow.transaction_id = transaction_id;
        escrow.lamports = lamports;
        escrow.is_canceled = false;

        // user defined data validate
        if user_defined_data.as_bytes().len() > USER_DEFINED_DATA_SIZE {
            return Err(ErrorCode::UserDefinedDataTooLarge.into());
        }
        escrow.user_defined_data = user_defined_data;

        // check (0 < refundable_seconds <= MAX_REFUNDABLE_SECONDS)
        if refundable_seconds <= 0 || refundable_seconds > MAX_REFUNDABLE_SECONDS {
            return Err(ErrorCode::RefundableSecondsError.into());
        }
        escrow.create_at = Clock::get()?.unix_timestamp;
        escrow.refund_deadline = escrow.create_at + refundable_seconds;

        // lamports transfer buyer -> RefundableEscrowPDA
        let from = ctx.accounts.buyer.to_account_info();
        let to = ctx.accounts.escrow.to_account_info();
        let system_program = ctx.accounts.system_program.to_account_info();
        transfer_lamports_to_pda(from, to, system_program, lamports)
    }

    // Refunds(Buyer) or Withdrawals(Seller)
    pub fn settle_lamports(ctx: Context<SettleLamports>) -> Result<()> {
        let from = ctx.accounts.escrow.to_account_info();
        let to = ctx.accounts.requestor.to_account_info();
        let lamports = ctx.accounts.escrow.lamports;
        let seller_pubkey = ctx.accounts.escrow.seller_pubkey;
        let buyer_pubkey = ctx.accounts.escrow.buyer_pubkey;
        let refund_deadline = ctx.accounts.escrow.refund_deadline;
        let now = Clock::get()?.unix_timestamp;

        // check RefundableEscrowPDA owner is this smart contractor?
        if from.owner != ctx.program_id {
            return Err(ErrorCode::InvalidAccountError.into());
        }

        match to.key() {
            key if key == buyer_pubkey => match now {
                // Buyer and within the refund period
                now if (now <= refund_deadline) => {
                    transfer_lamports_from_pda(&from, &to, lamports)?;
                    ctx.accounts.escrow.is_canceled = true;
                    Ok(())
                }
                // Refund could not be made because it was outside the refund period
                _ => Err(ErrorCode::RefundError.into()),
            },
            key if key == seller_pubkey => match now {
                // Seller and outside the refund period
                now if (refund_deadline < now) => transfer_lamports_from_pda(&from, &to, lamports),
                // Withdrawals not possible due to refund period
                _ => Err(ErrorCode::FundraisingError.into()),
            },
            // The account is neither buyer nor seller
            _ => return Err(ErrorCode::InvalidAccountError.into()),
        }
    }
}

// transfer from(UserAccount) -> to(PDA)
fn transfer_lamports_to_pda<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    lamports: u64,
) -> Result<()> {
    let ix = system_instruction::transfer(&from.key(), &to.key(), lamports);
    match invoke(&ix, &[from, to, system_program]) {
        Ok(_) => Ok(()),
        Err(_) => Err(ErrorCode::BuyerUnderfundedError.into()),
    }
}

// transfer from(PDA) -> to(UserAccount)
fn transfer_lamports_from_pda(from: &AccountInfo, to: &AccountInfo, lamports: u64) -> Result<()> {
    let mut from_lamports = from.try_borrow_mut_lamports()?;
    let mut to_lamports = to.try_borrow_mut_lamports()?;

    // Check whether the expected balance exists in the PDA
    if **from_lamports < lamports {
        return Err(ErrorCode::CashShortageError.into());
    }

    **from_lamports -= lamports;
    **to_lamports += lamports;
    Ok(())
}

#[derive(Accounts)]
#[instruction(transaction_id: u64)]
pub struct CreateRefundableEscrow<'info> {
    #[account(mut)]
    buyer: Signer<'info>,
    /// CHECK: money-back guarantee period allows for refunds within a certain period of time.
    seller: AccountInfo<'info>,

    #[account(
        init,
        // PDA is derived from buyer, seller and transaction ID
        seeds = [
            buyer.key().as_ref(),
            seller.key().as_ref(),
            &transaction_id.to_le_bytes()
        ],
        bump,
        payer = buyer,
        // Anchor's internal discriminator(8) + RefundableEscrow(32+32+8+8+8+8+1+4+USER_DEFINED_DATA_SIZE)
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + (4 + USER_DEFINED_DATA_SIZE),
    )]
    escrow: Account<'info, RefundableEscrow>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleLamports<'info> {
    // Buyer or Seller
    #[account(mut)]
    requestor: Signer<'info>,

    // PDA created by CreateRefundableEscrow
    #[account(mut)]
    escrow: Account<'info, RefundableEscrow>,
}

#[account]
pub struct RefundableEscrow {
    seller_pubkey: Pubkey,     // 32
    buyer_pubkey: Pubkey,      // 32
    transaction_id: u64,       // 8
    lamports: u64,             // 8
    create_at: i64,            // 8 (unix_timestamp)
    refund_deadline: i64,      // 8 (unix_timestamp)
    is_canceled: bool,         // 1
    user_defined_data: String, // 4 + (variable size)
}

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
    #[msg("There are not funds available to withdraw.")]
    CashShortageError,
    #[msg("User defined data size is too large.")]
    UserDefinedDataTooLarge,
    #[msg("Refundable seconds is invalid.")]
    RefundableSecondsError,
}
