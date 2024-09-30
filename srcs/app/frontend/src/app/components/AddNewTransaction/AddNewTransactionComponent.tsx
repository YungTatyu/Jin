import {
  PublicKey,
} from '@solana/web3.js';
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { addNewTransaction } from '../api';

// import IDL from '/usr/src/project/target/idl/refundable_escrow.json';
const IDL = require('/usr/src/project/target/idl/refundable_escrow.json');

const PROGRAM_ID = new PublicKey(
  'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);

interface input {
  sellerAddress: string;
  amount: string;
  refundDeadline: string;
  transactionInfo: string;
}

const AddNewTransactionComponent: React.FC<input> = ({
  sellerAddress,
  amount,
  refundDeadline,
  transactionInfo,
}) => {
  const wallet = useAnchorWallet()
  
  const handleAddNewTransaction = async () => {
    if (
      !sellerAddress ||
      !amount ||
      !refundDeadline ||
      !transactionInfo ||
      !wallet
    ) {
      alert('必要な情報が不足しています');
      return;
    }
    const ssss = new PublicKey(sellerAddress)
    alert("1111111111")
    let f = addNewTransaction(wallet, wallet.signTransaction, wallet.publicKey, ssss, 1, Number(amount), Number(refundDeadline) * 24 * 60 * 60, transactionInfo)
    alert(`${f}`)
    alert("22222222222")


    alert(
      `${sellerAddress}\n${amount}\n${refundDeadline}\n${transactionInfo}\n`
    );
  };

  return (
    <div>
      <button className={styles.okButton} onClick={handleAddNewTransaction}>
        OK
      </button>
    </div>
  );
};

export default AddNewTransactionComponent;
