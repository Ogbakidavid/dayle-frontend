"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";

export const WalletListener = () => {
  const { ready, authenticated, user, createWallet } = usePrivy();
  const { wallets } = useWallets();
  const creatingRef = useRef(false);

  useEffect(() => {
    async function ensureWallet() {
      // 1. Only run if Privy is fully initialized and user is logged in
      if (!ready || !authenticated || !user) return;

      // 2. Check if user ALREADY has a wallet (embedded or otherwise connected)
      //    'user.wallet' usually points to the latest/active wallet.
      //    'user.linkedAccounts' contains all linked accounts including wallets.
      //    'wallets' from useWallets() gives active connected wallet instances.

      const hasEmbeddedWallet = user.linkedAccounts.some(
        (account) =>
          account.type === "wallet" && account.walletClientType === "privy",
      );

      // 3. If no embedded wallet, try to create one.
      if (!hasEmbeddedWallet && !creatingRef.current) {
        console.log("WalletListener: No embedded wallet detected. Creating...");
        creatingRef.current = true;
        try {
          const wallet = await createWallet();
          console.log(
            "WalletListener: Embedded wallet created successfully:",
            wallet,
          );
        } catch (error) {
          console.error(
            "WalletListener: Failed to create embedded wallet:",
            error,
          );
        } finally {
          creatingRef.current = false;
        }
      }
    }

    ensureWallet();
  }, [ready, authenticated, user, createWallet, wallets]);

  return null; // This component renders nothing
};
