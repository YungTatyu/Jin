'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/Providers/Wallet-adapter-override.css'; // 新しく追加
import { Connection } from '@solana/web3.js';

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Localnetのエンドポイントを指定
  const endpoint = 'http://localhost:8899';
  //const network = WalletAdapterNetwork.Devnet;
  //const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // コネクションオブジェクトの作成
  const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({ connection }),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {/* autoConnectをfalseに変更 */}
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
