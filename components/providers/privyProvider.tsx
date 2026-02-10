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
        // Disable auto-creation of embedded wallets to hide the modal.
        // We will manually trigger creation in the background (silent).
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },

        appearance: {
          theme: "dark",
          showWalletLoginFirst: false,
          walletList: ["detected_wallets", "metamask", "coinbase_wallet"],
          // Attempt to fix some potential CSS/Style issues if possible, although 'fill-rule' is likely deep in SVG
        },
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
