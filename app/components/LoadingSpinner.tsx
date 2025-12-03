'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 24, className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-wrapper ${className}`}>
      <Loader2 size={size} className="loading-spinner-icon" />
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
}

