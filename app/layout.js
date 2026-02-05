import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import PWAInstallPromptController from "@/components/shared/PWAInstallPromptController";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Dayle - Work with Certainty",
  description: "Bank-grade infrastructure for milestone-based payments.",
  icons: {
    icon: "/icon.svg?v=4",
    shortcut: "/icon.svg?v=4",
    apple: "/icon.svg?v=4",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dayle",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-right" theme="dark" />
          <PWAInstallPromptController />
        </Providers>
      </body>
    </html>
  );
}
