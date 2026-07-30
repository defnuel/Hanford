import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LocationsPage } from './pages/LocationsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { CollaborationsPage } from './pages/CollaborationsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BookNowPage } from './pages/BookNowPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPath]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Extract query parameters if present
  const getQueryParam = (paramName: string) => {
    const urlStr = currentPath.includes('?') ? currentPath : window.location.search;
    const searchPart = urlStr.includes('?') ? urlStr.substring(urlStr.indexOf('?')) : urlStr;
    const params = new URLSearchParams(searchPart);
    return params.get(paramName) || undefined;
  };

  const isAdminRoute = currentPath.toLowerCase().startsWith('/admin');

  // Route matching
  const renderRoute = () => {
    const path = currentPath.toLowerCase();

    if (path.startsWith('/admin')) {
      return <AdminPage onNavigate={navigate} />;
    }

    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (path === '/about' || path === '/about/') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (path === '/ic-guidelines' || path === '/ic-guidelines/') {
      return <GuidelinesPage onNavigate={navigate} defaultTab="ic" />;
    }

    if (path === '/guidelines' || path === '/guidelines/' || path === '/guest-guidelines' || path === '/venue-guidelines') {
      return <GuidelinesPage onNavigate={navigate} defaultTab="guest-venue" />;
    }

    if (path === '/locations' || path === '/locations/') {
      return <LocationsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/locations/')) {
      const slug = path.replace('/locations/', '').replace(/\/$/, '');
      if (slug) {
        return <PropertyDetailPage slug={slug} onNavigate={navigate} />;
      }
      return <LocationsPage onNavigate={navigate} />;
    }

    if (path === '/collaborations' || path === '/collaborations/' || path === '/projects' || path === '/projects/') {
      return <CollaborationsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/collaborations/') || path.startsWith('/projects/')) {
      const slug = path
        .replace('/collaborations/', '')
        .replace('/projects/', '')
        .replace(/\/$/, '');
      if (slug) {
        return <ProjectDetailPage slug={slug} onNavigate={navigate} />;
      }
      return <CollaborationsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/book-now') || path.startsWith('/book')) {
      const propertySlug = getQueryParam('property') || getQueryParam('location');
      return <BookNowPage initialPropertySlug={propertySlug} onNavigate={navigate} />;
    }

    // Default Fallback
    return <HomePage onNavigate={navigate} />;
  };

  if (isAdminRoute) {
    return <AdminPage onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FFFFFF] text-[#2C2C2C] antialiased">
      {/* Primary Brand Navigation */}
      <Header currentPath={currentPath} onNavigate={navigate} />

      {/* Main Page View */}
      <main className="flex-grow">{renderRoute()}</main>

      {/* Brand Editorial Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

