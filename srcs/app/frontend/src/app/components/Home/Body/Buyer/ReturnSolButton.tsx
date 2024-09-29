/*
srcs/app/frontend/src/app/components/Body/Buyer/ReturnSolButton.tsx
請求権を持つトランザクションのスマートコントラクトに返金を要求するcomponentです。
*/

import React from 'react';
import styles from '../../../../styles/Body/Buyer/ReturnSolButton.module.css';
import { PublicKey } from '@solana/web3.js';

interface ReturnSolButtonProps {
  buyer_pubkey: PublicKey;
}

const ReturnSolButton: React.FC<ReturnSolButtonProps> = ({ buyer_pubkey }) => {
  const onClick = () => {
    alert(`Hello! ${buyer_pubkey}`);
  };
  return (
    <button className={styles.ButtonContainer} onClick={onClick}>
      return
    </button>
  );
};

export default ReturnSolButton;
