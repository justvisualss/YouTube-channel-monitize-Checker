import React, { useState } from 'react';
import {
  Calculator,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  INITIAL_RPM_ASSUMPTIONS,
  calculateEstimatedRevenue,
  MANDATORY_REVENUE_NOTICE,
} from '../config/rpmConfig';
import { formatCurrency, formatCompactNumber, formatExactNumber } from '../utils/formatters';

interface RevenueCalculatorProps {
  lifetimeViews: number;
  selectedMarketCode: string;
  onMarketChange: (code: string) => void;
  monthlyViews: number | undefined;
  onMonthlyViewsChange: (views: number) => void;
  channelTitle?: string;
}

export const RevenueCalculator: React.FC<RevenueCalculatorProps> = ({
  lifetimeViews,
  selectedMarketCode,
  onMarketChange,
  monthlyViews,
  onMonthlyViewsChange,
  channelTitle,
}) => {
  const [localMonthlyInput, setLocalMonthlyInput] = useState<string>(
    monthlyViews ? String(monthlyViews) : '250000'
  );
  const [calculationPeriod, setCalculationPeriod] = useState<'monthly' | 'annual' | 'lifetime'>('monthly');

  const market = INITIAL_RPM_ASSUMPTIONS[selectedMarketCode] || INITIAL_RPM_ASSUMPTIONS['US'];
  const parsedMonthlyViews = Math.max(0, parseInt(localMonthlyInput.replace(/,/g, ''), 10) || 0);

  const handleApplyMonthly = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onMonthlyViewsChange(parsedMonthlyViews);
  };

  const handlePreset = (views: number) => {
    setLocalMonthlyInput(String(views));
    onMonthlyViewsChange(views);
  };

  // Calculations
  const calculatedMonthly = calculateEstimatedRevenue(parsedMonthlyViews, market.rpm);
  const calculatedAnnual = calculatedMonthly * 12;
  const calculatedLifetime = calculateEstimatedRevenue(lifetimeViews, market.rpm);

  const displayAmount =
    calculationPeriod === 'monthly'
      ? calculatedMonthly
      : calculationPeriod === 'annual'
      ? calculatedAnnual
      : calculatedLifetime;

  const displayViews =
    calculationPeriod === 'monthly'
      ? parsedMonthlyViews
      : calculationPeriod === 'annual'
      ? parsedMonthlyViews * 12
      : lifetimeViews;

  return (
    <div className="card-surface rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282846] mt-8 sm:mt-10 w-full min-w-0 overflow-hidden">
      {/* Title & Product Positioning */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#282846] pb-4 sm:pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#00ffcc] mb-1">
            <Calculator className="w-4 h-4" />
            Transparent Mathematical Estimator
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-white break-words">
            Country-Based RPM & Revenue Calculator
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Simulate potential AdSense earnings using verified mathematical formulas and website-owner baseline RPM assumptions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#101026] p-1 rounded-xl border border-[#282846] self-start md:self-auto flex-wrap">
          {(['monthly', 'annual', 'lifetime'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setCalculationPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                calculationPeriod === period
                  ? 'bg-[#ff4d4d] text-white shadow-md font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mt-6 w-full min-w-0">
        {/* Left Column: Form & Inputs */}
        <div className="lg:col-span-7 space-y-6 w-full min-w-0">
          {/* Market Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              1. Select Audience Market (RPM Assumption)
            </label>
            <p className="text-[11px] text-gray-400 mb-3">
              Note: Do not assume the channel’s registered country is its audience market. RPM reflects viewer location purchasing power.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(INITIAL_RPM_ASSUMPTIONS).map((item) => (
                <button
                  key={item.countryCode}
                  type="button"
                  onClick={() => onMarketChange(item.countryCode)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMarketCode === item.countryCode
                      ? 'bg-[#00ffcc]/10 border-[#00ffcc] text-white ring-1 ring-[#00ffcc]'
                      : 'bg-[#101026] border-[#282846] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.flagEmoji}</span>
                    <span className="text-xs font-mono font-bold text-[#00ffcc]">
                      ${item.rpm.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs font-medium mt-1 truncate">{item.countryName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Views Input */}
          <form onSubmit={handleApplyMonthly} className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="monthlyViewsInput" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                2. Monthly View Count (Custom or Sampled)
              </label>
              <span className="text-[11px] text-gray-500">
                Supplied view count
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="monthlyViewsInput"
                  type="text"
                  value={localMonthlyInput}
                  onChange={(e) => setLocalMonthlyInput(e.target.value)}
                  placeholder="e.g. 500,000"
                  className="w-full bg-[#101026] border border-[#282846] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-500">views</span>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0f0f23] rounded-xl text-xs font-bold font-heading uppercase tracking-wider transition-colors"
              >
                Recalculate
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-400">
              <span className="text-[11px] text-gray-500">Presets:</span>
              {[50_000, 100_000, 500_000, 1_000_000, 5_000_000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="px-2 py-1 rounded bg-[#232342] hover:bg-[#2d2d54] text-gray-300 hover:text-white transition-colors"
                >
                  {formatCompactNumber(preset)}
                </button>
              ))}
            </div>
          </form>

          {/* Formula Transparency Box */}
          <div className="bg-[#101026] p-4 rounded-xl border border-[#282846] text-xs text-gray-400 space-y-1.5">
            <p className="font-semibold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff7e5f]" />
              Exact Formula Applied:
            </p>
            <p className="font-mono text-gray-200">
              Estimated Revenue = (Views / 1,000) × RPM
            </p>
            <p className="text-[11px] text-gray-400">
              ({formatExactNumber(displayViews)} / 1,000) × ${market.rpm.toFixed(2)} USD = {formatCurrency(displayAmount)}
            </p>
          </div>
        </div>

        {/* Right Column: Prominent Calculation Output */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#1a1a3a] to-[#12122b] p-4 sm:p-6 rounded-2xl border border-[#2d2d55] w-full min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 pb-3 border-b border-[#282846]">
              <span className="font-heading font-semibold uppercase tracking-wider text-gray-300">
                {calculationPeriod === 'monthly'
                  ? 'Monthly Scenario Estimate'
                  : calculationPeriod === 'annual'
                  ? 'Annualized 12-Month Run-Rate'
                  : 'Illustrative Lifetime Revenue Estimate'}
              </span>
              <span className="text-xs bg-[#ff7e5f]/20 text-[#ff7e5f] px-2 py-0.5 rounded font-medium">
                {market.countryName}
              </span>
            </div>

            <div className="my-4 sm:my-6">
              <p className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight break-words">
                {formatCurrency(displayAmount)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Calculated for{' '}
                <strong className="text-white font-mono">{formatExactNumber(displayViews)}</strong> views at{' '}
                <strong className="text-[#00ffcc] font-mono">${market.rpm.toFixed(2)} USD</strong> per 1,000 views.
              </p>
            </div>

            <div className="space-y-2 text-xs text-gray-300 pt-2 border-t border-[#282846]">
              <div className="flex justify-between py-1 border-b border-[#20203d]">
                <span className="text-gray-400">Selected Market:</span>
                <span className="font-semibold text-white">
                  {market.countryName} ({market.flagEmoji})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#20203d]">
                <span className="text-gray-400">Assumed RPM:</span>
                <span className="font-mono text-[#00ffcc] font-semibold">${market.rpm.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#20203d]">
                <span className="text-gray-400">View Source:</span>
                <span className="text-gray-300">
                  {calculationPeriod === 'lifetime'
                    ? 'Verified Public Channel Statistics'
                    : 'Visitor Supplied / Run-Rate'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Calculation Period:</span>
                <span className="capitalize font-semibold text-white">{calculationPeriod}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#282846]">
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00ffcc]" />
              RPM represents net creator revenue per 1,000 total views.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Revenue Notice (Exact Verbatim Specification) */}
      <div className="mt-8 p-4 rounded-xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-xs text-gray-300 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#ff4d4d] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white mb-0.5">Mandatory Notice & Assumptions Disclosure</p>
          <p className="leading-relaxed text-gray-300">
            "{MANDATORY_REVENUE_NOTICE}"
          </p>
        </div>
      </div>
    </div>
  );
};
