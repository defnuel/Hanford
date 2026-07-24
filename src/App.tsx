import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LocationsPage } from './pages/LocationsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { BookNowPage } from './pages/BookNowPage';

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

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract query parameters if present (e.g., /book-now?property=hanford-sanctuary-kyoto)
  const getQueryParam = (paramName: string) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName) || undefined;
  };

  // Route matching
  const renderRoute = () => {
    const path = currentPath.toLowerCase();

    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (path === '/about' || path === '/about/') {
      return <AboutPage onNavigate={navigate} />;
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

    if (path.startsWith('/book-now') || path.startsWith('/book')) {
      const propertySlug = getQueryParam('property');
      return <BookNowPage initialPropertySlug={propertySlug} onNavigate={navigate} />;
    }

    // Default Fallback
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#E8DAC1] text-[#1A1A1A] antialiased">
      {/* Primary Brand Navigation */}
      <Header currentPath={currentPath} onNavigate={navigate} />

      {/* Main Page View */}
      <main className="flex-grow">{renderRoute()}</main>

      {/* Brand Editorial Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
