import { PublicKey, Keypair, Connection, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Program, BN } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

// decode後にこの構造体に格納
export type RefundableEscrowData = {
  buyer_pubkey: PublicKey;
  seller_pubkey: PublicKey;
  transaction_id: bigint;
  amount_lamports: bigint;
  create_at: bigint;
  refund_deadline: bigint;
  is_canceled: boolean;
  user_defined_data: string;
};

// addNewTransaction画面でOKボタンを押したときに実行される想定
// 戻り値: Sucess -> true, Error -> false
export async function addNewTransaction(
  program: Program,
  programId: PublicKey,
  sellerPubkey: PublicKey,
  transactionId: number,
  amountLamports: number,
  refundableSeconds: number,
  userDefinedData: string
): Promise<boolean> {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  if (!publicKey || !sendTransaction) {
    console.error('Wallet not connected');
    return false;
  }
  const escrowPDA = await getEscrowPDA(
    publicKey,
    sellerPubkey,
    transactionId,
    programId
  );
  try {
    const transaction = await program.methods
      .createRefundableEscrow(
        new BN(transactionId),
        new BN(amountLamports),
        new BN(refundableSeconds),
        userDefinedData
      )
      .accounts({
        buyer: publicKey,
        seller: sellerPubkey,
        escrow: escrowPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    console.log('Transaction successful:', signature);
    return true;
  } catch (error) {
    console.error('Transaction failed:', error);
    return false;
  }
}

// 取引一覧するための情報を取得する関数
// この関数の戻り値をフィルタリングし、画面に一覧する
// 戻り値: RefundableEscrowData構造体の配列
export async function fetchBuyerTransactions(
  programId: PublicKey,
  connection: Connection,
  buyerPubkey: PublicKey
): Promise<RefundableEscrowData[]> {
  const filters = [{ memcmp: { offset: 72, bytes: buyerPubkey.toBase58() } }];
  const accounts = await connection.getParsedProgramAccounts(programId, {
    filters: filters,
  });

  //let refundableEscrowDataArray: RefundableEscrowData[] = [];
  const refundableEscrowDataArray: RefundableEscrowData[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const accountData = accounts[i].account.data;
    if (accountData instanceof Buffer) {
      const data = decodeRefundableEscrow(accountData);
      refundableEscrowDataArray.push(data);
    } else {
      console.warn('Skipping non-Buffer account data');
    }
  }
  return refundableEscrowDataArray;
}

function decodeRefundableEscrow(buffer: Buffer): RefundableEscrowData {
  const sellerPubkey = buffer.slice(8, 40);
  const buyerPubkey = buffer.slice(40, 72);
  const transactionId = buffer.readBigUInt64LE(72);
  const amountLamports = buffer.readBigUInt64LE(80);
  const createAt = buffer.readBigInt64LE(88);
  const refundDeadline = buffer.readBigInt64LE(96);
  const isCanceled = buffer.readUInt8(104) !== 0;
  const userDefinedData = buffer.slice(109).toString('utf-8');

  return {
    seller_pubkey: new PublicKey(sellerPubkey),
    buyer_pubkey: new PublicKey(buyerPubkey),
    transaction_id: transactionId,
    amount_lamports: amountLamports,
    create_at: createAt,
    refund_deadline: refundDeadline,
    is_canceled: isCanceled,
    user_defined_data: userDefinedData,
  };
}

export async function settleTransaction(
  program: Program,
  programId: PublicKey,
  requestor: Keypair,
  buyerPubkey: PublicKey,
  sellerPubkey: PublicKey,
  transactionId: number
): Promise<boolean> {
  const escrowPDA = await getEscrowPDA(
    buyerPubkey,
    sellerPubkey,
    transactionId,
    programId
  );
  try {
    await program.methods
      .settleLamports()
      .accounts({
        requestor: requestor.publicKey,
        escrow: escrowPDA,
      })
      .signers([requestor])
      .rpc();
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

  const [escrowPDA, _] = await PublicKey.findProgramAddress(seeds, programId);
  return escrowPDA;
}
