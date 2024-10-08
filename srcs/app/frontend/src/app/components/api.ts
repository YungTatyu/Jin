//import { SystemProgram, PublicKey, Connection, Wallet, Transaction } from "@solana/web3.js";
import {
  SystemProgram,
  PublicKey,
  Connection,
  Transaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
//import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { SOLANA_NETWORK, PROGRAM_ID } from '../../constant';
import { BigNumber } from 'bignumber.js';

// ローカルのsolana-test-validatorを指定
const CONNECTION = new Connection(SOLANA_NETWORK, 'confirmed');
// anchor build 後に作成されるインターフェースファイル
const IDL = require('../../refundable_escrow.json');

export async function addNewTransaction(
  wallet: AnchorWallet, // useWallet()で取得
  signTransaction: (transaction: Transaction) => Promise<Transaction>, // useWallet()で取得
  buyerPubkey: PublicKey, // useWallet()で取得
  sellerPubkey: PublicKey, // new PublicKey(Userによる入力文字列);
  transactionId: number, // 連番
  amountLamports: BigNumber, // new Number(Userによる入力数値);
  refundableSeconds: BigNumber, // new Number(Userによる入力数値);
  userDefinedData: string // Userによる入力文字列
): Promise<boolean> {
  const provider = new AnchorProvider(CONNECTION, wallet, {
    preflightCommitment: 'processed',
  });
  const program = new Program(IDL, PROGRAM_ID, provider);
  const escrowPDA = await getEscrowPDA(
    buyerPubkey,
    sellerPubkey,
    transactionId,
    PROGRAM_ID
  );
  try {
    const tx = await program.methods
      .createRefundableEscrow(
        new BN(transactionId.toString()),
        new BN(amountLamports.toString()),
        new BN(refundableSeconds.toString()),
        userDefinedData
      )
      .accounts({
        buyer: buyerPubkey,
        seller: sellerPubkey,
        escrow: escrowPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    const { blockhash } = await CONNECTION.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey; // 手数料の支払者を設定
    // recentBlockhashを取得し設定
    const signedTransaction = await signTransaction(tx);
    const signature = await CONNECTION.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'processed',
      }
    );
    await CONNECTION.confirmTransaction(signature, 'processed');
    return true;
  } catch (e) {
    alert(`Error: ${e}`);
    return false;
  }
}

export async function settleTransaction(
  wallet: AnchorWallet, // useWallet()で取得
  signTransaction: (transaction: Transaction) => Promise<Transaction>, // useWallet()で取得
  requestorPubkey: PublicKey, // useWallet()で取得
  buyerPubkey: PublicKey, // next.jsの内部に保存されている？
  sellerPubkey: PublicKey, // next.jsの内部に保存されている？
  transactionId: number // next.jsの内部に保存されている？
): Promise<boolean> {
  const provider = new AnchorProvider(CONNECTION, wallet, {
    preflightCommitment: 'processed',
  });
  const program = new Program(IDL, PROGRAM_ID, provider);
  const escrowPDA = await getEscrowPDA(
    buyerPubkey,
    sellerPubkey,
    transactionId,
    PROGRAM_ID
  );

  try {
    const tx = await program.methods
      .settleLamports()
      .accounts({
        requestor: requestorPubkey,
        escrow: escrowPDA,
      })
      .transaction();

    const { blockhash } = await CONNECTION.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey; // 手数料の支払者を設定

    const signedTransaction = await signTransaction(tx);
    const signature = await CONNECTION.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'processed',
      }
    );
    await CONNECTION.confirmTransaction(signature, 'processed');
    return true;
  } catch {
    return false;
  }
}

export async function getEscrowPDA(
  buyerPubkey: PublicKey,
  sellerPubkey: PublicKey,
  transactionId: number,
  programId: PublicKey
) {
  const transactionIdBuffer = Buffer.alloc(8);
  transactionIdBuffer.writeBigInt64LE(BigInt(transactionId), 0);

  const seeds = [
    buyerPubkey.toBuffer(),
    sellerPubkey.toBuffer(),
    transactionIdBuffer,
  ];

  const [escrowPDA] = await PublicKey.findProgramAddress(seeds, programId);
  return escrowPDA;
}

export async function countTransactions(
  sellerPubkey: PublicKey,
  buyerPubkey: PublicKey
): Promise<number> {
  const accounts = await CONNECTION.getParsedProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 8,
          bytes: sellerPubkey.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 40,
          bytes: buyerPubkey.toBase58(),
        },
      },
    ],
  });
  return accounts.length;
}
