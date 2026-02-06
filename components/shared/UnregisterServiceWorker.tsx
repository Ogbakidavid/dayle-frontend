"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function UnregisterServiceWorker() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        let mounted = true;

        const unregister = async () => {
            try {
                // Get all service worker registrations
                const registrations = await navigator.serviceWorker.getRegistrations();

                if (!mounted) return;

                // Unregister all service workers
                for (const registration of registrations) {
                    await registration.unregister();
                }

                // Optional: Clear caches as well to fully reset PWA state
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                }
            } catch (err) {
                // Unregistration failed; ignore silently
                // console.warn('SW unregistration failed', err);
            }
        };

        // Unregister service worker when on marketing/landing pages
        unregister();

        return () => {
            mounted = false;
        };
    }, [pathname]); // Re-run when pathname changes

    return null;
}
