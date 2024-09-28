import React from 'react';
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';

const Body: React.FC = () => {
  return (
    <div className={styles.body}>
      <div className={styles.frame30}>
        <div className={styles.frame27}>
          <h1 className={styles.title}>Add New Transaction</h1>
          
          <div className={styles.inputGroup}>
            <label htmlFor="sellerAddress">Enter seller address</label>
            <input type="text" id="sellerAddress" className={styles.input} />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="amount">Enter amount</label>
            <input type="text" id="amount" className={styles.input} />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="refundDeadline">
              Enter refund deadline
              <span className={styles.sublabel}>(You can enter 1 to 360 days)</span>
            </label>
            <input type="text" id="refundDeadline" className={styles.input} />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="transactionInfo">
              transaction info
              <span className={styles.sublabel}>(serves name, plan,etc)</span>
            </label>
            <input type="text" id="transactionInfo" className={styles.input} />
          </div>
        </div>
        
        <button className={styles.okButton}>OK</button>
      </div>
    </div>
  );
};

export default Body;