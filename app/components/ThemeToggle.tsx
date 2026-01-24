'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only use theme hook after mount to avoid SSR issues
  let theme: 'light' | 'dark' = 'light';
  let toggleTheme: () => void = () => {};
  
  if (mounted) {
    try {
      const themeContext = useTheme();
      theme = themeContext.theme;
      toggleTheme = themeContext.toggleTheme;
    } catch (e) {
      // ThemeProvider not available, use default
    }
  }

  if (!mounted) {
    return (
      <button
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
        disabled
      >
        <Moon size={18} />
        <span style={{ fontSize: '0.875rem' }}>Donker</span>
      </button>
    );
  }

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
