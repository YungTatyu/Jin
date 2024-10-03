/*
srcs/app/frontend/src/app/components/Body/Buyer/ClaimsList.tsx
請求権を持つトランザクションのリストを表示するcomponent
*/

'use client';

import React, { useEffect, useState } from 'react';
import ReturnSolButton from './ReturnSolButton';
import styles from '../../../../styles/Body/Buyer/ClaimsList.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TransactionData } from '../TransactionData';
import { SOLANA_NETWORK, PROGRAM_ID} from '../../../../../constant';

const ClaimsList: React.FC = () => {
  // useState の初期化時に型を指定
  const [transactions, setTransactions] = useState<RefundableEscrowData[]>([]);
  const { publicKey } = useWallet();
  //const nowDate = getCurrentDate();

  // データ取得の例
  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) {
        console.error('Wallet not connected');
        return;
      }
      const connection = new Connection(SOLANA_NETWORK);
      try {
        const escrowData = await fetchBuyerTransactions(
          PROGRAM_ID,
          connection,
          publicKey
        );
        setTransactions(escrowData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    if (publicKey) {
      fetchData();
    }
  }, [publicKey]);
  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAmount = (lamports: bigint): string => {
    return (Number(lamports) / 1e9).toFixed(9);
  };

  return (
    <div className={styles.claimsListContainer}>
      <h2 className={styles.sectionTitle}>Contract within the return period</h2>
      <div className={styles.transactionListWrapper}>
        <ul className={styles.transactionList}>
          {transactions.map((transaction, index) => (
            <li key={index} className={styles.transactionItem}>
              <div className={styles.transactionHeader}>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerAddress}>
                    {transaction.seller_pubkey.toBase58()}
                  </div>
                  <div className={styles.transactionAmount}>
                    {formatAmount(transaction.amount_lamports)} SOL
                  </div>
                </div>
                <div className={styles.sellerInfo2}>
                  <div className={styles.transactionDate}>
                    {formatDate(transaction.create_at)} ~{' '}
                    {formatDate(transaction.refund_deadline)}
                  </div>
                  <div className={styles.transactionId}>
                    Transaction ID: {transaction.transaction_id.toString()}
                  </div>
                </div>
                {!transaction.is_canceled && (
                  <ReturnSolButton
                    buyer_pubkey={transaction.buyer_pubkey}
                    seller_pubkey={transaction.seller_pubkey}
                    transactionId={transaction.transaction_id}
                  />
                )}
              </div>
              <div className={styles.transactionReason}>
                {transaction.user_defined_data}
              </div>
              {transaction.is_canceled && (
                <div className={styles.canceledStatus}>Canceled</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClaimsList;

type RefundableEscrowData = {
  buyer_pubkey: PublicKey;
  seller_pubkey: PublicKey;
  transaction_id: bigint;
  amount_lamports: bigint;
  create_at: bigint;
  refund_deadline: bigint;
  is_canceled: boolean;
  user_defined_data: string;
};

// 返金処理されていない? and 返金期間内?
function is_refundable(buffer: Buffer): boolean {
  const refundDeadline = Number(
    buffer.readBigInt64LE(TransactionData.REFUND_DEADLINE)
  );
  const now = Math.floor(Date.now() / 1000);
  const isCanceled = buffer.readUInt8(TransactionData.IS_CANCELED) !== 0;
  return !isCanceled && now <= refundDeadline;
}

async function fetchBuyerTransactions(
  programId: PublicKey,
  connection: Connection,
  buyerPubkey: PublicKey
): Promise<RefundableEscrowData[]> {
  const filters = [
    {
      memcmp: {
        offset: TransactionData.BUYER_PUBKEY,
        bytes: buyerPubkey.toBase58(),
      },
    },
  ];
  const accounts = await connection.getParsedProgramAccounts(programId, {
    filters: filters,
  });

  const refundableEscrowDataArray: RefundableEscrowData[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const accountData = accounts[i].account.data;
    if (accountData instanceof Buffer && is_refundable(accountData)) {
      const data = decodeRefundableEscrow(accountData);
      refundableEscrowDataArray.push(data);
    } else {
      console.warn('Skipping non-Buffer account data');
    }
  }
  return refundableEscrowDataArray;
}

function decodeRefundableEscrow(buffer: Buffer): RefundableEscrowData {
  const sellerPubkey = buffer.slice(
    TransactionData.SELLER_PUBKEY,
    TransactionData.BUYER_PUBKEY
  );
  const buyerPubkey = buffer.slice(
    TransactionData.BUYER_PUBKEY,
    TransactionData.TRANSACTION_ID
  );
  const transactionId = buffer.readBigUInt64LE(TransactionData.TRANSACTION_ID);
  const amountLamports = buffer.readBigUInt64LE(
    TransactionData.AMOUNT_LAMPORTS
  );
  const createAt = buffer.readBigInt64LE(TransactionData.CREATE_AT);
  const refundDeadline = buffer.readBigInt64LE(TransactionData.REFUND_DEADLINE);
  const isCanceled = buffer.readUInt8(TransactionData.IS_CANCELED) !== 0;
  const userDefinedData = buffer
    .slice(TransactionData.USER_DEFINED_DATA)
    .toString('utf-8')
    .replace(/\u0000/g, '')
    .trim();

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
