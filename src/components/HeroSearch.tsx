import React, { useState } from 'react';
import { Search, Loader2, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
  onExploreDemo?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  isLoading,
  initialQuery = '',
  onExploreDemo,
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-banner p-6 sm:p-10 md:p-14 text-white shadow-2xl">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wider uppercase text-white/95">
          <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
          Independent YouTube Channel Intelligence
        </div>

        {/* Heading & Subtitle as specified in PDF page 38 */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white drop-shadow-sm">
            YouTube Analytics
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto">
            Get detailed insights into any YouTube channel.
          </p>
        </div>

        {/* Central Search Interface */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#0f0f23]/95 p-2 rounded-2xl shadow-2xl border border-white/15 focus-within:border-[#00ffcc] transition-all">
            <div className="flex items-center flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter channel name, URL, @handle or Channel ID"
                disabled={isLoading}
                className="w-full bg-transparent text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none py-2"
                aria-label="Enter channel name, URL, handle or Channel ID"
              />
            </div>

            {/* Green See Analytics Button as specified */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-white font-heading font-bold text-sm tracking-wide rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>See Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Helpful Search Examples */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-white/90">
          <span className="font-semibold text-white/80">Try exploring:</span>
          {[
            { label: '@Veritasium', val: '@veritasium' },
            { label: '@MrBeast', val: '@MrBeast' },
            { label: '@MKBHD', val: '@mkbhd' },
            { label: 'Channel ID (UC...)', val: 'UCX6OQ3DkcsbYNE6H8uQQuVA' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => handleExampleClick(item.val)}
              className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-mono text-xs transition-colors backdrop-blur-sm"
            >
              {item.label}
            </button>
          ))}

          {onExploreDemo && (
            <button
              type="button"
              onClick={onExploreDemo}
              className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-[#00ffcc] font-semibold text-xs transition-colors border border-[#00ffcc]/40"
            >
              Preview Demo Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
