/*
srcs/app/frontend/src/app/components/Body/Buyer/ReturnSolButton.tsx
請求権を持つトランザクションのスマートコントラクトに返金を要求するcomponentです。
*/

import React from 'react';
import styles from '../../../../styles/Body/Buyer/ReturnSolButton.module.css';
import { PublicKey } from '@solana/web3.js';
import { settleTransaction } from '@/app/components/api';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

interface ReturnSolButtonProps {
  buyer_pubkey: PublicKey;
  seller_pubkey: PublicKey;
  transactionId: bigint;
}

const ReturnSolButton: React.FC<ReturnSolButtonProps> = ({
  buyer_pubkey,
  seller_pubkey,
  transactionId,
}) => {
  const wallet = useAnchorWallet();
  const onClick = async () => {
    if (wallet) {
      const f = await settleTransaction(
        wallet,
        wallet.signTransaction,
        wallet.publicKey,
        buyer_pubkey,
        seller_pubkey,
        Number(transactionId)
      );
      alert(`Success`);
    } else {
      alert(`Error: No wallet connected`);
    }
  };
  return (
    <button className={styles.ButtonContainer} onClick={onClick}>
      return
    </button>
  );
};

export default ReturnSolButton;
