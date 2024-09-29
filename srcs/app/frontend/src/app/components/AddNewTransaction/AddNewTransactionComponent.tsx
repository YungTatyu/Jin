import { PublicKey } from "@solana/web3.js";
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { addNewTransaction } from "../api";

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const IDL = require('../../../../../target/idl/refundable_escrow.json')

interface input {
  sellerAddress: string,
  amount: string,
  refundDeadline: string,
  transactionInfo: string,
};

const AddNewTransactionComponent: React.FC<input> = ({sellerAddress, amount, refundDeadline, transactionInfo}) => {

  const handleAddNewTransaction = async () => {
    if (!sellerAddress || !amount || !refundDeadline || !transactionInfo) {
        alert('必要な情報が不足しています');
        return
    }
    alert(`${sellerAddress}\n${amount}\n${refundDeadline}\n${transactionInfo}\n`)
  };

  return (
    <div>
      <button className={styles.okButton} onClick={handleAddNewTransaction}>OK</button>
    </div>
  );
};

export default AddNewTransactionComponent;