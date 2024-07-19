import { VerifierApi, VerifierApiResponce } from "@/types/verifier-api";
import { NextResponse } from "next/server";
import { CustomError, ErrorCodes } from "./error";

export const withCustomErrorHandling: Func =
  (handler) =>
  async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof CustomError) {
        return NextResponse.json(err, { status: err.status });
      } else {
        console.error(err);
        const internalServerError = new CustomError(
          ErrorCodes.InternalServerError
        );
        return NextResponse.json(internalServerError, {
          status: internalServerError.status,
        });
      }
    }
  };

type Func = (
  handler: VerifierApi
) => (
  ...args: Parameters<VerifierApi>
) => Promise<VerifierApiResponce | NextResponse<CustomError>>;
