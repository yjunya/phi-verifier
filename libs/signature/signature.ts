import {
  Address,
  Hex,
  encodeAbiParameters,
  hashMessage,
  keccak256,
  parseAbiParameters,
  toBytes,
  toHex,
} from "viem";
import { sign } from "viem/accounts";

export async function createSignature({
  address,
  result,
  counter,
}: {
  address: Address;
  result: boolean;
  counter: bigint;
}): Promise<Hex> {
  const encodedData = encodeAbiParameters(
    parseAbiParameters("address, bool, uint256"),
    [address, result, counter]
  );
  const { r, s, v } = await sign({
    hash: hashMessage({ raw: toBytes(keccak256(encodedData)) }),
    privateKey: process.env.SIGNER_PRIVATE_KEY as Hex,
  });
  let sBigInt = BigInt(s);
  if (v !== BigInt(27)) {
    sBigInt = sBigInt | (BigInt(1) << BigInt(255));
  }
  const sHex = toHex(sBigInt);
  return `0x${r.slice(2)}${sHex.slice(2)}`;
}
