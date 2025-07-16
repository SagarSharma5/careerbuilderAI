import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === 'light';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border ${isLight ? 'bg-white border-gray-200' : 'bg-[#1c1c1c] border-gray-800'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
                            <h2 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{title}</h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className={`h-6 w-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                            </Button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
