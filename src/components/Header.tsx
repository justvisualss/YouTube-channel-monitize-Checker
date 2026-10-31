import React, { useState } from 'react';
import {
  BarChart2,
  Menu,
  X,
  Youtube,
  Key,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isDemoMode: boolean;
  onToggleDemo: () => void;
  onOpenOwnerModal: () => void;
  onOpenApiModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  isDemoMode,
  onToggleDemo,
  onOpenOwnerModal,
  onOpenApiModal,
  hasApiKey,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f23]/90 backdrop-blur-md border-b border-[#282846]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Logo & Small Product Descriptor */}
        <div
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4d4d] to-[#ff7e5f] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-lg text-white tracking-wider">
                CHANNELSCOPE
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              YouTube Channel Analytics & Revenue Estimator
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePage === link.id
                  ? 'text-[#00ffcc] bg-[#00ffcc]/10 font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-[#1a1a36]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemo}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isDemoMode
                ? 'bg-[#ff4d4d] border-[#ff4d4d] text-white font-bold shadow-lg'
                : 'bg-[#17172f] border-[#282846] text-gray-300 hover:text-white hover:border-gray-500'
            }`}
            title="Toggle between live search and 6-chart demo mode"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'Demo Active' : 'Demo Mode'}</span>
          </button>

          {/* Connect YouTube Owner Analytics */}
          <button
            onClick={onOpenOwnerModal}
            className="px-3 py-1.5 rounded-xl bg-[#232342] hover:bg-[#2d2d55] border border-[#2d2d55] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
            title="Connect your channel via OAuth for private analytics"
          >
            <Youtube className="w-3.5 h-3.5 text-[#ff4d4d]" />
            <span>Connect YouTube</span>
          </button>

          {/* API Key Status / Setup Help */}
          <button
            onClick={onOpenApiModal}
            className={`p-2 rounded-xl border transition-colors ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
            title={hasApiKey ? 'YouTube Data API v3 Connected' : 'YouTube Data API v3 Setup Guide'}
          >
            <Key className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#17172f] text-gray-300 hover:text-white border border-[#282846]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121229] border-b border-[#282846] px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-2 rounded-lg text-left text-xs font-medium ${
                  activePage === link.id
                    ? 'text-[#00ffcc] bg-[#00ffcc]/10 font-bold'
                    : 'text-gray-300 hover:bg-[#1f1f3a]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#232342] flex flex-col gap-2">
            <button
              onClick={() => {
                onToggleDemo();
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                isDemoMode ? 'bg-[#ff4d4d] text-white' : 'bg-[#232342] text-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDemoMode ? 'Exit Demo Mode' : 'Explore Demo Mode'}</span>
            </button>

            <button
              onClick={() => {
                onOpenOwnerModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#232342] text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            >
              <Youtube className="w-4 h-4 text-[#ff4d4d]" />
              <span>Connect YouTube (Owner)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
