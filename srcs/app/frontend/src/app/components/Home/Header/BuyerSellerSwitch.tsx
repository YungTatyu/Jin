import React from 'react';
import styles from '../../../styles/Header/BuyerSellerSwitch.module.css';

interface BuyerSellerSwitchProps {
  isBuyer: boolean;
  onSwitch: (isBuyer: boolean) => void;
}

const BuyerSellerSwitch: React.FC<BuyerSellerSwitchProps> = ({
  isBuyer,
  onSwitch,
}) => {
  return (
    <div className={styles.switch}>
      <button
        className={`${styles.button} ${isBuyer ? styles.active : ''}`}
        onClick={() => onSwitch(true)}
      >
        Buyer
      </button>
      <button
        className={`${styles.button} ${!isBuyer ? styles.active : ''}`}
        onClick={() => onSwitch(false)}
      >
        Seller
      </button>
    </div>
  );
};

export default BuyerSellerSwitch;
