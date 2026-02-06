/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow inline scripts and styles for development and Privy
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io https://*.privy.io blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://auth.privy.io",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              // Allow connections to Privy, your backend, and blockchain RPCs
              "connect-src 'self' https://auth.privy.io https://*.privy.io https://celo-mainnet.infura.io https://forno.celo.org http://localhost:* ws://localhost:* wss://*.privy.io https://*.walletconnect.com wss://*.walletconnect.org https://api.pwnedpasswords.com https://public.pimlico.io data: blob:",
              "frame-src 'self' https://auth.privy.io https://*.privy.io https://*.walletconnect.com https://*.walletconnect.org data:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
