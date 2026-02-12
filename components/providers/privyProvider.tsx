"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { celo } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmlgbfk7k029al50bfwfrgti3"
      clientId="client-WY6W1EYmvypDsARfuDn8w1ELcVD4wNDMn3m8RQha7uDh5"
      config={{
        defaultChain: celo,
        supportedChains: [celo],
        // Disable auto-creation of embedded wallets to hide the modal.
        // We will manually trigger creation in the background (silent).
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
          // Attempt to fix some potential CSS/Style issues if possible, although 'fill-rule' is likely deep in SVG
        },
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
