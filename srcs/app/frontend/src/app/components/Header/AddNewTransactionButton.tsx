import React from 'react';
import styles from '../../styles/Header/ActionButton.module.css';

const AddNewTransactionButton: React.FC = () => {
  const handleClick = () => {
    console.log('Add New Transaction button clicked');
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
