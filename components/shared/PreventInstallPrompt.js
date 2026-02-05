'use client';

import { useEffect } from 'react';

/**
 * This component ensures the PWA install prompt is blocked and the manifest is disabled.
 * It's used on pages where we explicitly DON'T want PWA installation (like the landing page).
 */
export default function PreventInstallPrompt() {
    useEffect(() => {
        // 1. Block the 'beforeinstallprompt' event so the browser won't show the install prompt
        const handlePrompt = (e) => {
            try { e.preventDefault(); } catch (err) {}
            // console.log('PWA install prompt blocked.');
        };
        window.addEventListener('beforeinstallprompt', handlePrompt);

        // 2. Safely disable any manifest link elements while mounted by changing attributes
        //    instead of removing nodes (removing can race with React/Next head updates).
        const disabledManifests = new Set();
        const disableManifests = () => {
            if (!document || !document.head) return;
            const links = Array.from(document.querySelectorAll('link[rel="manifest"], link[rel="disabled-manifest"]'));
            links.forEach((link) => {
                try {
                    const rel = link.getAttribute('rel');
                    if (rel === 'manifest') {
                        const href = link.getAttribute('href') || '/manifest.json';
                        // mark original href on the element so we can restore later
                        link.setAttribute('data-orig-href', href);
                        link.setAttribute('rel', 'disabled-manifest');
                        // clear href so browsers ignore it
                        link.setAttribute('href', '');
                        disabledManifests.add(href);
                    } else if (rel === 'disabled-manifest') {
                        // ensure it's cleared
                        if (!link.hasAttribute('data-orig-href')) {
                            link.setAttribute('data-orig-href', link.getAttribute('href') || '');
                        }
                        link.setAttribute('href', '');
                    }
                } catch (err) {
                    // ignore
                }
            });
        };

        disableManifests();

        // Watch for manifest re-injections by Next.js during SPA navigation and disable them immediately
        const observer = new MutationObserver((mutations) => {
            if (!document || !document.head) return;
            for (const m of mutations) {
                if (!m.addedNodes) continue;
                for (const n of m.addedNodes) {
                    try {
                        if (n.nodeType === 1 && n.tagName === 'LINK') {
                            const rel = n.getAttribute('rel');
                            if (rel === 'manifest') {
                                const href = n.getAttribute('href') || '/manifest.json';
                                n.setAttribute('data-orig-href', href);
                                n.setAttribute('rel', 'disabled-manifest');
                                n.setAttribute('href', '');
                                disabledManifests.add(href);
                            }
                        }
                    } catch (err) {}
                }
            }
        });
        observer.observe(document.head, { childList: true, subtree: true });

        // 3. Optionally/unregister service workers while on the landing page to further prevent install UI
        //    This is local and temporary; we don't recreate registrations here. Navigating away will allow
        //    the normal PWA registration flow to re-add them when the manifest is present again.
        const unregistered = [];
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            try {
                navigator.serviceWorker.getRegistrations?.().then((regs) => {
                    const promises = regs.map((reg) => {
                        try {
                            return reg.unregister().then((ok) => {
                                if (ok) unregistered.push(reg);
                                return ok;
                            }).catch(() => false);
                        } catch (e) { return Promise.resolve(false); }
                    });
                    Promise.all(promises).then((results) => {
                        // If we unregistered any service worker or disabled manifest links,
                        // reload once to ensure the browser clears installability UI (only do this once per session).
                        const didUnregister = results.some(Boolean) || disabledManifests.size > 0;
                        try {
                            const key = 'pwa-suppressed-on-landing';
                            const already = sessionStorage.getItem(key);
                            if (didUnregister && !already) {
                                sessionStorage.setItem(key, '1');
                                // reload to ensure browser updates installability indicators
                                window.location.reload();
                            }
                        } catch (e) {
                            // if sessionStorage is unavailable, skip reload
                        }
                    });
                }).catch(() => {});
            } catch (e) {}
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handlePrompt);
            observer.disconnect();

            // Restore manifest links by finding disabled elements and restoring their original href/rel.
            try {
                if (document && document.head) {
                    const links = Array.from(document.querySelectorAll('link[rel="disabled-manifest"]'));
                    links.forEach((link) => {
                        try {
                            const orig = link.getAttribute('data-orig-href');
                            if (orig) {
                                link.setAttribute('href', orig);
                                link.setAttribute('rel', 'manifest');
                                link.removeAttribute('data-orig-href');
                            } else {
                                // if no original, just remove the disabled attribute so Next can manage it
                                link.setAttribute('rel', 'manifest');
                            }
                        } catch (err) {}
                    });
                }
            } catch (err) {}

            try {
                const key = 'pwa-suppressed-on-landing';
                if (sessionStorage.getItem(key)) {
                    sessionStorage.removeItem(key);
                }
            } catch (e) {}

            // We don't attempt to re-register service workers here; the PWA plugin/Next will handle registration
            // on navigation to routes that have the manifest.
        };
    }, []);

    return null;
}
