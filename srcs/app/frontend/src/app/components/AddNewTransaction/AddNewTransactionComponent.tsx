import { PublicKey } from '@solana/web3.js';
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { addNewTransaction, countTransactions } from '../api';

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
  const wallet = useAnchorWallet();

  const handleAddNewTransaction = async () => {
    alert(
      `${sellerAddress}\n${amount}\n${refundDeadline}\n${transactionInfo}\n`
    );
    if (
      !sellerAddress ||
      !amount ||
      !refundDeadline ||
      !transactionInfo ||
      !wallet
    ) {
      return;
    }
    const ssss = new PublicKey(sellerAddress);
    const num_of_transactions = await countTransactions(ssss, wallet.publicKey);
    await addNewTransaction(
      wallet,
      wallet.signTransaction,
      wallet.publicKey,
      ssss,
      num_of_transactions + 1,
      Number(amount),
      Number(refundDeadline) * 24 * 60 * 60,
      transactionInfo
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
