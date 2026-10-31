export interface YouTubeChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  country?: string;
}

export interface YouTubeChannelStatistics {
  viewCount: string;
  subscriberCount?: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface YouTubeChannelContentDetails {
  relatedPlaylists: {
    likes?: string;
    uploads: string;
  };
}

export interface YouTubeChannelBrandingSettings {
  channel?: {
    title?: string;
    description?: string;
    keywords?: string;
    country?: string;
  };
  image?: {
    bannerExternalUrl?: string;
  };
}

export interface YouTubeChannelStatus {
  privacyStatus?: string;
  isLinked?: boolean;
  longUploadsStatus?: string;
  madeForKids?: boolean;
}

export interface YouTubeChannelItem {
  id: string;
  snippet: YouTubeChannelSnippet;
  statistics: YouTubeChannelStatistics;
  contentDetails: YouTubeChannelContentDetails;
  brandingSettings?: YouTubeChannelBrandingSettings;
  status?: YouTubeChannelStatus;
}

export interface ChannelSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  customUrl?: string;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
  url: string;
}

export interface YouTubePlaylistItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl?: string;
  itemCount?: number;
  url: string;
  isUploadsPlaylist?: boolean;
}

export type ActivityStatus =
  | 'Public channel found'
  | 'Recent uploads detected'
  | 'No recent uploads in retrieved sample'
  | 'Activity information unavailable';

export interface OwnerAnalyticsSummary {
  channelId: string;
  startDate: string;
  endDate: string;
  dailyMetrics: Array<{
    date: string;
    views: number;
    subscribersGained: number;
    subscribersLost: number;
    netSubscribers: number;
    estimatedRevenue?: number;
  }>;
  audienceGeography?: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  totalViews: number;
  totalSubscribersGained: number;
  totalSubscribersLost: number;
  netSubscribers: number;
  totalEstimatedRevenue?: number;
}
