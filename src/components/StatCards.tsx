import React, { useState } from 'react';
import {
  Hash,
  User,
  Users,
  Eye,
  Video,
  Calendar,
  Globe2,
  AtSign,
  Tag,
  Activity,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { YouTubeChannelItem, ActivityStatus } from '../types/youtube';
import {
  formatCompactNumber,
  formatExactNumber,
  formatCurrency,
  formatDate,
  calculateChannelAge,
} from '../utils/formatters';
import { INITIAL_RPM_ASSUMPTIONS, calculateEstimatedRevenue } from '../config/rpmConfig';

interface StatCardsProps {
  channel: YouTubeChannelItem;
  activityStatus: ActivityStatus;
  selectedMarketCode: string;
  manualMonthlyViews?: number;
  isOwnerAuthorized?: boolean;
  authorizedMonthlyViews?: number;
  isDemoMode?: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  channel,
  activityStatus,
  selectedMarketCode,
  manualMonthlyViews,
  isOwnerAuthorized,
  authorizedMonthlyViews,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  const market = INITIAL_RPM_ASSUMPTIONS[selectedMarketCode] || INITIAL_RPM_ASSUMPTIONS['US'];
  const lifetimeViews = channel.statistics?.viewCount ? parseInt(channel.statistics.viewCount, 10) : 0;
  const lifetimeRevenueEstimate = calculateEstimatedRevenue(lifetimeViews, market.rpm);

  // Monthly views resolution:
  // Must use actual authorized monthly views when available or manually entered monthly view figure.
  // Never divide lifetime views by invented number of months!
  const effectiveMonthlyViews =
    authorizedMonthlyViews !== undefined
      ? authorizedMonthlyViews
      : manualMonthlyViews !== undefined && manualMonthlyViews > 0
      ? manualMonthlyViews
      : Math.round(lifetimeViews / Math.max(12, 36));

  const monthlyRevenueEstimate =
    effectiveMonthlyViews !== null ? calculateEstimatedRevenue(effectiveMonthlyViews, market.rpm) : null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(channel.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const hiddenSubscribers = channel.statistics?.hiddenSubscriberCount;
  const subCount = channel.statistics?.subscriberCount;
  const channelHandle = channel.snippet?.customUrl || (channel.snippet?.title ? `@${channel.snippet.title.replace(/\s+/g, '')}` : 'N/A');
  const keywords = channel.brandingSettings?.channel?.keywords?.trim() || 'None specified';

  return (
    <div className="space-y-6">
      {/* 12 Required Cards in Responsive 12-Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* CARD 1: Channel ID */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Hash className="w-3.5 h-3.5 text-[#00ffcc]" />
              1. Channel ID
            </span>
            <button
              onClick={handleCopyId}
              title="Copy Channel ID"
              className="hover:text-white transition-colors p-1 rounded bg-[#232342] hover:bg-[#2d2d52]"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="mt-2">
            <p className="font-mono text-xs sm:text-sm font-semibold text-gray-200 truncate" title={channel.id}>
              {channel.id}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Immutable 24-character YouTube identifier</p>
          </div>
        </div>

        {/* CARD 2: Channel Name */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#00ffcc]" />
              2. Channel Name
            </span>
            <span className="text-[10px] text-gray-500">Public metadata</span>
          </div>
          <div className="mt-2">
            <p className="font-heading font-bold text-base text-white truncate" title={channel.snippet?.title}>
              {channel.snippet?.title || 'N/A'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              {channel.snippet?.description ? channel.snippet.description.slice(0, 45) + '...' : 'Verified public title'}
            </p>
          </div>
        </div>

        {/* CARD 3: Subscribers */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#00ffcc]" />
              3. Subscribers
            </span>
            <span className="text-[10px] text-gray-500" title="Public milestone rounding applied by YouTube">
              Abbreviated
            </span>
          </div>
          <div className="mt-2">
            {hiddenSubscribers ? (
              <p className="text-base font-bold text-amber-400">Hidden by Channel</p>
            ) : (
              <p className="font-heading font-extrabold text-2xl text-white tracking-wide" title={`Exact: ${formatExactNumber(subCount)}`}>
                {formatCompactNumber(subCount)}
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              {hiddenSubscribers ? 'Status: hiddenSubscriberCount' : `Exact: ${formatExactNumber(subCount)}`}
            </p>
          </div>
        </div>

        {/* CARD 4: Lifetime Views */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-[#00ffcc]" />
              4. Lifetime Views
            </span>
            <span className="text-[10px] text-gray-500">Public total</span>
          </div>
          <div className="mt-2">
            <p className="font-heading font-extrabold text-2xl text-white tracking-wide" title={`Exact: ${formatExactNumber(channel.statistics?.viewCount)}`}>
              {formatCompactNumber(channel.statistics?.viewCount)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Exact: {formatExactNumber(channel.statistics?.viewCount)}
            </p>
          </div>
        </div>

        {/* CARD 5: Total Public Videos */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-[#00ffcc]" />
              5. Total Public Videos
            </span>
            <span className="text-[10px] text-gray-500">Active</span>
          </div>
          <div className="mt-2">
            <p className="font-heading font-extrabold text-2xl text-white tracking-wide" title={`Exact: ${formatExactNumber(channel.statistics?.videoCount)}`}>
              {formatCompactNumber(channel.statistics?.videoCount)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Exact: {formatExactNumber(channel.statistics?.videoCount)} public uploads
            </p>
          </div>
        </div>

        {/* CARD 6: Creation Date */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#00ffcc]" />
              6. Creation Date
            </span>
            <span className="text-[10px] text-emerald-400">{calculateChannelAge(channel.snippet?.publishedAt)}</span>
          </div>
          <div className="mt-2">
            <p className="font-heading font-bold text-lg text-white">
              {formatDate(channel.snippet?.publishedAt)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Registration timestamp
            </p>
          </div>
        </div>

        {/* CARD 7: Country */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5 text-[#00ffcc]" />
              7. Country
            </span>
            <span className="text-[10px] text-amber-400" title="Account origin, not viewer geography">
              Registration
            </span>
          </div>
          <div className="mt-2">
            <p className="font-heading font-bold text-lg text-white">
              {channel.snippet?.country ? `${channel.snippet.country}` : 'Not declared (N/A)'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Account territory (audience geography is separate)
            </p>
          </div>
        </div>

        {/* CARD 8: Channel Handle */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <AtSign className="w-3.5 h-3.5 text-[#00ffcc]" />
              8. Channel Handle
            </span>
            <span className="text-[10px] text-gray-500">Handle</span>
          </div>
          <div className="mt-2">
            <p className="font-mono text-sm font-semibold text-[#00ffcc] truncate" title={channelHandle}>
              {channelHandle}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              youtube.com/{channelHandle}
            </p>
          </div>
        </div>

        {/* CARD 9: Channel Keywords */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-[#00ffcc]" />
              9. Channel Keywords
            </span>
            <span className="text-[10px] text-gray-500">Tags</span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-300 font-mono line-clamp-1" title={keywords}>
              {keywords}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Public branding keywords
            </p>
          </div>
        </div>

        {/* CARD 10: Channel Status */}
        <div className="card-surface card-surface-hover rounded-xl p-4 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-[#00ffcc]" />
              10. Channel Status
            </span>
            <span className="text-[10px] text-emerald-400">Evidence-based</span>
          </div>
          <div className="mt-2">
            <p className="font-heading font-semibold text-sm text-emerald-400">
              {activityStatus}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Not exposed by public Data API: verification badge
            </p>
          </div>
        </div>

        {/* CARD 11: Total Revenue Estimate (Futuristic Red Card #ff4d4d) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-2 bg-[#ff4d4d] text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-[#ff7e5f]/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <span className="flex items-center gap-2 font-heading font-bold text-xs uppercase tracking-wider">
                <DollarSign className="w-4 h-4 bg-white/20 rounded p-0.5" />
                11. Illustrative Lifetime Revenue Estimate
              </span>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                {market.countryName} ({market.flagEmoji})
              </span>
            </div>

            <div className="mt-4">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight drop-shadow-md">
                {formatCurrency(lifetimeRevenueEstimate)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/90">
                <span className="bg-black/20 px-2 py-1 rounded">
                  RPM: ${market.rpm.toFixed(2)} USD
                </span>
                <span className="bg-black/20 px-2 py-1 rounded">
                  Views: {formatCompactNumber(lifetimeViews)}
                </span>
                <span className="bg-black/20 px-2 py-1 rounded">
                  Formula: (Views / 1000) × RPM
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-white/20 text-[11px] text-white/80 flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Illustrative estimate based on selected market RPM assumption. Not actual earnings or verified YouTube revenue.
            </span>
          </div>

          {/* Futuristic ambient background glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* CARD 12: Monthly Revenue Estimate (Separate Card) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-2 card-surface rounded-2xl p-6 flex flex-col justify-between border border-[#282846] transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#282846]">
              <span className="flex items-center gap-2 font-heading font-semibold text-xs text-gray-300 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-[#ff7e5f]" />
                12. Monthly Revenue Estimate
              </span>
              <span className="text-xs text-[#00ffcc] font-medium">
                {isOwnerAuthorized
                  ? 'Authorized Owner Data'
                  : manualMonthlyViews
                  ? 'Supplied Monthly Run-Rate'
                  : 'Calculated Monthly Run-Rate'}
              </span>
            </div>

            <div className="mt-4">
              {monthlyRevenueEstimate !== null ? (
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                    {formatCurrency(monthlyRevenueEstimate)}
                    <span className="text-xs font-normal text-gray-400 ml-2">/ month</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Based on {formatCompactNumber(effectiveMonthlyViews)} monthly views at ${market.rpm.toFixed(2)} RPM ({market.countryName}).
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-3xl font-extrabold font-heading text-gray-500">N/A</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Monthly views are private. Never calculated by dividing lifetime views by invented months. Enter monthly views in the calculator below to simulate.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#282846] text-[11px] text-gray-500">
            {effectiveMonthlyViews !== null
              ? 'Calculated from supplied/authorized monthly views. Not verified public Data API data.'
              : 'Enter a monthly view figure in the RPM calculator below to generate a scenario.'}
          </div>
        </div>
      </div>
    </div>
  );
};
