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

/**
 * Wrapper component for animated sections
 * Provides framer-motion animations for server-rendered content
 */
export function AnimatedSection({ children, className = "", delay = 0, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggeredContainer({ children, className = "" }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function FadeInUpItem({ children, className = "" }) {
    return (
        <motion.div
            variants={fadeInUp}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function ScaleOnHover({ children, className = "" }) {
    return (
        <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
