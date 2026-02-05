export const metadata = {
    manifest: "/manifest.json",
};

import RegisterServiceWorker from '@/components/shared/RegisterServiceWorker';

export default function AppPublicLayout({ children }) {
    return (
        <>
            {children}
            <RegisterServiceWorker />
        </>
    );
}
