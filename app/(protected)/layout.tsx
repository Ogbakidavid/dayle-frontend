export const metadata = {
    manifest: "/manifest.json",
};

import RegisterServiceWorker from '@/components/shared/RegisterServiceWorker';
import LandingPageNavigationInterceptor from '@/components/shared/LandingPageNavigationInterceptor';

export default function ProtectedLayout({ children }) {
    return (
        <>
            {children}
            <RegisterServiceWorker />
            <LandingPageNavigationInterceptor />
        </>
    );
}
