export default function OnboardingLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
