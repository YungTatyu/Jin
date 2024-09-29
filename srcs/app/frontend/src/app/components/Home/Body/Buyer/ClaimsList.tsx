/*
srcs/app/frontend/src/app/components/Body/Buyer/ClaimsList.tsx
請求権を持つトランザクションのリストを表示するcomponent
*/

'use client';

import React, { useEffect, useState } from 'react';
import ReturnSolButton from './ReturnSolButton';
import styles from '../../../../styles/Body/Buyer/ClaimsList.module.css';
import { RefundableEscrowData, fetchBuyerTransactions } from '@/app/components/api';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

const getCurrentDate = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので1を足す
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const SOLANA_NETWORK = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

const ClaimsList: React.FC = () => {
  // useState の初期化時に型を指定
  const [transactions, setTransactions] = useState<RefundableEscrowData[]>([]);
  const { publicKey } = useWallet();
  const nowDate = getCurrentDate();

  // データ取得の例
  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) {
        console.error('Wallet not connected');
        return;
      }
      const connection = new Connection(SOLANA_NETWORK);
      try {
        const escrowData = await fetchBuyerTransactions(PROGRAM_ID, connection, publicKey);
        setTransactions(escrowData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    if (publicKey) {
      fetchData();
    }
  }, [publicKey]);
  const formatDate = (timestamp: BigInt): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAmount = (lamports: BigInt): string => {
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
                    {formatDate(transaction.create_at)} ~ {formatDate(transaction.refund_deadline)}
                  </div>
                  <div className={styles.transactionId}>
                    Transaction ID: {transaction.transaction_id.toString()}
                  </div>
                </div>
                {!transaction.is_canceled && (
                  <ReturnSolButton buyer_pubkey={transaction.buyer_pubkey}/>
                )}
              </div>
              <div className={styles.transactionReason}>
                {transaction.user_defined_data}
              </div>
              {transaction.is_canceled && <div className={styles.canceledStatus}>Canceled</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClaimsList;
