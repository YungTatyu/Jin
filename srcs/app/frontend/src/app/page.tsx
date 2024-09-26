'use client';
import React, { useState } from 'react';
import Header from './components/Header/Header';
import Body from './components/Body/Body';

import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const [isBuyer, setIsBuyer] = useState(true);
  const { connected, publicKey } = useWallet();

  const handleBuyerSellerSwitch = (buyer: boolean) => {
    setIsBuyer(buyer);
  };

  return (
    <main>
      <Header 
        isBuyer={isBuyer} 
        onBuyerSellerSwitch={handleBuyerSellerSwitch} 
        connected={connected}
        publicKey={publicKey}
      />
      {/* ページの残りの部分 */}
      <Body 
        isBuyer={isBuyer}
        connected={connected}
        publicKey={publicKey}
      />
    </main>
  );
}
