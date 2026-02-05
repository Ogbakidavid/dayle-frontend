import LandingPageClient from './components/LandingPageClient';

// FAQ data
const faqs = [
    {
        q: "How does the 'Autonomous Vault' actually work?",
        a: "When a contract is initiated, funds are transferred into a secure escrow vault. These funds are locked and can only be released when pre-defined milestone conditions are met or if both parties agree to a refund."
    },
    {
        q: "What happens if a client refuses to approve a milestone?",
        a: "Dayle includes a built-in Dispute Hub. If a milestone is contested, an independent arbitrator reviews the submitted work against the project scope to ensure a fair resolution."
    },
    {
        q: "Are there any hidden fees for international transfers?",
        a: "No. We use integrated financial rails to provide real-time mid-market exchange rates. You see exactly what you'll receive before the vault is even funded."
    },
    {
        q: "Is my data and capital insured?",
        a: "Yes. All project capital held in Dayle vaults is covered by our secondary insurance layer, and our infrastructure is SOC-2 Type II compliant with AES-256 encryption."
    }
];

export default function LandingPage() {
    // This is now a SERVER COMPONENT
    // It will always do a full page reload when navigated to
    return <LandingPageClient faqs={faqs} />;
}