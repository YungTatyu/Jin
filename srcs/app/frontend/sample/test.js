const anchor = require('@project-serum/anchor');
const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const { Wallet } = require('@project-serum/anchor');
const fs = require('fs');

// SolanaのProgram IDを指定
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// SolanaプログラムのIDL(Interface Definition Language)を読み込む
const IDL = require('../../target/idl/counter.json')

// ローカル環境の秘密鍵のパス
const WALLET_FILE_PATH = '/root/.config/solana/id.json';

// 使用するネットワーク
const DEPLOY_NET = 'http://127.0.0.1:8899';

// ウォレットの秘密鍵をJSONファイルから読み込む関数
function loadWalletKey(filePath) {
	const secretKeyString = fs.readFileSync(filePath, 'utf-8'); // 秘密鍵のJSONファイルを読み込む
	const secretKey = Uint8Array.from(JSON.parse(secretKeyString)); // Uint8Arrayに変換
	return Keypair.fromSecretKey(secretKey); // Keypairオブジェクトを生成
}

// Providerをセットアップする関数(Solanaネットワークとの接続とウォレットのセットアップ)
async function setupProvider() {
	// Solanaのローカルネットワークに接続
	const connection = new Connection(DEPLOY_NET, 'confirmed');

	// ウォレットをロード
	const wallet = new anchor.Wallet(loadWalletKey(WALLET_FILE_PATH));

	// Anchorのプロバイダーを作成(接続とウォレットを含む)
	const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: 'confirmed' });
	anchor.setProvider(provider); // プロバイダーをグローバルに設定

	return provider;
}

// CounterアカウントのPDA(Program Derived Address)を取得する関数
async function getCounterPDA(authorityPublicKey) {
	// authority(ユーザー)の公開鍵に基づいてPDAを生成する
	const [counterPDA, bump] = await PublicKey.findProgramAddress(
		[authorityPublicKey.toBuffer()], // authorityの公開鍵をバッファに変換
		PROGRAM_ID
	);
	return counterPDA;
}

// Counterアカウントを作成する関数
async function createCounter() {
	// プロバイダーをセットアップ
	const provider = await setupProvider();

	// プログラムをAnchorを使ってセットアップ
	const program = new anchor.Program(IDL, PROGRAM_ID, provider);

	// authority(ウォレット)の公開鍵を取得
	const authorityPublicKey = provider.wallet.publicKey;

	// CounterアカウントのPDAを取得
	const counterPDA = await getCounterPDA(authorityPublicKey);

	// スマートコントラクトを呼び出してCounterアカウントを作成
	await program.methods
		.createCounter() // createCounterメソッドを呼び出し
		.accounts({
			authority: authorityPublicKey, // authority(ウォレット)
			counter: counterPDA, // CounterアカウントのPDA
			systemProgram: SystemProgram.programId, // システムプログラム(アカウント作成に必要)
		})
		.rpc(); // 実際にRPCリクエストを送信

	// 成功した場合、PDAを表示
	console.log('Counter created successfully:', counterPDA.toString());
}

// Counterアカウントをインクリメントする関数
async function updateCounter() {
	// プロバイダーをセットアップ
	const provider = await setupProvider();

	// プログラムをAnchorを使ってセットアップ
	const program = new anchor.Program(IDL, PROGRAM_ID, provider);

	// authority(ウォレット)の公開鍵を取得
	const authorityPublicKey = provider.wallet.publicKey;

	// CounterアカウントのPDAを取得
	const counterPDA = await getCounterPDA(authorityPublicKey);

	// Counterアカウントの現在の値を取得して表示
	const counterAccount = await program.account.counter.fetch(counterPDA);
	console.log('Current Counter Value:', counterAccount.count.toString());

	// スマートコントラクトを呼び出してカウンタをインクリメント
	await program.methods
		.updateCounter() // updateCounterメソッドを呼び出し
		.accounts({
			authority: authorityPublicKey, // authority(ウォレット)
			counter: counterPDA, // CounterアカウントのPDA
		})
		.rpc(); // 実際にRPCリクエストを送信

	// 成功した場合、メッセージを表示
	console.log('Counter updated successfully');
}

// メインの処理を実行する即時関数
(async () => {
	try {
		// Counterアカウントの作成を試みる
		await createCounter();
	} catch (error) {
		// エラーが発生した場合、既にCounterアカウントが存在している可能性がある
		console.error("Error or already exist Counter!!");
	}
	try {
		// Counterアカウントの更新（インクリメント）を試みる
		await updateCounter();
	} catch (error) {
		// エラーが発生した場合のメッセージ
		console.error('Error:', error);
	}
})();
