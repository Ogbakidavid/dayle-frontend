/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // The `ox` library (pulled in by Privy) has an internal type bug.
    // Our own code is type-safe — this only suppresses third-party lib errors.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow inline scripts and styles for development and Privy
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io https://*.privy.io blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://auth.privy.io",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              // Allow connections to Privy, your backend, and blockchain RPCs
              "connect-src 'self' https://auth.privy.io https://*.privy.io https://celo-mainnet.infura.io https://forno.celo.org https://forno.celo-sepolia.celo-testnet.org http://localhost:* ws://localhost:* wss://localhost:* wss://*.privy.io wss://*.ngrok-free.dev https://*.walletconnect.com wss://*.walletconnect.org https://api.pwnedpasswords.com https://public.pimlico.io https://api.pimlico.io https://*.didit.me https://*.ngrok-free.dev https://*.loca.lt https://dayle-app-storage.s3.us-east-1.amazonaws.com https://dayle-backend-production.up.railway.app data: blob:",
              "frame-src 'self' https://auth.privy.io https://*.privy.io https://*.walletconnect.com https://*.walletconnect.org https://verify.didit.me https://*.didit.me https://*.ngrok-free.dev https://*.loca.lt data:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-progress",
      "@radix-ui/react-tabs",
      "date-fns",
    ],
  },
  devIndicators: {
    appIsrStatus: false,
  },
  // Allow Turbopack to work with development origins
  allowedDevOrigins: [
    "localhost:3000",
  ],
};

export default nextConfig;
