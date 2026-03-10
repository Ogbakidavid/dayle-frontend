"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { celoSepolia } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={
        process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmlgbfk7k029al50bfwfrgti3"
      }
      clientId={
        process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ||
        "client-WY6W1EYmvypDsARfuDn8w1ELcVD4wNDMn3m8RQha7uDh5"
      }
      config={{
        defaultChain: celoSepolia,
        supportedChains: [celoSepolia],
        // Disable auto-creation of embedded wallets to hide the modal.
        // We will manually trigger creation in the background (silent).
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
          showWalletUIs: false,
        },

        appearance: {
          theme: "light",
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
