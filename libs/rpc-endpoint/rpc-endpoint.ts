export const RpcEndpoints: Record<string, string | undefined> = {
  base: process.env.RPC_BASE,
  eth_sepolia: process.env.RPC_ETH_SEPOLIA,
} as const;
