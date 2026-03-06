export const CONTRACTS = {
  vaultFactory: process.env.NEXT_PUBLIC_VAULT_FACTORY_ADDRESS || '0x21Cfc28262EDD316363157782a49C8543e8256aB',
  cUSDToken: '0x0aB67F8bfeCC54556490C89b0d1C79A549d3c756',
  usdcToken: '0x01C5C0122039549AD1493B8220cABEdD739BC44E',
  usdtToken: '0x954cBA141f21760751E3065ACC250c38fb9f5e61',
  rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
} as const;

export const SUPPORTED_TOKENS = [
  { symbol: 'USDC', address: CONTRACTS.usdcToken, decimals: 6 },
  { symbol: 'USDT', address: CONTRACTS.usdtToken, decimals: 6 },
  { symbol: 'cUSD', address: CONTRACTS.cUSDToken, decimals: 18 },
];

import VaultFactoryJson from './VaultFactory.json';
import VaultImplementationJson from './VaultImplementation.json';
import ERC20Json from './ERC20.json';

export const VaultFactoryABI = VaultFactoryJson.abi;
export const VaultImplementationABI = VaultImplementationJson.abi;
export const ERC20ABI = ERC20Json.abi;
