import React, { useState } from 'react';
import {
  Video,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { YouTubeVideoItem } from '../types/youtube';
import {
  formatCompactNumber,
  formatExactNumber,
  formatDate,
  formatDuration,
} from '../utils/formatters';

interface UploadsSectionProps {
  videos: YouTubeVideoItem[];
  uploadsPlaylistId?: string;
  totalExamined: number;
  sampleCoverageLabel?: string;
  isLoading?: boolean;
}

export const UploadsSection: React.FC<UploadsSectionProps> = ({
  videos,
  uploadsPlaylistId,
  totalExamined,
  sampleCoverageLabel,
  isLoading,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'30' | '90' | '365' | 'all'>('all');

  const filteredVideos = React.useMemo(() => {
    if (filterPeriod === 'all') return videos;
    const now = new Date().getTime();
    const daysLimit = parseInt(filterPeriod, 10);
    const msLimit = daysLimit * 24 * 60 * 60 * 1000;

    return videos.filter((v) => {
      if (!v.publishedAt) return false;
      const pubTime = new Date(v.publishedAt).getTime();
      return now - pubTime <= msLimit;
    });
  }, [videos, filterPeriod]);

  return (
    <div className="mt-8 sm:mt-12 space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282846] pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2 break-words">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff7e5f] flex-shrink-0" />
            Recent Uploads & Video Details
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {sampleCoverageLabel || `Sampled ${totalExamined} most recent public video uploads.`} (Never represents complete channel history).
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#101026] p-1 rounded-xl border border-[#282846] self-start sm:self-auto flex-wrap max-w-full">
          <Filter className="w-3.5 h-3.5 text-gray-500 ml-1.5 mr-1 flex-shrink-0" />
          <button
            onClick={() => setFilterPeriod('30')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filterPeriod === '30'
                ? 'bg-[#ff7e5f] text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setFilterPeriod('90')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filterPeriod === '90'
                ? 'bg-[#ff7e5f] text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setFilterPeriod('365')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filterPeriod === '365'
                ? 'bg-[#ff7e5f] text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Last 12 Months
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filterPeriod === 'all'
                ? 'bg-[#00ffcc] text-[#0f0f23] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Sampled
          </button>
        </div>
      </div>

      {/* Uploads List */}
      {videos.length === 0 ? (
        <div className="card-surface rounded-xl p-8 text-center border border-[#282846]">
          <Video className="w-10 h-10 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-300 font-semibold">No recent uploads found</p>
          <p className="text-xs text-gray-500 mt-1">
            Either no public videos are present in the uploads playlist, or the API request returned zero items.
          </p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="card-surface rounded-xl p-8 text-center border border-[#282846]">
          <p className="text-gray-300 font-semibold">No uploads in the selected timeframe</p>
          <p className="text-xs text-gray-500 mt-1">
            None of the {videos.length} examined videos were published within the last{' '}
            {filterPeriod === '30' ? '30 days' : filterPeriod === '90' ? '90 days' : '12 months'}.
          </p>
          <button
            onClick={() => setFilterPeriod('all')}
            className="mt-3 px-3 py-1.5 bg-[#232342] text-xs font-medium rounded-lg hover:bg-[#2d2d55] text-white"
          >
            Reset filter to All Sampled
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="card-surface card-surface-hover rounded-xl overflow-hidden border border-[#282846] flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Thumbnail with duration badge */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-white">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h4
                    className="font-semibold text-sm text-white line-clamp-2 group-hover:text-[#00ffcc] transition-colors"
                    title={video.title}
                  >
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1.5">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    Published: {formatDate(video.publishedAt)}
                  </p>
                </div>
              </div>

              {/* Stats Bar & Direct Link */}
              <div className="px-4 py-3 bg-[#111128] border-t border-[#232342] flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title={`Views: ${formatExactNumber(video.viewCount)}`}>
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    {formatCompactNumber(video.viewCount)}
                  </span>
                  <span className="flex items-center gap-1" title={`Likes: ${formatExactNumber(video.likeCount)}`}>
                    <ThumbsUp className="w-3.5 h-3.5 text-gray-500" />
                    {formatCompactNumber(video.likeCount)}
                  </span>
                  <span className="flex items-center gap-1" title={`Comments: ${formatExactNumber(video.commentCount)}`}>
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    {formatCompactNumber(video.commentCount)}
                  </span>
                </div>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-[#1f1f3a] hover:bg-[#ff4d4d] hover:text-white transition-colors"
                  title="Open video on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
