"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This component intercepts navigation to the landing page (/)
 * and forces a hard reload instead of client-side navigation.
 * This ensures service workers are properly unregistered.
 */
export default function LandingPageNavigationInterceptor() {
    const router = useRouter();

    useEffect(() => {
        const handleClick = (e) => {
            // Find the closest anchor tag
            const anchor = e.target.closest('a');

            if (!anchor) return;

            // Check if it's a link to the landing page
            const href = anchor.getAttribute('href');
            if (href === '/' || href === '') {
                // Prevent Next.js client-side navigation
                e.preventDefault();

                // Force hard navigation to landing page
                window.location.href = '/';
            }
        };

        // Add click listener to document
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [router]);

    return null;
}
