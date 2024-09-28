'use client';

import React, { useState } from 'react';
import Header from './components/Header/Header';
import Body from './components/Body/Body';

export default function Home() {
  const [isBuyer, setIsBuyer] = useState(true);

  const handleBuyerSellerSwitch = (buyer: boolean) => {
    setIsBuyer(buyer);
  };

  return (
    <main>
      <Header 
        isBuyer={isBuyer} 
        onBuyerSellerSwitch={handleBuyerSellerSwitch} 
      />
      {/* ページの残りの部分 */}
      <Body
        isBuyer={isBuyer} 
      />
    </main>
  );
}
