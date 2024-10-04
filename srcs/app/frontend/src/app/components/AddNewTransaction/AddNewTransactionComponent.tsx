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

type Result<T> = {
  value: T;
  error: string;
};

const MAX_TRANSACTION_INFO = 100;

/* transactionInfoをvalidateする関数
boolを返すのでも良かったが、下の関数群と合わせるためにResultを採用 */
function validateTransactionInfo(transactionInfo: string): Result<string> {
  transactionInfo = transactionInfo.trim();

  if (!/^[a-zA-Z0-9]+$/.test(transactionInfo)) {
    return {
      value: '',
      error:
        '"transaction info" field must contain only alphanumeric characters',
    };
  }
  // TextEncoderを使ってバイト数を計算
  if (
    transactionInfo.length === 0 ||
    transactionInfo.length > MAX_TRANSACTION_INFO
  ) {
    return {
      value: '',
      error: 'Transaction info should be no longer than 100 characters',
    };
  }
  return { value: transactionInfo, error: '' };
}

/* 入力はSOLの単位でくるが、スマートコントラクトはLamportsを期待しているため、
10^9を乗算し、Lamportsに変換 */
function solToLamports(sol: string): Result<BigNumber> {
  sol = sol.trim();
  if (sol === '') {
    return { value: new BigNumber(0), error: '"Enter amount" field is blank' };
  }
  /* 1 SOL あたりの Lamports 数を定義します（1 SOL = 10^9 Lamports）。*/
  const LAMPORTS_PER_SOL: BigNumber = new BigNumber('1000000000');
  const MIN_SOL: BigNumber = new BigNumber('0.000000001');
  const MAX_SOL: BigNumber = new BigNumber('100000000');
  try {
    const solAmount: BigNumber = new BigNumber(sol);
    /* 数値として無効な場合（NaN）、エラーを返します。 */
    if (solAmount.isNaN()) {
      return { value: new BigNumber(0), error: 'Invalid number format' };
    }
    /* 負の値の場合、エラーを返します。 */
    if (solAmount.isNegative()) {
      return { value: new BigNumber(0), error: 'Amount cannot be negative' };
    }
    /* 0.000000001を最小単位とし、それ以下が来るとエラーを返す */
    if (solAmount.isLessThan(MIN_SOL)) {
      return {
        value: new BigNumber(0),
        error: 'Amount is less than 0.000000001 SOL (1 Lamport)',
      };
    }
    /* 100000000以上の値が来るとエラーを返す */
    if (solAmount.isGreaterThanOrEqualTo(MAX_SOL)) {
      return {
        value: new BigNumber(0),
        error: 'Amount is 100000000 SOL or more',
      };
    }
    /* SOL を Lamports に変換します（solAmount に LAMPORTS_PER_SOL を掛ける） */
    const lamports = solAmount.times(LAMPORTS_PER_SOL);
    /* 変換結果が整数でない場合（精度が失われる場合）、エラーを返します。 */
    if (!lamports.isInteger()) {
      return {
        value: new BigNumber(0),
        error: 'Conversion would lose precision',
      };
    }
    return { value: lamports, error: '' };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return { value: new BigNumber(0), error: errorMessage };
  }
}

function daysToSeconds(days: string): Result<BigNumber> {
  days = days.trim();
  if (days === '') {
    return {
      value: new BigNumber(0),
      error: '"Enter refund deadline" field is blank',
    };
  }
  // 入力が有効な数値かどうかチェック
  if (!/^\d+(\.\d+)?$/.test(days)) {
    return { value: new BigNumber(0), error: 'Please enter a valid number' };
  }
  const dayNumber = new BigNumber(days);
  // 入力が1~360の範囲内かチェック
  if (dayNumber.isLessThan(1) || dayNumber.isGreaterThan(360)) {
    return {
      value: new BigNumber(0),
      error: 'Please enter a number of days between 1 and 360',
    };
  }
  // 日数を秒数に変換 BigNumber の乗算メソッドを使用して、より正確な計算を行うようにしました。
  const seconds: BigNumber = dayNumber.multipliedBy(24 * 60 * 60);
  return { value: seconds, error: '' };
}

function sellerAddressToPublickey(
  address: string,
  ownPubKey: PublicKey
): Result<PublicKey> {
  const INVALID_PUBLIC_KEY = new PublicKey('11111111111111111111111111111111');
  const keyoriginal = address.trim();
  if (keyoriginal === '') {
    return {
      value: new PublicKey(INVALID_PUBLIC_KEY),
      error: '"Enter seller address" field is blank',
    };
  }
  // 厳密なBase58文字のみを許可する正規表現
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (keyoriginal.length != 44 || !base58Regex.test(keyoriginal)) {
    return {
      value: new PublicKey(INVALID_PUBLIC_KEY),
      error: 'Seller address is not in the correct format',
    };
  }
  try {
    // PublicKeyクラスのコンストラクタを使用して有効性をチェック
    const pubkey = new PublicKey(keyoriginal);
    // PublicKeyが正しく生成されたことを確認
    // 注意: isOnCurve は静的メソッドなので、インスタンスではなくクラスに対して呼び出します
    if (!PublicKey.isOnCurve(pubkey.toBuffer())) {
      return {
        value: new PublicKey(INVALID_PUBLIC_KEY),
        error: 'Invalid public key: not on ed25519 curve',
      };
    }
    // 入力されたpubkeyと自分のpubkeyが同じだとエラーを返す
    if (pubkey.equals(ownPubKey)) {
      return {
        value: new PublicKey(INVALID_PUBLIC_KEY),
        error: "The seller's public key is the same as your own public key",
      };
    }
    return { value: pubkey, error: '' };
  } catch (error) {
    return {
      value: new PublicKey(INVALID_PUBLIC_KEY),
      error: `Invalid public key: ${error}`,
    };
  }
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
    // ここで各入力値をvalidateし、必要な値に変換しています
    const address = sellerAddressToPublickey(sellerAddress, wallet.publicKey);
    if (address.error !== '') {
      alert(`Error: ${address.error}`);
      return;
    }
    const lamports = solToLamports(amount);
    if (lamports.error !== '') {
      alert(`Error: ${lamports.error}`);
      return;
    }
    const seconds = daysToSeconds(refundDeadline);
    if (seconds.error !== '') {
      alert(`Error: ${seconds.error}`);
      return;
    }
    const trInfo = validateTransactionInfo(transactionInfo);
    if (trInfo.error !== '') {
      alert(`Error: ${trInfo.error}`);
      return;
    }
    const numTransactions = await countTransactions(
      address.value,
      wallet.publicKey
    );
    await addNewTransaction(
      wallet,
      wallet.signTransaction,
      wallet.publicKey,
      address.value,
      numTransactions + 1,
      lamports.value,
      seconds.value,
      trInfo.value
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
