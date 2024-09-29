'use client';

import React, { useState } from 'react';
import Header from './components/Home/Header/Header';
import Body from './components/Home/Body/Body';
import Footer from './components/Home/Footer/Footer';

export default function Home() {
  const [isBuyer, setIsBuyer] = useState(true);

  const handleBuyerSellerSwitch = (buyer: boolean) => {
    setIsBuyer(buyer);
  };

  return (
    <main>
      <Header isBuyer={isBuyer} onBuyerSellerSwitch={handleBuyerSellerSwitch} />
      {/* ページの残りの部分 */}
      <Body isBuyer={isBuyer} />
      <Footer />
    </main>
  );
}
