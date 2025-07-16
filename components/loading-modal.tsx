import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
    isLoading: boolean;
    message?: string;
}

export default function LoadingModal({ isLoading, message = "Loading..." }: LoadingModalProps) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-xl p-8 flex flex-col items-center justify-center"
                    >
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-lg font-semibold">{message}</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
