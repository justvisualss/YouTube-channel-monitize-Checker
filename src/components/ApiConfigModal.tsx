import React from 'react';
import { X, Key, CheckCircle, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  hasApiKey,
}) => {
  if (!isOpen) return null;

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
          <div className="w-10 h-10 rounded-xl bg-[#00ffcc]/15 text-[#00ffcc] border border-[#00ffcc]/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              YouTube Data API v3 Configuration
            </h3>
            <p className="text-xs text-gray-400">
              Server-side credentials & quota architecture
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5 text-xs text-gray-300">
          {/* Status Indicator */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {hasApiKey ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {hasApiKey ? 'Server API Key Configured' : 'Live API Key Not Detected in Environment'}
                </p>
                <p className="text-[11px] opacity-80">
                  {hasApiKey
                    ? 'Requests are routed through live YouTube Data API v3 endpoints.'
                    : 'ChannelScope supports exploring verified channel models in Demo Mode.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-white">
              How to configure your live YouTube API key:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 pl-1 leading-relaxed">
              <li>
                Open the{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ffcc] hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a project (e.g., <em>ChannelScope Project</em>).
              </li>
              <li>
                Navigate to <strong>APIs & Services &gt; Library</strong>, search for{' '}
                <strong className="text-white">YouTube Data API v3</strong>, and click <strong>Enable</strong>.
              </li>
              <li>
                Go to <strong>Credentials &gt; Create Credentials &gt; API Key</strong>.
              </li>
              <li>
                Restrict the key to <strong>YouTube Data API v3</strong> under API restrictions for enhanced security.
              </li>
              <li>
                Set the environment variable <code className="font-mono text-white bg-black/40 px-1 py-0.5 rounded">YOUTUBE_API_KEY</code> on your server or Vercel dashboard.
              </li>
            </ol>
          </div>

          {/* Security Guarantee */}
          <div className="p-3.5 rounded-xl bg-[#101026] border border-[#282846] text-[11px] text-gray-400 space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00ffcc]" />
              Strict Server-Side Key Protection
            </p>
            <p>
              As mandated by ChannelScope security guidelines, the API key is never bundled into client JavaScript, never printed in browser console logs, and never returned in API payloads. All requests pass through secure server proxies with response caching.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#232342] hover:bg-[#2d2d55] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
