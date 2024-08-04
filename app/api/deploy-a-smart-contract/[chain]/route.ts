import {
  CustomError,
  ErrorCodes,
  withCustomErrorHandling,
} from "@/libs/custom-error";
import { getAddress } from "@/libs/params";
import { createSignature } from "@/libs/signature";
import { Transaction } from "@/types/transaction";
import type { VerifierApi } from "@/types/verifier-api";
import { NextResponse } from "next/server";
import { Hex } from "viem";

const RECORD_LIMIT = 10000;

const handler: VerifierApi = async (req, { params }) => {
  const address = getAddress(req);
  const endpoint = getEndpoint(params?.chain);

  const mintEligibility = await isContractDeployed(endpoint, address);

  const signature = await createSignature({
    address,
    mint_eligibility: mintEligibility,
  });

  return NextResponse.json({ signature, mint_eligibility: mintEligibility });
};

const isContractDeployed = async (
  endpoint: string,
  address: Hex
): Promise<boolean> => {
  let startblock = "0";
  while (true) {
    const query = `?apikey=${process.env.ETHERSCAN_API_KEY}&module=account&action=txlist&startblock=${startblock}&sort=asc&address=${address}`;
    const responce = await fetch(endpoint + query);
    const body = await responce.json();

    if (!body || !Array.isArray(body.result))
      throw new CustomError(ErrorCodes.EtherscanFailed);

    const txlist = body.result as Transaction[];

    if (txlist.some((tx) => tx.to === "" && tx.isError === "0")) return true;

    if (txlist.length < RECORD_LIMIT) return false;

    startblock = txlist.slice(-1)[0].blockNumber;
  }
};

const getEndpoint = (chain?: string) => {
  switch (chain) {
    case "eth":
      return "https://api.etherscan.io/api";
    case "eth_sepolia":
      return "https://api-sepolia.etherscan.io/api";
    default:
      throw new CustomError(ErrorCodes.InvalidChain);
  }
};

export const GET = withCustomErrorHandling(handler);
