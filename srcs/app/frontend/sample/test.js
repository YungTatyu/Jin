const anchor = require('@project-serum/anchor');
const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

// SolanaのProgram IDを指定
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// SolanaプログラムのIDL(Interface Definition Language)を読み込む
const IDL = require('../../target/idl/refundable_escrow.json')

// ローカル環境の秘密鍵のパス
const WALLET_FILE_PATH = '/root/.config/solana/id.json';
const SELLER_FILE_PATH = '/root/.config/solana/id2.json';

// 使用するネットワーク
const DEPLOY_NET = 'http://127.0.0.1:8899';

// 返金可能秒数
const SECONDS = 10;

// ウォレットの秘密鍵をJSONファイルから読み込む関数
function loadWalletKey(filePath) {
	const secretKeyString = fs.readFileSync(filePath, 'utf-8'); // 秘密鍵のJSONファイルを読み込む
	const secretKey = Uint8Array.from(JSON.parse(secretKeyString)); // Uint8Arrayに変換
	return Keypair.fromSecretKey(secretKey); // Keypairオブジェクトを生成
}

// Providerをセットアップする関数(Solanaネットワークとの接続とウォレットのセットアップ)
async function setupProvider() {
	const connection = new Connection(DEPLOY_NET, 'confirmed');
	const wallet = new anchor.Wallet(loadWalletKey(WALLET_FILE_PATH));

	// Anchorのプロバイダーを作成(接続とウォレットを含む)
	const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: 'confirmed' });
	anchor.setProvider(provider); // プロバイダーをグローバルに設定

	return provider;
}

// RefundableEscrowアカウントのPDA(Program Derived Address)を取得する関数
async function getEscrowPDA(buyer_pubkey, seller_pubkey, transactionId) {
	// バイト列に変換
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

// スマートコントラクタのAPI1を叩き、PDA作成・PDAへの送金を実行
async function createEscrow(program, buyerPublicKey, seller, transactionId, amountLamports, refundableSeconds, userDefinedData) {
	const escrowPDA = await getEscrowPDA(buyerPublicKey, seller.publicKey, transactionId);

	await program.methods
		.createRefundableEscrow(transactionId, amountLamports, refundableSeconds, userDefinedData)
		.accounts({
			buyer: buyerPublicKey,
			seller: seller.publicKey,
			escrow: escrowPDA,
			systemProgram: SystemProgram.programId,
		})
		.rpc();
}

// スマートコントラクタのAPI2を買い手側が叩く
async function refund(program, buyerPublicKey, seller, transactionId) {
	const escrowPDA = await getEscrowPDA(buyerPublicKey, seller.publicKey, transactionId);

	await program.methods
		.settleLamports()
		.accounts({
			requestor: buyerPublicKey,
			escrow: escrowPDA,
		})
		.rpc();
}

// スマートコントラクタのAPI2を売り手側が叩く
async function withdraw(program, buyerPublicKey, seller, transactionId) {
	const escrowPDA = await getEscrowPDA(buyerPublicKey, seller.publicKey, transactionId);

	await program.methods
		.settleLamports()
		.accounts({
			requestor: seller.publicKey,
			escrow: escrowPDA,
		})
		.signers([seller.payer])
		.rpc();
}

// スマートコントラクタに紐づいたPDAの中でbuyerの公開鍵が一致するものを探して表示
// TODO 引数と戻り値を変えればもう少し汎用的な関数にできる
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

// RefundableEscrow構造体のspaceを用いてバイト列をデシリアライズ
async function decodeRefundableEscrow(buffer) {
	const sellerPubkey = buffer.slice(8, 40);
	const buyerPubkey = buffer.slice(40, 72);
	const transactionId = buffer.readBigUInt64LE(72);
	const amountLamports = buffer.readBigUInt64LE(80);
	const createAt = buffer.readBigInt64LE(88);
	const refundDeadline = buffer.readBigInt64LE(96);
	const isCanceled = buffer.readUInt8(104) !== 0;
	const userDefinedData = buffer.slice(109).toString('utf-8');

	return {
		seller_pubkey: new PublicKey(sellerPubkey).toString(),
		buyer_pubkey: new PublicKey(buyerPubkey).toString(),
		transaction_id: transactionId.toString(),
		amount_lamports: amountLamports.toString(),
		create_at: createAt.toString(),
		refund_deadline: refundDeadline.toString(),
		is_canceled: isCanceled,
		user_defined_data: userDefinedData,
	};
}

// ブロッキングするsleep関数(引数はミリ秒単位)
function sleep(milliseconds) {
	const start = Date.now();
	while (Date.now() - start < milliseconds) {
	}
}

async function main() {
	// 関数内で使用する変数の準備
	const provider = await setupProvider();
	const program = new anchor.Program(IDL, PROGRAM_ID, provider);
	const buyerPublicKey = provider.wallet.publicKey;
	const seller = new anchor.Wallet(loadWalletKey(SELLER_FILE_PATH));
	const amountLamports = new anchor.BN(10000000000); // 10SOL
	const refundableSeconds = new anchor.BN(SECONDS);
	const userDefinedData = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";

	console.log("===== Test =====");
	console.log('Buyer  Balance:', await provider.connection.getBalance(buyerPublicKey));
	console.log('Seller Balance:', await provider.connection.getBalance(seller.publicKey));
	// Escrowを作成、返金期間内に買い手が返金を要求
	try {
		const transactionId1 = new anchor.BN(1);
		await createEscrow(program, buyerPublicKey, seller, transactionId1, amountLamports, refundableSeconds, userDefinedData);
		await refund(program, buyerPublicKey, seller, transactionId1);
		await findPDA(buyerPublicKey);
	} catch (error) {
		console.error(error);
	}
	console.log('Buyer  Balance:', await provider.connection.getBalance(buyerPublicKey));
	console.log('Seller Balance:', await provider.connection.getBalance(seller.publicKey));
	// Escrowを作成、返金期間+1秒間sleepし、返金期間外に売り手が払出を要求
	try {
		const transactionId2 = new anchor.BN(2);
		await createEscrow(program, buyerPublicKey, seller, transactionId2, amountLamports, refundableSeconds, userDefinedData);
		sleep((SECONDS + 2) * 1000);
		await withdraw(program, buyerPublicKey, seller, transactionId2);
		await findPDA(buyerPublicKey);
	} catch (error) {
		console.error(error);
	}
	console.log('Buyer  Balance:', await provider.connection.getBalance(buyerPublicKey));
	console.log('Seller Balance:', await provider.connection.getBalance(seller.publicKey));
}

main().catch(console.error);