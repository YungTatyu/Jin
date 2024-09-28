import { PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import { RefundableEscrow } from "../target/types/refundable_escrow";
import { Buffer } from "buffer";
import { expect } from "chai";

enum ResultStatus {
	SUCCESS,
	ERROR,
}

async function execCreateRefundableEscrow(
	program: Program,
	buyer: Keypair,
	seller: Keypair,
	escrow: RefundableEscrow,
	transactionId: BN,
	amountLamports: BN,
	refundableSeconds: BN,
	userDefinedData: String
): Promise<ResultStatus> {
	try {

		await program.methods.createRefundableEscrow(
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData)
			.accounts({
				buyer: buyer.publicKey,
				seller: seller.publicKey,
				escrow: escrow,
				systemProgram: SystemProgram.programId,
			})
			.signers([buyer])
			.rpc();
		return ResultStatus.SUCCESS;
	} catch {
		return ResultStatus.ERROR;
	}
}

async function execSettleLamports(
	program: Program,
	requestor: Keypair,
	escrow: RefundableEscrow): Promise<ResultStatus> {
	try {
		await program.methods.settleLamports()
			.accounts({
				requestor: requestor.publicKey,
				escrow: escrow
			})
			.signers([requestor])
			.rpc();
		return ResultStatus.SUCCESS;
	} catch {
		return ResultStatus.ERROR;
	}
}

async function getEscrowPDA(
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

async function airdropLamports(
	provider: AnchorProvider,
	keypair: Keypair,
	amountLamports: number) {
	const connection = provider.connection;
	const signature = await connection.requestAirdrop(keypair.publicKey, amountLamports);
	await connection.confirmTransaction(signature);
}

function sleep(seconds: number) {
	const milliseconds = seconds * 1000;
	const start = Date.now();
	while (Date.now() - start < milliseconds) {
	}
}

describe("Refundable Escrow Program", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const SECONDS = 5;
	const SOL1 = (1 * LAMPORTS_PER_SOL); // 1SOL
	const SOL2 = (2 * LAMPORTS_PER_SOL); // 2SOL
	const amountLamports = new BN(SOL1);
	const refundableSeconds = new BN(SECONDS);
	const userDefinedData = "TEST";
	const program = anchor.workspace.RefundableEscrow;
	const programId = program.programId;

	it("should refund successfully", async () => {
		const transactionId = new BN(1);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		expect(await execSettleLamports(program, buyer, escrowPDA)).to.equal(ResultStatus.SUCCESS);
	});

	it("should withdraw successfully", async () => {
		const transactionId = new BN(2);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		sleep(SECONDS + 2);
		expect(await execSettleLamports(program, seller, escrowPDA)).to.equal(ResultStatus.SUCCESS);
	});

	it("should refund fail because it is outside refund period", async () => {
		const transactionId = new BN(3);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		sleep(SECONDS + 2);
		expect(await execSettleLamports(program, buyer, escrowPDA)).to.equal(ResultStatus.ERROR);
	});

	it("should withdraw fail because it is inside refund period", async () => {
		const transactionId = new BN(4);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		expect(await execSettleLamports(program, seller, escrowPDA)).to.equal(ResultStatus.ERROR);
	});

	it("should create PDA fail because amountLamports is negative", async () => {
		const transactionId = new BN(5);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);
		const negativeAmountLamports = -amountLamports;

		expect(
			await execCreateRefundableEscrow(
				program,
				buyer,
				seller,
				escrowPDA,
				transactionId,
				negativeAmountLamports,
				refundableSeconds,
				userDefinedData
			)
		).to.equal(ResultStatus.ERROR);
	});

	it("should create PDA fail because amountLamports is zero", async () => {
		const transactionId = new BN(6);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);
		const zeroAmountLamports = new BN(0);

		expect(
			await execCreateRefundableEscrow(
				program,
				buyer,
				seller,
				escrowPDA,
				transactionId,
				zeroAmountLamports,
				refundableSeconds,
				userDefinedData
			)
		).to.equal(ResultStatus.ERROR);
	});

	it("should create PDA fail because buyer doesn't have enough amountLamports", async () => {
		const transactionId = new BN(7);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, (1 * LAMPORTS_PER_SOL) - 1);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		expect(
			await execCreateRefundableEscrow(
				program,
				buyer,
				seller,
				escrowPDA,
				transactionId,
				amountLamports,
				refundableSeconds,
				userDefinedData
			)
		).to.equal(ResultStatus.ERROR);
	});

	it("should create PDA fail because refundable seconds too long", async () => {
		const transactionId = new BN(8);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);
		const tooLongRefundableSeconds = new BN((60 * 60 * 24 * 365) + 1);

		expect(
			await execCreateRefundableEscrow(
				program,
				buyer,
				seller,
				escrowPDA,
				transactionId,
				amountLamports,
				tooLongRefundableSeconds,
				userDefinedData
			)
		).to.equal(ResultStatus.ERROR);
	});

	it("should create PDA fail because refundable seconds too short", async () => {
		const transactionId = new BN(9);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);
		const tooShortRefundableSeconds = new BN(0);

		expect(
			await execCreateRefundableEscrow(
				program,
				buyer,
				seller,
				escrowPDA,
				transactionId,
				amountLamports,
				tooShortRefundableSeconds,
				userDefinedData
			)
		).to.equal(ResultStatus.ERROR);
	});

	it("should create PDA fail because userDefinedData too large", async () => {
		const transactionId = new BN(10);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);
		const tooLargeUserDefinedData = "A".repeat(101);

		expect(
			await execCreateRefundableEscrow(
				program,
				buyer,
				seller,
				escrowPDA,
				transactionId,
				amountLamports,
				refundableSeconds,
				tooLargeUserDefinedData
			)
		).to.equal(ResultStatus.ERROR);
	});

	it("should refund fail because requestor is neigher the buyer nor seller", async () => {
		const transactionId = new BN(11);
		const seller = new Keypair();
		const buyer = new Keypair();
		const other = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		await airdropLamports(provider, other, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		expect(await execSettleLamports(program, other, escrowPDA)).to.equal(ResultStatus.ERROR);
	});

	it("should withdraw fail because requestor is neigher the buyer nor seller", async () => {
		const transactionId = new BN(12);
		const seller = new Keypair();
		const buyer = new Keypair();
		const other = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		await airdropLamports(provider, other, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		sleep(SECONDS + 2);
		expect(await execSettleLamports(program, other, escrowPDA)).to.equal(ResultStatus.ERROR);
	});

	it("should refund fail because refund was done multiple times", async () => {
		const transactionId = new BN(13);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		await execSettleLamports(program, buyer, escrowPDA);
		expect(await execSettleLamports(program, buyer, escrowPDA)).to.equal(ResultStatus.ERROR);
	});

	it("should refund fail because withdraw was done multiple times", async () => {
		const transactionId = new BN(14);
		const seller = new Keypair();
		const buyer = new Keypair();
		await airdropLamports(provider, buyer, SOL2);
		const escrowPDA = await getEscrowPDA(buyer, seller, transactionId, programId);

		await execCreateRefundableEscrow(
			program,
			buyer,
			seller,
			escrowPDA,
			transactionId,
			amountLamports,
			refundableSeconds,
			userDefinedData
		);
		sleep(SECONDS + 2);
		await execSettleLamports(program, seller, escrowPDA);
		expect(await execSettleLamports(program, seller, escrowPDA)).to.equal(ResultStatus.ERROR);
	});
})
