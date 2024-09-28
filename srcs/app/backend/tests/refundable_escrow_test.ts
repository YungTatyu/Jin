import { LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { expect } from "chai";

import { execCreateRefundableEscrow, execSettleLamports, ResultStatus } from "./escrow";
import { sleep, getEscrowPDA, airdropLamports } from "./utils";

describe("Refundable Escrow Program", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const SECONDS = 5;
	const SOL1 = (1 * LAMPORTS_PER_SOL); // 1SOL
	const SOL2 = (2 * LAMPORTS_PER_SOL); // 2SOL
	const amountLamports = new BN(SOL1);
	const refundableSeconds = new BN(SECONDS);
	const transactionId = new BN(1);
	const userDefinedData = "TEST";
	const program = anchor.workspace.RefundableEscrow;
	const programId = program.programId;

	it("should refund successfully", async () => {
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

	it("should create PDA fail because PDA already exists", async () => {
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

})
