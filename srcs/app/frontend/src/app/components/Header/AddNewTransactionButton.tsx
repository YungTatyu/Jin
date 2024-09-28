import React from 'react';
import { useRouter } from 'next/navigation';
// /styles/AddNewTransaction/AddNewTransaction.module.css
import styles from '../../styles/Header/ActionButton.module.css';
import { useWallet } from '@solana/wallet-adapter-react';

const AddNewTransactionButton: React.FC = () => {
  const { connected } = useWallet();
  const router = useRouter();
  const handleClick = () => {
    if (connected) {
      router.push('/AddNewTransaction')
    }
  };
  return (
    <button
      className={styles.actionButton}
      onClick={handleClick}
      title="Add New Transaction"
    >
      Add New Transaction
    </button>
  );
};

export default AddNewTransactionButton;
