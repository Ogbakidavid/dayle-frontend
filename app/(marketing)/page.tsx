import LandingPageClient from './components/LandingPageClient';

// FAQ data
const faqs = [
    {
        q: "How does the Dayle vault system work?",
        a: "When a contract is created, funds are deposited into a dedicated vault controlled by Dayle’s settlement logic. The funds remain locked and can only be released when predefined milestones are submitted and approved according to the agreement between both parties."
    },
    {
        q: "What happens if a milestone is disputed?",
        a: "If a client disputes a milestone, the vault pauses any release. Both parties submit evidence related to the agreed scope of work, and the dispute is reviewed through Dayle’s structured resolution process to determine the appropriate outcome."
    },
    {
        q: "Are there hidden fees for international payments?",
        a: "No. All applicable fees and exchange rates are shown upfront before a vault is funded. Users can see the final amount a contractor will receive before any transaction is confirmed."
    },
    {
        q: "How does Dayle protect user funds and data?",
        a: "Funds are isolated per contract and access is tightly controlled by Dayle’s backend systems. User data is protected using industry-standard encryption and security practices designed for financial infrastructure."
    }
];


export default function LandingPage() {
    // This is now a SERVER COMPONENT
    // It will always do a full page reload when navigated to
    return <LandingPageClient faqs={faqs} />;
}