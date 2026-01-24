'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="button button-secondary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-panel)',
        color: 'var(--color-text)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      title={theme === 'light' ? 'Schakel naar donkere modus' : 'Schakel naar lichte modus'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      <span style={{ fontSize: '0.875rem' }}>
        {theme === 'light' ? 'Donker' : 'Licht'}
      </span>
    </button>
  );
}
