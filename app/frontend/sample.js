const anchor = require('@project-serum/anchor');
const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const { Wallet } = require('@project-serum/anchor');
const fs = require('fs');

// プログラムID (Solana上にデプロイされたスマートコントラクトのプログラムID)
const PROGRAM_ID = new PublicKey('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

// idl
const idl = require('../target/idl/counter.json')

// ウォレットの秘密鍵ファイルのパス (Solana CLIで作成したウォレットの場所)
const walletFilePath = '/root/.config/solana/id.json';

function loadWalletKey(filePath) {
	const secretKeyString = fs.readFileSync(filePath, 'utf-8'); // 秘密鍵のJSONファイルを読み込む
	const secretKey = Uint8Array.from(JSON.parse(secretKeyString)); // Uint8Arrayに変換
	return Keypair.fromSecretKey(secretKey); // Keypairオブジェクトを生成
}

// Anchorプロバイダをセットアップ (接続、ウォレット、プロバイダ)
async function setupProvider() {
	const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

	// ウォレットのキーをセットアップ (例: ローカルファイルに保存されたキーペアをロード)
	const wallet = new anchor.Wallet(loadWalletKey(walletFilePath));

	// プロバイダー (Anchorで使用される、トランザクションを送信するためのセットアップ)
	const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: 'confirmed' });
	anchor.setProvider(provider);

	return provider;
}

// CounterアカウントのPDAを取得 (Program Derived Address)
async function getCounterPDA(authorityPublicKey) {
	const [counterPDA, bump] = await PublicKey.findProgramAddress(
		[authorityPublicKey.toBuffer()],
		PROGRAM_ID
	);
	return counterPDA;
}

// カウンターを作成する関数 (create_counter)
async function createCounter() {
	const provider = await setupProvider();
	const program = new anchor.Program(idl, PROGRAM_ID, provider);

	// ウォレットの公開鍵 (authority)
	const authorityPublicKey = provider.wallet.publicKey;

	// CounterアカウントのPDAを取得
	const counterPDA = await getCounterPDA(authorityPublicKey);

	// トランザクション実行
	await program.methods
		.createCounter()
		.accounts({
			authority: authorityPublicKey,
			counter: counterPDA,
			systemProgram: SystemProgram.programId,
		})
		.rpc();

	console.log('Counter created successfully:', counterPDA.toString());
}

// カウンターを更新する関数 (update_counter)
async function updateCounter() {
	const provider = await setupProvider();
	const program = new anchor.Program(idl, PROGRAM_ID, provider);

	// ウォレットの公開鍵 (authority)
	const authorityPublicKey = provider.wallet.publicKey;

	// CounterアカウントのPDAを取得
	const counterPDA = await getCounterPDA(authorityPublicKey);

	const counterAccount = await program.account.counter.fetch(counterPDA);

	console.log('Current Counter Value:', counterAccount.count.toString());

	// トランザクション実行
	await program.methods
		.updateCounter()
		.accounts({
			authority: authorityPublicKey,
			counter: counterPDA,
		})
		.rpc();

	console.log('Counter updated successfully');
}

// 実行例
(async () => {
	try {
		await createCounter();
	} catch (error) {
		console.error("Error or already exist Counter!!");
	}
	try {
		await updateCounter();
	} catch (error) {
		console.error('Error:', error);
	}
})();
