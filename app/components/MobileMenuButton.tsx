'use client';

import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      className="mobile-menu-button"
      onClick={onClick}
      aria-label={isOpen ? 'Menu sluiten' : 'Menu openen'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: 'var(--color-text)',
        marginRight: 'var(--spacing-sm)',
      }}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}
