use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

// SolanaのProgram IDを指定
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod refundable_escrow {
    use super::*;

    pub fn create_refundable_escrow(
        ctx: Context<CreateRefundableEscrow>,
        transaction_id: u64,
        amount: u64,
        refundable_seconds: i64,
        user_defined_data: String,
    ) -> Result<()> {
        // init RefundableEscrowPDA
        let escrow = &mut ctx.accounts.escrow;
        escrow.seller_pubkey = ctx.accounts.seller.key();
        escrow.buyer_pubkey = ctx.accounts.buyer.key();
        escrow.transaction_id = transaction_id;
        escrow.amount = amount;
        escrow.create_at = Clock::get()?.unix_timestamp;
        escrow.refund_deadline = escrow.create_at + refundable_seconds;
        escrow.is_canceled = false;
        escrow.user_defined_data = user_defined_data;

        // SOL transfer buyer -> RefundableEscrowPDA
        let from = ctx.accounts.buyer.to_account_info();
        let to = ctx.accounts.escrow.to_account_info();
        let system_program = ctx.accounts.system_program.to_account_info();
        transfer_sol_to_pda(from, to, system_program, amount)
    }

    pub fn settle_sol(ctx: Context<SettleSol>) -> Result<()> {
        let from = ctx.accounts.escrow.to_account_info();
        let to = ctx.accounts.requestor.to_account_info();
        let amount = ctx.accounts.escrow.amount;
        let seller_pubkey = ctx.accounts.escrow.seller_pubkey;
        let buyer_pubkey = ctx.accounts.escrow.buyer_pubkey;
        let refund_deadline = ctx.accounts.escrow.refund_deadline;
        let now = Clock::get()?.unix_timestamp;

        match to.key() {
            key if key == buyer_pubkey => match now {
                now if (now <= refund_deadline) => transfer_sol_from_pda(&from, &to, amount),
                _ => Err(ErrorCode::RefundError.into()),
            },
            key if key == seller_pubkey => match now {
                now if (refund_deadline < now) => transfer_sol_from_pda(&from, &to, amount),
                _ => Err(ErrorCode::FundraisingError.into()),
            },
            _ => return Err(ErrorCode::InvalidAccountError.into()),
        }
    }
}

fn transfer_sol_to_pda<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let ix = system_instruction::transfer(&from.key(), &to.key(), amount);
    match invoke(&ix, &[from, to, system_program]) {
        Ok(_) => Ok(()),
        Err(_) => Err(ErrorCode::BuyerUnderfundedError.into()),
    }
}

fn transfer_sol_from_pda(from: &AccountInfo, to: &AccountInfo, amount: u64) -> Result<()> {
    if **from.try_borrow_lamports()? < amount {
        return Err(ErrorCode::CashShortageError.into());
    }
    **from.try_borrow_mut_lamports()? -= amount;
    **to.try_borrow_mut_lamports()? += amount;
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
        seeds = [
            buyer.key().as_ref(),
            seller.key().as_ref(),
            &transaction_id.to_le_bytes()
        ],
        bump,
        payer = buyer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 100,
    )]
    escrow: Account<'info, RefundableEscrow>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleSol<'info> {
    // buyer or seller
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
    amount: u64,               // 8
    create_at: i64,            // 8 (unix_timestamp)
    refund_deadline: i64,      // 8 (unix_timestamp)
    is_canceled: bool,         // 1
    user_defined_data: String, // (variable size)
}

#[error_code]
pub enum ErrorCode {
    #[msg("Buyer doesn't hold the required amount.")]
    BuyerUnderfundedError,
    #[msg("Invalid account provided.")]
    InvalidAccountError,
    #[msg("Refund period has expired.")]
    RefundError,
    #[msg("Withdrawals are not available during thr refund period.")]
    FundraisingError,
    #[msg("There are not funds available to withdraw.")]
    CashShortageError,
}
