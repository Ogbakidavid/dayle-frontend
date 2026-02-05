export const metadata = {
    // Disable PWA entirely for marketing/landing pages—no manifest, no service worker, no install icon.
    // This ensures users cannot install the PWA from the landing page.
    manifest: undefined,
};

export default function MarketingLayout({ children }) {
    return <>{children}</>;
}
