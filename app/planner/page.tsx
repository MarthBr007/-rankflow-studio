'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import UserIndicator from '../components/UserIndicator';
import Toast from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import { Calendar, Instagram, Linkedin, Plus, Grid, List, Clock, Image as ImageIcon, Edit2, Trash2, X, Save, CheckSquare, Square, Download, Facebook, Twitter, BarChart3, TrendingUp, FileText, Send, RefreshCw } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import CalendarView from '../components/CalendarView';
import Breadcrumbs from '../components/Breadcrumbs';
import EnhancedPostPreview from '../components/EnhancedPostPreview';
import MobileMenuButton from '../components/MobileMenuButton';
import { useIsMobile } from '../lib/useMediaQuery';

// Helper functions
function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return '#6c757d';
    case 'scheduled': return '#007bff';
    case 'published': return '#28a745';
    case 'cancelled': return '#dc3545';
    case 'failed': return '#ff9800';
    default: return '#6c757d';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft': return 'Concept';
    case 'scheduled': return 'Gepland';
    case 'published': return 'Gepubliceerd';
    case 'cancelled': return 'Geannuleerd';
    case 'failed': return 'Mislukt';
    default: return status;
  }
}

// Analytics Component - defined outside PlannerContent
function AnalyticsView({ posts }: { posts: any[] }) {
  // Calculate statistics
  const totalPosts = posts.length;
  const postsByPlatform = posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const postsByStatus = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const postsByContentType = posts.reduce((acc, post) => {
    acc[post.contentType] = (acc[post.contentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Posts scheduled for next 7 days
  const next7Days = posts.filter(post => {
    if (!post.scheduledDate) return false;
    const scheduled = new Date(post.scheduledDate);
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    return scheduled >= today && scheduled <= weekFromNow;
  }).length;

  // Posts scheduled for next 30 days
  const next30Days = posts.filter(post => {
    if (!post.scheduledDate) return false;
    const scheduled = new Date(post.scheduledDate);
    const today = new Date();
    const monthFromNow = new Date(today);
    monthFromNow.setDate(today.getDate() + 30);
    return scheduled >= today && scheduled <= monthFromNow;
  }).length;

  // Posts by month (last 6 months)
  const postsByMonth = posts.reduce((acc, post) => {
    if (!post.scheduledDate) return acc;
    const date = new Date(post.scheduledDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

  return (
    <div style={{ padding: '1rem' }}>
      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <FileText size={18} />
            <span>Totaal Posts</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
            {totalPosts}
          </div>
        </div>

        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <Clock size={18} />
            <span>Volgende 7 dagen</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {next7Days}
          </div>
        </div>

        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <Calendar size={18} />
            <span>Volgende 30 dagen</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {next30Days}
          </div>
        </div>

        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <TrendingUp size={18} />
            <span>Gepubliceerd</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {postsByStatus.published || 0}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Posts by Platform */}
        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Posts per Platform
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(postsByPlatform).map(([platform, count]) => {
              const percentage = totalPosts > 0 ? ((count as number) / totalPosts) * 100 : 0;
              const platformColors: Record<string, string> = {
                instagram: '#E4405F',
                linkedin: '#0077B5',
                facebook: '#1877F2',
                twitter: '#1DA1F2'
              };
              return (
                <div key={platform}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{platform}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{count as number} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '24px',
                    background: 'var(--color-bg-light)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: platformColors[platform] || '#6c757d',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Posts by Status */}
        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Posts per Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(postsByStatus).map(([status, count]) => {
              const percentage = totalPosts > 0 ? ((count as number) / totalPosts) * 100 : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600' }}>{getStatusLabel(status)}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{count as number} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '24px',
                    background: 'var(--color-bg-light)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: getStatusColor(status),
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Posts by Content Type */}
        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Posts per Type
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(postsByContentType).map(([type, count]) => {
              const percentage = totalPosts > 0 ? ((count as number) / totalPosts) * 100 : 0;
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{type}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{count as number} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '24px',
                    background: 'var(--color-bg-light)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: '#6c757d',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Posts Over Time */}
        <div style={{
          background: 'var(--color-bg-panel)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Posts Over Tijd (Laatste 6 Maanden)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', padding: '1rem 0' }}>
            {last6Months.map((monthKey) => {
              const count = (postsByMonth[monthKey] as number) || 0;
              const maxCount = Math.max(...(Object.values(postsByMonth) as number[]), 1);
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const [year, month] = monthKey.split('-');
              const monthName = monthNames[parseInt(month) - 1];
              
              return (
                <div key={monthKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    minHeight: count > 0 ? '4px' : '0',
                    background: '#007bff',
                    borderRadius: '4px 4px 0 0',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '0.5rem 0',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {count > 0 && count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    {monthName} {year.slice(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Components - defined outside PlannerContent to avoid parser issues
function LinkedInPostPreview({ post, formatDate }: { post: any; formatDate: (date: string | Date | null) => string }) {
  const content = post.content as any;
  const linkedinContent = content?.linkedin || content;

  return (
    <div style={{
      width: '100%',
      maxWidth: '552px',
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#0077B5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          {post.organizationId?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            {post.organizationId || 'Company Name'}
          </div>
          {post.scheduledDate && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {formatDate(post.scheduledDate)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 16px' }}>
        {linkedinContent.hook && (
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.5rem', lineHeight: '1.4' }}>
            {linkedinContent.hook}
          </div>
        )}
        {linkedinContent.post && (
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text)', whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>
            {linkedinContent.post}
          </div>
        )}
        {linkedinContent.valueBlock && (
          <div style={{
            padding: '12px',
            background: '#f3f2ef',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            {linkedinContent.valueBlock}
          </div>
        )}
        {linkedinContent.scenario && (
          <div style={{ fontSize: '14px', marginBottom: '0.5rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            {linkedinContent.scenario}
          </div>
        )}
        {linkedinContent.advice && (
          <div style={{ fontSize: '14px', marginBottom: '0.5rem' }}>
            <strong>Advies:</strong> {linkedinContent.advice}
          </div>
        )}
        {linkedinContent.cta && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0077B5' }}>
              {linkedinContent.cta}
            </div>
          </div>
        )}
        {linkedinContent.hashtags && (
          <div style={{ marginTop: '0.75rem', fontSize: '14px', color: '#0077B5' }}>
            {linkedinContent.hashtags}
          </div>
        )}
      </div>
    </div>
  );
}

function InstagramPostPreview({ post, formatDate }: { post: any; formatDate: (date: string | Date | null) => string }) {
  const content = post.content as any;
  const isCarousel = post.contentType === 'carousel';
  const isReel = post.contentType === 'reel';

  return (
    <div style={{
      width: '100%',
      maxWidth: '470px',
      background: 'var(--color-bg-panel)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {post.organizationId?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            {post.organizationId || 'Account'}
          </div>
          {post.scheduledDate && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {formatDate(post.scheduledDate)}
            </div>
          )}
        </div>
      </div>

      {/* Image placeholder */}
      <div style={{
        width: '100%',
        aspectRatio: isReel ? '9/16' : '1/1',
        background: post.imageUrl ? `url(${post.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '14px',
        position: 'relative'
      }}>
        {!post.imageUrl && (
          <>
            <ImageIcon size={48} style={{ opacity: 0.5 }} />
            {isCarousel && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Carousel
              </div>
            )}
            {isReel && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Reel
              </div>
            )}
          </>
        )}
      </div>

      {/* Caption */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
          {isCarousel && content?.carousel ? (
            <>
              <strong>{content.carousel.hook}</strong>
              {'\n\n'}
              {content.carousel.slides?.slice(0, 2).map((slide: string, i: number) => (
                <div key={i} style={{ marginBottom: '8px' }}>• {slide}</div>
              ))}
              {content.carousel.slides?.length > 2 && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  +{content.carousel.slides.length - 2} meer slides
                </div>
              )}
              {'\n\n'}
              <strong>{content.carousel.cta}</strong>
            </>
          ) : isReel && content?.reel ? (
            <>
              {content.reel.caption}
              {'\n\n'}
              <span style={{ color: 'var(--color-text-muted)' }}>{content.reel.hashtags}</span>
            </>
          ) : content?.caption ? (
            content.caption
          ) : (
            'Geen caption beschikbaar'
          )}
        </div>
        {post.hashtags && post.hashtags.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#00376b' }}>
            {post.hashtags.join(' ')}
          </div>
        )}
      </div>
    </div>
  );
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'calendar' | 'feed' | 'list' | 'analytics'>('feed');
  const [modalView, setModalView] = useState<'form' | 'preview'>('form'); // For mobile tab switching
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; url: string }>>([]);
  
  // Form state voor create/edit
  const [formData, setFormData] = useState({
    platform: 'instagram',
    contentType: 'single',
    title: '',
    content: { caption: '' },
    imageId: null as string | null,
    imageUrl: null as string | null,
    scheduledDate: '',
    scheduledTime: '',
    hashtags: [] as string[],
    hashtagInput: '',
  });

  useEffect(() => {
    // Load tenant config from localStorage
    const stored = localStorage.getItem('tenantConfig');
    if (stored) {
      try {
        const config = JSON.parse(stored);
        setOrganizationId(config.organizationId || null);
      } catch (e) {
        console.error('Error parsing tenant config:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [organizationId, selectedPlatform, selectedStatus]);

  useEffect(() => {
    if (showCreateModal && organizationId) {
      loadTemplates();
    }
  }, [showCreateModal, organizationId, formData.platform, formData.contentType]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      // Always include organizationId if available, but don't filter if null
      // This allows loading posts even without organizationId
      if (organizationId) {
        params.append('organizationId', organizationId);
      }
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/social-posts?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Fout bij laden posts');
      }
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      showToast(error.message || 'Fout bij laden posts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (formData.platform) params.append('platform', formData.platform);
      if (formData.contentType) params.append('contentType', formData.contentType);

      const response = await fetch(`/api/social-templates?${params.toString()}`);
      if (!response.ok) throw new Error('Fout bij laden templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const applyTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      platform: template.platform,
      contentType: template.contentType,
      content: template.content,
      hashtags: template.hashtags || [],
    }));
    setSelectedTemplate(template.id);
    showToast(`Template "${template.name}" toegepast`, 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePublish = async (postId: string, publishNow: boolean = true) => {
    try {
      const response = await fetch('/api/social-posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, publishNow }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fout bij publiceren');
      }

      const data = await response.json();
      showToast(data.message || 'Post succesvol gepubliceerd', 'success');
      loadPosts();
    } catch (error: any) {
      console.error('Error publishing post:', error);
      showToast(error.message || 'Fout bij publiceren', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze post wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/social-posts?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Fout bij verwijderen');
      showToast('Post verwijderd', 'success');
      loadPosts();
      if (selectedPost?.id === id) setSelectedPost(null);
      setSelectedPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error: any) {
      showToast(error.message || 'Fout bij verwijderen', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.size === 0) {
      showToast('Selecteer eerst posts om te verwijderen', 'warning');
      return;
    }

    if (!confirm(`Weet je zeker dat je ${selectedPostIds.size} post(s) wilt verwijderen?`)) return;

    try {
      const deletePromises = Array.from(selectedPostIds).map(id =>
        fetch(`/api/social-posts?id=${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      showToast(`${selectedPostIds.size} post(s) verwijderd`, 'success');
      setSelectedPostIds(new Set());
      setIsBulkMode(false);
      loadPosts();
    } catch (error: any) {
      showToast('Fout bij verwijderen posts', 'error');
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedPostIds.size === 0) {
      showToast('Selecteer eerst posts om status te wijzigen', 'warning');
      return;
    }

    try {
      const updatePromises = Array.from(selectedPostIds).map(id =>
        fetch('/api/social-posts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: newStatus }),
        })
      );
      await Promise.all(updatePromises);
      showToast(`${selectedPostIds.size} post(s) status gewijzigd naar ${getStatusLabel(newStatus)}`, 'success');
      setSelectedPostIds(new Set());
      setIsBulkMode(false);
      loadPosts();
    } catch (error: any) {
      showToast('Fout bij wijzigen status', 'error');
    }
  };

  const handleBulkExport = () => {
    if (selectedPostIds.size === 0) {
      showToast('Selecteer eerst posts om te exporteren', 'warning');
      return;
    }

    const selectedPosts = posts.filter(p => selectedPostIds.has(p.id));
    const exportData = selectedPosts.map(post => ({
      id: post.id,
      platform: post.platform,
      contentType: post.contentType,
      title: post.title,
      caption: (post.content as any)?.caption || (post.content as any)?.carousel?.hook || '',
      scheduledDate: post.scheduledDate,
      status: post.status,
      hashtags: post.hashtags,
      imageUrl: post.imageUrl,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-posts-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`${selectedPostIds.size} post(s) geëxporteerd`, 'success');
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const selectAllPosts = () => {
    setSelectedPostIds(new Set(posts.map(p => p.id)));
  };

  const deselectAllPosts = () => {
    setSelectedPostIds(new Set());
  };

  const formatDate = (date: string | Date | null): string => {
    if (!date) return 'Niet gepland';
    const d = new Date(date);
    return d.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddHashtag = () => {
    if (formData.hashtagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, prev.hashtagInput.trim()],
        hashtagInput: '',
      }));
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag),
    }));
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    const scheduledDate = post.scheduledDate ? new Date(post.scheduledDate) : null;
    setFormData({
      platform: post.platform,
      contentType: post.contentType,
      title: post.title || '',
      content: post.content || { caption: '' },
      imageId: post.imageId || null,
      imageUrl: post.imageUrl || null,
      scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
      scheduledTime: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : '',
      hashtags: post.hashtags || [],
      hashtagInput: '',
    });
    // Set selected images for preview
    if (post.imageUrl) {
      setSelectedImages([{ id: post.imageId || 'main', url: post.imageUrl }]);
    } else {
      setSelectedImages([]);
    }
    setShowCreateModal(true);
  };

  const handlePostMove = async (postId: string, newDate: Date) => {
    try {
      const response = await fetch('/api/social-posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
          scheduledDate: newDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Fout bij verplaatsen post');
      }

      showToast('Post verplaatst', 'success');
      loadPosts(); // Reload posts to reflect changes
    } catch (error: any) {
      console.error('Error moving post:', error);
      showToast(error.message || 'Fout bij verplaatsen post', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.platform || !formData.contentType || !formData.content) {
      showToast('Platform, type en content zijn verplicht', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const scheduledDateTime = formData.scheduledDate && formData.scheduledTime
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : formData.scheduledDate
        ? new Date(`${formData.scheduledDate}T12:00`).toISOString()
        : null;

      const body: any = {
        organizationId,
        platform: formData.platform,
        contentType: formData.contentType,
        title: formData.title || null,
        content: formData.content,
        imageUrl: formData.imageUrl,
        imageId: formData.imageId,
        scheduledDate: scheduledDateTime,
        hashtags: formData.hashtags,
      };

      if (editingPost) {
        // Update existing post
        const response = await fetch('/api/social-posts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPost.id, ...body }),
        });
        if (!response.ok) throw new Error('Fout bij updaten post');
        showToast('Post bijgewerkt', 'success');
      } else {
        // Create new post
        const response = await fetch('/api/social-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Fout bij aanmaken post');
        showToast('Post aangemaakt', 'success');
      }

      setShowCreateModal(false);
      setEditingPost(null);
      setSelectedImages([]);
      setFormData({
        platform: 'instagram',
        contentType: 'single',
        title: '',
        content: { caption: '' },
        imageId: null,
        imageUrl: null,
        scheduledDate: '',
        scheduledTime: '',
        hashtags: [],
        hashtagInput: '',
      });
      loadPosts();
    } catch (error: any) {
      showToast(error.message || 'Fout bij opslaan', 'error');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className={`app-layout ${isMobileMenuOpen && isMobile ? 'mobile-sidebar-open' : ''}`}>
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar 
        activeType="planner" 
        onTypeChange={() => {}}
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ThemeToggle />
              <UserIndicator />
              {isBulkMode && selectedPostIds.size > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', background: 'var(--color-bg-light)', borderRadius: '6px', border: '1px solid var(--color-primary)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                    {selectedPostIds.size} geselecteerd
                  </span>
                  <button
                    className="button button-secondary"
                    onClick={() => handleBulkStatusChange('draft')}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                  >
                    Concept
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => handleBulkStatusChange('scheduled')}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                  >
                    Gepland
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={handleBulkExport}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Download size={14} />
                    Export
                  </button>
                  <button
                    className="button"
                    onClick={handleBulkDelete}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: 'var(--color-error)' }}
                    title="Verwijder geselecteerde posts"
                  >
                    Verwijderen
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setIsBulkMode(false);
                      setSelectedPostIds(new Set());
                    }}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                  >
                    Annuleren
                  </button>
                </div>
              )}
              {!isBulkMode && (
                <>
                  <button
                    className="button button-secondary"
                    onClick={() => setIsBulkMode(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <CheckSquare size={18} />
                    Bulk Acties
                  </button>
                  <button
                    className="button"
                    onClick={() => setShowCreateModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={18} />
                    Nieuwe Post
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-panel)', color: 'var(--color-text)' }}
          >
            <option value="all">Alle platforms</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-panel)', color: 'var(--color-text)' }}
          >
            <option value="all">Alle statussen</option>
            <option value="draft">Concept</option>
            <option value="scheduled">Gepland</option>
            <option value="published">Gepubliceerd</option>
          </select>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <button
              className={`button ${viewMode === 'feed' ? 'active' : ''}`}
              onClick={() => setViewMode('feed')}
              style={{ padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem', minHeight: '44px' }}
              title="Feed weergave"
            >
              {isMobile ? <><Grid size={18} /> Feed</> : <Grid size={18} />}
            </button>
            <button
              className={`button ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              style={{ padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem', minHeight: '44px' }}
              title="Kalender weergave"
            >
              {isMobile ? <><Calendar size={18} /> Kalender</> : <Calendar size={18} />}
            </button>
            <button
              className={`button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{ padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem', minHeight: '44px' }}
              title="Lijst weergave"
            >
              {isMobile ? <><List size={18} /> Lijst</> : <List size={18} />}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Posts laden...</p>
          </div>
        ) : viewMode === 'feed' ? (
          <div style={{ padding: '1rem' }}>
            {isBulkMode && posts.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={selectedPostIds.size === posts.length ? deselectAllPosts : selectAllPosts}
                    className="button button-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {selectedPostIds.size === posts.length ? <Square size={18} /> : <CheckSquare size={18} />}
                    {selectedPostIds.size === posts.length ? 'Deselecteer alles' : 'Selecteer alles'}
                  </button>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {selectedPostIds.size} van {posts.length} geselecteerd
                  </span>
                </div>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: isMobile ? '1rem' : '1.5rem'
            }}>
              {posts.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <Calendar size={48} style={{ margin: '0 auto 1rem', color: '#999' }} />
                  <h3>Geen posts gevonden</h3>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Maak je eerste social media post aan
                  </p>
                  <button
                    className="button"
                    onClick={() => setShowCreateModal(true)}
                    style={{ marginTop: '1rem' }}
                  >
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Nieuwe Post
                  </button>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      if (isBulkMode) {
                        togglePostSelection(post.id);
                      } else {
                        setSelectedPost(post);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      background: '#fff',
                      borderRadius: '8px',
                      border: selectedPostIds.has(post.id) ? '3px solid #007bff' : '1px solid #e5e7eb',
                      overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isBulkMode) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isBulkMode) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isBulkMode && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 10,
                        background: selectedPostIds.has(post.id) ? '#007bff' : '#fff',
                        border: '2px solid #007bff',
                        borderRadius: '4px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePostSelection(post.id);
                      }}
                      >
                        {selectedPostIds.has(post.id) && (
                          <CheckSquare size={16} style={{ color: '#fff' }} />
                        )}
                      </div>
                    )}
                  {post.platform === 'instagram' ? (
                    <InstagramPostPreview post={post} formatDate={formatDate} />
                  ) : post.platform === 'linkedin' ? (
                    <LinkedInPostPreview post={post} formatDate={formatDate} />
                  ) : (
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {post.platform === 'facebook' ? <Facebook size={20} /> : post.platform === 'twitter' ? <Twitter size={20} /> : <Calendar size={20} />}
                        <strong>{post.platform}</strong>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: getStatusColor(post.status),
                          color: '#fff'
                        }}>
                          {getStatusLabel(post.status)}
                        </span>
                      </div>
                      {post.title && <h3 style={{ margin: '0.5rem 0' }}>{post.title}</h3>}
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
                        {formatDate(post.scheduledDate)}
                      </p>
                    </div>
                  )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div style={{ padding: '1rem' }}>
            {isBulkMode && posts.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={selectedPostIds.size === posts.length ? deselectAllPosts : selectAllPosts}
                    className="button button-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {selectedPostIds.size === posts.length ? <Square size={18} /> : <CheckSquare size={18} />}
                    {selectedPostIds.size === posts.length ? 'Deselecteer alles' : 'Selecteer alles'}
                  </button>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {selectedPostIds.size} van {posts.length} geselecteerd
                  </span>
                </div>
              </div>
            )}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                    {isBulkMode && (
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedPostIds.size === posts.length && posts.length > 0}
                          onChange={selectedPostIds.size === posts.length ? deselectAllPosts : selectAllPosts}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                    )}
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Platform</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Titel</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Gepland</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    {!isBulkMode && (
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Acties</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={isBulkMode ? 6 : 7} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        Geen posts gevonden
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr
                        key={post.id}
                        onClick={() => {
                          if (isBulkMode) {
                            togglePostSelection(post.id);
                          } else {
                            setSelectedPost(post);
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'background 0.2s',
                          background: selectedPostIds.has(post.id) ? '#f0f8ff' : '#fff'
                        }}
                        onMouseEnter={(e) => {
                          if (!isBulkMode) {
                            e.currentTarget.style.background = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isBulkMode) {
                            e.currentTarget.style.background = '#fff';
                          } else {
                            e.currentTarget.style.background = selectedPostIds.has(post.id) ? '#f0f8ff' : '#fff';
                          }
                        }}
                      >
                        {isBulkMode && (
                          <td style={{ padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedPostIds.has(post.id)}
                              onChange={() => togglePostSelection(post.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                        )}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {post.platform === 'instagram' ? <Instagram size={18} /> : <Linkedin size={18} />}
                            {post.platform}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>{post.contentType}</td>
                        <td style={{ padding: '1rem' }}>{post.title || '-'}</td>
                        <td style={{ padding: '1rem' }}>{formatDate(post.scheduledDate)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: getStatusColor(post.status),
                            color: '#fff'
                          }}>
                            {getStatusLabel(post.status)}
                          </span>
                        </td>
                        {!isBulkMode && (
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              {(post.status === 'draft' || post.status === 'scheduled') && (
                                <button
                                  className="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handlePublish(post.id, true);
                                  }}
                                  style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.25rem',
                                    cursor: 'pointer'
                                  }}
                                  title="Publiceer nu"
                                >
                                  <Send size={16} />
                                </button>
                              )}
                              {post.status === 'failed' && (
                                <button
                                  className="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handlePublish(post.id, true);
                                  }}
                                  style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.25rem',
                                    cursor: 'pointer'
                                  }}
                                  title="Probeer opnieuw"
                                >
                                  <RefreshCw size={16} />
                                </button>
                              )}
                              <button
                                className="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEdit(post);
                                }}
                                style={{ 
                                  padding: '0.25rem 0.5rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Bewerken"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleDelete(post.id);
                                }}
                                style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  background: '#dc3545',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Verwijderen"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'analytics' ? (
          <AnalyticsView posts={posts} />
        ) : (
          <CalendarView
            posts={posts}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onPostClick={(post) => {
              setSelectedPost(post);
            }}
            onPostEdit={(post) => {
              handleEdit(post);
            }}
            onPostMove={handlePostMove}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={() => setSelectedPost(null)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Post Details</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {selectedPost.platform === 'instagram' && (
                  <InstagramPostPreview post={selectedPost} formatDate={formatDate} />
                )}
                {selectedPost.platform === 'linkedin' && (
                  <LinkedInPostPreview post={selectedPost} formatDate={formatDate} />
                )}
                {selectedPost.platform !== 'instagram' && selectedPost.platform !== 'linkedin' && (
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p><strong>Platform:</strong> {selectedPost.platform}</p>
                    <p><strong>Type:</strong> {selectedPost.contentType}</p>
                    {selectedPost.title && <p><strong>Titel:</strong> {selectedPost.title}</p>}
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Content:</strong>
                      <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedPost.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="button"
                    onClick={() => {
                      handleEdit(selectedPost);
                      setSelectedPost(null);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Edit2 size={18} />
                    Bewerken
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      handleDelete(selectedPost.id);
                      setSelectedPost(null);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dc3545' }}
                  >
                    <Trash2 size={18} />
                    Verwijderen
                  </button>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <h3>Metadata</h3>
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Platform:</strong> {selectedPost.platform}</p>
                    <p><strong>Type:</strong> {selectedPost.contentType}</p>
                    <p><strong>Status:</strong> <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: getStatusColor(selectedPost.status),
                      color: '#fff'
                    }}>{getStatusLabel(selectedPost.status)}</span></p>
                    <p><strong>Gepland:</strong> {formatDate(selectedPost.scheduledDate)}</p>
                    {selectedPost.publishedDate && (
                      <p><strong>Gepubliceerd:</strong> {formatDate(selectedPost.publishedDate)}</p>
                    )}
                    {selectedPost.createdBy && (
                      <p><strong>Aangemaakt door:</strong> {selectedPost.createdBy}</p>
                    )}
                    {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Hashtags:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                          {selectedPost.hashtags.map((tag: string) => (
                            <span key={tag} style={{
                              padding: '0.25rem 0.5rem',
                              background: '#007bff',
                              color: '#fff',
                              borderRadius: '4px',
                              fontSize: '0.875rem'
                            }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem',
              overflow: 'auto'
            }}
            onClick={() => {
              setShowCreateModal(false);
              setEditingPost(null);
              setSelectedTemplate(null);
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: 0,
                maxWidth: isMobile ? '100%' : '1400px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: isMobile ? 'flex' : 'grid',
                flexDirection: isMobile ? 'column' : undefined,
                gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
                gap: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Tabs */}
              {isMobile && (
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#f8f9fa'
                }}>
                  <button
                    onClick={() => setModalView('form')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: modalView === 'form' ? '#fff' : 'transparent',
                      border: 'none',
                      borderBottom: modalView === 'form' ? '2px solid #007bff' : '2px solid transparent',
                      cursor: 'pointer',
                      fontWeight: modalView === 'form' ? '600' : '400',
                      color: modalView === 'form' ? '#007bff' : '#666'
                    }}
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => setModalView('preview')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: modalView === 'preview' ? '#fff' : 'transparent',
                      border: 'none',
                      borderBottom: modalView === 'preview' ? '2px solid #007bff' : '2px solid transparent',
                      cursor: 'pointer',
                      fontWeight: modalView === 'preview' ? '600' : '400',
                      color: modalView === 'preview' ? '#007bff' : '#666'
                    }}
                  >
                    Voorvertoning
                  </button>
                </div>
              )}

              {/* Left Panel - Form */}
              <div style={{ 
                padding: isMobile ? '1rem' : '2rem',
                overflowY: 'auto',
                borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
                display: isMobile && modalView !== 'form' ? 'none' : 'block'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{editingPost ? 'Post bewerken' : 'Nieuwe Post'}</h2>
                    {!editingPost && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                        Of <a href="/?type=social" style={{ color: '#007bff', textDecoration: 'underline' }}>genereer een post met AI</a>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPost(null);
                      setSelectedTemplate(null);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Template Selector */}
                {!editingPost && templates.length > 0 && (
                  <div style={{
                    padding: '1rem',
                background: 'var(--color-bg-panel)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
                  }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Gebruik een template
                    </label>
                    {isLoadingTemplates ? (
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>Templates laden...</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: selectedTemplate === template.id ? '#007bff' : '#fff',
                              color: selectedTemplate === template.id ? '#fff' : '#333',
                              border: `1px solid ${selectedTemplate === template.id ? '#007bff' : '#ddd'}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedTemplate !== template.id) {
                                e.currentTarget.style.borderColor = '#007bff';
                                e.currentTarget.style.background = '#f0f8ff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedTemplate !== template.id) {
                                e.currentTarget.style.borderColor = '#ddd';
                                e.currentTarget.style.background = '#fff';
                              }
                            }}
                          >
                            {template.isDefault && <span style={{ fontSize: '0.75rem' }}>⭐</span>}
                            {template.name}
                            {template.description && (
                              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                - {template.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Platform & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Platform *</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Type *</label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                      <option value="single">Single Post</option>
                      <option value="carousel">Carousel</option>
                      <option value="reel">Reel</option>
                      <option value="story">Story</option>
                      {formData.platform === 'linkedin' && <option value="linkedin_post">LinkedIn Post</option>}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Titel</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bijv. Glaswerk voor bruiloft"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                {/* Image Selectie */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Afbeeldingen</label>
                  <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '1rem' }}>
                    <ImageGallery
                      organizationId={organizationId}
                      onSelect={(image) => {
                        setFormData(prev => ({
                          ...prev,
                          imageId: image.id,
                          imageUrl: image.url,
                        }));
                        // Update selected images for preview
                        if (!selectedImages.find(img => img.id === image.id)) {
                          setSelectedImages(prev => [...prev, { id: image.id, url: image.url }]);
                        }
                      }}
                      selectedImageId={formData.imageId}
                      showUploader={true}
                    />
                  </div>
                </div>

                {/* Caption/Content */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Caption *</label>
                  <textarea
                    value={formData.content.caption || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: { ...prev.content, caption: e.target.value }
                    }))}
                    placeholder="Schrijf je caption hier..."
                    rows={6}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }}
                  />
                  <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                    {formData.content.caption?.length || 0} karakters
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Hashtags</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={formData.hashtagInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, hashtagInput: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHashtag();
                        }
                      }}
                      placeholder="Voeg hashtag toe..."
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHashtag}
                      className="button"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Toevoegen
                    </button>
                  </div>
                  {formData.hashtags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {formData.hashtags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            background: '#007bff',
                            color: '#fff',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                          }}
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveHashtag(tag)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scheduling */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Datum</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tijd</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPost(null);
                    }}
                    disabled={isSaving}
                  >
                    Annuleren
                  </button>
                  <button
                    className="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Save size={18} />
                    {isSaving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                </div>
              </div>

              {/* Right Panel - Preview */}
              <div style={{
                padding: isMobile ? '1rem' : '2rem',
                background: '#f8f9fa',
                overflowY: 'auto',
                display: isMobile && modalView !== 'preview' ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: isMobile ? 'auto' : '100%'
              }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600', color: '#666' }}>
                    Voorvertoning
                  </h3>
                  <EnhancedPostPreview
                    post={{
                      id: editingPost?.id || 'new',
                      platform: formData.platform,
                      contentType: formData.contentType,
                      title: formData.title,
                      content: formData.content,
                      imageUrl: formData.imageUrl,
                      imageId: formData.imageId,
                      hashtags: formData.hashtags,
                      organizationId: organizationId || undefined,
                    }}
                    images={selectedImages.length > 0 ? selectedImages : (formData.imageUrl ? [{ id: formData.imageId || 'main', url: formData.imageUrl }] : [])}
                    onImageSelect={(imageId) => {
                      const image = selectedImages.find(img => img.id === imageId);
                      if (image) {
                        setFormData(prev => ({
                          ...prev,
                          imageId: image.id,
                          imageUrl: image.url,
                        }));
                      }
                    }}
                    selectedImageId={formData.imageId}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlannerContent />
    </Suspense>
  );
}

