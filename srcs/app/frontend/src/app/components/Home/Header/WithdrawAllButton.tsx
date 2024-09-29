import React from 'react';
import styles from '../../../styles/Header/ActionButton.module.css';

const WithdrawAllButton: React.FC = () => {
  const handleClick = () => {
    console.log('Withdraw All button clicked');
  };

  return (
    <button
      className={styles.actionButton}
      onClick={handleClick}
      title="Withdraw All"
    >
      Withdraw All
    </button>
  );
};

export default WithdrawAllButton;
