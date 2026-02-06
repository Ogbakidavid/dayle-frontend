'use client';

import { motion } from 'framer-motion';

export default function Template({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
