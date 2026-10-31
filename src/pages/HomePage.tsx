import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Share2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { HeroSearch } from '../components/HeroSearch';
import { ChannelSelector } from '../components/ChannelSelector';
import { StatCards } from '../components/StatCards';
import { RevenueCalculator } from '../components/RevenueCalculator';
import { ChartsSection } from '../components/ChartsSection';
import { UploadsSection } from '../components/UploadsSection';
import { PlaylistsSection } from '../components/PlaylistsSection';
import {
  YouTubeChannelItem,
  ChannelSearchResult,
  YouTubeVideoItem,
  YouTubePlaylistItem,
  ActivityStatus,
  OwnerAnalyticsSummary,
} from '../types/youtube';
import {
  DEMO_CHANNEL,
  DEMO_VIDEOS,
  DEMO_PLAYLISTS,
  DEMO_OWNER_ANALYTICS,
} from '../data/demoChannel';
import { DEFAULT_MARKET_CODE } from '../config/rpmConfig';

interface HomePageProps {
  isDemoMode: boolean;
  onToggleDemo: () => void;
  onOpenOwnerModal: () => void;
  onOpenApiModal: () => void;
  hasApiKey: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  isDemoMode,
  onToggleDemo,
  onOpenOwnerModal,
  onOpenApiModal,
  hasApiKey,
}) => {
  // Search and selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [multipleMatches, setMultipleMatches] = useState<
    (ChannelSearchResult & { subscriberCount?: string; videoCount?: string })[] | null
  >(null);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    code?: string;
    details?: string;
  } | null>(null);

  // Active channel data state
  const [channel, setChannel] = useState<YouTubeChannelItem | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylistItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Estimator & Owner state
  const [selectedMarketCode, setSelectedMarketCode] = useState<string>(DEFAULT_MARKET_CODE);
  const [manualMonthlyViews, setManualMonthlyViews] = useState<number>(250000);
  const [ownerAnalytics, setOwnerAnalytics] = useState<OwnerAnalyticsSummary | null>(null);
  const [isOwnerAuthorized, setIsOwnerAuthorized] = useState(false);

  // When demo mode changes, switch channel data accordingly
  useEffect(() => {
    if (isDemoMode) {
      setChannel(DEMO_CHANNEL);
      setVideos(DEMO_VIDEOS);
      setPlaylists(DEMO_PLAYLISTS);
      setOwnerAnalytics(DEMO_OWNER_ANALYTICS);
      setIsOwnerAuthorized(true);
      setLastUpdated(new Date().toLocaleTimeString());
      setErrorInfo(null);
      setMultipleMatches(null);
    } else {
      // If exiting demo mode and no search performed, reset or keep empty
      if (channel?.id === DEMO_CHANNEL.id) {
        setChannel(null);
        setVideos([]);
        setPlaylists([]);
        setOwnerAnalytics(null);
        setIsOwnerAuthorized(false);
      }
    }
  }, [isDemoMode]);

  // Check URL params for channel query on mount or OAuth return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam && !channel) {
      handleSearch(qParam);
    }

    const oauthSuccess = params.get('oauth_success');
    if (oauthSuccess === 'true') {
      fetchOwnerAnalytics();
    }
  }, []);

  const fetchOwnerAnalytics = async () => {
    try {
      const res = await fetch('/api/oauth/analytics');
      if (res.ok) {
        const data = await res.json();
        setOwnerAnalytics(data);
        setIsOwnerAuthorized(true);
      }
    } catch {
      // Owner analytics optional
    }
  };

  const handleSearch = async (query: string, bypassCache = false) => {
    setIsSearching(true);
    setErrorInfo(null);
    setMultipleMatches(null);
    setSearchQuery(query);

    try {
      const res = await fetch(
        `/api/channel/resolve?q=${encodeURIComponent(query)}${bypassCache ? '&fresh=true' : ''}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw {
          status: res.status,
          message: data.error || 'Channel lookup failed',
          code: data.code,
          details: data.details,
        };
      }

      if (data.type === 'multiple') {
        setMultipleMatches(data.matches);
        setIsSearching(false);
        return;
      }

      if (data.type === 'single' && data.channel) {
        await loadChannelFullData(data.channel, bypassCache);
      }
    } catch (err: any) {
      setErrorInfo({
        message: err.message || 'Failed to resolve YouTube channel',
        code: err.code,
        details: err.details,
      });
      // Do not clear channel if refreshing failed
      if (!channel) {
        setChannel(null);
      }
    } finally {
      setIsSearching(false);
      setIsRefreshing(false);
    }
  };

  const loadChannelFullData = async (channelData: YouTubeChannelItem, fresh = false) => {
    setChannel(channelData);
    setMultipleMatches(null);
    setLastUpdated(new Date().toLocaleTimeString());

    const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
    const channelId = channelData.id;

    // Concurrently fetch uploads and playlists
    try {
      const [uploadsRes, playlistsRes] = await Promise.all([
        uploadsPlaylistId
          ? fetch(
              `/api/channel/uploads?uploadsPlaylistId=${encodeURIComponent(uploadsPlaylistId)}&channelId=${encodeURIComponent(
                channelId
              )}${fresh ? '&fresh=true' : ''}`
            )
          : null,
        fetch(`/api/channel/playlists?channelId=${encodeURIComponent(channelId)}${fresh ? '&fresh=true' : ''}`),
      ]);

      if (uploadsRes && uploadsRes.ok) {
        const uData = await uploadsRes.json();
        setVideos(uData.videos || []);
      } else {
        setVideos([]);
      }

      if (playlistsRes && playlistsRes.ok) {
        const pData = await playlistsRes.json();
        setPlaylists(pData.playlists || []);
      } else {
        setPlaylists([]);
      }
    } catch {
      // Partial video fetch failure handled gracefully
    }
  };

  const handleSelectMatchedChannel = async (channelId: string) => {
    setIsSearching(true);
    setMultipleMatches(null);
    try {
      const res = await fetch(`/api/channel/details?id=${encodeURIComponent(channelId)}`);
      const channelData = await res.json();
      if (!res.ok) throw new Error(channelData.error || 'Failed to fetch selected channel');
      await loadChannelFullData(channelData);
    } catch (err: any) {
      setErrorInfo({ message: err.message });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = () => {
    if (!channel || isRefreshing) return;
    setIsRefreshing(true);
    handleSearch(channel.id, true);
  };

  const handleShareUrl = () => {
    if (!channel) return;
    const shareUrl = `${window.location.origin}/?q=${encodeURIComponent(channel.id)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 2500);
  };

  // Determine evidence-based activity status label (PDF page 15)
  const computeActivityStatus = (): ActivityStatus => {
    if (!channel) return 'Activity information unavailable';
    if (videos.length > 0) {
      const now = Date.now();
      const mostRecent = new Date(videos[0].publishedAt).getTime();
      const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
      if (now - mostRecent <= sixtyDaysMs) {
        return 'Recent uploads detected';
      }
      return 'No recent uploads in retrieved sample';
    }
    return 'Public channel found';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      {/* Hero Search Section */}
      <HeroSearch
        onSearch={(q) => handleSearch(q)}
        isLoading={isSearching}
        initialQuery={searchQuery}
        onExploreDemo={!isDemoMode ? onToggleDemo : undefined}
      />

      {/* Demo Mode Notification Banner */}
      {isDemoMode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ff4d4d]/20 to-[#ff7e5f]/20 border border-[#ff4d4d]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d4d] animate-ping flex-shrink-0" />
            <p className="font-semibold text-white">
              DEMO DATA — NOT REAL CHANNEL ANALYTICS (Previewing All 6 Chart Visualizations)
            </p>
          </div>
          <button
            onClick={onToggleDemo}
            className="px-3 py-1.5 rounded-lg bg-[#ff4d4d] hover:bg-[#e04343] text-white font-bold transition-colors self-end sm:self-auto"
          >
            Exit Demo Mode
          </button>
        </div>
      )}

      {/* Multiple Matches Disambiguation Selector */}
      {multipleMatches && (
        <ChannelSelector
          query={searchQuery}
          matches={multipleMatches}
          onSelectChannel={handleSelectMatchedChannel}
          onCancel={() => setMultipleMatches(null)}
        />
      )}

      {/* Error and Recoverable Failure Alert */}
      {errorInfo && !multipleMatches && (
        <div className="card-surface rounded-2xl p-6 border border-rose-500/40 bg-rose-950/20 text-xs text-rose-200 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm font-heading">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Search Notice: {errorInfo.message}</span>
          </div>
          {errorInfo.details && (
            <p className="text-rose-300/90 leading-relaxed pl-7">
              {errorInfo.details}
            </p>
          )}

          <div className="pl-7 pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-3.5 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg text-rose-200 font-medium transition-colors"
            >
              Retry Search
            </button>
            {!hasApiKey && (
              <button
                onClick={onOpenApiModal}
                className="px-3.5 py-1.5 bg-[#232342] hover:bg-[#2d2d55] text-white rounded-lg font-medium transition-colors"
              >
                Configure Server API Key
              </button>
            )}
            <button
              onClick={onToggleDemo}
              className="px-3.5 py-1.5 bg-[#00ffcc] text-[#0f0f23] rounded-lg font-bold font-heading uppercase transition-colors"
            >
              Explore With Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Channel Analytics Dashboard */}
      {channel && (
        <div id="analytics" className="space-y-8 animate-in fade-in duration-300">
          {/* Dashboard Header Bar */}
          <div className="card-surface rounded-2xl p-6 border border-[#282846] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={
                  channel.snippet?.thumbnails?.medium?.url ||
                  channel.snippet?.thumbnails?.default?.url ||
                  'https://via.placeholder.com/96'
                }
                alt={channel.snippet?.title}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#00ffcc]/40 shadow-xl flex-shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                    {channel.snippet?.title}
                  </h2>
                  <span className="text-xs font-mono text-[#00ffcc] bg-[#00ffcc]/10 px-2.5 py-0.5 rounded-full border border-[#00ffcc]/30">
                    {channel.snippet?.customUrl || `@${channel.id.slice(0, 10)}`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xl">
                  {channel.snippet?.description || 'Public YouTube Channel Profile'}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                  <span>Data Source: <strong>YouTube Data API v3 (Public)</strong></span>
                  <span>•</span>
                  <span>Updated: {lastUpdated || 'Just now'}</span>
                  {isDemoMode && (
                    <span className="text-[#ff4d4d] font-bold">• Demo Snapshot</span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls: Refresh, Share, External Channel Link */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-xl bg-[#232342] hover:bg-[#2d2d55] text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Trigger fresh server-side API request"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00ffcc]' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={handleShareUrl}
                className="px-3.5 py-2 rounded-xl bg-[#232342] hover:bg-[#2d2d55] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                title="Copy shareable channel URL"
              >
                {copyLinkSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <a
                href={`https://www.youtube.com/channel/${channel.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#ff4d4d] hover:bg-[#e04343] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>YouTube Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 12 Required Statistic Cards */}
          <StatCards
            channel={channel}
            activityStatus={computeActivityStatus()}
            selectedMarketCode={selectedMarketCode}
            manualMonthlyViews={manualMonthlyViews}
            isOwnerAuthorized={isOwnerAuthorized}
            authorizedMonthlyViews={ownerAnalytics?.totalViews}
            isDemoMode={isDemoMode}
          />

          {/* Country-Based RPM & Revenue Estimator */}
          <RevenueCalculator
            lifetimeViews={parseInt(channel.statistics?.viewCount || '0', 10)}
            selectedMarketCode={selectedMarketCode}
            onMarketChange={(code) => setSelectedMarketCode(code)}
            monthlyViews={manualMonthlyViews}
            onMonthlyViewsChange={(views) => setManualMonthlyViews(views)}
            channelTitle={channel.snippet?.title}
          />

          {/* Exactly Six Interactive Chart.js Visualizations */}
          <ChartsSection
            videos={videos}
            ownerAnalytics={ownerAnalytics}
            isOwnerAuthorized={isOwnerAuthorized}
            isDemoMode={isDemoMode}
            manualMonthlyViews={manualMonthlyViews}
            selectedMarketCode={selectedMarketCode}
          />

          {/* Recent Uploads Section with Date Filters */}
          <UploadsSection
            videos={videos}
            uploadsPlaylistId={channel.contentDetails?.relatedPlaylists?.uploads}
            totalExamined={videos.length}
            sampleCoverageLabel={`Sampled ${videos.length} most recent uploads from channel uploads playlist`}
          />

          {/* Public Playlists Section */}
          <PlaylistsSection
            playlists={playlists}
            uploadsPlaylistId={channel.contentDetails?.relatedPlaylists?.uploads}
            channelTitle={channel.snippet?.title}
          />
        </div>
      )}

      {/* Empty State when no channel selected yet */}
      {!channel && !multipleMatches && !errorInfo && !isSearching && (
        <div className="card-surface rounded-3xl p-10 sm:p-14 border border-[#282846] text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff4d4d] to-[#ff7e5f] flex items-center justify-center text-white mx-auto shadow-xl">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-heading text-white">
              Ready to Analyze Any Channel
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Enter any YouTube channel name, @handle, URL, or Channel ID above to explore 12 public metric cards, 6 interactive charts, recent uploads, and transparent RPM revenue estimates.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onToggleDemo}
              className="px-5 py-2.5 rounded-xl bg-[#00ffcc] text-[#0f0f23] font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Demo Mode (All 6 Charts)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
