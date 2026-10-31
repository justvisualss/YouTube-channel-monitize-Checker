import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, Search, Tag, Sparkles } from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogArticles';
import { formatDate } from '../utils/formatters';

interface BlogIndexPageProps {
  onSelectArticle: (slug: string) => void;
  onNavigateHome: () => void;
}

export const BlogIndexPage: React.FC<BlogIndexPageProps> = ({
  onSelectArticle,
  onNavigateHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(BLOG_ARTICLES.map((a) => a.category)))];

  const filteredArticles = BLOG_ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-in fade-in duration-300">
      {/* Blog Hub Hero */}
      <div className="border-b border-[#282846] pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00ffcc]">
          <BookOpen className="w-4 h-4" />
          ChannelScope Editorial & Research
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-white">
          YouTube Analytics, RPM & Growth Hub
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-3xl leading-relaxed">
          Comprehensive, evidence-based guides on decoding YouTube Data API metrics, calculating accurate RPM revenue scenarios, and tracking creator momentum over time.
        </p>

        {/* Search & Topic Filters */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles by keyword (e.g. RPM, subscribers, shorts)..."
              className="w-full bg-[#101026] border border-[#282846] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffcc]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#00ffcc] text-[#0f0f23] font-bold shadow-md'
                    : 'bg-[#17172f] border border-[#282846] text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.slug}
            onClick={() => onSelectArticle(article.slug)}
            className="group card-surface card-surface-hover rounded-2xl p-6 border border-[#282846] flex flex-col justify-between transition-all cursor-pointer hover:border-[#ff7e5f] relative"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 pb-3 border-b border-[#232342] mb-3">
                <span className="px-2 py-0.5 rounded bg-[#232342] text-[#00ffcc] font-semibold text-[11px]">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {article.readTime}
                </span>
              </div>

              <h2 className="text-lg font-bold font-heading text-white group-hover:text-[#ff7e5f] transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h2>

              <p className="text-xs text-gray-400 mt-2.5 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232342] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              <span className="font-semibold text-[#00ffcc] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick CTA to Calculator */}
      <div className="bg-gradient-to-r from-[#17172f] to-[#1e1e3b] p-8 rounded-3xl border border-[#2d2d55] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold text-[#ff7e5f] tracking-wider">
            Live Tool Access
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
            Put These Formulas to Work
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Test any YouTube channel right now with our public lookup engine and interactive RPM estimator.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0f0f23] rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-lg flex items-center gap-2"
        >
          <span>Open YouTube Analytics Tool</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
