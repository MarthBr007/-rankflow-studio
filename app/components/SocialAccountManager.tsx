'use client';

import { useState, useEffect } from 'react';
import { Instagram, Linkedin, X, Check, AlertCircle, ExternalLink } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  accountType: string;
  accountName: string;
  username?: string;
  isActive: boolean;
  isDefault: boolean;
  tokenExpiresAt?: string;
  createdAt: string;
}

interface SocialAccountManagerProps {
  organizationId?: string | null;
}

export default function SocialAccountManager({ organizationId }: SocialAccountManagerProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (organizationId) {
        params.append('organizationId', organizationId);
      }
      
      const response = await fetch(`/api/social-auth/accounts?${params.toString()}`);
      if (!response.ok) throw new Error('Fout bij laden accounts');
      
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [organizationId]);

  const handleConnect = async (platform: 'instagram' | 'linkedin') => {
    setIsConnecting(platform);
    try {
      const params = new URLSearchParams();
      if (organizationId) {
        params.append('organizationId', organizationId);
      }
      
      window.location.href = `/api/social-auth/${platform}/authorize?${params.toString()}`;
    } catch (error: any) {
      console.error('Error connecting:', error);
      alert('Fout bij verbinden: ' + error.message);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Weet je zeker dat je dit account wilt ontkoppelen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/social-auth/accounts?id=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Fout bij ontkoppelen');
      
      await loadAccounts();
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      alert('Fout bij ontkoppelen: ' + error.message);
    }
  };

  const handleSetDefault = async (accountId: string, platform: string) => {
    // This would require a PATCH endpoint, for now we'll just show a message
    alert('Default account functionaliteit komt binnenkort beschikbaar');
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'instagram' ? <Instagram size={20} /> : <Linkedin size={20} />;
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'instagram' ? '#E4405F' : '#0077B5';
  };

  const isTokenExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry < 7; // Expiring within 7 days
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Accounts laden...
      </div>
    );
  }

  const instagramAccounts = accounts.filter(a => a.platform === 'instagram');
  const linkedinAccounts = accounts.filter(a => a.platform === 'linkedin');

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Social Media Accounts</h2>
        <p style={{ color: '#666', margin: 0 }}>
          Koppel je Instagram en LinkedIn accounts om direct te kunnen posten vanuit RankFlow Studio.
        </p>
      </div>

      {/* Instagram Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Instagram size={24} color="#E4405F" />
            <h3 style={{ margin: 0 }}>Instagram</h3>
          </div>
          <button
            onClick={() => handleConnect('instagram')}
            disabled={isConnecting === 'instagram'}
            style={{
              padding: '0.5rem 1rem',
              background: isConnecting === 'instagram' ? '#ccc' : '#E4405F',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isConnecting === 'instagram' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {isConnecting === 'instagram' ? 'Verbinden...' : '+ Account Koppelen'}
          </button>
        </div>

        {instagramAccounts.length === 0 ? (
          <div style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px dashed #dee2e6',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ margin: 0 }}>Geen Instagram accounts gekoppeld</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
              Klik op "Account Koppelen" om te beginnen
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {instagramAccounts.map((account) => (
              <div
                key={account.id}
                style={{
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#E4405F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    <Instagram size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{account.accountName}</strong>
                      {account.isDefault && (
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          background: '#28a745',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          Standaard
                        </span>
                      )}
                    </div>
                    {account.username && (
                      <div style={{ color: '#666', fontSize: '0.875rem' }}>
                        @{account.username}
                      </div>
                    )}
                    {isTokenExpiringSoon(account.tokenExpiresAt) && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: '#ff9800',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem'
                      }}>
                        <AlertCircle size={14} />
                        Token verloopt binnenkort
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!account.isDefault && (
                    <button
                      onClick={() => handleSetDefault(account.id, account.platform)}
                      style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#666'
                      }}
                      title="Stel in als standaard"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: '1px solid #dc3545',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#dc3545'
                    }}
                    title="Ontkoppel account"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LinkedIn Section */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Linkedin size={24} color="#0077B5" />
            <h3 style={{ margin: 0 }}>LinkedIn</h3>
          </div>
          <button
            onClick={() => handleConnect('linkedin')}
            disabled={isConnecting === 'linkedin'}
            style={{
              padding: '0.5rem 1rem',
              background: isConnecting === 'linkedin' ? '#ccc' : '#0077B5',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isConnecting === 'linkedin' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {isConnecting === 'linkedin' ? 'Verbinden...' : '+ Account Koppelen'}
          </button>
        </div>

        {linkedinAccounts.length === 0 ? (
          <div style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px dashed #dee2e6',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ margin: 0 }}>Geen LinkedIn accounts gekoppeld</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
              Klik op "Account Koppelen" om te beginnen
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {linkedinAccounts.map((account) => (
              <div
                key={account.id}
                style={{
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#0077B5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    <Linkedin size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{account.accountName}</strong>
                      {account.isDefault && (
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          background: '#28a745',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          Standaard
                        </span>
                      )}
                    </div>
                    {account.username && (
                      <div style={{ color: '#666', fontSize: '0.875rem' }}>
                        {account.username}
                      </div>
                    )}
                    <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {account.accountType === 'organization' ? 'Bedrijfspagina' : 'Persoonlijk profiel'}
                    </div>
                    {isTokenExpiringSoon(account.tokenExpiresAt) && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: '#ff9800',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem'
                      }}>
                        <AlertCircle size={14} />
                        Token verloopt binnenkort
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!account.isDefault && (
                    <button
                      onClick={() => handleSetDefault(account.id, account.platform)}
                      style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#666'
                      }}
                      title="Stel in als standaard"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: '1px solid #dc3545',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#dc3545'
                    }}
                    title="Ontkoppel account"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#0066cc" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#0066cc' }}>Belangrijke informatie:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#666', fontSize: '0.875rem' }}>
              <li>Instagram: Alleen Business of Creator accounts kunnen worden gekoppeld</li>
              <li>LinkedIn: Persoonlijke profielen en bedrijfspagina's worden ondersteund</li>
              <li>Tokens worden veilig opgeslagen en automatisch ververst</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

