import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Calculator,
  Lock,
  AlertTriangle,
  ArrowRight,
  Database,
  BarChart,
} from 'lucide-react';
import { MANDATORY_INDEPENDENCE_NOTICE } from '../config/rpmConfig';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="border-b border-[#282846] pb-6 space-y-2">
        <span className="text-xs uppercase font-semibold tracking-wider text-[#00ffcc]">
          Platform Overview
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
          About ChannelScope Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          An independent YouTube channel analytics, publishing velocity inspector, and transparent RPM revenue estimation platform.
        </p>
      </div>

      {/* Section 1: What ChannelScope Does */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <BarChart className="w-5 h-5 text-[#ff7e5f]" />
          What ChannelScope Analytics Does
        </h2>
        <div className="card-surface rounded-2xl p-6 border border-[#282846] text-sm text-gray-300 space-y-3 leading-relaxed">
          <p>
            ChannelScope Analytics provides creators, digital marketers, research analysts, and viewers with immediate, verifiable visibility into any publicly accessible YouTube channel.
          </p>
          <p>
            Unlike typical "black-box" platforms that invent arbitrary rankings or present inflated CPM calculations, ChannelScope is built on transparent data architecture:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-400 pl-2">
            <li>Instant lookup by Channel ID, @handle, custom URL, or creator name</li>
            <li>Direct retrieval of public subscriber milestones, lifetime views, and public upload counts</li>
            <li>Inspection of actual recent video uploads with like, comment, and duration metrics</li>
            <li>Grouping of video releases into monthly upload velocity trends</li>
            <li>Six standardized Chart.js interactive visualizations</li>
          </ul>
        </div>
      </section>

      {/* Section 2: How Public Data is Retrieved */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#00ffcc]" />
          How Public Channel Data is Retrieved
        </h2>
        <div className="card-surface rounded-2xl p-6 border border-[#282846] text-sm text-gray-300 space-y-3 leading-relaxed">
          <p>
            All public channel intelligence displayed on ChannelScope is requested directly through Google’s official <strong>YouTube Data API v3</strong> using secure, server-side endpoints.
          </p>
          <p>
            To conserve API quota and deliver sub-second performance, our backend utilizes the least expensive reliable lookup method first:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#101026] rounded-xl border border-[#282846] text-xs">
              <span className="font-semibold text-white block mb-1">Direct ID / Handle Lookup</span>
              Uses <code className="text-[#00ffcc] font-mono">channels.list</code> (1 quota unit) to avoid wasteful search queries when exact identifiers are provided.
            </div>
            <div className="p-3 bg-[#101026] rounded-xl border border-[#282846] text-xs">
              <span className="font-semibold text-white block mb-1">Search Fallback & Disambiguation</span>
              Uses <code className="text-[#ff7e5f] font-mono">search.list</code> only for ambiguous text queries, presenting a channel selection interface rather than making blind guesses.
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How RPM Estimates are Calculated */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#ff4d4d]" />
          How RPM Estimates are Calculated
        </h2>
        <div className="card-surface rounded-2xl p-6 border border-[#282846] text-sm text-gray-300 space-y-3 leading-relaxed">
          <p>
            YouTube does not expose creator bank statements or private ad contracts through public APIs. Therefore, all revenue figures on ChannelScope are calculated using transparent mathematical models based on <strong>Revenue Per Mille (RPM)</strong>:
          </p>
          <div className="bg-[#101026] p-4 rounded-xl border border-[#282846] font-mono text-center text-xs sm:text-sm text-[#00ffcc]">
            Estimated Revenue = (Views / 1,000) × Assumed RPM
          </div>
          <p>
            We supply baseline RPM benchmarks configured directly by the website owner (e.g. US: $7.53, UK: $5.62, NZ: $5.56, UAE: $2.33, PK: $2.50, IN: $2.50). Users can toggle audience markets or supply specific monthly view run-rates.
          </p>
          <p className="text-xs text-amber-300">
            <strong>Critical Principle:</strong> We never divide lifetime views by an invented number of months to fabricate a monthly income figure. Monthly revenue requires either authorized owner views or user-supplied run-rates.
          </p>
        </div>
      </section>

      {/* Section 4: Public vs Private Owner Analytics */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#00ffcc]" />
          Public Statistics vs. Private Owner Analytics
        </h2>
        <div className="card-surface rounded-2xl p-6 border border-[#282846] text-sm text-gray-300 space-y-3 leading-relaxed">
          <p>
            Google maintains a strict security boundary between public catalog data and private business intelligence:
          </p>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#282846] text-gray-400">
                  <th className="py-2 pr-4">Dimension</th>
                  <th className="py-2 pr-4">Public Visitor View</th>
                  <th className="py-2">Authorized Channel Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20203d]">
                <tr>
                  <td className="py-2 font-semibold text-white">Subscriber Count</td>
                  <td className="py-2 text-gray-400">Abbreviated / Rounded milestone</td>
                  <td className="py-2 text-emerald-400">Exact single-digit count</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-white">Historical Velocity</td>
                  <td className="py-2 text-gray-400">Locked / Unavailable</td>
                  <td className="py-2 text-emerald-400">Daily subscribers gained & lost</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-white">Audience Location</td>
                  <td className="py-2 text-gray-400">Account registration country only</td>
                  <td className="py-2 text-emerald-400">Actual viewer country breakdown</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-white">AdSense Earnings</td>
                  <td className="py-2 text-gray-400">Illustrative RPM simulation</td>
                  <td className="py-2 text-emerald-400">Verified monthly revenue reports</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Tool Limitations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Platform Limitations
        </h2>
        <div className="card-surface rounded-2xl p-6 border border-[#282846] text-xs sm:text-sm text-gray-400 space-y-2 leading-relaxed">
          <p>
            1. <strong>Verification Badges:</strong> The public YouTube Data API does not expose official channel verification status badges. ChannelScope never invents or implies verification badges.
          </p>
          <p>
            2. <strong>Recent Video Sampling:</strong> To prevent quota exhaustion, video-level metrics (likes, comments, duration) are sampled from the most recent uploads in the channel's uploads playlist. This sample does not represent the entire historical catalog.
          </p>
          <p>
            3. <strong>Monetization Status:</strong> High view counts do not prove that a channel is accepted into or remains active in the YouTube Partner Program.
          </p>
        </div>
      </section>

      {/* Mandatory Independence Notice */}
      <div className="p-4 rounded-xl bg-[#14142a] border border-[#232342] text-xs text-gray-400">
        <p className="leading-relaxed">
          <strong>Notice:</strong> "{MANDATORY_INDEPENDENCE_NOTICE}"
        </p>
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0f0f23] font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <span>Try YouTube Analytics Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
