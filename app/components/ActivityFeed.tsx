'use client';

import { useState, useEffect } from 'react';
import { FileText, Folder, Package, PenTool, Share2, Clock } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}

export default function ActivityFeed({ limit = 5 }: { limit?: number }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/library');
      const data = await response.json();
      // Sorteer op datum (nieuwste eerst) en neem eerste N items
      const sorted = data
        .sort((a: ActivityItem, b: ActivityItem) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit)
        .map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          createdAt: item.createdAt,
        }));
      setActivities(sorted);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Zojuist';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min geleden`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} uur geleden`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dagen geleden`;
    return date.toLocaleDateString('nl-NL');
  };

  if (isLoading) {
    return (
      <div className="activity-feed">
        <h3>Recente Activiteit</h3>
        <div className="activity-loading">
          <p>Laden...</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <h3>Recente Activiteit</h3>
        <div className="activity-empty">
          <p>Nog geen activiteit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <h3>Recente Activiteit</h3>
        <Link href="/library" className="activity-feed-link">
          Alles bekijken →
        </Link>
      </div>
      <div className="activity-list">
        {activities.map((activity) => {
          const Icon = getTypeIcon(activity.type);
          return (
            <Link
              key={activity.id}
              href={`/library?preview=${activity.id}`}
              className="activity-item"
            >
              <div className="activity-icon">
                <Icon size={18} />
              </div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-meta">
                  <span className="activity-type">{getTypeLabel(activity.type)}</span>
                  <span className="activity-time">
                    <Clock size={12} />
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

