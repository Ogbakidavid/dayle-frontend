export const CONTRACTS = {
  vaultFactory: process.env.NEXT_PUBLIC_VAULT_FACTORY_ADDRESS || '0xd35814B2194Ef79E5eE11D18E4FF0296d5b15466',
  cUSDToken: process.env.NEXT_PUBLIC_CUSD_TOKEN_ADDRESS || '0x2909EE56C5C1ad87968E7B5146e8ca4C8217BFEe',
  rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
} as const;

import VaultFactoryJson from './VaultFactory.json';
import VaultImplementationJson from './VaultImplementation.json';
import ERC20Json from './ERC20.json';

export const VaultFactoryABI = VaultFactoryJson.abi;
export const VaultImplementationABI = VaultImplementationJson.abi;
export const ERC20ABI = ERC20Json.abi;
