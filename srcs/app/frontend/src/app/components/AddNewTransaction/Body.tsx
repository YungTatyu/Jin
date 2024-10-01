import React, { useState } from 'react';
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';
import AddNewTransactionComponent from './AddNewTransactionComponent';

const Body: React.FC = () => {
  const [sellerAddress, setSellerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [refundDeadline, setRefundDeadline] = useState('');
  const [transactionInfo, setTransactionInfo] = useState('');

  return (
    <div className={styles.body}>
      <div className={styles.frame30}>
        <div className={styles.frame27}>
          <h1 className={styles.title}>Add New Transaction</h1>

          <div className={styles.inputGroup}>
            <label htmlFor="sellerAddress">Enter seller address</label>
            <input
              type="text"
              id="sellerAddress"
              className={styles.input}
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="amount">Enter amount</label>
            <input
              type="text"
              id="amount"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="refundDeadline">
              Enter refund deadline
              <span className={styles.sublabel}>
                (You can enter 1 to 360 days)
              </span>
            </label>
            <input
              type="text"
              id="refundDeadline"
              className={styles.input}
              value={refundDeadline}
              onChange={(e) => setRefundDeadline(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="transactionInfo">
              transaction info
              <span className={styles.sublabel}>(serves name, plan,etc)</span>
            </label>
            <input
              type="text"
              id="transactionInfo"
              className={styles.input}
              value={transactionInfo}
              onChange={(e) => setTransactionInfo(e.target.value)}
            />
          </div>
        </div>
        <AddNewTransactionComponent
          sellerAddress={sellerAddress}
          amount={amount}
          refundDeadline={refundDeadline}
          transactionInfo={transactionInfo}
        />
      </div>
    </div>
  );
};

export default Body;
