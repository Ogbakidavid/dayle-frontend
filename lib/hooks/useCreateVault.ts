import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { ethers } from 'ethers';
import { CONTRACTS, VaultFactoryABI } from '../contracts';
import { useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

export function useCreateVault() {
  const { wallets } = useWallets();
  const [isCreating, setIsCreating] = useState(false);

  const createVault = async (
    freelancerAddress: string,
    deliverableIds: number[],
    amounts: string[], // e.g. ["100", "200", "300"]
    tokenAddress: string,
    tokenDecimals: number = 18
  ) => {
    try {
      setIsCreating(true);
      
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
      if (!embeddedWallet) {
        throw new Error("No embedded Privy wallet found. Please login.");
      }

      await embeddedWallet.switchChain(11142220); // Celo Sepolia
      const ethereumProvider = await embeddedWallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      const factory = new ethers.Contract(
        CONTRACTS.vaultFactory,
        VaultFactoryABI,
        signer
      );

      // Convert amounts to units based on token decimals
      const amountsWei = amounts.map(a => ethers.parseUnits(a, tokenDecimals));

      const tx = await factory.createVault(
        freelancerAddress,
        deliverableIds,
        tokenAddress,
        amountsWei
      );

      const receipt = await tx.wait();

      // Extract vault address from event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return factory.interface.parseLog(log);
          } catch(e) {
            return null;
          }
        })
        .find((e: any) => e?.name === 'VaultCreated');

      if (!event) {
        throw new Error("VaultCreated event not found in transaction logs.");
      }

      return {
        vaultAddress: event.args.vault,
        txHash: receipt.hash
      };
    } finally {
      setIsCreating(false);
    }
  };

  return { createVault, isCreating };
}
