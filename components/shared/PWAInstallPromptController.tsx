"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PWA Install Prompt Controller
 * 
 * This component intercepts the browser's install prompt and controls
 * when it should be shown based on the current route.
 * 
 * - Landing page ('/'): Install prompt is suppressed
 * - Protected routes ('/login', '/signup', '/dashboard', etc.): Install prompt is allowed
 */
export default function PWAInstallPromptController() {
    const pathname = usePathname();

    useEffect(() => {
        // Store the deferred prompt globally
        let deferredPrompt = null;

        const handleBeforeInstallPrompt = (e) => {
            // Check if we're on the landing page
            if (window.location.pathname === '/') {
                // Prevent the install prompt from showing on landing page
                e.preventDefault();

                // Store the event for later use
                deferredPrompt = e;
                window.deferredPrompt = e;

                console.log('[PWA] Install prompt suppressed on landing page');
            } else {
                // On protected routes, allow the prompt
                // Store it globally in case we want to trigger it manually
                deferredPrompt = e;
                window.deferredPrompt = e;

                console.log('[PWA] Install prompt available on protected route');
            }
        };

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if we need to re-trigger the prompt when route changes
        if (pathname !== '/' && window.deferredPrompt) {
            // User has navigated to a protected route
            // The prompt is now available if they want to install
            console.log('[PWA] User on protected route, install prompt can be triggered');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [pathname]);

    return null;
}

/**
 * Helper function to manually trigger the install prompt
 * Call this from a button or UI element on protected routes
 * 
 * Example usage:
 * ```jsx
 * import { triggerPWAInstall } from '@/components/shared/PWAInstallPromptController';
 * 
 * <button onClick={triggerPWAInstall}>
 *   Install App
 * </button>
 * ```
 */
export async function triggerPWAInstall() {
    if (!window.deferredPrompt) {
        console.log('[PWA] No install prompt available');
        return false;
    }

    // Show the install prompt
    window.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await window.deferredPrompt.userChoice;

    console.log(`[PWA] User response: ${outcome}`);

    // Clear the deferred prompt
    window.deferredPrompt = null;

    return outcome === 'accepted';
}
