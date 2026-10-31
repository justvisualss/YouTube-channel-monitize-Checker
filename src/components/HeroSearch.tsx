import React, { useState } from 'react';
import { Search, Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  isLoading,
  initialQuery = '',
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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl gradient-banner p-4 sm:p-8 md:p-12 text-white shadow-2xl w-full max-w-full">
      {/* Decorative ambient elements - constrained within bounds */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-white/95 max-w-full">
          <Sparkles className="w-3 h-3 text-[#00ffcc] flex-shrink-0" />
          <span className="truncate">Independent YouTube Intelligence</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading tracking-normal text-white drop-shadow-sm leading-tight break-words">
            YouTube Analytics
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-white/90 font-medium max-w-xl mx-auto leading-relaxed">
            Get detailed insights into any YouTube channel.
          </p>
        </div>

        {/* Central Search Interface */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#0f0f23]/95 p-1.5 sm:p-2 rounded-2xl shadow-2xl border border-white/15 focus-within:border-[#00ffcc] transition-all w-full min-w-0">
            <div className="flex items-center flex-1 px-2.5 min-w-0">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter channel name, URL, @handle or ID"
                disabled={isLoading}
                className="w-full min-w-0 bg-transparent text-white text-xs sm:text-base placeholder-gray-400 focus:outline-none py-2"
                aria-label="Enter channel name, URL, handle or Channel ID"
              />
            </div>

            {/* Green See Analytics Button */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-3 sm:py-3.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-white font-heading font-bold text-xs sm:text-sm tracking-wide rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>See Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Helpful Search Examples */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] sm:text-xs text-white/90 max-w-full">
          <span className="font-semibold text-white/80">Try exploring:</span>
          {[
            { label: '@Veritasium', val: '@veritasium' },
            { label: '@MrBeast', val: '@MrBeast' },
            { label: '@MKBHD', val: '@mkbhd' },
            { label: 'Channel ID', val: 'UCHnyfMqiRRG1u-2MsSQLbXA' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => handleExampleClick(item.val)}
              className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-mono text-[11px] transition-colors backdrop-blur-sm"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
