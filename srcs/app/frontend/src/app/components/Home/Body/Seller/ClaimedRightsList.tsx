/*
srcs/app/frontend/src/app/components/Body/Seller/ClaimedRightsList.tsx
被請求権を持つトランザクションのリストのcomponentです。
*/

'use client';

import React, { useEffect, useState } from 'react';
import styles from '../../../../styles/Body/Seller/ClaimedRightsList.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { TransactionData } from '../TransactionData';
import { SOLANA_NETWORK, PROGRAM_ID } from '../../../../../constant';

const CONNECTION = new Connection(SOLANA_NETWORK);

const getCurrentDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので1を足す
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

interface PossibleRepaymentTransaction {
  buyerAddress: string;
  id: string;
  transactionAmount: number;
  deadline: bigint;
  reason: string;
}

// 返金処理されていない? and 返金期間内?
function is_refundable(buffer: Buffer): boolean {
  const refundDeadline = Number(
    buffer.readBigInt64LE(TransactionData.REFUND_DEADLINE)
  );
  const now = Math.floor(Date.now() / 1000);
  const isCanceled = buffer.readUInt8(TransactionData.IS_CANCELED) !== 0;
  return !isCanceled && now <= refundDeadline;
}

async function fetchTransactions(
  programId: PublicKey,
  connection: Connection,
  sellerPubkey: PublicKey
): Promise<PossibleRepaymentTransaction[]> {
  const accounts = await connection.getParsedProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: TransactionData.SELLER_PUBKEY,
          bytes: sellerPubkey.toBase58(),
        },
      },
    ],
  });

  const returnableTransactionArray: PossibleRepaymentTransaction[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const accountData = accounts[i].account.data;
    if (Buffer.isBuffer(accountData) && is_refundable(accountData)) {
      const data = decodeRefundableEscrow(accountData);
      returnableTransactionArray.push(data);
    }
  }
  return returnableTransactionArray;
}

function decodeRefundableEscrow(buffer: Buffer): PossibleRepaymentTransaction {
  const buyerPubkey = buffer.slice(
    TransactionData.BUYER_PUBKEY,
    TransactionData.TRANSACTION_ID
  );
  const transactionId = buffer.readBigUInt64LE(TransactionData.TRANSACTION_ID);
  const amountLamports = buffer.readBigUInt64LE(
    TransactionData.AMOUNT_LAMPORTS
  );
  const userDefinedData = buffer
    .slice(TransactionData.USER_DEFINED_DATA)
    .toString('utf-8')
    .replace(/\u0000/g, '')
    .trim();
  const refundDeadline = buffer.readBigInt64LE(TransactionData.REFUND_DEADLINE);

  return {
    buyerAddress: new PublicKey(buyerPubkey).toString(),
    id: transactionId.toString(),
    transactionAmount: Number(amountLamports),
    deadline: refundDeadline,
    reason: userDefinedData,
  };
}

const ClaimedRightsList = () => {
  const [transactions, setTransactions] = useState<
    PossibleRepaymentTransaction[]
  >([]);

  const { publicKey } = useWallet();
  useEffect(() => {
    const fetchData = async () => {
      if (publicKey) {
        const possibleTransactions = await fetchTransactions(
          PROGRAM_ID,
          CONNECTION,
          publicKey
        );
        setTransactions(possibleTransactions);
      }
    };
    fetchData();
  }, [publicKey]);

  const nowDate = getCurrentDate(new Date());

  return (
    <div className={styles.ClaimedRightsListContainer}>
      <h2 className={styles.sectionTitle}>Contract within the return period</h2>
      <div className={styles.transactionListWrapper}>
        <ul className={styles.transactionList}>
          {transactions.map((transaction, index) => (
            <li key={index} className={styles.transactionItem}>
              <div className={styles.transactionHeader}>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerAddress}>
                    {transaction.buyerAddress}
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

export default ClaimedRightsList;
