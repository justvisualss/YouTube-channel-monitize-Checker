import {
  YouTubeChannelItem,
  ChannelSearchResult,
  YouTubeVideoItem,
  YouTubePlaylistItem,
} from '../types/youtube';
import { classifyChannelInput } from '../utils/youtubeParser';

// Official active YouTube Data API v3 key provided by user
export const YOUTUBE_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_YOUTUBE_API_KEY) ||
  'AIzaSyAZPd7sDWORRvYFyO3RcSRWOtK_D07s5lg';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// In-memory cache for API calls to preserve quota
const clientCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 mins

function getFromCache<T>(key: string): T | null {
  const item = clientCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    clientCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setToCache(key: string, data: any) {
  clientCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

async function callGoogleApi(endpoint: string, params: Record<string, string>): Promise<any> {
  const urlParams = new URLSearchParams({
    ...params,
    key: YOUTUBE_API_KEY,
  });

  const url = `${BASE_URL}/${endpoint}?${urlParams.toString()}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.error?.message || `YouTube API error: ${res.statusText}`;
    const reason = data.error?.errors?.[0]?.reason || 'API_ERROR';
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.code = reason;
    err.details = data.error;
    throw err;
  }

  return data;
}

export type ResolveResult =
  | { type: 'single'; channel: YouTubeChannelItem }
  | { type: 'multiple'; matches: (ChannelSearchResult & { subscriberCount?: string; videoCount?: string })[] };

export async function resolveChannelDirectly(query: string, bypassCache = false): Promise<ResolveResult> {
  const cacheKey = `resolve:${query.toLowerCase()}`;
  if (!bypassCache) {
    const cached = getFromCache<ResolveResult>(cacheKey);
    if (cached) return cached;
  }

  const classified = classifyChannelInput(query);

  // 1. Direct Channel ID
  if (classified.type === 'channel_id') {
    const data = await callGoogleApi('channels', {
      part: 'snippet,statistics,contentDetails,brandingSettings,status',
      id: classified.value,
    });

    if (!data.items || data.items.length === 0) {
      throw new Error(`No YouTube channel found with ID "${classified.value}"`);
    }

    const result: ResolveResult = { type: 'single', channel: data.items[0] };
    setToCache(cacheKey, result);
    return result;
  }

  // 2. Handle
  if (classified.type === 'handle') {
    const data = await callGoogleApi('channels', {
      part: 'snippet,statistics,contentDetails,brandingSettings,status',
      forHandle: classified.value,
    });

    if (data.items && data.items.length > 0) {
      const result: ResolveResult = { type: 'single', channel: data.items[0] };
      setToCache(cacheKey, result);
      return result;
    }
  }

  // 3. Legacy Username
  if (classified.type === 'legacy_user') {
    const data = await callGoogleApi('channels', {
      part: 'snippet,statistics,contentDetails,brandingSettings,status',
      forUsername: classified.value,
    });

    if (data.items && data.items.length > 0) {
      const result: ResolveResult = { type: 'single', channel: data.items[0] };
      setToCache(cacheKey, result);
      return result;
    }
  }

  // 4. Search Query / Multi-match fallback
  const searchTarget = classified.value || query;
  const searchData = await callGoogleApi('search', {
    part: 'snippet',
    type: 'channel',
    q: searchTarget,
    maxResults: '6',
  });

  if (!searchData.items || searchData.items.length === 0) {
    throw new Error(`No YouTube channels found matching "${query}"`);
  }

  // If only 1 search match, fetch its complete channel details
  if (searchData.items.length === 1) {
    const channelId = searchData.items[0].snippet?.channelId || searchData.items[0].id?.channelId;
    const details = await callGoogleApi('channels', {
      part: 'snippet,statistics,contentDetails,brandingSettings,status',
      id: channelId,
    });
    if (details.items && details.items.length > 0) {
      const result: ResolveResult = { type: 'single', channel: details.items[0] };
      setToCache(cacheKey, result);
      return result;
    }
  }

  // Hydrate multiple search results with subscriber count and details
  const channelIds = searchData.items
    .map((item: any) => item.snippet?.channelId || item.id?.channelId)
    .filter(Boolean);

  let hydratedChannels: any[] = [];
  if (channelIds.length > 0) {
    try {
      const batchDetails = await callGoogleApi('channels', {
        part: 'snippet,statistics',
        id: channelIds.join(','),
      });
      hydratedChannels = batchDetails.items || [];
    } catch {
      // fallback to searchData if batch fails
    }
  }

  const matches = (hydratedChannels.length > 0 ? hydratedChannels : searchData.items).map((item: any) => ({
    id: item.id || item.snippet?.channelId,
    title: item.snippet?.title || 'Unknown Channel',
    description: item.snippet?.description || '',
    thumbnailUrl:
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      '',
    customUrl: item.snippet?.customUrl,
    subscriberCount: item.statistics?.subscriberCount,
    videoCount: item.statistics?.videoCount,
  }));

  const result: ResolveResult = { type: 'multiple', matches };
  setToCache(cacheKey, result);
  return result;
}

export async function getChannelDetailsDirectly(channelId: string, bypassCache = false): Promise<YouTubeChannelItem> {
  const cacheKey = `details:${channelId}`;
  if (!bypassCache) {
    const cached = getFromCache<YouTubeChannelItem>(cacheKey);
    if (cached) return cached;
  }

  const data = await callGoogleApi('channels', {
    part: 'snippet,statistics,contentDetails,brandingSettings,status',
    id: channelId,
  });

  if (!data.items || data.items.length === 0) {
    throw new Error(`Channel details not found for ID "${channelId}"`);
  }

  setToCache(cacheKey, data.items[0]);
  return data.items[0];
}

export async function getChannelUploadsDirectly(
  uploadsPlaylistId: string,
  maxResults = 25
): Promise<{ videos: YouTubeVideoItem[]; totalExamined: number }> {
  const cacheKey = `uploads:${uploadsPlaylistId}:${maxResults}`;
  const cached = getFromCache<{ videos: YouTubeVideoItem[]; totalExamined: number }>(cacheKey);
  if (cached) return cached;

  const playlistData = await callGoogleApi('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
  });

  if (!playlistData.items || playlistData.items.length === 0) {
    return { videos: [], totalExamined: 0 };
  }

  const videoIds = playlistData.items
    .map((item: any) => item.contentDetails?.videoId)
    .filter(Boolean);

  let videoStatsMap = new Map<string, any>();
  if (videoIds.length > 0) {
    try {
      const videoData = await callGoogleApi('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
      });
      for (const v of videoData.items || []) {
        videoStatsMap.set(v.id, v);
      }
    } catch {
      // proceed without full video stats
    }
  }

  const videos: YouTubeVideoItem[] = playlistData.items.map((item: any) => {
    const videoId = item.contentDetails?.videoId;
    const details = videoStatsMap.get(videoId);

    return {
      id: videoId,
      title: item.snippet?.title || 'Untitled Video',
      description: item.snippet?.description || '',
      publishedAt: item.snippet?.publishedAt,
      thumbnailUrl:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.default?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      viewCount: details?.statistics?.viewCount ? parseInt(details.statistics.viewCount, 10) : undefined,
      likeCount: details?.statistics?.likeCount ? parseInt(details.statistics.likeCount, 10) : undefined,
      commentCount: details?.statistics?.commentCount ? parseInt(details.statistics.commentCount, 10) : undefined,
      duration: details?.contentDetails?.duration,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  });

  const result = { videos, totalExamined: videos.length };
  setToCache(cacheKey, result);
  return result;
}

export async function getChannelPlaylistsDirectly(channelId: string): Promise<YouTubePlaylistItem[]> {
  const cacheKey = `playlists:${channelId}`;
  const cached = getFromCache<YouTubePlaylistItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await callGoogleApi('playlists', {
      part: 'snippet,contentDetails',
      channelId,
      maxResults: '20',
    });

    const playlists = (data.items || []).map((p: any) => ({
      id: p.id,
      title: p.snippet?.title,
      description: p.snippet?.description,
      publishedAt: p.snippet?.publishedAt,
      thumbnailUrl: p.snippet?.thumbnails?.medium?.url || p.snippet?.thumbnails?.default?.url,
      itemCount: p.contentDetails?.itemCount,
      url: `https://www.youtube.com/playlist?list=${p.id}`,
    }));

    setToCache(cacheKey, playlists);
    return playlists;
  } catch {
    return [];
  }
}
