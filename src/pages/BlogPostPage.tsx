import React, { useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { BlogArticle, BLOG_ARTICLES } from '../data/blogArticles';
import { formatDate } from '../utils/formatters';

interface BlogPostPageProps {
  article: BlogArticle;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
  onNavigateHome: () => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  article,
  onBack,
  onSelectArticle,
  onNavigateHome,
}) => {
  // Update document title, canonical, and inject structured data
  useEffect(() => {
    document.title = article.metaTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', article.metaDescription);
    }

    // Update canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', article.canonicalUrl);
    }

    // Article Structured Data
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Organization',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'ChannelScope Analytics',
        url: 'https://youtube-monetization-checker-free.vercel.app',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.canonicalUrl,
      },
    };

    const faqSchema =
      article.faqs && article.faqs.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          }
        : null;

    const scriptId = 'blog-article-ldjson';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(faqSchema ? [articleSchema, faqSchema] : articleSchema);

    window.scrollTo(0, 0);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [article]);

  const relatedArticles = BLOG_ARTICLES.filter(
    (a) => article.relatedSlugs?.includes(a.slug) || (a.category === article.category && a.slug !== article.slug)
  ).slice(0, 3);

  // Render markdown-like sections cleanly
  const renderFormattedContent = (raw: string) => {
    const lines = raw.trim().split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-bold font-heading text-white mt-8 mb-3">
            {trimmed.replace('### ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold font-heading text-[#00ffcc] mt-5 mb-2">
            {trimmed.replace('#### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-gray-300 my-1 text-sm leading-relaxed">
            {trimmed.replace('* ', '')}
          </li>
        );
      }
      if (trimmed.startsWith('---')) {
        return <hr key={idx} className="border-[#282846] my-6" />;
      }
      if (trimmed === '') {
        return null;
      }
      return (
        <p key={idx} className="text-gray-300 text-sm sm:text-base leading-relaxed my-3">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
        <button onClick={onNavigateHome} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <button onClick={onBack} className="hover:text-white transition-colors">
          Blog
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-[#00ffcc] truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="border-b border-[#282846] pb-8 space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-[#ff7e5f]/15 text-[#ff7e5f] font-semibold border border-[#ff7e5f]/30">
            {article.category}
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>

        {/* The Mandatory Single Clear H1 */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-light">
          {article.excerpt}
        </p>

        {/* Editorial Byline & Dates */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400 border-t border-[#20203d]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff4d4d] to-[#ff7e5f] flex items-center justify-center text-white text-[11px] font-bold">
                CS
              </div>
              <div>
                <span className="text-white font-medium block">{article.author}</span>
                <span className="text-[10px] text-gray-500">Research & Verification</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400 border-l border-[#282846] pl-4">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Published: {formatDate(article.publishedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }
              }}
              className="p-2 rounded-lg bg-[#17172f] hover:bg-[#232342] border border-[#282846] text-gray-300 hover:text-white transition-colors"
              title="Share article"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Body */}
      <div className="prose prose-invert max-w-none text-gray-200">
        {renderFormattedContent(article.content)}
      </div>

      {/* FAQs Section */}
      {article.faqs && article.faqs.length > 0 && (
        <section className="card-surface rounded-2xl p-6 sm:p-8 border border-[#282846] mt-10 space-y-4">
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#00ffcc]" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-[#232342] space-y-4 pt-2">
            {article.faqs.map((faq, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internal Tool Link CTA Banner */}
      <div className="bg-gradient-to-r from-[#ff4d4d]/15 to-[#ff7e5f]/15 p-6 rounded-2xl border border-[#ff4d4d]/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold font-heading text-white">
            Analyze Any YouTube Channel Instantly
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Apply these insights to live data using ChannelScope’s free search and RPM estimator.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0f0f23] rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap shadow-md"
        >
          Open Analytics Tool
        </button>
      </div>

      {/* Related Articles Grid */}
      {relatedArticles.length > 0 && (
        <div className="pt-10 border-t border-[#282846] space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">
            Related Analytics Articles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.slug}
                onClick={() => onSelectArticle(rel.slug)}
                className="card-surface card-surface-hover rounded-xl p-4 border border-[#282846] cursor-pointer hover:border-[#00ffcc] transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-[#00ffcc] font-semibold">{rel.category}</span>
                  <h4 className="font-bold text-xs text-white mt-1 line-clamp-2">{rel.title}</h4>
                </div>
                <span className="text-[11px] text-gray-400 mt-3 flex items-center gap-1 font-medium">
                  Read Guide <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back to Blog Button */}
      <div className="pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17172f] hover:bg-[#232342] text-xs font-semibold text-gray-300 hover:text-white border border-[#282846] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Articles</span>
        </button>
      </div>
    </article>
  );
};
