type Values<T> = T[keyof T];

const DefaultErrorCodes = {
  BadRequest: 400,
  NotFound: 404,
  InternalServerError: 500,
} as const;
type DefaultErrorCode = Values<typeof DefaultErrorCodes>;

const CustomErrorCodes = {
  InvalidAddress: 400001,
  InvalidChain: 400002,
  EtherscanFailed: 400003,
} as const;
type CustomErrorCode = Values<typeof CustomErrorCodes>;

export const ErrorCodes = {
  ...DefaultErrorCodes,
  ...CustomErrorCodes,
} as const;
type ErrorCode = Values<typeof ErrorCodes>;

type ErrorConfig = {
  status: DefaultErrorCode;
  name: string;
  custom_error_code?: CustomErrorCode;
  message?: string;
};

const defaultErrorCodeToConfig: Record<DefaultErrorCode, ErrorConfig> = {
  [DefaultErrorCodes.BadRequest]: {
    status: 400,
    name: "BadRequest",
  },
  [DefaultErrorCodes.NotFound]: {
    status: 404,
    name: "NotFound",
  },
  [DefaultErrorCodes.InternalServerError]: {
    status: 500,
    name: "InternalServerError",
  },
};

const errorCodeToConfig: Record<ErrorCode, ErrorConfig> = {
  ...defaultErrorCodeToConfig,
  [ErrorCodes.InvalidAddress]: {
    ...defaultErrorCodeToConfig[ErrorCodes.BadRequest],
    custom_error_code: ErrorCodes.InvalidAddress,
    message: "Invalid Address.",
  },
  [ErrorCodes.InvalidChain]: {
    ...defaultErrorCodeToConfig[ErrorCodes.BadRequest],
    custom_error_code: ErrorCodes.InvalidChain,
    message: "Invalid Chain.",
  },
  [ErrorCodes.EtherscanFailed]: {
    ...defaultErrorCodeToConfig[ErrorCodes.BadRequest],
    custom_error_code: ErrorCodes.EtherscanFailed,
    message: "Request to etherscan is failed.",
  },
};

export class CustomError extends Error {
  status: number;
  metaData?: { custom_error_code: number; message?: string };

  constructor(error_code: ErrorCode, message?: string) {
    const errorConfig =
      errorCodeToConfig[error_code] ||
      errorCodeToConfig[DefaultErrorCodes.InternalServerError];
    super(errorConfig.name);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = errorConfig.name;
    this.status = errorConfig.status;
    this.metaData = {
      custom_error_code: errorConfig.custom_error_code || errorConfig.status,
      message: message || errorConfig.message,
    };

    if (process.env.NODE_ENV === "production") {
      // Override the `stack` property with an empty string to hide the call stack in a production environment
      Object.defineProperty(this, "stack", {
        value: "",
        writable: true,
        configurable: true,
      });
    } else {
      // Capture the call stack using `Error.captureStackTrace` to show it in a development environment
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
