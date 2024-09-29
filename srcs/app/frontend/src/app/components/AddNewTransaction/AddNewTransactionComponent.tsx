import { PublicKey } from '@solana/web3.js';
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { addNewTransaction } from '../api';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import IDL from '../../../../../target/idl/refundable_escrow.json';

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
  const wallet = useAnchorWallet();
  const connection = useConnection();
  if (!wallet) {
    throw new Error('Wallet not connected');
  }
  const provider = new AnchorProvider(
    connection.connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  const program: Program = new Program(IDL, PROGRAM_ID, provider);

  const handleAddNewTransaction = async () => {
    if (!sellerAddress || !amount || !refundDeadline || !transactionInfo) {
      alert('必要な情報が不足しています');
      return;
    }
    const sellerAdd = new PublicKey(sellerAddress);
    const f = addNewTransaction(
      program,
      PROGRAM_ID,
      sellerAdd,
      1,
      Number(amount),
      Number(refundDeadline),
      transactionInfo
    );
    if (!f) {
      alert('addNewTransaction() Error');
      return;
    }
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
