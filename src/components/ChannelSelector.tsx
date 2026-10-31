import React from 'react';
import { Users, Video, ArrowRight, Search, Hash } from 'lucide-react';
import { ChannelSearchResult } from '../types/youtube';
import { formatCompactNumber } from '../utils/formatters';

interface ChannelSelectorProps {
  query: string;
  matches: (ChannelSearchResult & { subscriberCount?: string; videoCount?: string })[];
  onSelectChannel: (channelId: string) => void;
  onCancel: () => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  query,
  matches,
  onSelectChannel,
  onCancel,
}) => {
  return (
    <div className="card-surface rounded-2xl p-6 md:p-8 border border-[#282846] my-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#282846] pb-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-[#ff7e5f]">
            Multiple Matches Found
          </span>
          <h3 className="text-xl font-bold font-heading text-white mt-1">
            Select Your Target Channel
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            We discovered {matches.length} public channels matching your query <strong className="text-white">"{query}"</strong>. Choose the channel you wish to analyze:
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-[#232342] hover:bg-[#2d2d55] text-xs text-gray-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          Cancel & Edit Query
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => onSelectChannel(match.id)}
            className="group card-surface card-surface-hover rounded-xl p-5 border border-[#282846] cursor-pointer transition-all flex flex-col justify-between hover:border-[#00ffcc] relative"
          >
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={match.thumbnailUrl || 'https://via.placeholder.com/64'}
                  alt={match.title}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#282846] group-hover:border-[#00ffcc] transition-colors flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-base text-white group-hover:text-[#00ffcc] transition-colors truncate">
                    {match.title}
                  </h4>
                  {match.customUrl && (
                    <p className="text-xs font-mono text-gray-400 truncate">{match.customUrl}</p>
                  )}
                  <p className="text-[11px] font-mono text-gray-500 mt-0.5 truncate flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {match.id}
                  </p>
                </div>
              </div>

              {match.description && (
                <p className="text-xs text-gray-400 mt-3 line-clamp-2">
                  {match.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#232342] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-gray-400">
                {match.subscriberCount && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    {formatCompactNumber(match.subscriberCount)}
                  </span>
                )}
                {match.videoCount && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-gray-500" />
                    {formatCompactNumber(match.videoCount)} vids
                  </span>
                )}
              </div>

              <span className="text-xs font-bold text-[#00ffcc] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Select <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
