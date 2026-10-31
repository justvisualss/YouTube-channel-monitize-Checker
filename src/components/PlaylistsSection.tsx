import React from 'react';
import { ListVideo, PlaySquare, ExternalLink, Info } from 'lucide-react';
import { YouTubePlaylistItem } from '../types/youtube';
import { formatExactNumber } from '../utils/formatters';

interface PlaylistsSectionProps {
  playlists: YouTubePlaylistItem[];
  uploadsPlaylistId?: string;
  channelTitle?: string;
}

export const PlaylistsSection: React.FC<PlaylistsSectionProps> = ({
  playlists,
  uploadsPlaylistId,
  channelTitle,
}) => {
  const otherPlaylists = playlists.filter((p) => !p.isUploadsPlaylist && p.id !== uploadsPlaylistId);

  return (
    <div className="mt-8 sm:mt-12 space-y-6 w-full min-w-0 overflow-hidden">
      <div className="border-b border-[#282846] pb-4">
        <h3 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2 break-words">
          <ListVideo className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ffcc] flex-shrink-0" />
          Public Playlists
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Separate views for the channel’s primary Uploads playlist and supplementary curated public playlists.
        </p>
      </div>

      {/* 1. Primary Uploads Playlist (Separated as required) */}
      <div className="bg-gradient-to-r from-[#17172f] to-[#1e1e3b] p-4 sm:p-6 rounded-2xl border border-[#2d2d55] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ff4d4d]/20 border border-[#ff4d4d]/40 flex items-center justify-center flex-shrink-0 text-[#ff4d4d]">
            <PlaySquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#ff4d4d] text-white uppercase tracking-wider">
                Primary System Playlist
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {uploadsPlaylistId || 'N/A'}</span>
            </div>
            <h4 className="text-lg font-bold font-heading text-white mt-1">
              Uploads from {channelTitle || 'Channel'}
            </h4>
            <p className="text-xs text-gray-400">
              The canonical YouTube system playlist containing all active public channel uploads.
            </p>
          </div>
        </div>

        {uploadsPlaylistId && (
          <a
            href={`https://www.youtube.com/playlist?list=${uploadsPlaylistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#232342] hover:bg-[#2d2d55] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            <span>Open in YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* 2. Other Public Playlists */}
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Curated Public Playlists ({otherPlaylists.length})
        </h4>

        {otherPlaylists.length === 0 ? (
          <div className="card-surface rounded-xl p-8 text-center border border-[#282846]">
            <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-300 font-semibold text-sm">No additional public playlists available</p>
            <p className="text-xs text-gray-500 mt-1">
              This channel has not published any separate curated public playlists beyond its default uploads.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherPlaylists.map((pl) => (
              <div
                key={pl.id}
                className="card-surface card-surface-hover rounded-xl p-4 border border-[#282846] flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-[#232342]">
                    <span className="font-mono text-[11px] truncate max-w-[150px]">{pl.id}</span>
                    <span className="bg-[#232342] px-2 py-0.5 rounded text-[11px] text-gray-300 font-semibold">
                      {pl.itemCount !== undefined ? `${formatExactNumber(pl.itemCount)} videos` : 'Videos: N/A'}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-white mt-3 line-clamp-2" title={pl.title}>
                    {pl.title}
                  </h5>
                  {pl.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{pl.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#232342] flex justify-end">
                  <a
                    href={pl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#00ffcc] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>View Playlist</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
