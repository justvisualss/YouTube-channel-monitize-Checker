# ChannelScope Analytics

> **YouTube Channel Analytics, Growth Insights & Revenue Estimator**  
> *Independent platform for inspecting public YouTube channel metrics, analyzing upload velocity, and modeling transparent RPM-based earnings scenarios.*

---

## 1. Project Overview

ChannelScope Analytics is a production-minded web platform designed to analyze public YouTube channels and provide clear, assumption-based revenue estimates without requiring visitors to log in. 

Channel owners may optionally authorize their own accounts via Google OAuth 2.0 to view private historical analytics and realized Partner Program earnings.

### Key Capabilities
* **Flexible Channel Search**: Resolves Channel IDs (`UC...`), handles (`@channel`), URLs, legacy usernames, or creator names.
* **Least-Expensive API Lookup**: Prioritizes inexpensive `channels.list` lookups before falling back to `search.list`.
* **Selection Interface**: When broad searches yield multiple channels, users are presented with a selection grid to choose the exact entity.
* **12 Comprehensive Metric Cards**: Channel ID, Name, Subscribers (milestone rounded), Lifetime Views, Public Videos, Creation Date, Registered Country, Handle, Keywords, Evidence-Based Status, and two dedicated Revenue Cards.
* **Prominent Revenue Cards**: Lifetime revenue estimate presented in an attention-grabbing `#ff4d4d` red card; monthly revenue presented in a separate card (strictly avoids dividing lifetime views by arbitrary months).
* **Country-Based RPM Calculator**: Interactive calculator incorporating owner baseline assumptions (US: $7.53, UK: $5.62, NZ: $5.56, UAE: $2.33, PK: $2.50, IN: $2.50) with formula transparency.
* **Exactly Six Interactive Chart.js Visualizations**: Clean white surfaces featuring Subscriber Growth (Line), Video Uploads by Month (Bar), Views Over Time (Pie), Revenue Trends (Doughnut), Engagement Metrics (Radar), and Audience Geography (Polar Area).
* **Demo Mode Toggle**: Preview all six chart designs with mock data clearly stamped: `DEMO DATA — NOT REAL CHANNEL ANALYTICS`.
* **10 Complete In-Depth SEO Articles**: Rich original guides (800–1,200 words) with structured JSON-LD data, FAQs, and internal links.
* **Full Legal Suite**: Privacy Policy, Terms of Service, Disclaimer, About Us, and Contact Us.

---

## 2. Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion
* **Visualizations**: Chart.js v4 (Canvas-based with explicit instance destroy lifecycle)
* **Backend**: Node.js, Express, Cookie-Parser, Dotenv
* **Typography**: Orbitron (Headings), Poppins (Body text) via Google Fonts
* **APIs**: YouTube Data API v3 (Public), YouTube Analytics API (OAuth Owner)

---

## 3. Installation & Local Development

### Prerequisites
* Node.js 20+ installed
* npm or bun package manager

### Steps
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Set your Google Cloud `YOUTUBE_API_KEY` in `.env` (see `API_SETUP.md` for steps).
4. Run the full-stack development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

---

## 4. Production Build & Start

To build and run the production bundle:
```bash
# Build the client bundle with Vite
npm run build

# Start the Express server
npm start
```

---

## 5. Environment Variables Summary

| Variable | Requirement | Description |
| :--- | :--- | :--- |
| `YOUTUBE_API_KEY` | **Mandatory for live search** | Google Cloud API key with YouTube Data API v3 enabled. |
| `APP_URL` | Recommended | Public domain for sitemaps, canonical tags, and OAuth redirection. |
| `PORT` | Optional (default: 3000) | Server port. |
| `GOOGLE_CLIENT_ID` | Optional (Owner OAuth) | OAuth 2.0 Web Client ID for channel owners. |
| `GOOGLE_CLIENT_SECRET`| Optional (Owner OAuth) | OAuth 2.0 Client Secret. |
| `GOOGLE_OAUTH_REDIRECT_URI` | Optional (Owner OAuth) | Callback URL (`${APP_URL}/api/oauth/callback`). |
| `TOKEN_ENCRYPTION_KEY` | Optional | Key for server-side token encryption. |

---

## 6. Vercel Deployment Instructions

1. Push this repository to GitHub or GitLab.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. Configure the **Build & Development Settings**:
   * Framework Preset: **Other** / **Vite**
   * Build Command: `npm run build`
   * Output Directory: `dist`
4. In **Environment Variables**, add:
   * `YOUTUBE_API_KEY`: Your restricted Google Cloud API key.
   * `APP_URL`: Your Vercel production domain (e.g. `https://channelscope.vercel.app`).
   * (Optional) `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if enabling owner OAuth.
5. Deploy.

---

## 7. Security & Quota Architecture

1. **Strict Key Containment**: `YOUTUBE_API_KEY` is kept server-side. It is never bundled into client JS or printed in console logs.
2. **Quota Conservation**: Lookups check an in-memory cache (15-min TTL) to prevent repeated requests for identical channels. Direct IDs and handles use single-credit `channels.list` rather than 100-credit searches.
3. **OAuth Token Security**: Access tokens are kept in secure server memory/sessions with `httpOnly, Secure` cookies. No tokens are written to `localStorage`.
4. **Data Integrity**: We never invent values to fill cards, never imply verified badges, and display clear source distinctions: **Public API Data**, **Owner Analytics**, or **Estimated Data**.

---

## 8. Independence Statement

"ChannelScope Analytics is an independent analytics and estimation tool and is not affiliated with, endorsed by, or officially connected to YouTube or Google."
