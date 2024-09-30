/*
srcs/app/frontend/src/app/components/Body/Buyer/UnrecoverableList.tsx
請求権を持っていたが指定した期限が切れたトランザクションのリストを表示するcomponent
*/

'use client';

import React, { useEffect, useState } from 'react';
import styles from '../../../../styles/Body/Buyer/UnrecoverableList.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';

const PROGRAM_ID = new PublicKey(
  'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);
const CONNECTION = new Connection('http://localhost:8899/');

const getCurrentDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので1を足す
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

interface NotRetTransaction {
  sellerAddress: string;
  id: string;
  transactionAmount: number;
  deadline: bigint;
  reason: string;
}

// 返金期間外?
function is_expired_refund(buffer: Buffer): boolean {
  const refundDeadline = buffer.readBigInt64LE(96);
  const now = Math.floor(Date.now() / 1000);
  return refundDeadline < now;
}

// 買い手の公開鍵が引数と一致し、返金処理可能な取引を取得
async function fetchTransactions(
  programId: PublicKey,
  connection: Connection,
  buyerPubkey: PublicKey
): Promise<NotRetTransaction[]> {
  const accounts = await connection.getParsedProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 40,
          bytes: buyerPubkey.toBase58(),
        },
      },
    ],
  });

  const returnableTransactionArray: NotRetTransaction[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const accountData = accounts[i].account.data;
    if (Buffer.isBuffer(accountData) && is_expired_refund(accountData)) {
      const data = decodeRefundableEscrow(accountData);
      returnableTransactionArray.push(data);
    }
  }
  return returnableTransactionArray;
}

function decodeRefundableEscrow(buffer: Buffer): NotRetTransaction {
  const sellerPubkey = buffer.slice(8, 40);
  const transactionId = buffer.readBigUInt64LE(72);
  const amountLamports = buffer.readBigUInt64LE(80);
  const userDefinedData = buffer.slice(109).toString('utf-8').replace(/\u0000/g, '').trim();
  const refundDeadline = buffer.readBigInt64LE(96);

  return {
    sellerAddress: new PublicKey(sellerPubkey).toString(),
    id: transactionId.toString(),
    transactionAmount: Number(amountLamports),
    deadline: refundDeadline,
    reason: userDefinedData,
  };
}

const UnrecoverableList = () => {
  const [transactions, setTransactions] = useState<NotRetTransaction[]>([]);

  const { publicKey } = useWallet();
  useEffect(() => {
    const fetchData = async () => {
      if (publicKey) {
        const returnedTransactions = await fetchTransactions(
          PROGRAM_ID,
          CONNECTION,
          publicKey
        );
        setTransactions(returnedTransactions);
      }
    };
    fetchData();
  }, [publicKey]);

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
