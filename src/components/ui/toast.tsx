import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='h-5 w-5 text-green-400' />;
      case 'error':
        return <AlertCircle className='h-5 w-5 text-red-400' />;
      case 'warning':
        return <AlertCircle className='h-5 w-5 text-yellow-400' />;
      case 'info':
      default:
        return <Info className='h-5 w-5 text-blue-400' />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-700';
      case 'error':
        return 'bg-red-900/90 border-red-700';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-900/90 border-blue-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-[100] flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm ${getBackgroundColor()}`}
    >
      {getIcon()}
      <span className='text-white text-sm font-medium'>{message}</span>
      <button
        onClick={onClose}
        className='ml-2 p-1 hover:bg-white/10 rounded transition-colors'
      >
        <X className='h-4 w-4 text-gray-300' />
      </button>
    </motion.div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <AnimatePresence>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </AnimatePresence>
  );

  return { showToast, ToastContainer };
};
