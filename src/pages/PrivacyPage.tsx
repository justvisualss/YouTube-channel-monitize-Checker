import React from 'react';
import { Shield, Lock, Eye, Database, Server, RefreshCw } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#282846] pb-6 space-y-2">
        <span className="text-xs uppercase font-semibold tracking-wider text-[#00ffcc]">
          Legal & Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-400">
          Last updated: February 2026 • Policy Version 2.4
        </p>
      </div>

      <div className="card-surface rounded-2xl p-6 sm:p-8 border border-[#282846] space-y-6 text-sm text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00ffcc]" />
            1. Information We Collect
          </h2>
          <p>
            ChannelScope Analytics respects visitor privacy. When you interact with our website, we process the following categories of information:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-xs sm:text-sm">
            <li><strong>Channel Search Queries:</strong> Channel names, handles, URLs, and Channel IDs submitted into the search bar.</li>
            <li><strong>Technical Connection Telemetry:</strong> Standard web server request logs, including IP addresses, user-agent strings, and request timestamps necessary for DDoS mitigation and API rate limiting.</li>
            <li><strong>Contact Submissions:</strong> Names, email addresses, and message contents voluntarily provided through the Contact form.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-[#ff7e5f]" />
            2. Search Request Processing & Public API Usage
          </h2>
          <p>
            When you initiate a search, our server queries Google’s official YouTube Data API v3 on your behalf. Public channel metadata (channel title, description, subscriber scale, lifetime views, and public uploads) is cached in server memory for up to 15 minutes to conserve quota. Search queries are not tied to personal identities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00ffcc]" />
            3. Google OAuth Permissions & Token Security
          </h2>
          <p>
            If you optionally choose to connect your channel using "Connect YouTube" for private owner analytics:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-xs sm:text-sm">
            <li>We request read-only access to YouTube Analytics (<code className="text-[#00ffcc] font-mono">yt-analytics.readonly</code>) and monetary reports (<code className="text-[#ff7e5f] font-mono">yt-analytics-monetary.readonly</code>).</li>
            <li><strong>No Browser Local Storage:</strong> OAuth access tokens are handled strictly on the server and mapped to a secure, cryptographically random session identifier stored in an <code className="text-white font-mono">httpOnly, Secure</code> cookie. Sensitive tokens are never placed in browser <code className="font-mono text-gray-400">localStorage</code>.</li>
            <li><strong>Authorization Boundaries:</strong> You can only authorize and view analytics for channels your Google account legitimately manages. You cannot view private analytics of other creators.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#ff4d4d]" />
            4. Cookies and Local Preferences
          </h2>
          <p>
            ChannelScope Analytics uses strictly necessary cookies:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-xs sm:text-sm">
            <li><code className="text-white font-mono">cs_oauth_state</code>: Temporary anti-CSRF token used exclusively during the OAuth authorization round-trip.</li>
            <li><code className="text-white font-mono">cs_owner_session</code>: Encrypted session cookie storing authenticated owner state for returning channel owners.</li>
          </ul>
          <p className="text-xs text-gray-400">
            We do not use invasive third-party cross-site advertising cookies or fingerprinting trackers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#feb47b]" />
            5. Data Retention, Revocation, and Deletion
          </h2>
          <p>
            You may disconnect your YouTube channel at any time by clicking "Disconnect Account" in the Owner Modal, which immediately purges active tokens from server memory and clears your session cookie. Furthermore, you may revoke ChannelScope's permissions directly via your Google Account Security Settings at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#00ffcc] hover:underline">myaccount.google.com/permissions</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            6. Third-Party Services
          </h2>
          <p>
            This website relies on services provided by Google LLC (YouTube Data API v3, YouTube Analytics API, and Google OAuth 2.0). By using this site, users acknowledge that public video and channel retrieval is subject to Google's Privacy Policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00ffcc] hover:underline">policies.google.com/privacy</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
