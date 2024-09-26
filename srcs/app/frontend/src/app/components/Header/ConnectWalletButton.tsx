'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from '../../styles/Header/DisconectWalletButton.module.css';

interface ConnectWalletButtonProps {
  connected: boolean;
  publicKey: PublicKey;
}
const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({connected, publicKey}) => {
  //const { connected, disconnect, publicKey } = useWallet();
  const { disconnect } = useWallet();

  const handleDisconnect = async () => {
    if (connected) {
      await disconnect();
    }
  };
  //console.log(`connected: ${connected}\ndisconnect: ${disconnect}\npublicKey: ${publicKey}`)

  const truncatedPublicKey = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  return (
    <div>
      {connected ? (
        <>
          <button className={styles.walletButton} onClick={handleDisconnect}>
            Disconnect The Wallet
          </button>
        </>
      ) : (
        <WalletMultiButton className={styles.walletButton}>
          Connect The Wallet
        </WalletMultiButton>
      )}
    </div>
  );
};

export default ConnectWalletButton;