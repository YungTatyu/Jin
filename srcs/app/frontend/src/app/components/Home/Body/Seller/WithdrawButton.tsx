/*
srcs/app/frontend/src/app/components/Body/Seller/WithdrawButton.tsx
期限が切れ、PDAから回収できるトランザクションを実際に回収するボタンのcomponentです。
*/

import React from 'react';
import styles from '../../../../styles/Body/Seller/WithdrawButton.module.css';
import { settleTransaction } from '@/app/components/api';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface WithdrawButtonProps {
  buyer_pubkey: PublicKey;
  seller_pubkey: PublicKey;
  transactionId: bigint;
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
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
      withdraw
    </button>
  );
};

export default WithdrawButton;
