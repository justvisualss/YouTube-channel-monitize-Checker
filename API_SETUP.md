# YouTube Data API v3 & OAuth Setup Guide

This guide walks you through configuring Google Cloud services for ChannelScope Analytics.

---

## Part 1: Enabling YouTube Data API v3 (Public Search)

The YouTube Data API v3 powers all public channel lookups, video upload sampling, and playlist queries.

### Step 1: Create a Google Cloud Project
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top of the page and click **New Project**.
3. Name your project (e.g. `ChannelScope Analytics`) and click **Create**.

### Step 2: Enable the YouTube Data API v3
1. From the navigation menu, go to **APIs & Services > Library**.
2. Search for **YouTube Data API v3**.
3. Click on the API card and click **Enable**.

### Step 3: Create & Restrict an API Key
1. Navigate to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** at the top, and select **API Key**.
3. A modal will display your new key. Click **Edit API Key** (or the pencil icon next to the key).
4. Under **API restrictions**:
   * Choose **Restrict key**.
   * Select only **YouTube Data API v3** from the dropdown.
   * Click **Save**.
5. Copy your API Key.

### Step 4: Configure the Key on the Server
In your `.env` file (or host environment variables):
```env
YOUTUBE_API_KEY="AIzaSyYourGeneratedApiKeyHere"
```
*Note: ChannelScope will automatically detect this key and route live channel lookups through the YouTube API.*

---

## Part 2: Quota Monitoring & Budgeting

* The default YouTube Data API quota provides **10,000 units per day** for free.
* `channels.list` (Direct ID or handle lookup) costs **1 unit**.
* `playlistItems.list` costs **1 unit**.
* `videos.list` (batch video details) costs **1 unit**.
* `search.list` (broad query fallback) costs **100 units**.
* ChannelScope’s search strategy optimizes quota by querying `channels.list` first, caching results for 15 minutes, and sampling uploads sensibly.
* You can monitor daily usage under **APIs & Services > Enabled APIs & services > YouTube Data API v3 > Quotas & System Limits**.

---

## Part 3: Optional Google OAuth 2.0 (Owner Analytics)

Channel owners can optionally authorize private analytics via the YouTube Analytics API.

### Step 1: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in the required application details:
   * App name: `ChannelScope Analytics`
   * User support email: your email
   * Developer contact info: your email
4. Click **Save and Continue**.
5. In **Scopes**, add:
   * `https://www.googleapis.com/auth/yt-analytics.readonly`
   * `https://www.googleapis.com/auth/yt-analytics-monetary.readonly`
   * `https://www.googleapis.com/auth/youtube.readonly`
6. Click **Save and Continue**.

### Step 2: Create OAuth 2.0 Web Client ID
1. Navigate to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
2. Application type: **Web application**.
3. Name: `ChannelScope Web Client`.
4. Under **Authorized redirect URIs**, add:
   * Local: `http://localhost:3000/api/oauth/callback`
   * Production: `https://your-domain.com/api/oauth/callback`
5. Click **Create**.

### Step 3: Configure Server Environment Variables
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_OAUTH_REDIRECT_URI="https://your-domain.com/api/oauth/callback"
```

Once saved, the "Connect YouTube" button on ChannelScope will allow channel owners to link their channels and display authorized historical velocity and revenue reports.
