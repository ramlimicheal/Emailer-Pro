import React, { useEffect } from 'react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const ICONS: Record<ToastMessage['type'], string> = {
  success: 'check-circle',
  error: 'alert-triangle',
  info: 'info',
};

const COLORS: Record<ToastMessage['type'], string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, onDismiss]);

  return (
    <div className="toast">
      <i data-lucide={ICONS[toast.type]} className={`w-5 h-5 ${COLORS[toast.type]}`}></i>
      <span className="font-medium">{toast.message}</span>
    </div>
  );
};

export default Toast;
