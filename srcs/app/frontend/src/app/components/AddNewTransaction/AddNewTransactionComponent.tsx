import { PublicKey } from '@solana/web3.js';
import styles from '../../styles/AddNewTransaction/AddNewTransaction.module.css';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { addNewTransaction, countTransactions } from '../api';
import { BigNumber } from 'bignumber.js';

interface input {
  sellerAddress: string;
  amount: string;
  refundDeadline: string;
  transactionInfo: string;
}

function isAmount(str: string) : boolean {
  str = str.trim();
  // 空文字列の場合はfalse
  if (str.length === 0) return false;
  // 負の場合と0の場合にfalse
  if (str[0] === '-' || (str[0] === '0' && str.length === 1)) return false;
  // 数値に変換してみる
  const num = Number(str);
  return !isNaN(num) && isFinite(num);
}

function isDeadline(str: string) : boolean {
  str = str.trim();
  // 空文字列の場合はfalse
  if (str.length === 0 || str.length > 3) return false;
  const regex = /^[0-9]+$/;
  if (!regex.test(str)) { return false; }
  // 負の場合と0の場合にfalse
  const num = Number(str);
  return num >= 1 && num <= 360;
}

function validateAddNewTransaction(sellerAddress: string, amount: string, refundDeadline: string, transactionInfo: string) : boolean {
  if (
    !sellerAddress ||
    !amount ||
    !refundDeadline ||
    !transactionInfo
  ) {
    return false;
  }
  sellerAddress = sellerAddress.trim();
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (sellerAddress.length != 44 || !alphanumericRegex.test(sellerAddress)) {
    alert("Error: seller address")
    return false;
  }
  if (!isAmount(amount)) {
    alert("Error: amount")
    return false;
  }
  if (!isDeadline(refundDeadline)) {
    alert("Error: deadline")
    return false;
  }
  refundDeadline = refundDeadline.trim();
  if (transactionInfo.length > 0 && transactionInfo.length < 51) {
    alert("Error: transaction info")
    return false;
  }
  return true;
}

/* 入力はSOLの単位でくるが、スマートコントラクトはLamportsを期待しているため、
10^9を乗算し、Lamportsに変換 */
function solToLamports(sol: string | number): string {
  const LAMPORTS_PER_SOL = new BigNumber('1000000000');
  const solAmount = new BigNumber(sol);

  const lamports = solAmount.times(LAMPORTS_PER_SOL);

  return lamports.toFixed(0);
}

const AddNewTransactionComponent: React.FC<input> = ({
  sellerAddress,
  amount,
  refundDeadline,
  transactionInfo,
}) => {
  const wallet = useAnchorWallet();
  const handleAddNewTransaction = async () => {
    if (!wallet) {
      return;
    }
    if (!validateAddNewTransaction(sellerAddress, amount, refundDeadline, transactionInfo)) {
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
      //Number(amount) * 10 ** 9,
      Number(solToLamports(amount)),
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
