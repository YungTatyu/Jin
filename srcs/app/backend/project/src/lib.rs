use anchor_lang::prelude::*;
use errors::ErrorCode;
use state::{RefundableEscrow, USER_DEFINED_DATA_SIZE};
use utils::{transfer_lamports_from_pda, transfer_lamports_to_pda};

mod errors;
mod state;
mod utils;

// Specify program ID
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const MAX_REFUNDABLE_SECONDS: i64 = 60 * 60 * 24 * 365;

#[program]
pub mod refundable_escrow {
    use super::*;

    // Initialize RefundableEscrowPDA and transfer lamports from buyer to PDA
    pub fn create_refundable_escrow(
        ctx: Context<CreateRefundableEscrow>,
        transaction_id: u64,
        amount_lamports: u64,
        refundable_seconds: i64,
        user_defined_data: String,
    ) -> Result<()> {
        // init RefundableEscrowPDA
        let escrow = &mut ctx.accounts.escrow;
        escrow.seller_pubkey = ctx.accounts.seller.key();
        escrow.buyer_pubkey = ctx.accounts.buyer.key();
        escrow.transaction_id = transaction_id;
        escrow.is_canceled = false;
        escrow.is_withdrawn = false;

        // check (Seller != Buyer)
        if ctx.accounts.seller.key() == ctx.accounts.buyer.key() {
            return Err(ErrorCode::SamePublicKeyError.into());
        }

        // amount validate
        if amount_lamports <= 0 {
            return Err(ErrorCode::AmountTooSmall.into());
        }
        escrow.amount_lamports = amount_lamports;

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
        transfer_lamports_to_pda(from, to, system_program, amount_lamports)
    }

    // Refunds(Buyer) or Withdrawals(Seller)
    pub fn settle_lamports(ctx: Context<SettleLamports>) -> Result<()> {
        let from = ctx.accounts.escrow.to_account_info();
        let to = ctx.accounts.requestor.to_account_info();
        let amount_lamports = ctx.accounts.escrow.amount_lamports;
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
                    transfer_lamports_from_pda(&from, &to, amount_lamports)?;
                    ctx.accounts.escrow.is_canceled = true;
                    Ok(())
                }
                // Refund could not be made because it was outside the refund period
                _ => Err(ErrorCode::RefundError.into()),
            },
            key if key == seller_pubkey => match now {
                // Seller and outside the refund period
                now if (refund_deadline < now) => {
                    transfer_lamports_from_pda(&from, &to, amount_lamports)?;
                    ctx.accounts.escrow.is_withdrawn = true;
                    Ok(())
                }
                // Withdrawals not possible due to refund period
                _ => Err(ErrorCode::FundraisingError.into()),
            },
            // The account is neither buyer nor seller
            _ => Err(ErrorCode::InvalidAccountError.into()),
        }
    }
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
        // In addition to the space for the account data,
        // you have to add 8 to the space constraint for Anchor's internal discriminator.
        // https://www.anchor-lang.com/docs/space
        space = 8 + RefundableEscrow::LEN,
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
