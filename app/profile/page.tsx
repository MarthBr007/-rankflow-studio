'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import UserIndicator from '../components/UserIndicator';
import Breadcrumbs from '../components/Breadcrumbs';
import MobileMenuButton from '../components/MobileMenuButton';
import ThemeToggle from '../components/ThemeToggle';
import { useIsMobile } from '../lib/useMediaQuery';
import { useToast } from '../components/ToastContainer';
import { User, Save, Lock, Mail, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string;
    role?: string;
    createdAt?: string;
    lastLoginAt?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.sidebar') && !target.closest('.mobile-menu-button')) {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen, isMobile]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Fout bij laden profiel');
      }
      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error loading profile:', error);
      showToast(error.message || 'Fout bij laden profiel', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Real-time validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: 'Ongeldig e-mailadres' }));
      } else {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    }

    if (name === 'newPassword' && value) {
      if (value.length < 6) {
        setErrors(prev => ({ ...prev, newPassword: 'Minimaal 6 tekens' }));
      } else {
        setErrors(prev => ({ ...prev, newPassword: undefined }));
      }
    }

    if (name === 'confirmPassword' && formData.newPassword) {
      if (value !== formData.newPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Wachtwoorden komen niet overeen' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; label: string; color: string } => {
    if (!password) return { strength: 'weak', label: '', color: '#e5e7eb' };
    if (password.length < 6) return { strength: 'weak', label: 'Zwak', color: '#ef4444' };
    if (password.length < 10) return { strength: 'medium', label: 'Gemiddeld', color: '#f59e0b' };
    return { strength: 'strong', label: 'Sterk', color: '#10b981' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate password change
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          showToast('Voer je huidige wachtwoord in', 'error');
          setIsSaving(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          showToast('Nieuw wachtwoord moet minimaal 6 tekens lang zijn', 'error');
          setIsSaving(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          showToast('Nieuwe wachtwoorden komen niet overeen', 'error');
          setIsSaving(false);
          return;
        }
      }

      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij bijwerken profiel');
      }

      showToast(data.message || 'Profiel succesvol bijgewerkt', 'success');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // Reload profile
      await loadProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Fout bij bijwerken profiel', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar 
          activeType="profile" 
          onTypeChange={() => {}}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Suspense fallback={<div style={{ minHeight: '24px' }} />}>
                <Breadcrumbs />
              </Suspense>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <UserIndicator />
              </div>
            </div>
          </div>
          <div className="loading">
            <p>Profiel laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar 
        activeType="profile" 
        onTypeChange={() => {}}
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        className={isMobile && isMobileMenuOpen ? 'mobile-open' : ''}
      />
      <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isMobile && (
                <MobileMenuButton 
                  isOpen={isMobileMenuOpen} 
                  onClick={toggleMobileMenu} 
                />
              )}
              <Suspense fallback={<div style={{ minHeight: '24px' }} />}>
                <Breadcrumbs />
              </Suspense>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ThemeToggle />
              <UserIndicator />
            </div>
          </div>
        </div>

        <div className="settings-container">
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <UserIcon size={24} />
                <h2>Mijn Profiel</h2>
              </div>
            </div>
            <div className="settings-card-body">
              <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} style={{ marginRight: '0.5rem' }} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <span id="email-error" className="form-error" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <User size={16} style={{ marginRight: '0.5rem' }} />
                    Naam
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Jouw naam (optioneel)"
                  />
                </div>

                {user && (
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <input
                      type="text"
                      value={user.role === 'admin' ? 'Admin' : 'Gebruiker'}
                      className="form-input"
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                )}

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={18} />
                    Wachtwoord wijzigen
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Laat leeg om wachtwoord niet te wijzigen
                  </p>

                  <div className="form-group">
                    <label className="form-label">Huidig wachtwoord</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Voer je huidige wachtwoord in"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nieuw wachtwoord</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`form-input ${errors.newPassword ? 'form-input-error' : ''}`}
                      placeholder="Minimaal 6 tekens"
                      aria-invalid={!!errors.newPassword}
                      aria-describedby={errors.newPassword ? 'newPassword-error' : formData.newPassword ? 'password-strength' : undefined}
                    />
                    {formData.newPassword && (
                      <div id="password-strength" style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <div style={{
                            flex: 1,
                            height: '4px',
                            backgroundColor: 'var(--color-border)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: formData.newPassword.length < 6 ? '33%' : formData.newPassword.length < 10 ? '66%' : '100%',
                              height: '100%',
                              backgroundColor: getPasswordStrength(formData.newPassword).color,
                              transition: 'all 0.3s'
                            }} />
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: getPasswordStrength(formData.newPassword).color,
                            fontWeight: 500
                          }}>
                            {getPasswordStrength(formData.newPassword).label}
                          </span>
                        </div>
                      </div>
                    )}
                    {errors.newPassword && (
                      <span id="newPassword-error" className="form-error" role="alert">
                        {errors.newPassword}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bevestig nieuw wachtwoord</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                      placeholder="Herhaal je nieuwe wachtwoord"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    {errors.confirmPassword && (
                      <span id="confirmPassword-error" className="form-error" role="alert">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    className="button"
                    disabled={isSaving}
                  >
                    <Save size={16} style={{ marginRight: '0.5rem' }} />
                    {isSaving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => router.back()}
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

