import { LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import { expect } from 'chai';

import {
  execCreateRefundableEscrow,
  execSettleLamports,
  ResultStatus,
} from './escrow';
import { sleep, getEscrowPDA, airdropLamports } from './utils';

describe('Refundable Escrow Program', () => {
  const PROVIDER = anchor.AnchorProvider.env();
  anchor.setProvider(PROVIDER);

  const SECONDS = 5;
  const SOL1 = 1 * LAMPORTS_PER_SOL; // 1SOL
  const SOL2 = 2 * LAMPORTS_PER_SOL; // 2SOL
  const AMOUNT_LAMPORTS = new BN(SOL1);
  const REFUNDABLE_SECONDS = new BN(SECONDS);
  const TRANSACTION_ID = new BN(1);
  const USER_DEFINED_DATA = 'TEST';
  const PROGRAM = anchor.workspace.RefundableEscrow;
  const PROGRAM_ID = PROGRAM.programId;

  it('should refund successfully', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    expect(await execSettleLamports(PROGRAM, buyer, escrowPDA)).to.equal(
      ResultStatus.SUCCESS
    );
  });

  it('should withdraw successfully', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    sleep(SECONDS + 2);
    expect(await execSettleLamports(PROGRAM, seller, escrowPDA)).to.equal(
      ResultStatus.SUCCESS
    );
  });

  it('should refund fail because it is outside refund period', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    sleep(SECONDS + 2);
    expect(await execSettleLamports(PROGRAM, buyer, escrowPDA)).to.equal(
      ResultStatus.ERROR
    );
  });

  it('should withdraw fail because it is inside refund period', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    expect(await execSettleLamports(PROGRAM, seller, escrowPDA)).to.equal(
      ResultStatus.ERROR
    );
  });

  it('should create PDA fail because amountLamports is negative', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );
    const negativeAmountLamports = -AMOUNT_LAMPORTS;

    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        negativeAmountLamports,
        REFUNDABLE_SECONDS,
        USER_DEFINED_DATA
      )
    ).to.equal(ResultStatus.ERROR);
  });

  it('should create PDA fail because amountLamports is zero', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );
    const zeroAmountLamports = new BN(0);

    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        zeroAmountLamports,
        REFUNDABLE_SECONDS,
        USER_DEFINED_DATA
      )
    ).to.equal(ResultStatus.ERROR);
  });

  it("should create PDA fail because buyer doesn't have enough amountLamports", async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, 1 * LAMPORTS_PER_SOL - 1);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        AMOUNT_LAMPORTS,
        REFUNDABLE_SECONDS,
        USER_DEFINED_DATA
      )
    ).to.equal(ResultStatus.ERROR);
  });

  it('should create PDA fail because refundable seconds too long', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );
    const tooLongRefundableSeconds = new BN(60 * 60 * 24 * 365 + 1);

    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        AMOUNT_LAMPORTS,
        tooLongRefundableSeconds,
        USER_DEFINED_DATA
      )
    ).to.equal(ResultStatus.ERROR);
  });

  it('should create PDA fail because refundable seconds too short', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );
    const tooShortRefundableSeconds = new BN(0);

    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        AMOUNT_LAMPORTS,
        tooShortRefundableSeconds,
        USER_DEFINED_DATA
      )
    ).to.equal(ResultStatus.ERROR);
  });

  it('should create PDA fail because userDefinedData too large', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );
    const tooLargeUserDefinedData = 'A'.repeat(101);

    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        AMOUNT_LAMPORTS,
        REFUNDABLE_SECONDS,
        tooLargeUserDefinedData
      )
    ).to.equal(ResultStatus.ERROR);
  });

  it('should refund fail because requestor is neigher the buyer nor seller', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    const other = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    await airdropLamports(PROVIDER, other, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    expect(await execSettleLamports(PROGRAM, other, escrowPDA)).to.equal(
      ResultStatus.ERROR
    );
  });

  it('should withdraw fail because requestor is neigher the buyer nor seller', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    const other = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    await airdropLamports(PROVIDER, other, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    sleep(SECONDS + 2);
    expect(await execSettleLamports(PROGRAM, other, escrowPDA)).to.equal(
      ResultStatus.ERROR
    );
  });

  it('should refund fail because refund was done multiple times', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    await execSettleLamports(PROGRAM, buyer, escrowPDA);
    expect(await execSettleLamports(PROGRAM, buyer, escrowPDA)).to.equal(
      ResultStatus.ERROR
    );
  });

  it('should refund fail because withdraw was done multiple times', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    sleep(SECONDS + 2);
    await execSettleLamports(PROGRAM, seller, escrowPDA);
    expect(await execSettleLamports(PROGRAM, seller, escrowPDA)).to.equal(
      ResultStatus.ERROR
    );
  });

  it('should create PDA fail because PDA already exists', async () => {
    const seller = new Keypair();
    const buyer = new Keypair();
    await airdropLamports(PROVIDER, buyer, SOL2);
    const escrowPDA = await getEscrowPDA(
      buyer,
      seller,
      TRANSACTION_ID,
      PROGRAM_ID
    );

    await execCreateRefundableEscrow(
      PROGRAM,
      buyer,
      seller,
      escrowPDA,
      TRANSACTION_ID,
      AMOUNT_LAMPORTS,
      REFUNDABLE_SECONDS,
      USER_DEFINED_DATA
    );
    expect(
      await execCreateRefundableEscrow(
        PROGRAM,
        buyer,
        seller,
        escrowPDA,
        TRANSACTION_ID,
        AMOUNT_LAMPORTS,
        REFUNDABLE_SECONDS,
        USER_DEFINED_DATA
      )
    ).to.equal(ResultStatus.ERROR);
  });
});
