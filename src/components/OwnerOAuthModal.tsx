import React, { useEffect, useState } from 'react';
import {
  X,
  Youtube,
  Shield,
  DollarSign,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Lock,
  LogOut,
  HelpCircle,
} from 'lucide-react';

interface OwnerOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnerAuthorized: boolean;
  authorizedChannelTitle?: string;
  onDisconnect: () => void;
}

export const OwnerOAuthModal: React.FC<OwnerOAuthModalProps> = ({
  isOpen,
  onClose,
  isOwnerAuthorized,
  authorizedChannelTitle,
  onDisconnect,
}) => {
  const [oauthStatus, setOauthStatus] = useState<{
    hasCredentials: boolean;
    isAuthorized: boolean;
    channelTitle?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/oauth/status')
      .then((res) => res.json())
      .then((data) => setOauthStatus(data))
      .catch(() => setOauthStatus({ hasCredentials: false, isAuthorized: false }));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/oauth/url');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate OAuth URL');
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-surface rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-[#2d2d55] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-gray-400 hover:text-white bg-[#17172f] border border-[#282846]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-[#282846]">
          <div className="w-10 h-10 rounded-xl bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/30 flex items-center justify-center">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Connect YouTube Channel Owner Analytics
            </h3>
            <p className="text-xs text-gray-400">
              Optional Google OAuth 2.0 authorization for channel owners & managers
            </p>
          </div>
        </div>

        {/* Current State */}
        <div className="mt-6 space-y-4">
          {isOwnerAuthorized ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-sm">Channel Authorized & Connected</span>
              </div>
              <p className="text-xs text-emerald-200/90">
                Connected Channel: <strong>{authorizedChannelTitle || 'Your Channel'}</strong>. You now have access to verified historical owner analytics across the 6 dashboard charts.
              </p>
              <button
                onClick={onDisconnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#101026] border border-[#282846] space-y-2 text-xs text-gray-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#00ffcc]" />
                  Why Connect Your Own Channel?
                </p>
                <p className="leading-relaxed">
                  The public YouTube Data API only returns aggregated public totals. Connecting your own channel via Google OAuth enables private analytics:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 pl-1">
                  <li>Daily historical subscriber additions and losses</li>
                  <li>Realized YouTube Partner Program ad earnings & RPM</li>
                  <li>True geographic viewer distribution (viewer location vs. channel registration)</li>
                </ul>
              </div>

              {/* Monetary Permission Explanation */}
              <div className="p-4 rounded-xl bg-[#ff7e5f]/10 border border-[#ff7e5f]/30 space-y-1.5 text-xs text-gray-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#ff7e5f]" />
                  Why Monetary Permission is Requested:
                </p>
                <p className="leading-relaxed text-gray-300">
                  We request <code className="text-[#ff7e5f] font-mono">yt-analytics-monetary.readonly</code> strictly to calculate and display your actual verified net revenue in the dashboard. If your channel is not monetized through the YouTube Partner Program, monetary metrics will simply return $0.00.
                </p>
              </div>

              {/* Server Credentials Notice */}
              {oauthStatus && !oauthStatus.hasCredentials && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    OAuth Credentials Incomplete on Server
                  </div>
                  <p className="text-amber-200/90 leading-relaxed">
                    Google OAuth client credentials (<code className="font-mono text-white">GOOGLE_CLIENT_ID</code> and <code className="font-mono text-white">GOOGLE_CLIENT_SECRET</code>) are not yet configured in the environment.
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    Public channel analytics remain 100% operational without OAuth! To configure OAuth, create an OAuth 2.0 Web Client in Google Cloud Console and set the environment variables.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                disabled={loading || (oauthStatus !== null && !oauthStatus.hasCredentials)}
                className="w-full py-3 bg-[#ff4d4d] hover:bg-[#e04343] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Youtube className="w-4 h-4" />
                <span>
                  {oauthStatus && !oauthStatus.hasCredentials
                    ? 'OAuth Setup Required (See Guide)'
                    : 'Authorize with Google OAuth'}
                </span>
              </button>
            </div>
          )}

          {/* Privacy & Token Protection Assurance */}
          <div className="pt-4 border-t border-[#282846] text-[11px] text-gray-400 space-y-1">
            <p className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#00ffcc]" />
              Zero Browser Token Storage Guarantee
            </p>
            <p className="leading-relaxed">
              Tokens are managed exclusively through secure, httpOnly server sessions and are never stored in client-side localStorage. OAuth authorization only permits viewing your own channel, never another creator's private data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
