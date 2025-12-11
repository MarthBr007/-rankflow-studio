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
import { useRef } from 'react';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  status?: string;
  tags?: string[];
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userRole, setUserRole] = useState<string>('user');
  const [pendingTags, setPendingTags] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [versions, setVersions] = useState<Array<{ version: number; createdAt: string }>>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [selectedVersionData, setSelectedVersionData] = useState<any | null>(null);
  const [isLoadingVersionData, setIsLoadingVersionData] = useState(false);
  const [diff, setDiff] = useState<any | null>(null);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const notifySlack = async (status: 'success' | 'error', message: string) => {
    try {
      await fetch('/api/notify/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message }),
      });
    } catch (err) {
      console.warn('Slack notification failed', err);
    }
  };

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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role) setUserRole(data.user.role);
        }
      } catch (e) {
        console.warn('Kon gebruiker niet laden voor rol', e);
      }
    };
    loadUser();
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

  const updateStatus = async (id: string, status: string) => {
    // Alleen editor/admin mag status wijzigen
    if (!['admin', 'editor'].includes(userRole)) {
      showToast('Alleen editor/admin mag status wijzigen', 'error');
      return;
    }
    try {
      const res = await fetch('/api/library', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Status bijwerken mislukt');
      showToast(`Status bijgewerkt naar ${status}`, 'success');
      await notifySlack('success', `Status gewijzigd naar ${status}`);
      await loadLibrary();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem((prev) => prev ? { ...prev, status } : prev);
      }
    } catch (error: any) {
      showToast(error.message || 'Fout bij bijwerken status', 'error');
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
    if (!['admin', 'editor'].includes(userRole)) {
      showToast('Alleen editor/admin mag verwijderen', 'error');
      return;
    }
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkDelete = async () => {
    if (!['admin', 'editor'].includes(userRole)) {
      showToast('Alleen editor/admin mag bulk verwijderen', 'error');
      return;
    }
    if (selectedIds.length === 0) return;
    if (!confirm(`Weet je zeker dat je ${selectedIds.length} item(s) wilt verwijderen?`)) return;
    try {
      await Promise.all(selectedIds.map((id) =>
        fetch(`/api/library?id=${id}`, { method: 'DELETE' })
      ));
      setLibrary(prev => prev.filter(item => !selectedIds.includes(item.id)));
      clearSelection();
      if (selectedItem && selectedIds.includes(selectedItem.id)) {
        setSelectedItem(null);
        router.push('/library');
      }
      showToast('Items verwijderd', 'success');
    } catch (error) {
      console.error('Bulk delete error:', error);
      showToast('Fout bij bulk verwijderen', 'error');
    }
  };

  const exportSelected = () => {
    if (selectedIds.length === 0) return;
    const items = library.filter(item => selectedIds.includes(item.id));
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-export-${selectedIds.length}-items.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const items = Array.isArray(json) ? json : [json];
      let success = 0;
      for (const item of items) {
        const payload = {
          type: item.type || item.contentType,
          title: item.title || 'Imported item',
          data: item.data || item,
        };
        if (!payload.type || !payload.data) continue;
        await fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        success += 1;
      }
      showToast(`Import gereed: ${success} item(s)`, 'success');
      loadLibrary();
    } catch (error) {
      console.error('Import error:', error);
      showToast('Fout bij importeren (controleer JSON)', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredLibrary = library.filter(item => {
    const matchesQuery = !searchQuery
      ? true
      : (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTypeLabel(item.type).toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' ? true : (item.status || 'draft') === statusFilter;

    return matchesQuery && matchesStatus;
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
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`library-status-badge status-${selectedItem.status || 'draft'}`}>
                    {selectedItem.status || 'draft'}
                  </span>
                  <select
                    value={selectedItem.status || 'draft'}
                    onChange={(e) => updateStatus(selectedItem.id, e.target.value)}
                    className="filter-select"
                    style={{ minWidth: '140px' }}
                    disabled={!['admin', 'editor'].includes(userRole)}
                    title={!['admin', 'editor'].includes(userRole) ? 'Alleen editor/admin' : 'Status wijzigen'}
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Tags (komma-gescheiden)"
                    value={pendingTags}
                    onChange={(e) => setPendingTags(e.target.value)}
                    className="search-input"
                    style={{ maxWidth: '320px', paddingLeft: '0.75rem' }}
                  />
                  <button
                    className="button button-secondary"
                    disabled={!['admin', 'editor'].includes(userRole)}
                    onClick={async () => {
                      const tags = pendingTags.split(',').map(t => t.trim()).filter(Boolean);
                      try {
                        const res = await fetch('/api/library', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: selectedItem.id, tags }),
                        });
                        if (!res.ok) throw new Error('Tags bijwerken mislukt');
                        showToast('Tags bijgewerkt', 'success');
                        setSelectedItem(prev => prev ? { ...prev, tags } : prev);
                        setLibrary(prev => prev.map(it => it.id === selectedItem.id ? { ...it, tags } : it));
                        await notifySlack('success', `Tags bijgewerkt voor ${selectedItem.title}`);
                      } catch (err: any) {
                        showToast(err.message || 'Fout bij tags', 'error');
                      }
                    }}
                    title={!['admin', 'editor'].includes(userRole) ? 'Alleen editor/admin' : 'Tags opslaan'}
                  >
                    Tags opslaan
                  </button>
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {selectedItem.tags.map((t) => (
                        <span key={t} className="library-status-badge status-draft" style={{ background: '#eef2ff', color: '#4338ca' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="filter-group">
                  <label htmlFor="statusFilter">Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Alle</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>
              {selectedIds.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.95rem' }}>
                    {selectedIds.length} geselecteerd
                  </div>
                  <button className="button ghost" onClick={clearSelection}>
                    Selectie wissen
                  </button>
                  <button className="button" onClick={exportSelected}>
                    Exporteer JSON
                  </button>
                  <button className="button ghost" onClick={handleImportClick}>
                    Importeer JSON
                  </button>
                  <button className="button" style={{ backgroundColor: '#dc3545' }} onClick={bulkDelete}>
                    Bulk verwijderen
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
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
                            <div key={item.id} className="library-card" style={{ position: 'relative' }}>
                              <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(item.id)}
                                  onChange={() => toggleSelect(item.id)}
                                />
                              </div>
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
                                  <span className={`library-status-badge status-${item.status || 'draft'}`}>
                                    {item.status || 'draft'}
                                  </span>
                                  <span className="library-card-date">
                                    {new Date(item.createdAt).toLocaleDateString('nl-NL')}
                                  </span>
                                </div>
                                {item.tags && item.tags.length > 0 && (
                                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {item.tags.map((t) => (
                                      <span key={t} className="library-status-badge status-draft" style={{ background: '#eef2ff', color: '#4338ca' }}>
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
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

