/*
srcs/app/frontend/src/app/components/Body/Seller/ClaimsExpiredList.tsx
期限が切れ、PDAから回収できるトランザクションのリストのcomponentです。
*/

'use client';

import React, { useEffect, useState } from 'react';
import WithdrawButton from './WithdrawButton';
import styles from '../../../../styles/Body/Seller/ClaimsExpiredList.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { TransactionData } from '../TransactionData';
import { SOLANA_NETWORK, PROGRAM_ID } from '../../../../../constant';
import { BigNumber } from 'bignumber.js';

const CONNECTION = new Connection(SOLANA_NETWORK);

interface WithdrawTransaction {
  buyerAddress: string;
  id: string;
  transactionAmount: BigNumber;
  reason: string;
}

function can_withdraw(buffer: Buffer): boolean {
  const isCanceled = buffer.readUInt8(TransactionData.IS_CANCELED) !== 0;
  const isWithdrawn = buffer.readUInt8(TransactionData.IS_WITHDRAWN) !== 0;
  const refundDeadline = Number(
    buffer.readBigInt64LE(TransactionData.REFUND_DEADLINE)
  );
  const now = Math.floor(Date.now() / 1000);
  return !isCanceled && !isWithdrawn && refundDeadline < now;
}

// 買い手の公開鍵が引数と一致し、返金処理可能な取引を取得
async function fetchTransactions(
  programId: PublicKey,
  connection: Connection,
  sellerPubkey: PublicKey
): Promise<WithdrawTransaction[]> {
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

  const returnableTransactionArray: WithdrawTransaction[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const accountData = accounts[i].account.data;

    // キャンセルされていない && 出金処理されていない && 返金期間外
    if (Buffer.isBuffer(accountData) && can_withdraw(accountData)) {
      const data = decodeRefundableEscrow(accountData);
      returnableTransactionArray.push(data);
    }
  }
  return returnableTransactionArray;
}

function decodeRefundableEscrow(buffer: Buffer): WithdrawTransaction {
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

  return {
    buyerAddress: new PublicKey(buyerPubkey).toString(),
    id: transactionId.toString(),
    transactionAmount: new BigNumber(amountLamports.toString()),
    reason: userDefinedData,
  };
}

const ClaimsExpiredList = () => {
  const [transactions, setTransactions] = useState<WithdrawTransaction[]>([]);

  const { publicKey } = useWallet();
  useEffect(() => {
    const fetchData = async () => {
      if (publicKey) {
        const withdrawTransactions = await fetchTransactions(
          PROGRAM_ID,
          CONNECTION,
          publicKey
        );
        setTransactions(withdrawTransactions);
      }
    };
    fetchData();
  }, [publicKey]);

  // lamports形式をsolの形式に変更
  const formatAmount = (amount: BigNumber): string => {
    return amount.dividedBy(1e9).toFixed(9);
  };

  return (
    <div className={styles.ClaimsExpiredListContainer}>
      <h2 className={styles.sectionTitle}>Refund expired</h2>
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
                    {formatAmount(transaction.transactionAmount)} SOL
                  </div>
                </div>
                <div className={styles.sellerInfo2}>
                  <div className={styles.transactionDate}>Withdraw OK</div>
                  <div className={styles.transactionId}>
                    Transaction ID: {transaction.id}
                  </div>
                </div>
                {publicKey && (
                  <WithdrawButton
                    buyer_pubkey={new PublicKey(transaction.buyerAddress)}
                    seller_pubkey={publicKey}
                    transactionId={BigInt(transaction.id)}
                  />
                )}
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

export default ClaimsExpiredList;
