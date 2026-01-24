'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const contentTypeLabels: Record<string, string> = {
  landing: 'Landingspagina',
  categorie: 'Categoriepagina',
  product: 'Productpagina',
  blog: 'Blog',
  social: 'Social Media',
};

const pageLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/library': 'Content Library',
  '/planner': 'Social Planner',
  '/templates': 'Templates',
  '/analytics': 'Analytics',
  '/settings': 'Instellingen',
  '/profile': 'Profiel',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  const crumbs: Array<{ label: string; href: string | null }> = [];

  // Always start with Home
  crumbs.push({ label: 'Home', href: '/' });

  // Add current page or content type
  if (pathname === '/') {
    if (type && contentTypeLabels[type]) {
      crumbs.push({ label: contentTypeLabels[type], href: null });
    } else {
      // Dashboard - no additional crumb needed
      return null;
    }
  } else {
    // Other pages
    const pageLabel = pageLabels[pathname];
    if (pageLabel) {
      crumbs.push({ label: pageLabel, href: null });
    }
  }

  if (crumbs.length <= 1) {
    return null; // Don't show breadcrumbs if only Home
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {crumbs.map((crumb, index) => (
          <li key={index} className="breadcrumbs-item">
            {index === 0 ? (
              <Link href={crumb.href || '#'} className="breadcrumbs-link">
                <Home size={14} />
                <span>{crumb.label}</span>
              </Link>
            ) : index === crumbs.length - 1 ? (
              <span className="breadcrumbs-current">{crumb.label}</span>
            ) : (
              <Link href={crumb.href || '#'} className="breadcrumbs-link">
                {crumb.label}
              </Link>
            )}
            {index < crumbs.length - 1 && (
              <ChevronRight size={14} className="breadcrumbs-separator" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

