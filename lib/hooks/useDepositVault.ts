import { ethers } from 'ethers';
import { CONTRACTS, VaultImplementationABI, ERC20ABI } from '../contracts';
import { useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

export function useDepositVault(vaultAddress: string) {
  const { wallets } = useWallets();
  const [isDepositing, setIsDepositing] = useState(false);

  const deposit = async (amount: string, tokenAddress: string, tokenDecimals: number = 18) => {
    try {
      setIsDepositing(true);
      
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
      if (!embeddedWallet) {
        throw new Error("No embedded Privy wallet found. Please login.");
      }

      await embeddedWallet.switchChain(11142220); // Celo Sepolia
      const ethereumProvider = await embeddedWallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20ABI,
        signer
      );

      const vault = new ethers.Contract(
        vaultAddress,
        VaultImplementationABI,
        signer
      );

      const amountWei = ethers.parseUnits(amount, tokenDecimals);

      // 1. Approve vault to spend token
      const approveTx = await tokenContract.approve(vaultAddress, amountWei);
      await approveTx.wait();

      // 2. Deposit to vault
      const depositTx = await vault.deposit(amountWei);
      const receipt = await depositTx.wait();

      return receipt.hash;
    } finally {
      setIsDepositing(false);
    }
  };

  return { deposit, isDepositing };
}
