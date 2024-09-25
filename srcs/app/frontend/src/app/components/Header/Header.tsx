'use client';
import React, { useState } from 'react';
import JinLogo from './JinLogo';
import BuyerSellerSwitch from './BuyerSellerSwitch';
import AddNewTransactionButton from './AddNewTransactionButton';
import WithdrawAllButton from './WithdrawAllButton';
import ConnectWalletButton from './ConnectWalletButton';
import styles from '../../styles/Header/Header.module.css';

const Header: React.FC = () => {
  const [isBuyer, setIsBuyer] = useState(true);

  const handleBuyerSellerSwitch = (buyer: boolean) => {
    setIsBuyer(buyer);
  };

  return (
    <header className={styles.header}>
      <JinLogo />
      <div className={styles.rightSection}>
        <BuyerSellerSwitch
          isBuyer={isBuyer}
          onSwitch={handleBuyerSellerSwitch}
        />
        {isBuyer ? <AddNewTransactionButton /> : <WithdrawAllButton />}
        <ConnectWalletButton />
      </div>
    </header>
  );
};

export default Header;
