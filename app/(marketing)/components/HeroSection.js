"use client";

import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export default function HeroSection() {
    return (
        <section className="relative pt-26 md:pt-24 lg:pt-32 pb-16 md:pb-24 lg:pb-32 px-4 md:px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center relative z-10">
                {/* Content will be passed as children or props */}
            </div>
        </section>
    );
}
