import React from 'react';
import { AlertCircle, HelpCircle, ShieldAlert, CheckCircle2, Lock, DollarSign } from 'lucide-react';
import { MANDATORY_INDEPENDENCE_NOTICE, MANDATORY_REVENUE_NOTICE } from '../config/rpmConfig';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#282846] pb-6 space-y-2">
        <span className="text-xs uppercase font-semibold tracking-wider text-[#ff4d4d]">
          Platform Disclosures
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
          Disclaimer & Data Integrity Disclosures
        </h1>
        <p className="text-xs text-gray-400">
          Essential clarifications on public YouTube data, revenue estimates, and independence.
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Independence Statement */}
        <div className="p-5 rounded-2xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-xs sm:text-sm text-gray-200 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-[#ff4d4d] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-white text-base">
              Non-Affiliation Notice
            </h3>
            <p className="leading-relaxed">
              "{MANDATORY_INDEPENDENCE_NOTICE}"
            </p>
            <p className="text-xs text-gray-400 pt-1">
              YouTube and the YouTube logo are trademarks of Google LLC. ChannelScope Analytics is a separate, independent software tool operating strictly via publicly published Google developer APIs.
            </p>
          </div>
        </div>

        {/* Five Key Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Public Data Rounding */}
          <div className="card-surface rounded-xl p-5 border border-[#282846] space-y-2">
            <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00ffcc]" />
              1. Public Data May Be Limited or Rounded
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Google enforces abbreviated milestone counters for subscriber figures (e.g., 250K or 1.25M) on all public data feeds. Exact single-digit values are exclusively accessible to channel owners within YouTube Studio.
            </p>
          </div>

          {/* 2. Revenue Figures are Estimates */}
          <div className="card-surface rounded-xl p-5 border border-[#282846] space-y-2">
            <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#ff7e5f]" />
              2. Revenue Figures are Illustrative Estimates
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              "{MANDATORY_REVENUE_NOTICE}"
            </p>
          </div>

          {/* 3. Public Stats Do Not Prove Earnings */}
          <div className="card-surface rounded-xl p-5 border border-[#282846] space-y-2">
            <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              3. Public Stats Do Not Prove Monetization
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              The presence of video views or subscriber counts does not verify whether a channel has been approved for the YouTube Partner Program, whether individual uploads have demonetization flags, or what percentage of viewers use ad blockers.
            </p>
          </div>

          {/* 4. Private Analytics Require Owner OAuth */}
          <div className="card-surface rounded-xl p-5 border border-[#282846] space-y-2">
            <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00ffcc]" />
              4. Private Analytics Require Owner Authorization
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Historical daily subscriber gain/loss charts, actual geographic viewer distribution, and verified AdSense payouts are confidential creator assets accessible only after authenticating via Google OAuth 2.0.
            </p>
          </div>
        </div>

        {/* Registered Country Note */}
        <div className="card-surface rounded-xl p-5 border border-[#282846] space-y-2 text-xs text-gray-300">
          <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#feb47b]" />
            5. Channel Registered Country vs. Audience Location
          </h4>
          <p className="leading-relaxed">
            The country field retrieved from a channel's public profile indicates the geographic jurisdiction where the channel account was registered with Google. It does not reflect where the channel’s audience watches from. Advertisers pay based on viewer geography, not the creator's residency.
          </p>
        </div>
      </div>
    </div>
  );
};
