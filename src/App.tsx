import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { BlogIndexPage } from './pages/BlogIndexPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { OwnerOAuthModal } from './components/OwnerOAuthModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { getArticleBySlug } from './data/blogArticles';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [isOwnerAuthorized, setIsOwnerAuthorized] = useState(false);
  const [authorizedChannelTitle, setAuthorizedChannelTitle] = useState<string | undefined>(undefined);

  // Parse path on initial load & popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;

      if (pathname.startsWith('/blog/')) {
        const slug = pathname.replace('/blog/', '').replace(/\/$/, '');
        if (slug) {
          setActivePage('blog-post');
          setActiveBlogSlug(slug);
          return;
        }
      }

      if (pathname === '/blog') {
        setActivePage('blog');
        setActiveBlogSlug(null);
        return;
      }
      if (pathname === '/about') {
        setActivePage('about');
        return;
      }
      if (pathname === '/contact') {
        setActivePage('contact');
        return;
      }
      if (pathname === '/privacy') {
        setActivePage('privacy');
        return;
      }
      if (pathname === '/terms') {
        setActivePage('terms');
        return;
      }
      if (pathname === '/disclaimer') {
        setActivePage('disclaimer');
        return;
      }

      setActivePage('home');
      setActiveBlogSlug(null);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (page: string, slug?: string) => {
    let targetPath = '/';
    if (page === 'blog') targetPath = '/blog';
    else if (page === 'blog-post' && slug) targetPath = `/blog/${slug}`;
    else if (page === 'about') targetPath = '/about';
    else if (page === 'contact') targetPath = '/contact';
    else if (page === 'privacy') targetPath = '/privacy';
    else if (page === 'terms') targetPath = '/terms';
    else if (page === 'disclaimer') targetPath = '/disclaimer';
    else if (page === 'analytics') targetPath = '/#analytics';

    window.history.pushState({}, '', targetPath);
    setActivePage(page);
    setActiveBlogSlug(slug || null);
    window.scrollTo(0, 0);
  };

  const handleSelectArticle = (slug: string) => {
    navigateTo('blog-post', slug);
  };

  const handleDisconnectOwner = async () => {
    try {
      await fetch('/api/oauth/disconnect', { method: 'POST' });
      setIsOwnerAuthorized(false);
      setAuthorizedChannelTitle(undefined);
    } catch {
      // ignore
    }
  };

  const currentArticle = activeBlogSlug ? getArticleBySlug(activeBlogSlug) : null;

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col font-sans selection:bg-[#ff4d4d]/30 selection:text-[#00ffcc] overflow-x-hidden w-full max-w-[100vw]">
      {/* Navigation Header */}
      <Header
        activePage={activePage === 'blog-post' ? 'blog' : activePage}
        onNavigate={(p) => navigateTo(p)}
        onOpenOwnerModal={() => setIsOwnerModalOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activePage === 'home' || activePage === 'analytics' ? (
          <HomePage
            onOpenOwnerModal={() => setIsOwnerModalOpen(true)}
            onOpenApiModal={() => setIsApiModalOpen(true)}
            hasApiKey={hasApiKey}
          />
        ) : activePage === 'about' ? (
          <AboutPage onNavigate={(p) => navigateTo(p)} />
        ) : activePage === 'contact' ? (
          <ContactPage />
        ) : activePage === 'privacy' ? (
          <PrivacyPage />
        ) : activePage === 'terms' ? (
          <TermsPage />
        ) : activePage === 'disclaimer' ? (
          <DisclaimerPage />
        ) : activePage === 'blog' ? (
          <BlogIndexPage
            onSelectArticle={handleSelectArticle}
            onNavigateHome={() => navigateTo('home')}
          />
        ) : activePage === 'blog-post' && currentArticle ? (
          <BlogPostPage
            article={currentArticle}
            onBack={() => navigateTo('blog')}
            onSelectArticle={handleSelectArticle}
            onNavigateHome={() => navigateTo('home')}
          />
        ) : (
          <HomePage
            onOpenOwnerModal={() => setIsOwnerModalOpen(true)}
            onOpenApiModal={() => setIsApiModalOpen(true)}
            hasApiKey={hasApiKey}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(p) => navigateTo(p)} />

      {/* Owner OAuth Modal */}
      <OwnerOAuthModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        isOwnerAuthorized={isOwnerAuthorized}
        authorizedChannelTitle={authorizedChannelTitle}
        onDisconnect={handleDisconnectOwner}
      />

      {/* API Key Guide Modal */}
      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        hasApiKey={hasApiKey}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
