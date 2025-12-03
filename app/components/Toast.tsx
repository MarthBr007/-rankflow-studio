'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: '#f0fff4',
      border: '#9ae6b4',
      text: '#22543d',
      icon: '#38a169',
    },
    error: {
      bg: '#fff5f5',
      border: '#feb2b2',
      text: '#c53030',
      icon: '#e53e3e',
    },
    warning: {
      bg: '#fffaf0',
      border: '#fbd38d',
      text: '#c05621',
      icon: '#dd6b20',
    },
    info: {
      bg: '#ebf8ff',
      border: '#90cdf4',
      text: '#2c5282',
      icon: '#3182ce',
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <div
      className="toast"
      style={{
        backgroundColor: colorScheme.bg,
        borderColor: colorScheme.border,
        color: colorScheme.text,
      }}
    >
      <div className="toast-content">
        <Icon size={20} style={{ color: colorScheme.icon, flexShrink: 0 }} />
        <span className="toast-message">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="toast-close"
        aria-label="Sluiten"
      >
        <X size={18} style={{ color: colorScheme.text }} />
      </button>
    </div>
  );
}

