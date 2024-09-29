/*
srcs/app/frontend/src/app/components/Body/Buyer/UnrecoverableList.tsx
請求権を持っていたが指定した期限が切れたトランザクションのリストを表示するcomponent
*/

'use client';

import React, { useEffect, useState } from 'react';
import styles from '../../../../styles/Body/Buyer/UnrecoverableList.module.css';

interface NotRetTransaction {
  sellerAddress: string;
  id: string;
  transactionAmount: number;
  deadline: string;
  reason: string;
}

const UnrecoverableList = () => {
  const [transactions, setTransactions] = useState<NotRetTransaction[]>([]);

  // データ取得の例
  useEffect(() => {
    const fetchData = async () => {
      // ここでAPIからデータを取得する
      const transactions: NotRetTransaction[] = [
        {
          sellerAddress: 'ユーザーA`',
          id: '1234567891085552',
          transactionAmount: 100,
          deadline: '2024-09-01 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーB`',
          id: '1234567891085552',
          transactionAmount: 200,
          deadline: '2024-09-02 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーC`',
          id: '1234567891085552',
          transactionAmount: 150,
          deadline: '2024-09-03 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーD`',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-09-04 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーE`',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-09-04 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーF`',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-09-04 11:00',
          reason: 'netflix, standard plan',
        },
        {
          sellerAddress: 'ユーザーG`',
          id: '1234567891085552',
          transactionAmount: 300,
          deadline: '2024-09-04 11:00',
          reason: 'netflix, standard plan',
        },
        // さらに要素を追加可能
      ];
      setTransactions(transactions);
    };

    fetchData();
  }, []);

  //const nowDate = getCurrentDate();
  return (
    <div className={styles.unrecoverableListContainer}>
      <h2 className={styles.sectionTitle}>Refund expired</h2>
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
                  <div className={styles.transactionDate}>Not returnable</div>
                  <div className={styles.transactionId}>
                    Transaction ID: {transaction.id}
                  </div>
                </div>
                <button className={styles.buttonBack}></button>
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

export default UnrecoverableList;
