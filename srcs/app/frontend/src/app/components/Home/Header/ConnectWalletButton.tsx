'use client';

import React, { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  WalletModalButton,
  WalletConnectButton,
  WalletDisconnectButton,
  useWalletModal,
} from '@solana/wallet-adapter-react-ui';

const ConnectWalletButton: React.FC = () => {
  const { wallet, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setVisible(true); // ウォレットを切断した後、モーダルを再表示
  }, [disconnect, setVisible]);

  if (connected) {
    return (
      <WalletDisconnectButton onClick={handleDisconnect}>
        Disconnect The Wallet
      </WalletDisconnectButton>
    );
  }
  if (wallet) {
    return (
      <>
        <WalletConnectButton>Connect The Wallet</WalletConnectButton>
        <WalletModalButton>Change Wallet</WalletModalButton>
      </>
    );
  }
  return <WalletModalButton>Select The Wallet</WalletModalButton>;
};

export default ConnectWalletButton;
