// components/Body/Body.tsx
'use client'
import React from 'react';
import styles from '../../styles/Body/Body.module.css'; // スタイルを適用する場合
import ClaimsList from './Buyer/ClaimsList';

interface BodyProps {
  isBuyer: boolean;
  connected: boolean;
  publicKey: any; // 型は適切に調整してください
}

const Body: React.FC<BodyProps> = ({ isBuyer, connected, publicKey }) => {
  console.log(`isBuyer: ${isBuyer}`);
  console.log(`connected: ${connected}`);
  console.log(`publicKey: ${publicKey}`);

  return (
    <div className={styles.bodyContainer}>
      {isBuyer ? (
        <div>
          {connected ? (
            <>
              <ClaimsList />
            </>
          ) : (
            <p>Please connect your wallet to access buyer features.</p>
          )}
        </div>
      ) : (
        <div>
          <h2>Seller Dashboard</h2>
          {connected ? (
            <>
              <p>Welcome, Seller! Your public key is: {publicKey?.toString()}</p>
              <button>List New Item</button>
              <button>View My Listings</button>
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
