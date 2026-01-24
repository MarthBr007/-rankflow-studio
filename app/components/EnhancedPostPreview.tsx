'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, ChevronRight, Trash2, X, Eye } from 'lucide-react';
import { Instagram, Linkedin, Facebook, Twitter } from 'lucide-react';
import { useIsMobile } from '../lib/useMediaQuery';

interface Post {
  id: string;
  platform: string;
  contentType: string;
  title?: string;
  content: any;
  imageUrl?: string | null;
  imageId?: string | null;
  hashtags?: string[];
  scheduledDate?: string | Date | null;
  organizationId?: string;
  [key: string]: any;
}

interface EnhancedPostPreviewProps {
  post: Post;
  images?: Array<{ id: string; url: string; alt?: string }>;
  onImageSelect?: (imageId: string) => void;
  selectedImageId?: string | null;
  showFullPreview?: boolean;
  onCloseFullPreview?: () => void;
}

export default function EnhancedPostPreview({
  post,
  images = [],
  onImageSelect,
  selectedImageId,
  showFullPreview = false,
  onCloseFullPreview,
}: EnhancedPostPreviewProps) {
  const isMobile = useIsMobile();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(showFullPreview);

  // Get all images (from post.imageUrl or images array)
  const allImages = images.length > 0 
    ? images 
    : (post.imageUrl ? [{ id: post.imageId || 'main', url: post.imageUrl }] : []);

  const currentImage = allImages[selectedImageIndex] || allImages[0];
  const isCarousel = post.contentType === 'carousel' || allImages.length > 1;
  const isReel = post.contentType === 'reel';

  // Instagram Preview
  const InstagramPreview = () => {
    const content = post.content as any;
    const carouselContent = content?.carousel;
    const reelContent = content?.reel;
    const caption = content?.caption || carouselContent?.hook || reelContent?.caption || '';

    return (
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px',
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transform: 'scale(1)',
        transition: 'transform 0.2s'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '14px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid var(--color-border)'
        }}>
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
            fontSize: '14px',
            flexShrink: 0
          }}>
            {post.organizationId?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.organizationId || 'Account'}
            </div>
          </div>
          <MoreHorizontal size={20} style={{ color: 'var(--color-text)', cursor: 'pointer' }} />
        </div>

        {/* Image/Video */}
        <div style={{
          width: '100%',
          aspectRatio: isReel ? '9/16' : '1/1',
          background: currentImage?.url 
            ? `url(${currentImage.url})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Carousel indicator dots */}
          {isCarousel && allImages.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              gap: '4px',
              background: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: idx === selectedImageIndex ? 'var(--color-bg-panel)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(idx);
                  }}
                />
              ))}
            </div>
          )}

          {/* Carousel arrow */}
          {isCarousel && allImages.length > 1 && selectedImageIndex < allImages.length - 1 && (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => Math.min(prev + 1, allImages.length - 1));
              }}
            >
              <ChevronRight size={18} />
            </div>
          )}

          {/* Play button for Reels */}
          {isReel && (
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid #fff'
            }}>
              <Play size={32} fill="#fff" color="#fff" />
            </div>
          )}

          {/* Carousel badge */}
          {isCarousel && allImages.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#fff',
              fontWeight: '600'
            }}>
              {selectedImageIndex + 1}/{allImages.length}
            </div>
          )}
        </div>

        {/* Engagement buttons */}
        <div style={{ 
          padding: '12px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Heart size={24} style={{ color: '#262626', cursor: 'pointer' }} />
          <MessageCircle size={24} style={{ color: '#262626', cursor: 'pointer' }} />
          <Send size={24} style={{ color: '#262626', cursor: 'pointer' }} />
          <div style={{ flex: 1 }} />
          <Bookmark size={24} style={{ color: '#262626', cursor: 'pointer' }} />
        </div>

        {/* Likes */}
        <div style={{ padding: '0 16px 8px', fontSize: '14px', fontWeight: '600' }}>
          {Math.floor(Math.random() * 1000)} likes
        </div>

        {/* Caption */}
        <div style={{ padding: '0 16px 12px', fontSize: '14px', lineHeight: '1.5' }}>
          <span style={{ fontWeight: '600', marginRight: '4px' }}>
            {post.organizationId || 'Account'}
          </span>
          <span style={{ whiteSpace: 'pre-wrap' }}>{caption}</span>
          {post.hashtags && post.hashtags.length > 0 && (
            <div style={{ marginTop: '4px', color: '#00376b' }}>
              {post.hashtags.map(tag => `#${tag}`).join(' ')}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div style={{ 
          padding: '0 16px 16px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase'
        }}>
          {post.scheduledDate 
            ? new Date(post.scheduledDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
            : '1 min. geleden'
          }
        </div>
      </div>
    );
  };

  // LinkedIn Preview
  const LinkedInPreview = () => {
    const content = post.content as any;
    const linkedinContent = content?.linkedin || content;

    return (
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px',
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transform: 'scale(1)',
        transition: 'transform 0.2s'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid var(--color-border)'
        }}>
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
            fontSize: '18px',
            flexShrink: 0
          }}>
            {post.organizationId?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              {post.organizationId || 'Company Name'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {post.scheduledDate 
                ? new Date(post.scheduledDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
                : '1 sec. geleden'
              }
            </div>
          </div>
          <MoreHorizontal size={20} style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }} />
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
          {linkedinContent.hashtags && (
            <div style={{ marginTop: '0.75rem', fontSize: '14px', color: '#0077B5' }}>
              {linkedinContent.hashtags}
            </div>
          )}
        </div>

        {/* Image Gallery (if multiple images) */}
        {allImages.length > 1 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(allImages.length, 3)}, 1fr)`,
            gap: '2px',
            padding: '0 16px 12px'
          }}>
            {allImages.slice(0, 6).map((img, idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  background: `url(${img.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedImageIndex(idx)}
              >
                {idx === 5 && allImages.length > 6 && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '18px'
                  }}>
                    +{allImages.length - 6}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Single large image */}
        {allImages.length === 1 && currentImage && (
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            background: `url(${currentImage.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        )}

        {/* Engagement buttons */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '24px',
          fontSize: '14px',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Heart size={18} />
            <span>Leuk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <MessageCircle size={18} />
            <span>Opmerking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Send size={18} />
            <span>Verzenden</span>
          </div>
        </div>
      </div>
    );
  };

  // Thumbnail Gallery Component (Adobe Express style)
  const ThumbnailGallery = () => {
    // Show gallery even with single image for consistency
    if (allImages.length === 0) return null;

    return (
      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        padding: isMobile ? '16px' : '20px',
        overflowX: 'auto',
        background: 'var(--color-bg-panel)',
        borderTop: '1px solid var(--color-border)',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        justifyContent: allImages.length === 1 ? 'center' : 'flex-start'
      }}>
        {allImages.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: isMobile ? '72px' : '96px',
              height: isMobile ? '72px' : '96px',
              flexShrink: 0,
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: selectedImageIndex === idx ? '3px solid #007bff' : '2px solid var(--color-border)',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
              boxShadow: selectedImageIndex === idx ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
              transform: selectedImageIndex === idx ? 'scale(1.05)' : 'scale(1)'
            }}
            onClick={() => {
              setSelectedImageIndex(idx);
              if (onImageSelect && img.id) {
                onImageSelect(img.id);
              }
            }}
            onMouseEnter={(e) => {
              if (selectedImageIndex !== idx) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedImageIndex !== idx) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            <img
              src={img.url}
              alt={img.alt || `Image ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Number badge - always visible */}
            <div style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              background: selectedImageIndex === idx ? '#007bff' : 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: '700',
              padding: '4px 8px',
              borderRadius: '12px',
              minWidth: '24px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {idx + 1}
            </div>
            {/* Selected indicator overlay */}
            {selectedImageIndex === idx && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,123,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#007bff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(0,123,255,0.4)'
                }}>
                  ✓
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const PreviewContent = () => {
    if (post.platform === 'instagram') {
      return <InstagramPreview />;
    } else if (post.platform === 'linkedin') {
      return <LinkedInPreview />;
    } else {
      return (
        <div style={{
          padding: '2rem',
          background: 'var(--color-bg-panel)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <p>Preview voor {post.platform} wordt binnenkort toegevoegd</p>
        </div>
      );
    }
  };

  // Full screen preview modal
  if (showFullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
        onClick={() => {
          setShowFullScreen(false);
          if (onCloseFullPreview) onCloseFullPreview();
        }}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setShowFullScreen(false);
              if (onCloseFullPreview) onCloseFullPreview();
            }}
            style={{
              position: 'absolute',
              top: '-40px',
              right: 0,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '32px',
              cursor: 'pointer',
              padding: '8px',
              zIndex: 10001
            }}
          >
            <X size={24} />
          </button>
          <PreviewContent />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      background: 'var(--color-bg-panel)',
      borderRadius: '12px',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    }}>
      {/* Preview Header with "Voorvertoning bekijken" button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '12px 16px' : '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-panel)'
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: '600',
            color: 'var(--color-text)'
          }}>
            Voorvertoning
          </h3>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '12px', 
            color: 'var(--color-text-muted)' 
          }}>
            {post.platform === 'instagram' ? 'Instagram' : post.platform === 'linkedin' ? 'LinkedIn' : post.platform} • {post.contentType}
          </p>
        </div>
        <button
          onClick={() => setShowFullScreen(true)}
          style={{
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: isMobile ? '8px 16px' : '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0056b3';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#007bff';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Eye size={18} />
          {isMobile ? 'Preview' : 'Voorvertoning bekijken'}
        </button>
      </div>

      {/* Main Preview Content */}
      <div style={{
        padding: isMobile ? '24px 16px' : '40px 32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        minHeight: isMobile ? '450px' : '600px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <PreviewContent />
        </div>
      </div>

      {/* Thumbnail Gallery - Always visible at bottom */}
      <ThumbnailGallery />
    </div>
  );
}
