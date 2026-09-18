'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export interface TemplateProps {
    children: React.ReactNode;
}

export default function Template({ children }: TemplateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // smooth bezier
            className="w-full"
        >
            {children}
        </motion.div>
    );
}
