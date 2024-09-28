import { Keypair, SystemProgram } from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";
import { RefundableEscrow } from "../target/types/refundable_escrow";

// If the transaction is successful, then SUCCESS.
// If it fails, then ERROR.
export enum ResultStatus {
	SUCCESS,
	ERROR,
}

// Call the createRefundableEscrow API
// If an exception occurs, return ERROR; otherwise, return SUCCESS
export async function execCreateRefundableEscrow(
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

// Call the settleLamports API
// If an exception occurs, return ERROR; otherwise, return SUCCESS
export async function execSettleLamports(
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
