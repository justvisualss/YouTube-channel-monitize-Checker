import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Share2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
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
} from '../types/youtube';
import {
  resolveChannelDirectly,
  getChannelDetailsDirectly,
  getChannelUploadsDirectly,
  getChannelPlaylistsDirectly,
} from '../services/youtubeApi';
import { DEFAULT_MARKET_CODE } from '../config/rpmConfig';

interface HomePageProps {
  onOpenOwnerModal: () => void;
  onOpenApiModal: () => void;
  hasApiKey: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
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
    details?: string;
  } | null>(null);

  // Active channel data state
  const [channel, setChannel] = useState<YouTubeChannelItem | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylistItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Estimator state
  const [selectedMarketCode, setSelectedMarketCode] = useState<string>(DEFAULT_MARKET_CODE);
  const [manualMonthlyViews, setManualMonthlyViews] = useState<number>(250000);

  // Initial load: check query param or load default channel (@veritasium)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam) {
      handleSearch(qParam);
    } else {
      // Default to live channel so users immediately see live dashboard
      handleSearch('@veritasium');
    }
  }, []);

  const handleSearch = async (query: string, bypassCache = false) => {
    setIsSearching(true);
    setErrorInfo(null);
    setMultipleMatches(null);
    setSearchQuery(query);

    try {
      // Direct call to official Google YouTube Data API v3
      const result = await resolveChannelDirectly(query, bypassCache);
      if (result.type === 'multiple') {
        setMultipleMatches(result.matches);
      } else if (result.type === 'single') {
        await loadChannelFullData(result.channel, bypassCache);
      }
    } catch (err: any) {
      setErrorInfo({
        message: err.message || 'Failed to resolve YouTube channel',
        details: err.details?.message || 'Please check the channel identifier or try again.',
      });
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

    try {
      const [uploadsResult, playlistsResult] = await Promise.allSettled([
        uploadsPlaylistId ? getChannelUploadsDirectly(uploadsPlaylistId, 25) : Promise.resolve({ videos: [] }),
        getChannelPlaylistsDirectly(channelId),
      ]);

      if (uploadsResult.status === 'fulfilled') {
        setVideos(uploadsResult.value.videos || []);
      }
      if (playlistsResult.status === 'fulfilled') {
        setPlaylists(playlistsResult.value || []);
      }
    } catch {
      // ignore partial video failure
    }
  };

  const handleSelectMatchedChannel = async (channelId: string) => {
    setIsSearching(true);
    setMultipleMatches(null);
    try {
      const channelData = await getChannelDetailsDirectly(channelId);
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 w-full min-w-0 overflow-hidden">
      {/* Hero Search Section */}
      <HeroSearch
        onSearch={(q) => handleSearch(q)}
        isLoading={isSearching}
        initialQuery={searchQuery}
      />

      {/* Multiple Matches Disambiguation Selector */}
      {multipleMatches && (
        <ChannelSelector
          query={searchQuery}
          matches={multipleMatches}
          onSelectChannel={handleSelectMatchedChannel}
          onCancel={() => setMultipleMatches(null)}
        />
      )}

      {/* Error and Failure Alert */}
      {errorInfo && !multipleMatches && (
        <div className="card-surface rounded-2xl p-4 sm:p-6 border border-rose-500/40 bg-rose-950/20 text-xs text-rose-200 space-y-3 w-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm font-heading">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="break-words">Search Notice: {errorInfo.message}</span>
          </div>
          {errorInfo.details && (
            <p className="text-rose-300/90 leading-relaxed pl-6 sm:pl-7 break-words">
              {errorInfo.details}
            </p>
          )}

          <div className="pl-6 sm:pl-7 pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-3.5 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg text-rose-200 font-semibold transition-colors text-xs"
            >
              Retry Search
            </button>
            <button
              onClick={onOpenApiModal}
              className="px-3.5 py-1.5 bg-[#232342] hover:bg-[#2d2d55] text-white rounded-lg font-medium transition-colors text-xs"
            >
              API Key Status
            </button>
          </div>
        </div>
      )}

      {/* Channel Analytics Dashboard */}
      {channel && (
        <div id="analytics" className="space-y-6 sm:space-y-8 w-full min-w-0 overflow-hidden animate-in fade-in duration-300">
          {/* Dashboard Header Bar */}
          <div className="card-surface rounded-2xl p-4 sm:p-6 border border-[#282846] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 w-full min-w-0 overflow-hidden">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0 flex-1">
              <img
                src={
                  channel.snippet?.thumbnails?.medium?.url ||
                  channel.snippet?.thumbnails?.default?.url ||
                  'https://via.placeholder.com/96'
                }
                alt={channel.snippet?.title}
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#00ffcc]/40 shadow-xl flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-2xl font-bold font-heading text-white truncate max-w-full">
                    {channel.snippet?.title}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-mono text-[#00ffcc] bg-[#00ffcc]/10 px-2 py-0.5 rounded-full border border-[#00ffcc]/30 truncate max-w-full">
                    {channel.snippet?.customUrl || `@${channel.id.slice(0, 10)}`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xl">
                  {channel.snippet?.description || 'Public YouTube Channel Profile'}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-[11px] text-gray-400">
                  <span>Data Source: <strong className="text-emerald-400">YouTube Data API v3 (Live)</strong></span>
                  <span>•</span>
                  <span>Updated: {lastUpdated || 'Just now'}</span>
                </div>
              </div>
            </div>

            {/* Controls: Refresh, Share, External Channel Link */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#282846]">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#232342] hover:bg-[#2d2d55] text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Trigger fresh server-side API request"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00ffcc]' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={handleShareUrl}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#232342] hover:bg-[#2d2d55] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
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
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#ff4d4d] hover:bg-[#e04343] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>YouTube</span>
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
            channel={channel}
            videos={videos}
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
    </div>
  );
};
