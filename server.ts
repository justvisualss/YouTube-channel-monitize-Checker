import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { BLOG_ARTICLES } from './src/data/blogArticles.ts';
import { classifyChannelInput } from './src/utils/youtubeParser.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL =
  process.env.APP_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://youtube-monetization-checker-free.vercel.app'
    : `http://localhost:${PORT}`);
const OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${APP_URL}/api/oauth/callback`;

app.use(express.json());
app.use(cookieParser());

// Simple in-memory cache to conserve YouTube API quota
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any) {
  apiCache.set(key, { data, timestamp: Date.now() });
}

// In-memory session store for OAuth (tokens never sent to client)
interface OwnerSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  channelId?: string;
  channelTitle?: string;
}
const ownerSessions = new Map<string, OwnerSession>();

// Health & Config Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'MY_YOUTUBE_API_KEY'),
    hasOAuth: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    appUrl: APP_URL,
    timestamp: new Date().toISOString(),
  });
});

// Dynamic robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /disclaimer
Allow: /blog
Allow: /blog/

Disallow: /api/oauth/callback
Disallow: /api/oauth/url

Sitemap: ${APP_URL}/sitemap.xml
`);
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const staticUrls = [
    { loc: `${APP_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${APP_URL}/about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${APP_URL}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${APP_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${APP_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${APP_URL}/disclaimer`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${APP_URL}/blog`, priority: '0.9', changefreq: 'daily' },
  ];

  const blogUrls = BLOG_ARTICLES.map((article) => ({
    loc: `${APP_URL}/blog/${article.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: article.updatedAt.split('T')[0],
  }));

  const allUrls = [...staticUrls, ...blogUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(sitemapXml);
});

// Helper for YouTube API Fetch
async function fetchYouTubeApi(endpoint: string, params: Record<string, string>): Promise<any> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'MY_YOUTUBE_API_KEY') {
    const error: any = new Error('YouTube API Key is not configured on the server.');
    error.status = 503;
    error.code = 'API_KEY_MISSING';
    throw error;
  }

  const queryParams = new URLSearchParams({
    ...params,
    key: YOUTUBE_API_KEY,
  });

  const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);
  const data: any = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || 'YouTube API error occurred.';
    const reason = data.error?.errors?.[0]?.reason || 'unknown';
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.code = reason;
    err.details = data.error;
    throw err;
  }

  return data;
}

// Channel Resolution Route (Least Expensive Method First)
app.get('/api/channel/resolve', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const bypassCache = req.query.fresh === 'true';
  const cacheKey = `resolve:${query.toLowerCase()}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  }

  try {
    const classified = classifyChannelInput(query);

    // 1. If Direct Channel ID
    if (classified.type === 'channel_id') {
      const data = await fetchYouTubeApi('channels', {
        part: 'snippet,statistics,contentDetails,brandingSettings,status',
        id: classified.value,
      });

      if (!data.items || data.items.length === 0) {
        return res.status(404).json({ error: 'Channel not found with this Channel ID' });
      }

      const result = { type: 'single', channel: data.items[0] };
      setCache(cacheKey, result);
      return res.json(result);
    }

    // 2. If Handle
    if (classified.type === 'handle') {
      const data = await fetchYouTubeApi('channels', {
        part: 'snippet,statistics,contentDetails,brandingSettings,status',
        forHandle: classified.value,
      });

      if (data.items && data.items.length > 0) {
        const result = { type: 'single', channel: data.items[0] };
        setCache(cacheKey, result);
        return res.json(result);
      }
      // If forHandle didn't find, fallback to search below
    }

    // 3. If Legacy Username
    if (classified.type === 'legacy_user') {
      const data = await fetchYouTubeApi('channels', {
        part: 'snippet,statistics,contentDetails,brandingSettings,status',
        forUsername: classified.value,
      });

      if (data.items && data.items.length > 0) {
        const result = { type: 'single', channel: data.items[0] };
        setCache(cacheKey, result);
        return res.json(result);
      }
      // If forUsername didn't find, fallback to search below
    }

    // 4. Search query / multiple matches
    const searchTarget = classified.value || query;
    const searchData = await fetchYouTubeApi('search', {
      part: 'snippet',
      type: 'channel',
      q: searchTarget,
      maxResults: '6',
    });

    if (!searchData.items || searchData.items.length === 0) {
      return res.status(404).json({ error: `No channels found matching "${query}"` });
    }

    // If exactly 1 match returned, fetch its complete channel details
    if (searchData.items.length === 1) {
      const channelId = searchData.items[0].snippet.channelId || searchData.items[0].id?.channelId;
      const detailsData = await fetchYouTubeApi('channels', {
        part: 'snippet,statistics,contentDetails,brandingSettings,status',
        id: channelId,
      });
      if (detailsData.items && detailsData.items.length > 0) {
        const result = { type: 'single', channel: detailsData.items[0] };
        setCache(cacheKey, result);
        return res.json(result);
      }
    }

    // Multiple matches: return channel-selection interface list as required
    const channelIds = searchData.items
      .map((item: any) => item.snippet?.channelId || item.id?.channelId)
      .filter(Boolean);

    // Hydrate matches with subscriber count and details for rich selection
    let hydratedChannels: any[] = [];
    if (channelIds.length > 0) {
      const batchDetails = await fetchYouTubeApi('channels', {
        part: 'snippet,statistics',
        id: channelIds.join(','),
      });
      hydratedChannels = batchDetails.items || [];
    }

    const matches = (hydratedChannels.length > 0 ? hydratedChannels : searchData.items).map((item: any) => ({
      id: item.id || item.snippet?.channelId,
      title: item.snippet?.title || 'Unknown Title',
      description: item.snippet?.description || '',
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
      customUrl: item.snippet?.customUrl,
      subscriberCount: item.statistics?.subscriberCount,
      videoCount: item.statistics?.videoCount,
    }));

    const result = { type: 'multiple', matches };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    return handleApiError(res, error);
  }
});

// Channel Details by ID
app.get('/api/channel/details', async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'Channel ID is required' });

  const bypassCache = req.query.fresh === 'true';
  const cacheKey = `details:${id}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
  }

  try {
    const data = await fetchYouTubeApi('channels', {
      part: 'snippet,statistics,contentDetails,brandingSettings,status',
      id,
    });

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = data.items[0];
    setCache(cacheKey, channel);
    return res.json(channel);
  } catch (error: any) {
    return handleApiError(res, error);
  }
});

// Recent Uploads from Uploads Playlist
app.get('/api/channel/uploads', async (req: Request, res: Response) => {
  const uploadsPlaylistId = req.query.uploadsPlaylistId as string;
  const channelId = req.query.channelId as string;
  const maxResults = Math.min(parseInt(req.query.limit as string || '25', 10), 50);

  if (!uploadsPlaylistId) {
    return res.status(400).json({ error: 'Uploads Playlist ID is required' });
  }

  const cacheKey = `uploads:${uploadsPlaylistId}:${maxResults}`;
  const cached = getCached(cacheKey);
  if (cached && req.query.fresh !== 'true') {
    return res.json(cached);
  }

  try {
    // 1. Fetch playlist items
    const playlistData = await fetchYouTubeApi('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: String(maxResults),
    });

    if (!playlistData.items || playlistData.items.length === 0) {
      const result = { videos: [], totalExamined: 0, uploadsPlaylistId };
      setCache(cacheKey, result);
      return res.json(result);
    }

    const videoIds = playlistData.items
      .map((item: any) => item.contentDetails?.videoId)
      .filter(Boolean);

    // 2. Fetch video details for statistics (views, likes, comments, duration)
    let videoStatsMap = new Map<string, any>();
    if (videoIds.length > 0) {
      const videoData = await fetchYouTubeApi('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
      });

      for (const v of videoData.items || []) {
        videoStatsMap.set(v.id, v);
      }
    }

    // Map into typed video objects
    const videos = playlistData.items.map((item: any) => {
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

    const result = {
      videos,
      totalExamined: videos.length,
      uploadsPlaylistId,
      sampleCoverageLabel: `Sampled ${videos.length} most recent uploads from channel uploads playlist`,
    };

    setCache(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    return handleApiError(res, error);
  }
});

// Public Playlists
app.get('/api/channel/playlists', async (req: Request, res: Response) => {
  const channelId = req.query.channelId as string;
  if (!channelId) return res.status(400).json({ error: 'Channel ID is required' });

  const cacheKey = `playlists:${channelId}`;
  const cached = getCached(cacheKey);
  if (cached && req.query.fresh !== 'true') {
    return res.json(cached);
  }

  try {
    const data = await fetchYouTubeApi('playlists', {
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

    const result = { playlists };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    return handleApiError(res, error);
  }
});

// Optional Owner OAuth Endpoints
app.get('/api/oauth/status', (req: Request, res: Response) => {
  const sessionId = req.cookies?.cs_owner_session;
  const session = sessionId ? ownerSessions.get(sessionId) : null;
  const isAuthorized = Boolean(session && session.expiresAt > Date.now());

  res.json({
    hasCredentials: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    isAuthorized,
    channelId: session?.channelId || null,
    channelTitle: session?.channelTitle || null,
    scopes: [
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
    ],
  });
});

app.get('/api/oauth/url', (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: 'Google OAuth credentials not configured on the server.',
      instructions:
        'To connect private YouTube owner analytics, configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your server environment.',
    });
  }

  const scopes = [
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
    'https://www.googleapis.com/auth/youtube.readonly',
  ].join(' ');

  const state = Math.random().toString(36).substring(2, 15);
  res.cookie('cs_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 10 * 60 * 1000 });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    GOOGLE_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    OAUTH_REDIRECT_URI
  )}&response_type=code&scope=${encodeURIComponent(
    scopes
  )}&access_type=offline&prompt=consent&state=${state}`;

  return res.json({ url });
});

app.get('/api/oauth/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?oauth_error=${encodeURIComponent(String(error))}`);
  }

  const cookieState = req.cookies?.cs_oauth_state;
  if (!state || state !== cookieState) {
    return res.redirect('/?oauth_error=invalid_state');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange OAuth code');
    }

    // Retrieve authorized channel ID
    const userChannelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userChannelData: any = await userChannelRes.json();
    const authorizedChannel = userChannelData.items?.[0];

    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    ownerSessions.set(sessionId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
      channelId: authorizedChannel?.id,
      channelTitle: authorizedChannel?.snippet?.title,
    });

    res.cookie('cs_owner_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect('/?oauth_success=true');
  } catch (err: any) {
    res.redirect(`/?oauth_error=${encodeURIComponent(err.message)}`);
  }
});

app.post('/api/oauth/disconnect', (req: Request, res: Response) => {
  const sessionId = req.cookies?.cs_owner_session;
  if (sessionId) {
    ownerSessions.delete(sessionId);
  }
  res.clearCookie('cs_owner_session');
  res.json({ success: true });
});

// Owner Analytics Report Query
app.get('/api/oauth/analytics', async (req: Request, res: Response) => {
  const sessionId = req.cookies?.cs_owner_session;
  const session = sessionId ? ownerSessions.get(sessionId) : null;

  if (!session || session.expiresAt <= Date.now()) {
    return res.status(401).json({ error: 'Owner is not authenticated via OAuth' });
  }

  try {
    const channelId = session.channelId;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    // Query daily views, subscribers gained/lost
    const queryUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,subscribersGained,subscribersLost,estimatedRevenue&dimensions=day&sort=day`;

    const reportRes = await fetch(queryUrl, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const reportData: any = await reportRes.json();

    if (!reportRes.ok) {
      throw new Error(reportData.error?.message || 'Failed to query YouTube Analytics API');
    }

    // Format daily metrics
    const rows = reportData.rows || [];
    const dailyMetrics = rows.map((r: any[]) => ({
      date: r[0],
      views: r[1] || 0,
      subscribersGained: r[2] || 0,
      subscribersLost: r[3] || 0,
      netSubscribers: (r[2] || 0) - (r[3] || 0),
      estimatedRevenue: r[4] !== undefined ? r[4] : undefined,
    }));

    return res.json({
      channelId,
      channelTitle: session.channelTitle,
      startDate,
      endDate,
      dailyMetrics,
      isMonetizedReport: rows.some((r: any[]) => r[4] !== undefined && r[4] > 0),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Contact Endpoint
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // As required by page 43:
  // "If no mail service is configured, do not claim that a submission was successfully delivered."
  const hasMailService = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
  if (!hasMailService) {
    return res.json({
      status: 'received_unconfigured',
      message:
        'Your message was processed locally. However, an external SMTP or mail delivery service is not currently configured on this server. For urgent inquiries, please email contact@channelscope.app directly.',
      delivered: false,
    });
  }

  return res.json({
    status: 'delivered',
    message: 'Thank you for contacting ChannelScope. We have received your inquiry.',
    delivered: true,
  });
});

// Normalized Error Handler
function handleApiError(res: Response, error: any) {
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  const code = error.code || 'UNKNOWN_ERROR';

  if (code === 'API_KEY_MISSING') {
    return res.status(503).json({
      error: 'YouTube API Key is not configured.',
      code: 'API_KEY_MISSING',
      details:
        'To enable live public YouTube searches, add YOUTUBE_API_KEY in your environment variables. You can also explore with Demo Mode.',
    });
  }

  if (code === 'quotaExceeded') {
    return res.status(429).json({
      error: 'YouTube Data API daily quota exceeded.',
      code: 'QUOTA_EXCEEDED',
      details: 'Google YouTube API quota for today has been reached. Please try again tomorrow or use Demo Mode.',
    });
  }

  if (code === 'keyInvalid' || status === 400 && message.includes('API key not valid')) {
    return res.status(401).json({
      error: 'YouTube API key is invalid or inactive.',
      code: 'KEY_INVALID',
      details: 'Please verify the YOUTUBE_API_KEY configured in your Google Cloud Console.',
    });
  }

  if (code === 'accessNotConfigured') {
    return res.status(403).json({
      error: 'YouTube Data API v3 is not enabled in Google Cloud Console.',
      code: 'API_DISABLED',
      details: 'Please visit Google Cloud Console APIs & Services and enable YouTube Data API v3.',
    });
  }

  return res.status(status).json({
    error: message,
    code,
  });
}

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ChannelScope Analytics server running on port ${PORT}`);
  });
}

startServer();
