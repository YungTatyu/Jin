/*
srcs/app/frontend/src/app/components/Body/Buyer/ClaimsList.tsx
請求権を持つトランザクションのリストを表示するcomponent
*/

'use client';

import React, { useEffect, useState } from 'react';
import ReturnSolButton from './ReturnSolButton';
import styles from '../../../../styles/Body/Buyer/ClaimsList.module.css';

const getCurrentDate = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので1を足す
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

interface ReturnableTransaction {
  sellerAddress: string;
  id: string;
  transactionAmount: number;
  deadline: string;
  reason: string;
}


const ClaimsList = () => {
  // useState の初期化時に型を指定
  const [transactions, setTransactions] = useState<ReturnableTransaction[]>([]);

  // データ取得の例
  useEffect(() => {
    const fetchData = async () => {
      // ここでAPIからデータを取得する
      const data = [
        {
          sellerAddress: 'ユーザーA',
          id: '1234567891085552',
          transactionAmount: 100,
          deadline: '2024-11-01 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーB',
          id: '1234567891085552',
          transactionAmount: 200,
          deadline: '2024-11-02 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーC',
          id: '1234567891085552',
          transactionAmount: 150,
          deadline: '2024-11-03 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーD',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-11-04 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーE',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-11-04 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーF',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-11-04 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーG',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-11-04 11:00',
          reason: 'netflix, standard plan',
        },
        // さらに要素を追加可能
      ];
      setTransactions(data);
    };

    fetchData();
  }, []);

  const nowDate = getCurrentDate();

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
                    {transaction.sellerAddress}
                  </div>
                  <div className={styles.transactionAmount}>
                    {transaction.transactionAmount} SOL
                  </div>
                </div>
                <div className={styles.sellerInfo2}>
                  <div className={styles.transactionDate}>
                    {nowDate} ~ {transaction.deadline}
                  </div>
                  <div className={styles.transactionId}>
                    Transaction ID: {transaction.id}
                  </div>
                </div>
                <ReturnSolButton />
              </div>
              <div className={styles.transactionReason}>
                {transaction.reason}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClaimsList;
