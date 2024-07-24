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

  const result = await isContractDeployed(endpoint, address);
  const counter = BigInt(result);

  const signature = await createSignature({ address, result, counter });

  return NextResponse.json({ signature, result, counter: counter.toString() });
};

const isContractDeployed = async (
  endpoint: string,
  address: Hex
): Promise<boolean> => {
  let startblock = "0";
  while (true) {
    const query = `?module=account&action=txlist&address=${address}&startblock=${startblock}&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;
    const responce = await fetch(endpoint + query);
    const body = await responce.json();

    if (!body || body.message !== "OK") return false;

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
