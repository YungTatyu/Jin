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
import { TransactionData } from '../TransactionData';
import { SOLANA_NETWORK, PROGRAM_ID } from '../../../../../constant';
import { BigNumber } from 'bignumber.js';

const CONNECTION = new Connection(SOLANA_NETWORK);

interface NotRetTransaction {
  sellerAddress: string;
  id: string;
  transactionAmount: BigNumber;
  reason: string;
}

// 返金期間外?
function is_expired_refund(buffer: Buffer): boolean {
  const refundDeadline = buffer.readBigInt64LE(TransactionData.REFUND_DEADLINE);
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
          offset: TransactionData.BUYER_PUBKEY,
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
  const sellerPubkey = buffer.slice(
    TransactionData.SELLER_PUBKEY,
    TransactionData.BUYER_PUBKEY
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

  return {
    sellerAddress: new PublicKey(sellerPubkey).toString(),
    id: transactionId.toString(),
    transactionAmount: new BigNumber(amountLamports.toString()),
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

  // lamports形式をsolの形式に変更
  const formatAmount = (amount: BigNumber): string => {
    return amount.dividedBy(1e9).toFixed(9);
  };

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
                    {formatAmount(transaction.transactionAmount)} SOL
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
