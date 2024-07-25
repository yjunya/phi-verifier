import {
  CustomError,
  ErrorCodes,
  withCustomErrorHandling,
} from "@/libs/custom-error";
import { getAddress } from "@/libs/params";
import { createSignature } from "@/libs/signature";
import type { VerifierApi } from "@/types/verifier-api";
import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import {
  arbitrum,
  base,
  berachainTestnet,
  mainnet,
  optimism,
  scroll,
  taiko,
  zkSync,
} from "viem/chains";

const handler: VerifierApi = async (req, { params }) => {
  const address = getAddress(req);
  const client = getClient(params?.chain);

  const txCount = await client.getTransactionCount({ address });
  const mintEligibility = txCount > 0;

  const signature = await createSignature({
    address,
    mint_eligibility: mintEligibility,
  });

  return NextResponse.json({ signature, mint_eligibility: mintEligibility });
};

const getClient = (chain?: string) => {
  switch (chain) {
    case "eth":
      return createPublicClient({
        chain: mainnet,
        transport: http(process.env.RPC_ETH),
      });
    case "arbitrum":
      return createPublicClient({
        chain: arbitrum,
        transport: http(process.env.RPC_ARBITRUM),
      });
    case "optimism":
      return createPublicClient({
        chain: optimism,
        transport: http(process.env.RPC_OPTIMISM),
      });
    case "base":
      return createPublicClient({
        chain: base,
        transport: http(process.env.RPC_BASE),
      });
    case "scroll":
      return createPublicClient({
        chain: scroll,
        transport: http(process.env.RPC_SCROLL),
      });
    case "taiko":
      return createPublicClient({
        chain: taiko,
        transport: http(process.env.RPC_TAIKO),
      });
    case "zksync_era":
      return createPublicClient({
        chain: zkSync,
        transport: http(process.env.RPC_ZKSYNC_ERA),
      });
    case "berachain_testnet":
      return createPublicClient({
        chain: berachainTestnet,
        transport: http(process.env.RPC_BERACHAIN_TESTNET),
      });
    default:
      throw new CustomError(ErrorCodes.InvalidChain);
  }
};

export const GET = withCustomErrorHandling(handler);
