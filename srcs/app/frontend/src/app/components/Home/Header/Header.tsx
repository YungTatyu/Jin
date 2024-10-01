'use client';

import JinLogo from './JinLogo';
import BuyerSellerSwitch from './BuyerSellerSwitch';
import AddNewTransactionButton from './AddNewTransactionButton';
import ConnectWalletButton from './ConnectWalletButton';
import styles from '../../../styles/Header/Header.module.css';

interface HeaderProps {
  isBuyer: boolean;
  onBuyerSellerSwitch: (buyer: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isBuyer, onBuyerSellerSwitch }) => {
  return (
    <header className={styles.header}>
      <JinLogo />
      <div className={styles.rightSection}>
        <BuyerSellerSwitch isBuyer={isBuyer} onSwitch={onBuyerSellerSwitch} />
        <AddNewTransactionButton />
        <ConnectWalletButton />
      </div>
    </header>
  );
};

export default Header;
