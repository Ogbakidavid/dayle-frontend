"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { celo } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmkrdte7f017ml50bgzxjrhx6"
      clientId="client-WY6VA9LkGLeABxXt3HKt5cQc3jwU8NTp1mq7umpdKhahE"
      config={{
        defaultChain: celo,
        supportedChains: [celo],
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
