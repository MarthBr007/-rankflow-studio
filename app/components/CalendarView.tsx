'use client';

import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Instagram, Linkedin, Facebook, Twitter } from 'lucide-react';
import { useIsMobile } from '../lib/useMediaQuery';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Post {
  id: string;
  platform: string;
  contentType: string;
  title?: string;
  scheduledDate?: string | Date | null;
  status: string;
  imageUrl?: string | null;
}

interface CalendarViewProps {
  posts: Post[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onPostClick: (post: Post) => void;
  onPostEdit: (post: Post) => void;
  onPostMove?: (postId: string, newDate: Date) => Promise<void>;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function CalendarView({
  posts,
  currentMonth,
  onMonthChange,
  onPostClick,
  onPostEdit,
  onPostMove,
  getStatusColor,
  getStatusLabel,
}: CalendarViewProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>(isMobile ? 'week' : 'month');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);

  // Get first day of month and number of days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  // Adjust for Monday as first day (0 = Monday, 6 = Sunday)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Get posts for a specific date
  const getPostsForDate = (date: Date): Post[] => {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => {
      if (!post.scheduledDate) return false;
      const postDate = new Date(post.scheduledDate);
      const postDateStr = postDate.toISOString().split('T')[0];
      return postDateStr === dateStr;
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onMonthChange(newDate);
  };

  const goToToday = () => {
    onMonthChange(new Date());
    setSelectedDate(new Date());
  };

  // Week view functions
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Monday as first day
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (date: Date): Date[] => {
    const weekStart = getWeekStart(date);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - 7);
    onMonthChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + 7);
    onMonthChange(newDate);
  };

  const weekDays = viewMode === 'week' ? getWeekDays(currentMonth) : [];

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month && date.getFullYear() === year;
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      default: return null;
    }
  };

  // Get platform color
  const getPlatformColor = (platform: string): string => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      default: return '#6c757d';
    }
  };

  // Month name in Dutch
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < adjustedStartingDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Get selected date posts
  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const post = posts.find(p => p.id === active.id);
    setDraggedPost(post || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedPost(null);

    if (!over || !onPostMove) return;

    const postId = active.id as string;
    let targetDate: Date | null = null;

    // Check if dropped on a date cell
    if (typeof over.id === 'string' && over.id.startsWith('date-')) {
      const dateStr = over.id.replace('date-', '');
      targetDate = new Date(dateStr);
    } else if (over.data?.current?.date) {
      // Fallback: check data attribute
      targetDate = new Date(over.data.current.date);
    }

    if (targetDate) {
      try {
        await onPostMove(postId, targetDate);
      } catch (error) {
        console.error('Error moving post:', error);
      }
    }
  };

  // Droppable Date Cell Component
  const DroppableDateCell = ({ date, children }: { date: Date; children: React.ReactNode }) => {
    const dateId = `date-${date.toISOString().split('T')[0]}`;
    const { setNodeRef, isOver } = useDroppable({
      id: dateId,
      data: { date },
    });

    return (
      <div
        ref={setNodeRef}
        style={{
          border: isOver ? '2px dashed #007bff' : undefined,
          background: isOver ? 'rgba(0, 123, 255, 0.1)' : undefined,
        }}
      >
        {children}
      </div>
    );
  };

  // Sortable Post Component
  const SortablePost = ({ post, date }: { post: Post; date: Date }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: post.id });

    const dragStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const PlatformIcon = getPlatformIcon(post.platform);
    const platformColor = getPlatformColor(post.platform);

    return (
      <div
        ref={setNodeRef}
        style={{
          ...dragStyle,
          padding: '0.25rem 0.5rem',
          background: platformColor,
          color: '#fff',
          borderRadius: '4px',
          fontSize: '0.75rem',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          touchAction: 'none',
        }}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation();
          onPostClick(post);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onPostEdit(post);
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        title={post.title || `${post.platform} ${post.contentType}`}
      >
        {PlatformIcon && <PlatformIcon size={12} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {post.title || post.platform}
        </span>
      </div>
    );
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ padding: '1rem' }}>
        {/* Calendar Header */}
        <div style={{
          background: 'var(--color-bg-panel)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={viewMode === 'month' ? goToPreviousMonth : goToPreviousWeek}
              className="button button-secondary"
              style={{ padding: '0.5rem' }}
            >
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>
              {viewMode === 'week' 
                ? `Week ${Math.ceil((currentMonth.getDate() + getWeekStart(currentMonth).getDay() - 1) / 7)} - ${weekDays[0]?.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} t/m ${weekDays[6]?.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : `${monthNames[month]} ${year}`
              }
            </h2>
            <button
              onClick={viewMode === 'month' ? goToNextMonth : goToNextWeek}
              className="button button-secondary"
              style={{ padding: '0.5rem' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <div style={{ display: 'flex', gap: '0.25rem', background: '#f3f4f6', padding: '0.25rem', borderRadius: '6px' }}>
              <button
                onClick={() => setViewMode('month')}
                className="button"
                style={{
                  padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
                  minHeight: '44px',
                  background: viewMode === 'month' ? '#007bff' : 'transparent',
                  color: viewMode === 'month' ? '#fff' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }}
              >
                Maand
              </button>
              <button
                onClick={() => setViewMode('week')}
                className="button"
                style={{
                  padding: isMobile ? '0.75rem 1rem' : '0.5rem 1rem',
                  minHeight: '44px',
                  background: viewMode === 'week' ? '#007bff' : 'transparent',
                  color: viewMode === 'week' ? '#fff' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }}
              >
                Week
              </button>
            </div>
            <button
              onClick={goToToday}
              className="button button-secondary"
              style={{ minHeight: '44px', padding: isMobile ? '0.75rem 1rem' : undefined }}
            >
              Vandaag
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: isMobile && viewMode === 'month' ? 'none' : 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: isMobile ? '0.25rem' : '0.5rem'
        }}>
          {/* Day headers */}
          {dayNames.map(day => (
            <div
              key={day}
              style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                borderBottom: '2px solid var(--color-border)'
              }}
            >
              {day}
            </div>
          ))}

          {/* Calendar days - Month or Week view */}
          {(viewMode === 'month' ? calendarDays : weekDays.map(d => d)).map((date, index) => {
            if (viewMode === 'week' && !(date instanceof Date)) return null;
            const dateObj = viewMode === 'week' ? date as Date : date;
            if (!dateObj) {
              return <div key={`empty-${index}`} style={{ aspectRatio: '1', minHeight: '100px' }} />;
            }
            if (!date) {
              return <div key={`empty-${index}`} style={{ aspectRatio: '1', minHeight: '100px' }} />;
            }

            const dayPosts = getPostsForDate(dateObj);
            const isTodayDate = isToday(dateObj);
            const isSelected = selectedDate && 
              dateObj.getDate() === selectedDate.getDate() &&
              dateObj.getMonth() === selectedDate.getMonth() &&
              dateObj.getFullYear() === selectedDate.getFullYear();

            const dayPostIds = dayPosts.map(p => p.id);

            return (
              <DroppableDateCell key={dateObj.toISOString()} date={dateObj}>
              <div
                onClick={() => setSelectedDate(dateObj)}
                style={{
                  aspectRatio: viewMode === 'week' ? 'auto' : '1',
                  minHeight: viewMode === 'week' ? (isMobile ? '150px' : '200px') : (isMobile ? '80px' : '100px'),
                  border: `2px solid ${isSelected ? '#007bff' : isTodayDate ? '#28a745' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                  padding: isMobile ? '0.25rem' : '0.5rem',
                  background: isSelected ? '#f0f8ff' : isTodayDate ? '#f0fff4' : 'var(--color-bg-panel)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  overflow: 'hidden',
                  touchAction: 'manipulation'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#007bff';
                    e.currentTarget.style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = isTodayDate ? '#28a745' : 'var(--color-border)';
                    e.currentTarget.style.background = isTodayDate ? '#f0fff4' : 'var(--color-bg-panel)';
                  }
                }}
              >
                {/* Day number */}
                <div style={{
                  fontWeight: isTodayDate ? 'bold' : 'normal',
                  fontSize: '0.875rem',
                  color: isTodayDate ? '#28a745' : 'var(--color-text)',
                  marginBottom: '0.25rem'
                }}>
                  {dateObj.getDate()}
                </div>

                {/* Posts */}
                <SortableContext items={dayPostIds} strategy={verticalListSortingStrategy}>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    overflow: 'auto'
                  }}>
                    {dayPosts.slice(0, 3).map(post => (
                      <SortablePost key={post.id} post={post} date={dateObj} />
                    ))}
                  </div>
                </SortableContext>
                  {dayPosts.length > 3 && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      textAlign: 'center',
                      padding: '0.25rem'
                    }}>
                      +{dayPosts.length - 3} meer
                    </div>
                  )}
                </div>
              </DroppableDateCell>
            );
          })}
        </div>
      </div>

      {/* Selected Date Posts */}
      {selectedDate && selectedDatePosts.length > 0 && (
        <div style={{
          background: 'var(--color-bg-panel)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
            Posts op {selectedDate.toLocaleDateString('nl-NL', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedDatePosts.map(post => {
              const PlatformIcon = getPlatformIcon(post.platform);
              const platformColor = getPlatformColor(post.platform);
              
              return (
                <div
                  key={post.id}
                  onClick={() => onPostClick(post)}
                  onDoubleClick={() => onPostEdit(post)}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = platformColor;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${platformColor}33`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title || 'Post image'}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {PlatformIcon && <PlatformIcon size={18} style={{ color: platformColor }} />}
                      <strong>{post.title || `${post.platform} ${post.contentType}`}</strong>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: getStatusColor(post.status),
                        color: '#fff',
                        marginLeft: 'auto'
                      }}>
                        {getStatusLabel(post.status)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {post.contentType} • {new Date(post.scheduledDate!).toLocaleTimeString('nl-NL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && selectedDatePosts.length === 0 && (
        <div style={{
          background: 'var(--color-bg-panel)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          <p>Geen posts gepland op {selectedDate.toLocaleDateString('nl-NL', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
        </div>
      )}
      </div>
      <DragOverlay>
        {draggedPost && (
          <div style={{
            padding: '0.25rem 0.5rem',
            background: getPlatformColor(draggedPost.platform),
            color: '#fff',
            borderRadius: '4px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: 0.8
          }}>
            {getPlatformIcon(draggedPost.platform) && (
              <span>{draggedPost.title || draggedPost.platform}</span>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

