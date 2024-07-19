import { CustomError, ErrorCodes } from "@/libs/custom-error";
import { NextRequest } from "next/server";
import { Hex, isAddress } from "viem";

export const getAddress: (req: NextRequest) => Hex = (req) => {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    throw new CustomError(ErrorCodes.InvalidAddress);
  }
  return address;
};
