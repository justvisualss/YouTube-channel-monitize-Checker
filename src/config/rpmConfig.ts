/**
 * Centralized RPM configuration
 * As specified in ChannelScope Analytics specification:
 * Initial RPM assumptions supplied by the website owner.
 * Currency: USD. RPM represents assumed revenue per 1,000 views.
 */

export interface MarketRpmConfig {
  countryCode: string;
  countryName: string;
  rpm: number; // in USD
  flagEmoji: string;
}

export const INITIAL_RPM_ASSUMPTIONS: Record<string, MarketRpmConfig> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    rpm: 7.53,
    flagEmoji: '🇺🇸',
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    rpm: 5.62,
    flagEmoji: '🇬🇧',
  },
  NZ: {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    rpm: 5.56,
    flagEmoji: '🇳🇿',
  },
  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    rpm: 2.33,
    flagEmoji: '🇦🇪',
  },
  PK: {
    countryCode: 'PK',
    countryName: 'Pakistan',
    rpm: 2.50,
    flagEmoji: '🇵🇰',
  },
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    rpm: 2.50,
    flagEmoji: '🇮🇳',
  },
};

export const DEFAULT_MARKET_CODE = 'US';

/**
 * Calculates estimated revenue based on view count and RPM.
 * Formula: Estimated Revenue = (Views / 1000) * RPM
 */
export function calculateEstimatedRevenue(views: number, rpm: number): number {
  if (!views || views <= 0 || !rpm || rpm <= 0) return 0;
  return (views / 1000) * rpm;
}

/**
 * Mandatory Revenue Notice required across all revenue estimation displays
 */
export const MANDATORY_REVENUE_NOTICE =
  'Revenue figures are illustrative estimates based on selected RPM assumptions and public or supplied view counts. They are not actual channel earnings, verified YouTube revenue, or a guarantee of future income. Actual earnings depend on monetized playbacks, audience geography, content format, advertiser demand, eligibility, and other factors.';

/**
 * Mandatory Independence Notice required in footer and about
 */
export const MANDATORY_INDEPENDENCE_NOTICE =
  'ChannelScope Analytics is an independent analytics and estimation tool and is not affiliated with, endorsed by, or officially connected to YouTube or Google.';
