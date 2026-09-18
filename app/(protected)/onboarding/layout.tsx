import * as React from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
