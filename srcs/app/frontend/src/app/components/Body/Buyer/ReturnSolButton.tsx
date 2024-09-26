/*
srcs/app/frontend/src/app/components/Body/Buyer/ReturnSolButton.tsx
請求権を持つトランザクションのスマートコントラクトに返金を要求するcomponentです。
*/


import React from 'react';
import styles from '../../../styles/Body/Buyer/ReturnSolButton.module.css'

const ReturnSolButton = () => {
  const onClick = () => {
    alert("Hello, world!");
  };
  return (
    <button className={styles.ButtonContainer} onClick={onClick}>return</button>
  );
};

export default ReturnSolButton;
