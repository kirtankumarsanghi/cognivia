import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', isOpen, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'check_circle';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-[#3DD68C]/90 text-[#000000] border-[#3DD68C]';
      case 'error': return 'bg-error/90 text-on-error border-error';
      case 'warning': return 'bg-[#E8A634]/90 text-[#000000] border-[#E8A634]';
      case 'info': return 'bg-primary/90 text-on-primary border-primary';
      default: return 'bg-[#3DD68C]/90 text-[#000000] border-[#3DD68C]';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-24 right-8 z-[100] max-w-md"
        >
          <div className={`${getColors()} backdrop-blur-md rounded-xl shadow-2xl border-2 p-4 flex items-center gap-3`}>
            <span className="material-symbols-outlined text-[24px]">
              {getIcon()}
            </span>
            <p className="font-body-md font-medium flex-1">{message}</p>
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}
