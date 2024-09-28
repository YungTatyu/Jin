import { PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { Buffer } from "buffer";

export function sleep(seconds: number) {
	const milliseconds = seconds * 1000;
	const start = Date.now();
	while (Date.now() - start < milliseconds) {
	}
}

export async function getEscrowPDA(
	buyer: Keypair,
	seller: Keypair,
	transactionId: BN,
	programId: PublicKey) {
	// convert to bytes
	const transactionIdBuffer = Buffer.alloc(8);
	transactionIdBuffer.writeBigInt64LE(BigInt(transactionId.toNumber()), 0);

	const seeds = [
		buyer.publicKey.toBuffer(),
		seller.publicKey.toBuffer(),
		transactionIdBuffer,
	]

	const [escrowPDA, _] = await PublicKey.findProgramAddress(
		seeds,
		programId
	);
	return escrowPDA;
}

export async function airdropLamports(
	provider: AnchorProvider,
	keypair: Keypair,
	amountLamports: number) {
	const connection = provider.connection;
	const signature = await connection.requestAirdrop(keypair.publicKey, amountLamports);
	await connection.confirmTransaction(signature);
}
