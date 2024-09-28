/*
srcs/app/frontend/src/app/components/Body/Seller/WithdrawButton.tsx
期限が切れ、PDAから回収できるトランザクションを実際に回収するボタンのcomponentです。
*/

import React from 'react';
import styles from '../../../../styles/Body/Seller/WithdrawButton.module.css'

const WithdrawButton = () => {
  const onClick = () => {
    alert("Hello, world!");
  };
  return (
    <button className={styles.ButtonContainer} onClick={onClick}>withdraw</button>
  );
};

export default WithdrawButton;
