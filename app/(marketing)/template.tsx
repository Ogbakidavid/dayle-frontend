"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UnregisterServiceWorker from '@/components/shared/UnregisterServiceWorker';

export default function MarketingTemplate({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only run on landing page
        if (pathname !== '/') return;

        // Check if we have a service worker registered
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                if (registrations.length > 0) {
                    // Service worker exists, we need to force a hard reload
                    // Check if we just did a reload to prevent infinite loop
                    const reloadTimestamp = sessionStorage.getItem('landing_reload_time');
                    const now = Date.now();

                    // Only reload if we haven't reloaded in the last 2 seconds
                    if (!reloadTimestamp || (now - parseInt(reloadTimestamp)) > 2000) {
                        sessionStorage.setItem('landing_reload_time', now.toString());
                        // Force hard reload
                        window.location.replace('/');
                    } else {
                        // We just reloaded, clear the timestamp
                        sessionStorage.removeItem('landing_reload_time');
                    }
                }
            });
        }
    }, [pathname]);

    return (
        <>
            {children}
            <UnregisterServiceWorker />
        </>
    );
}
