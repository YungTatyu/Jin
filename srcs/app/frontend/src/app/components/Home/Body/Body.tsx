// components/Body/Body.tsx
'use client'
import React from 'react';
import styles from '../../../styles/Body/Body.module.css'; // スタイルを適用する場合
import ClaimsList from './Buyer/ClaimsList';
import UnrecoverableList from './Buyer/UnrecoverableList';
import { useWallet } from '@solana/wallet-adapter-react';
import ClaimedRightsList from './Seller/ClaimedRightsList';
import ClaimsExpiredList from './Seller/ClaimsExpiredList';

interface BodyProps {
  isBuyer: boolean;
}

const Body: React.FC<BodyProps> = ({ isBuyer}) => {
  const { connected, publicKey } = useWallet();

  return (
    <div className={styles.bodyContainer}>
      {isBuyer ? (
        <div>
          {connected ? (
            <>
              <ClaimsList />
              <UnrecoverableList />
            </>
          ) : (
            <p>Please connect your wallet to access buyer features.</p>
          )}
        </div>
      ) : (
        <div>
          {connected ? (
            <>
              <ClaimedRightsList/>
              <ClaimsExpiredList/>
            </>
          ) : (
            <p>Please connect your wallet to access seller features.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Body;
