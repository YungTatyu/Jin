'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave'; // 追加
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'; // 追加
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/Providers/Wallet-adapter-override.css'; // 新しく追加
import { Connection } from '@solana/web3.js';
import { SOLANA_NETWORK } from '../../constant';

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Localnetのエンドポイントを指定
  const endpoint = SOLANA_NETWORK;
  // コネクションオブジェクトの作成
  const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BraveWalletAdapter(), // 追加
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new BackpackWalletAdapter(), // 追加
    ],
    [connection]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
