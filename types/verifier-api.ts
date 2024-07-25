import { NextRequest, NextResponse } from "next/server";
import { Hex } from "viem";

export type VerifierApiResponce = NextResponse<{
  signature: Hex;
  mint_eligibility: boolean;
  data?: string;
}>;

export type VerifierApi = (
  req: NextRequest,
  params: { params: Record<string, string | undefined> }
) => Promise<VerifierApiResponce>;
