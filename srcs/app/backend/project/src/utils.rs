use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

// transfer from(UserAccount) -> to(PDA)
pub fn transfer_lamports_to_pda<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    amount_lamports: u64,
) -> Result<()> {
    let ix = system_instruction::transfer(&from.key(), &to.key(), amount_lamports);
    match invoke(&ix, &[from, to, system_program]) {
        Ok(_) => Ok(()),
        Err(_) => Err(ErrorCode::BuyerUnderfundedError.into()),
    }
}

// transfer from(PDA) -> to(UserAccount)
pub fn transfer_lamports_from_pda(
    from: &AccountInfo,
    to: &AccountInfo,
    amount_lamports: u64,
) -> Result<()> {
    let mut from_lamports = from.try_borrow_mut_lamports()?;
    let mut to_lamports = to.try_borrow_mut_lamports()?;

    // Check whether the expected balance exists in the PDA
    if **from_lamports < amount_lamports {
        return Err(ErrorCode::CashShortageError.into());
    }

    **from_lamports -= amount_lamports;
    **to_lamports += amount_lamports;
    Ok(())
}
