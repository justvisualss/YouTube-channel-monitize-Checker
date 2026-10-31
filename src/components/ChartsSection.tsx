import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  LineChart,
  BarChart3,
  PieChart as PieIcon,
  CircleDollarSign,
  Radar,
  Compass,
  Lock,
  Info,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react';
import { YouTubeVideoItem, OwnerAnalyticsSummary } from '../types/youtube';
import { INITIAL_RPM_ASSUMPTIONS, calculateEstimatedRevenue } from '../config/rpmConfig';
import { formatCompactNumber, formatCurrency, formatExactNumber } from '../utils/formatters';

Chart.register(...registerables);

interface ChartsSectionProps {
  videos: YouTubeVideoItem[];
  ownerAnalytics: OwnerAnalyticsSummary | null;
  isOwnerAuthorized: boolean;
  isDemoMode: boolean;
  manualMonthlyViews?: number;
  selectedMarketCode: string;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  videos,
  ownerAnalytics,
  isOwnerAuthorized,
  isDemoMode,
  manualMonthlyViews,
  selectedMarketCode,
}) => {
  const [showDataTables, setShowDataTables] = useState<Record<string, boolean>>({});

  const toggleTable = (id: string) => {
    setShowDataTables((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Canvas Refs
  const chart1Ref = useRef<HTMLCanvasElement | null>(null);
  const chart2Ref = useRef<HTMLCanvasElement | null>(null);
  const chart3Ref = useRef<HTMLCanvasElement | null>(null);
  const chart4Ref = useRef<HTMLCanvasElement | null>(null);
  const chart5Ref = useRef<HTMLCanvasElement | null>(null);
  const chart6Ref = useRef<HTMLCanvasElement | null>(null);

  // Instance Refs
  const chart1Inst = useRef<Chart | null>(null);
  const chart2Inst = useRef<Chart | null>(null);
  const chart3Inst = useRef<Chart | null>(null);
  const chart4Inst = useRef<Chart | null>(null);
  const chart5Inst = useRef<Chart | null>(null);
  const chart6Inst = useRef<Chart | null>(null);

  // -------------------------------------------------------------
  // CHART 1: Subscriber Growth (Line Chart)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!chart1Ref.current) return;
    if (chart1Inst.current) {
      chart1Inst.current.destroy();
      chart1Inst.current = null;
    }

    if (!isOwnerAuthorized && !isDemoMode) return;
    if (!ownerAnalytics || !ownerAnalytics.dailyMetrics || ownerAnalytics.dailyMetrics.length === 0) return;

    const ctx = chart1Ref.current.getContext('2d');
    if (!ctx) return;

    const labels = ownerAnalytics.dailyMetrics.map((m) => m.date);
    const gained = ownerAnalytics.dailyMetrics.map((m) => m.subscribersGained);
    const lost = ownerAnalytics.dailyMetrics.map((m) => m.subscribersLost);
    const net = ownerAnalytics.dailyMetrics.map((m) => m.netSubscribers);

    chart1Inst.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Subscribers Gained',
            data: gained,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Subscribers Lost',
            data: lost,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Net Subscriber Change',
            data: net,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: ${formatExactNumber(item.parsed.y)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => formatCompactNumber(Number(val)),
            },
          },
        },
      },
    });

    return () => {
      if (chart1Inst.current) {
        chart1Inst.current.destroy();
        chart1Inst.current = null;
      }
    };
  }, [ownerAnalytics, isOwnerAuthorized, isDemoMode]);

  // -------------------------------------------------------------
  // CHART 2: Video Uploads by Month (Bar Chart)
  // -------------------------------------------------------------
  const uploadGroups = React.useMemo(() => {
    if (!videos || videos.length === 0) return [];
    const map = new Map<string, number>();

    videos.forEach((v) => {
      if (!v.publishedAt) return;
      try {
        const d = new Date(v.publishedAt);
        if (!isNaN(d.getTime())) {
          const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          map.set(key, (map.get(key) || 0) + 1);
        }
      } catch {
        // ignore invalid dates
      }
    });

    return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
  }, [videos]);

  useEffect(() => {
    if (!chart2Ref.current) return;
    if (chart2Inst.current) {
      chart2Inst.current.destroy();
      chart2Inst.current = null;
    }

    if (uploadGroups.length === 0) return;
    const ctx = chart2Ref.current.getContext('2d');
    if (!ctx) return;

    chart2Inst.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: uploadGroups.map((g) => g.month),
        datasets: [
          {
            label: 'Upload Count',
            data: uploadGroups.map((g) => g.count),
            backgroundColor: '#ff7e5f',
            borderColor: '#e06042',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Videos published: ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });

    return () => {
      if (chart2Inst.current) {
        chart2Inst.current.destroy();
        chart2Inst.current = null;
      }
    };
  }, [uploadGroups]);

  // -------------------------------------------------------------
  // CHART 3: Views Over Time / Buckets (Pie Chart)
  // -------------------------------------------------------------
  const viewDistribution = React.useMemo(() => {
    if ((!isOwnerAuthorized && !isDemoMode) || !ownerAnalytics?.dailyMetrics) return null;
    const metrics = ownerAnalytics.dailyMetrics;
    if (metrics.length === 0) return null;

    // Divide period into 3 weekly buckets
    const bucketSize = Math.ceil(metrics.length / 3);
    const b1 = metrics.slice(0, bucketSize).reduce((acc, m) => acc + m.views, 0);
    const b2 = metrics.slice(bucketSize, bucketSize * 2).reduce((acc, m) => acc + m.views, 0);
    const b3 = metrics.slice(bucketSize * 2).reduce((acc, m) => acc + m.views, 0);

    return [
      { label: 'Week 1-10 Period', views: b1 },
      { label: 'Week 11-20 Period', views: b2 },
      { label: 'Week 21-30 Period', views: b3 },
    ];
  }, [ownerAnalytics, isOwnerAuthorized, isDemoMode]);

  useEffect(() => {
    if (!chart3Ref.current) return;
    if (chart3Inst.current) {
      chart3Inst.current.destroy();
      chart3Inst.current = null;
    }

    if (!viewDistribution) return;
    const ctx = chart3Ref.current.getContext('2d');
    if (!ctx) return;

    chart3Inst.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: viewDistribution.map((d) => d.label),
        datasets: [
          {
            data: viewDistribution.map((d) => d.views),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => `${item.label}: ${formatCompactNumber(item.parsed)} views`,
            },
          },
        },
      },
    });

    return () => {
      if (chart3Inst.current) {
        chart3Inst.current.destroy();
        chart3Inst.current = null;
      }
    };
  }, [viewDistribution]);

  // -------------------------------------------------------------
  // CHART 4: Revenue Trends / Regional Scenario (Doughnut Chart)
  // -------------------------------------------------------------
  const revenueScenario = React.useMemo(() => {
    // If owner authorized & verified revenue reports exist
    if ((isOwnerAuthorized || isDemoMode) && ownerAnalytics?.dailyMetrics?.some((m) => (m.estimatedRevenue || 0) > 0)) {
      return {
        type: 'verified',
        labels: ownerAnalytics.dailyMetrics.map((m) => m.date),
        values: ownerAnalytics.dailyMetrics.map((m) => m.estimatedRevenue || 0),
      };
    }

    // Otherwise, generate scenario across markets based on monthly views
    const views = manualMonthlyViews && manualMonthlyViews > 0 ? manualMonthlyViews : 100_000;
    const markets = Object.values(INITIAL_RPM_ASSUMPTIONS);
    return {
      type: 'scenario',
      labels: markets.map((m) => `${m.countryName} ($${m.rpm})`),
      values: markets.map((m) => calculateEstimatedRevenue(views, m.rpm)),
      views,
    };
  }, [ownerAnalytics, isOwnerAuthorized, isDemoMode, manualMonthlyViews]);

  useEffect(() => {
    if (!chart4Ref.current) return;
    if (chart4Inst.current) {
      chart4Inst.current.destroy();
      chart4Inst.current = null;
    }

    const ctx = chart4Ref.current.getContext('2d');
    if (!ctx) return;

    chart4Inst.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: revenueScenario.labels,
        datasets: [
          {
            data: revenueScenario.values,
            backgroundColor: ['#ff4d4d', '#ff7e5f', '#feb47b', '#00ffcc', '#38bdf8', '#a855f7'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => `${item.label}: ${formatCurrency(item.parsed)}`,
            },
          },
        },
      },
    });

    return () => {
      if (chart4Inst.current) {
        chart4Inst.current.destroy();
        chart4Inst.current = null;
      }
    };
  }, [revenueScenario]);

  // -------------------------------------------------------------
  // CHART 5: Engagement Metrics (Radar Chart)
  // -------------------------------------------------------------
  const engagementData = React.useMemo(() => {
    if (!videos || videos.length === 0) return null;

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let validSampleCount = 0;

    videos.forEach((v) => {
      if (v.viewCount && v.viewCount > 0) {
        totalViews += v.viewCount;
        totalLikes += v.likeCount || 0;
        totalComments += v.commentCount || 0;
        validSampleCount++;
      }
    });

    if (validSampleCount === 0 || totalViews === 0) return null;

    const likesPer1k = (totalLikes / totalViews) * 1000;
    const commentsPer1k = (totalComments / totalViews) * 1000;

    // Normalizing metrics on 0-100 scale for radar representation
    // Industry baseline: 40 likes/1k is ~80 score, 5 comments/1k is ~80 score
    const likesScore = Math.min(Math.round((likesPer1k / 50) * 100), 100);
    const commentsScore = Math.min(Math.round((commentsPer1k / 6) * 100), 100);
    const uploadConsistencyScore = Math.min(Math.round(videos.length * 10), 100);
    const viewDepthScore = Math.min(Math.round((totalViews / validSampleCount / 200_000) * 50) + 40, 100);
    const interactionBreadth = Math.min(Math.round((likesScore + commentsScore) / 2), 100);

    return {
      sampleSize: validSampleCount,
      likesPer1k: likesPer1k.toFixed(1),
      commentsPer1k: commentsPer1k.toFixed(1),
      scores: [likesScore, commentsScore, uploadConsistencyScore, viewDepthScore, interactionBreadth],
    };
  }, [videos]);

  useEffect(() => {
    if (!chart5Ref.current) return;
    if (chart5Inst.current) {
      chart5Inst.current.destroy();
      chart5Inst.current = null;
    }

    if (!engagementData) return;
    const ctx = chart5Ref.current.getContext('2d');
    if (!ctx) return;

    chart5Inst.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Likes per 1k Views',
          'Comments per 1k Views',
          'Upload Consistency',
          'View Performance',
          'Interaction Breadth',
        ],
        datasets: [
          {
            label: 'Normalized Score (0-100)',
            data: engagementData.scores,
            backgroundColor: 'rgba(0, 255, 204, 0.25)',
            borderColor: '#00c79e',
            pointBackgroundColor: '#00ffcc',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { stepSize: 20 },
          },
        },
      },
    });

    return () => {
      if (chart5Inst.current) {
        chart5Inst.current.destroy();
        chart5Inst.current = null;
      }
    };
  }, [engagementData]);

  // -------------------------------------------------------------
  // CHART 6: Audience Demographics (Polar Area Chart)
  // -------------------------------------------------------------
  const audienceGeo = React.useMemo(() => {
    if ((!isOwnerAuthorized && !isDemoMode) || !ownerAnalytics?.audienceGeography) return null;
    return ownerAnalytics.audienceGeography;
  }, [ownerAnalytics, isOwnerAuthorized, isDemoMode]);

  useEffect(() => {
    if (!chart6Ref.current) return;
    if (chart6Inst.current) {
      chart6Inst.current.destroy();
      chart6Inst.current = null;
    }

    if (!audienceGeo || audienceGeo.length === 0) return;
    const ctx = chart6Ref.current.getContext('2d');
    if (!ctx) return;

    chart6Inst.current = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: audienceGeo.map((g) => `${g.country} (${g.percentage}%)`),
        datasets: [
          {
            data: audienceGeo.map((g) => g.views),
            backgroundColor: [
              'rgba(255, 77, 77, 0.7)',
              'rgba(255, 126, 95, 0.7)',
              'rgba(254, 180, 123, 0.7)',
              'rgba(0, 255, 204, 0.7)',
              'rgba(56, 189, 248, 0.7)',
              'rgba(168, 85, 247, 0.7)',
            ],
            borderWidth: 1,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => `${item.label}: ${formatCompactNumber(item.parsed.r)} views`,
            },
          },
        },
      },
    });

    return () => {
      if (chart6Inst.current) {
        chart6Inst.current.destroy();
        chart6Inst.current = null;
      }
    };
  }, [audienceGeo]);

  return (
    <div className="mt-12 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#282846] pb-4">
        <div>
          <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#00ffcc]" />
            Six Core Visualizations
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Standardized Chart.js analytics engine rendering public signals and authorized owner reports.
          </p>
        </div>

        {isDemoMode && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ff4d4d]/15 border border-[#ff4d4d]/30 text-[#ff4d4d] text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            DEMO DATA — NOT REAL CHANNEL ANALYTICS
          </div>
        )}
      </div>

      {/* Grid of 6 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Subscriber Growth */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-emerald-600" />
                <h4 className="font-heading font-semibold text-lg text-gray-900">
                  Chart 1 — Subscriber Growth
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-700">
                Line Chart
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Historical daily subscriber velocity (gained vs. lost). Does not reconstruct historical total subscribers from an invented baseline.
            </p>

            {(!isOwnerAuthorized && !isDemoMode) ? (
              <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <Lock className="w-10 h-10 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-800 text-sm">Owner Authorization Required</p>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Historical daily subscriber gains and losses are private metrics protected by Google. Connect your channel via OAuth to display real historical velocity.
                </p>
              </div>
            ) : (
              <div className="h-64 relative">
                <canvas ref={chart1Ref} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {isOwnerAuthorized || isDemoMode
                ? `Authorized 30-day snapshot (${ownerAnalytics?.dailyMetrics?.length || 0} days recorded)`
                : 'Locked for public visitors'}
            </span>
            {(isOwnerAuthorized || isDemoMode) && (
              <button
                onClick={() => toggleTable('chart1')}
                className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
              >
                <TableIcon className="w-3.5 h-3.5" />
                {showDataTables['chart1'] ? 'Hide Data' : 'View Table'}
              </button>
            )}
          </div>

          {showDataTables['chart1'] && ownerAnalytics?.dailyMetrics && (
            <div className="mt-3 overflow-x-auto text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-40">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="p-1">Date</th>
                    <th className="p-1">Gained</th>
                    <th className="p-1">Lost</th>
                    <th className="p-1">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerAnalytics.dailyMetrics.map((m, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-1">{m.date}</td>
                      <td className="p-1 text-emerald-600">+{m.subscribersGained}</td>
                      <td className="p-1 text-rose-600">-{m.subscribersLost}</td>
                      <td className="p-1 font-semibold">{m.netSubscribers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 2: Video Uploads */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h4 className="font-heading font-semibold text-lg text-gray-900">
                  Chart 2 — Video Uploads
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-700">
                Bar Chart
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Actual publication dates grouped by month from retrieved uploads. Clearly identifies sampled video coverage.
            </p>

            {uploadGroups.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <Info className="w-8 h-8 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-700 text-sm">No Upload Dates Available</p>
                <p className="text-xs text-gray-500 mt-1">Upload records could not be fetched for this channel.</p>
              </div>
            ) : (
              <div className="h-64 relative">
                <canvas ref={chart2Ref} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Sampled {videos.length} recent uploads ({uploadGroups.length} months represented)
            </span>
            <button
              onClick={() => toggleTable('chart2')}
              className="inline-flex items-center gap-1 font-medium text-orange-700 hover:underline"
            >
              <TableIcon className="w-3.5 h-3.5" />
              {showDataTables['chart2'] ? 'Hide Data' : 'View Table'}
            </button>
          </div>

          {showDataTables['chart2'] && (
            <div className="mt-3 overflow-x-auto text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-40">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="p-1">Month</th>
                    <th className="p-1">Uploads</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadGroups.map((g, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-1">{g.month}</td>
                      <td className="p-1 font-semibold">{g.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 3: Views Over Time */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-blue-600" />
                <h4 className="font-heading font-semibold text-lg text-gray-900">
                  Chart 3 — Views Over Time
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-700">
                Pie Chart
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Distribution of views across meaningful time buckets. Does not imply historical breakdown exists when unavailable.
            </p>

            {(!isOwnerAuthorized && !isDemoMode) ? (
              <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <Lock className="w-10 h-10 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-800 text-sm">Owner Analytics Required</p>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Historical view distribution over time requires authenticated YouTube Analytics API reports.
                </p>
              </div>
            ) : (
              <div className="h-64 relative">
                <canvas ref={chart3Ref} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {isOwnerAuthorized || isDemoMode
                ? 'Authorized time-bucketed share of views'
                : 'Locked for public-only channels'}
            </span>
            {(isOwnerAuthorized || isDemoMode) && viewDistribution && (
              <button
                onClick={() => toggleTable('chart3')}
                className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline"
              >
                <TableIcon className="w-3.5 h-3.5" />
                {showDataTables['chart3'] ? 'Hide Data' : 'View Table'}
              </button>
            )}
          </div>

          {showDataTables['chart3'] && viewDistribution && (
            <div className="mt-3 overflow-x-auto text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-40">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="p-1">Time Bucket</th>
                    <th className="p-1">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {viewDistribution.map((d, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-1">{d.label}</td>
                      <td className="p-1 font-semibold">{formatExactNumber(d.views)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 4: Revenue Trends */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-rose-600" />
                <h4 className="font-heading font-semibold text-lg text-gray-900">
                  Chart 4 — Revenue Trends
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-700">
                Doughnut Chart
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              {revenueScenario.type === 'verified'
                ? 'Verified monthly revenue distribution from authorized owner reports.'
                : 'Illustrative RPM Scenario: Regional revenue potential based on input monthly views.'}
            </p>

            <div className="h-64 relative">
              <canvas ref={chart4Ref} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {revenueScenario.type === 'verified'
                ? 'Verified Creator AdSense'
                : 'Label: Illustrative RPM Scenario'}
            </span>
            <button
              onClick={() => toggleTable('chart4')}
              className="inline-flex items-center gap-1 font-medium text-rose-700 hover:underline"
            >
              <TableIcon className="w-3.5 h-3.5" />
              {showDataTables['chart4'] ? 'Hide Data' : 'View Table'}
            </button>
          </div>

          {showDataTables['chart4'] && (
            <div className="mt-3 overflow-x-auto text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-40">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="p-1">Market / Dimension</th>
                    <th className="p-1">Estimated Value</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueScenario.labels.map((l, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-1">{l}</td>
                      <td className="p-1 font-semibold">{formatCurrency(revenueScenario.values[idx])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 5: Engagement Metrics */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-teal-600" />
                <h4 className="font-heading font-semibold text-lg text-gray-900">
                  Chart 5 — Engagement Metrics
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-700">
                Radar Chart
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Derived from verified public video statistics. Normalizes likes, comments, and upload cadence on a 0–100 scale.
            </p>

            {!engagementData ? (
              <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <Info className="w-8 h-8 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-700 text-sm">Insufficient Video Data</p>
                <p className="text-xs text-gray-500 mt-1">Requires at least one sampled video with public view counts.</p>
              </div>
            ) : (
              <div className="h-64 relative">
                <canvas ref={chart5Ref} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {engagementData
                ? `Sample: ${engagementData.sampleSize} videos (${engagementData.likesPer1k} likes / ${engagementData.commentsPer1k} comments per 1k views)`
                : 'No data'}
            </span>
            {engagementData && (
              <button
                onClick={() => toggleTable('chart5')}
                className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline"
              >
                <TableIcon className="w-3.5 h-3.5" />
                {showDataTables['chart5'] ? 'Hide Data' : 'View Table'}
              </button>
            )}
          </div>

          {showDataTables['chart5'] && engagementData && (
            <div className="mt-3 overflow-x-auto text-xs bg-gray-50 p-2 rounded border border-gray-200">
              <p className="p-1 text-gray-600">
                <strong>Methodology:</strong> Likes per 1k views = (Total Likes / Total Views) × 1000. Comments per 1k views = (Total Comments / Total Views) × 1000. Normalized against YouTube creator averages.
              </p>
            </div>
          )}
        </div>

        {/* CHART 6: Audience Demographics */}
        <div className="bg-white rounded-2xl p-6 text-gray-900 border border-gray-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h4 className="font-heading font-semibold text-lg text-gray-900">
                  Chart 6 — Audience Demographics
                </h4>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-700">
                Polar Area Chart
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Viewer geographic breakdown. For public-only channels, actual audience geography is private (distinct from registered country).
            </p>

            {(!isOwnerAuthorized && !isDemoMode) ? (
              <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <Lock className="w-10 h-10 text-gray-400 mb-2" />
                <p className="font-semibold text-gray-800 text-sm">Audience Geography is Private</p>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  YouTube does not publicly expose where viewers reside. The registered country in a channel’s profile only indicates where the account was registered.
                </p>
              </div>
            ) : (
              <div className="h-64 relative">
                <canvas ref={chart6Ref} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {isOwnerAuthorized || isDemoMode
                ? 'Authorized viewer geographic breakdown'
                : 'Private audience data locked'}
            </span>
            {(isOwnerAuthorized || isDemoMode) && audienceGeo && (
              <button
                onClick={() => toggleTable('chart6')}
                className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:underline"
              >
                <TableIcon className="w-3.5 h-3.5" />
                {showDataTables['chart6'] ? 'Hide Data' : 'View Table'}
              </button>
            )}
          </div>

          {showDataTables['chart6'] && audienceGeo && (
            <div className="mt-3 overflow-x-auto text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-40">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="p-1">Country</th>
                    <th className="p-1">Share</th>
                    <th className="p-1">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {audienceGeo.map((g, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-1">{g.country}</td>
                      <td className="p-1 font-semibold">{g.percentage}%</td>
                      <td className="p-1">{formatCompactNumber(g.views)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
