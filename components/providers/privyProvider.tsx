"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { celo } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmkrdte7f017ml50bgzxjrhx6"
      clientId="client-WY6VA9LkGLeABxXt3HKt5cQc3jwU8NTp1mq7umpdKhahE"
      config={{
        defaultChain: celo,
        supportedChains: [celo],
        // Create embedded wallets for all users to ensure they show up in the dashboard
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
          showWalletUIs: false,
        },

        appearance: {
          theme: "dark",
          showWalletLoginFirst: false,
          walletList: ["detected_wallets", "metamask", "coinbase_wallet"],
        },
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
