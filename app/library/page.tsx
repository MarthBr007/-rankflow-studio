'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import ContentResult from '../components/ContentResult';
import { useToast } from '../components/ToastContainer';
import { 
  Trash2, 
  Eye, 
  FileText, 
  Folder, 
  Package, 
  PenTool, 
  Share2,
  Search,
  X
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  currentVersion?: number;
  versionCount?: number;
  data: any;
  preview?: string;
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [library, setLibrary] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { showToast } = useToast();
  const [versions, setVersions] = useState<Array<{ version: number; createdAt: string }>>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [selectedVersionData, setSelectedVersionData] = useState<any | null>(null);
  const [isLoadingVersionData, setIsLoadingVersionData] = useState(false);
  const [diff, setDiff] = useState<any | null>(null);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Laad sidebar state
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

  // Laad library
  useEffect(() => {
    loadLibrary();
  }, []);

  // Check voor preview mode
  useEffect(() => {
    const previewId = searchParams.get('preview');
    if (previewId && library.length > 0) {
      const item = library.find(i => i.id === previewId);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, library]);

  // Laad versies bij selectie van item
  useEffect(() => {
    if (selectedItem?.id) {
      loadVersions(selectedItem.id);
      setSelectedVersion(null);
      setSelectedVersionData(null);
      setDiff(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.id]);

  const loadLibrary = async () => {
    try {
      const response = await fetch('/api/library');
      const data = await response.json();
      setLibrary(data);
      // Reset selection if existing item removed
      if (selectedItem) {
        const stillExists = data.find((i: ContentItem) => i.id === selectedItem.id);
        if (!stillExists) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async (id: string) => {
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/library/versions?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const loadVersionData = async (id: string, version: number) => {
    setIsLoadingVersionData(true);
    setDiff(null);
    try {
      const res = await fetch(`/api/library/versions?id=${id}&version=${version}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedVersionData(data.data);
      }
    } catch (error) {
      console.error('Error loading version data:', error);
    } finally {
      setIsLoadingVersionData(false);
    }
  };

  const loadDiff = async (id: string, v1: number, v2: number) => {
    setIsLoadingDiff(true);
    try {
      const res = await fetch(`/api/library/diff?id=${id}&v1=${v1}&v2=${v2}`);
      if (res.ok) {
        const data = await res.json();
        setDiff(data.diff);
      }
    } catch (error) {
      console.error('Error loading diff:', error);
    } finally {
      setIsLoadingDiff(false);
    }
  };

  const restoreVersion = async () => {
    if (!selectedItem || !selectedVersion || !selectedVersionData) return;
    setIsRestoring(true);
    try {
      const payload = {
        id: selectedItem.id,
        type: selectedItem.type,
        title: selectedItem.title,
        data: selectedVersionData,
      };
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Restore mislukt');
      }
      showToast(`Versie v${selectedVersion} hersteld als nieuwe versie`, 'success');
      // Refresh library and versions
      loadLibrary();
      loadVersions(selectedItem.id);
    } catch (error: any) {
      showToast(error.message || 'Restore mislukt', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/library?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fout bij verwijderen');
      }

      // Verwijder uit state
      setLibrary(prev => prev.filter(item => item.id !== id));
      
      // Als dit item werd bekeken, sluit preview
      if (selectedItem?.id === id) {
        setSelectedItem(null);
        router.push('/library');
      }
      
      showToast('Item succesvol verwijderd', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('Fout bij verwijderen van item', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landing': return FileText;
      case 'categorie': return Folder;
      case 'product': return Package;
      case 'blog': return PenTool;
      case 'social': return Share2;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      landing: 'Landingspagina',
      categorie: 'Categoriepagina',
      product: 'Productpagina',
      blog: 'Blog',
      social: 'Social Media',
    };
    return labels[type] || type;
  };

  const filteredLibrary = library.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.preview?.toLowerCase().includes(query) ||
      getTypeLabel(item.type).toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLibrary.length / pageSize));
  const paginatedLibrary = filteredLibrary.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
  };

  if (selectedItem) {
    return (
      <div className="app-layout">
        <Sidebar 
          activeType={selectedItem.type} 
          onTypeChange={() => {}}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="result-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1>{selectedItem.title}</h1>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                  {getTypeLabel(selectedItem.type)} • {new Date(selectedItem.createdAt).toLocaleDateString('nl-NL')}
                  {selectedItem.currentVersion ? ` • v${selectedItem.currentVersion}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    router.push('/library');
                  }}
                  className="button"
                  style={{ backgroundColor: '#6c757d' }}
                >
                  ← Terug naar Library
                </button>
                <button
                  onClick={() => deleteItem(selectedItem.id)}
                  className="button"
                  style={{ backgroundColor: '#dc3545' }}
                >
                  <Trash2 size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                  Verwijderen
                </button>
              </div>
            </div>
          </div>

          {/* Versiebeheer */}
          <div className="prompt-viewer" style={{ marginBottom: '1rem' }}>
            <div className="prompt-header">
              <h2>Versies</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="button" onClick={() => loadVersions(selectedItem.id)} disabled={isLoadingVersions}>
                  {isLoadingVersions ? 'Laden...' : 'Ververs'}
                </button>
                <button
                  className="button ghost"
                  onClick={() => {
                    setSelectedVersion(null);
                    setSelectedVersionData(null);
                    setDiff(null);
                  }}
                >
                  Reset selectie
                </button>
              </div>
            </div>
            <div className="prompt-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '220px' }}>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                    Kies versie
                  </label>
                  <select
                    value={selectedVersion ?? ''}
                    onChange={(e) => {
                      const v = e.target.value ? parseInt(e.target.value, 10) : null;
                      setSelectedVersion(v);
                      setSelectedVersionData(null);
                      setDiff(null);
                      if (v !== null) {
                        loadVersionData(selectedItem.id, v);
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Selecteer</option>
                    {versions.map((v) => (
                      <option key={v.version} value={v.version}>
                        v{v.version} — {new Date(v.createdAt).toLocaleString('nl-NL')}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="button ghost"
                    onClick={() => {
                      const currentV = selectedItem.currentVersion || (versions[0]?.version ?? null);
                      if (currentV && selectedVersion && currentV !== selectedVersion) {
                        loadDiff(selectedItem.id, currentV, selectedVersion);
                      }
                    }}
                    disabled={!selectedVersion || isLoadingDiff}
                  >
                    {isLoadingDiff ? 'Diff...' : 'Toon diff met huidige'}
                  </button>
                  <button
                    className="button"
                    onClick={restoreVersion}
                    disabled={!selectedVersion || !selectedVersionData || isRestoring}
                    style={{ backgroundColor: '#0b5ed7', color: '#fff' }}
                  >
                    {isRestoring ? 'Herstellen...' : 'Herstel als nieuwe versie'}
                  </button>
                </div>
              </div>

              {isLoadingVersionData && <p style={{ color: '#666' }}>Versie laden...</p>}

              {selectedVersionData && (
                <div style={{ display: 'grid', gridTemplateColumns: diff ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Geselecteerde versie {selectedVersion ? `v${selectedVersion}` : ''}</h4>
                    <pre
                      style={{
                        background: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        minHeight: '260px',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {JSON.stringify(selectedVersionData, null, 2)}
                    </pre>
                  </div>
                  {diff && (
                    <div>
                      <h4 style={{ marginBottom: '0.5rem' }}>Diff met huidige</h4>
                      <pre
                        style={{
                          background: '#fffaf0',
                          padding: '1rem',
                          borderRadius: '4px',
                          border: '1px solid #fbd38d',
                          minHeight: '260px',
                          fontSize: '0.9rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {JSON.stringify(diff, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ContentResult
            type={selectedItem.type}
            result={selectedItem.data}
            onRefine={async () => {}}
            isRefining={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        activeType="library" 
        onTypeChange={() => {}}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>Content Library</h1>
              <p>Bekijk en beheer je opgeslagen content</p>
            </div>
            <Link href="/" className="button" style={{ textDecoration: 'none' }}>
              ← Nieuw genereren
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">
            <p>Library wordt geladen...</p>
          </div>
        ) : (
          <>
            <div className="library-search">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Zoek in library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="search-clear"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {filteredLibrary.length === 0 ? (
              <div className="empty-state">
                <FileText size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
                <h2>{searchQuery ? 'Geen resultaten gevonden' : 'Library is leeg'}</h2>
                <p>
                  {searchQuery 
                    ? 'Probeer een andere zoekterm'
                    : 'Genereer content en sla het op om het hier te zien'}
                </p>
                {!searchQuery && (
                  <Link href="/" className="button" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block' }}>
                    Start met genereren
                  </Link>
                )}
              </div>
            ) : (
              <>
                {['landing', 'categorie', 'product', 'blog', 'social'].map((typeKey) => {
                  const itemsOfType = paginatedLibrary.filter(item => item.type === typeKey);
                  if (itemsOfType.length === 0) return null;
                  return (
                    <div key={typeKey} style={{ marginBottom: '2rem' }}>
                      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                        {getTypeLabel(typeKey)}
                      </h2>
                      <div className="library-grid">
                        {itemsOfType.map((item) => {
                          const Icon = getTypeIcon(item.type);
                          return (
                            <div key={item.id} className="library-card">
                              <div className="library-card-header">
                                <div className="library-card-icon" style={{ 
                                  backgroundColor: item.type === 'landing' ? '#e3f2fd' : 
                                                  item.type === 'categorie' ? '#e8f5e9' :
                                                  item.type === 'product' ? '#fff3e0' :
                                                  item.type === 'blog' ? '#fce4ec' : '#f3e5f5'
                                }}>
                                  <Icon size={24} style={{ 
                                    color: item.type === 'landing' ? '#4a90e2' : 
                                          item.type === 'categorie' ? '#28a745' :
                                          item.type === 'product' ? '#ffc107' :
                                          item.type === 'blog' ? '#dc3545' : '#6f42c1'
                                  }} />
                                </div>
                                <div className="library-card-actions">
                                  <button
                                    onClick={() => {
                                      setSelectedItem(item);
                                      router.push(`/library?preview=${item.id}`);
                                    }}
                                    className="icon-button"
                                    title="Bekijken"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item.id)}
                                    className="icon-button delete"
                                    title="Verwijderen"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                              <div className="library-card-content">
                                <h3>{item.title}</h3>
                                <p className="library-card-preview">{item.preview || 'Geen preview beschikbaar'}</p>
                                <div className="library-card-meta">
                                  <span className="library-card-type">{getTypeLabel(item.type)}</span>
                                  <span className="library-card-date">
                                    {new Date(item.createdAt).toLocaleDateString('nl-NL')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      ← Vorige
                    </button>
                    <span className="pagination-info">
                      Pagina {currentPage} van {totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Volgende →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="app-layout">
        <div className="main-content">
          <div className="loading">
            <p>Laden...</p>
          </div>
        </div>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}

