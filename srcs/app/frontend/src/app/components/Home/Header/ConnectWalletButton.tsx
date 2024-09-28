'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  WalletModalButton,
  WalletConnectButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui';

const ConnectWalletButton: React.FC = () => {
  //const { connected, disconnect, publicKey } = useWallet();
  const { wallet, connected } = useWallet();

  return (
    <div>
      {connected ? (
        <WalletDisconnectButton>Disconnect The Wallet</WalletDisconnectButton>
      ) : wallet ? (
        <WalletConnectButton>Connect The Wallet</WalletConnectButton>
      ) : (
        <WalletModalButton>Select The Wallet</WalletModalButton>
      )}
    </div>
  );
};

export default ConnectWalletButton;
