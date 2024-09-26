const anchor = require('@project-serum/anchor');
const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const { Wallet } = require('@project-serum/anchor');
const fs = require('fs');

// SolanaのProgram IDを指定
const PROGRAM_ID = new PublicKey('FuPCcrAxKT4QKQMcdYf3e65DReF7DV1C8sW8TowcSYMN');

// SolanaプログラムのIDL(Interface Definition Language)を読み込む
const IDL = require('../../target/idl/refundable_escrow.json')

// ローカル環境の秘密鍵のパス
const WALLET_FILE_PATH = '/root/.config/solana/id.json';
const SELLER_FILE_PATH = '/root/.config/solana/id2.json';

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
async function getEscrowPDA(buyer_pubkey, seller_pubkey, transactionId) {
	const transactionIdBuffer = Buffer.alloc(8);
	transactionIdBuffer.writeBigInt64LE(BigInt(transactionId.toNumber()), 0);

	const seeds = [
		buyer_pubkey.toBuffer(),
		seller_pubkey.toBuffer(),
		transactionIdBuffer,
	]

	const [counterPDA, _] = await PublicKey.findProgramAddress(
		seeds,
		PROGRAM_ID
	);
	return counterPDA;
}

async function createEscrow() {
	const provider = await setupProvider();
	const program = new anchor.Program(IDL, PROGRAM_ID, provider);
	const buyerPublicKey = provider.wallet.publicKey;
	const seller = new anchor.Wallet(loadWalletKey(SELLER_FILE_PATH));
	const transactionId = new anchor.BN(1);
	const lamports = new anchor.BN(500000);
	const refundableSeconds = new anchor.BN(10);
	const userDefinedData = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
	const escrowPDA = await getEscrowPDA(buyerPublicKey, seller.publicKey, transactionId);

	await program.methods
		.createRefundableEscrow(transactionId, lamports, refundableSeconds, userDefinedData)
		.accounts({
			buyer: buyerPublicKey,
			seller: seller.publicKey,
			escrow: escrowPDA,
			systemProgram: SystemProgram.programId,
		})
		.rpc();

	console.log('Buyer  Balance:', await provider.connection.getBalance(buyerPublicKey));
	console.log('Seller Balance:', await provider.connection.getBalance(seller.publicKey));
	findPDA(buyerPublicKey);
}

async function refund() {
	const provider = await setupProvider();
	const program = new anchor.Program(IDL, PROGRAM_ID, provider);
	const buyerPublicKey = provider.wallet.publicKey;
	const seller = new anchor.Wallet(loadWalletKey(SELLER_FILE_PATH));
	const transactionId = new anchor.BN(1);
	const escrowPDA = await getEscrowPDA(buyerPublicKey, seller.publicKey, transactionId);

	await program.methods
		.settleLamports()
		.accounts({
			requestor: buyerPublicKey,
			escrow: escrowPDA,
		})
		.rpc();

	console.log('Buyer  Balance:', await provider.connection.getBalance(buyerPublicKey));
	console.log('Seller Balance:', await provider.connection.getBalance(seller.publicKey));
	findPDA(buyerPublicKey);
}

async function withdraw() {
	const provider = await setupProvider();
	const program = new anchor.Program(IDL, PROGRAM_ID, provider);
	const buyerPublicKey = provider.wallet.publicKey;
	const seller = new anchor.Wallet(loadWalletKey(SELLER_FILE_PATH));
	const transactionId = new anchor.BN(1);
	const escrowPDA = await getEscrowPDA(buyerPublicKey, seller.publicKey, transactionId);

	await program.methods
		.settleLamports()
		.accounts({
			requestor: seller.publicKey,
			escrow: escrowPDA,
		})
		.signers([seller.payer])
		.rpc();

	console.log('Buyer  Balance:', await provider.connection.getBalance(buyerPublicKey));
	console.log('Seller Balance:', await provider.connection.getBalance(seller.publicKey));
	findPDA(buyerPublicKey);
}

async function findPDA(buyer_pubkey) {
	const connection = new Connection(DEPLOY_NET, 'confirmed');
	const accounts = await connection.getParsedProgramAccounts(
		PROGRAM_ID,
		{
			filters: [
				{
					memcmp: {
						offset: 40,
						bytes: buyer_pubkey,
					},
				},
			],
		}
	);
	for (let i = 0; i < accounts.length; i++) {
		const accountData = accounts[i].account.data;
		const refundableEscrow = decodeRefundableEscrow(accountData);
		console.log("RefundableEscrow: ", refundableEscrow);
	}
}

function decodeRefundableEscrow(buffer) {
	const sellerPubkey = buffer.slice(8, 40);
	const buyerPubkey = buffer.slice(40, 72);
	const transactionId = buffer.readBigUInt64LE(72);
	const lamports = buffer.readBigUInt64LE(80);
	const createAt = buffer.readBigInt64LE(88);
	const refundDeadline = buffer.readBigInt64LE(96);
	const isCanceled = buffer.readUInt8(104) !== 0;
	const userDefinedData = buffer.slice(109, 209).toString('utf-8');

	return {
		seller_pubkey: new PublicKey(sellerPubkey).toString(),
		buyer_pubkey: new PublicKey(buyerPubkey).toString(),
		transaction_id: transactionId.toString(),
		lamports: lamports.toString(),
		create_at: createAt.toString(),
		refund_deadline: refundDeadline.toString(),
		is_canceled: isCanceled,
		user_defined_data: userDefinedData,
	};
}

function sleep(milliseconds) {
	const start = Date.now();
	while (Date.now() - start < milliseconds) {
	}
}

(async () => {
	try {
		await createEscrow();
	} catch (error) {
		console.error("Error: ", error);
	}
	try {
		await refund();
	} catch (error) {
		console.error('Error:', error);
	}
	// sleep(12000);
	// try {
	// 	await withdraw();
	// } catch (error) {
	// 	console.error('Error:', error);
	// }
})();
