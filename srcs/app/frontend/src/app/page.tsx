'use client';

import React, { useState } from 'react';
import Header from './components/Home/Header/Header';
import Body from './components/Home/Body/Body';
import Footer from './components/Home/Footer/Footer';
import { Connection, PublicKey, TransactionInstruction, Transaction } from '@solana/web3.js';

// Solanaネットワークへの接続
const CONNECTION = new Connection('https://api.devnet.solana.com');
// 自作のプログラムID (デプロイした時に得られたプログラムIDを使用)
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

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
