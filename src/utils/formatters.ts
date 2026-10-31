/**
 * Formatting utilities for metrics and currency
 */

export function formatCompactNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  if (num === 0) return '0';

  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(2);
    return `${formatted.replace(/\.00$/, '')}B`;
  }
  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(2);
    return `${formatted.replace(/\.00$/, '')}M`;
  }
  if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return `${formatted.replace(/\.0$/, '')}K`;
  }
  return num.toLocaleString();
}

export function formatExactNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  return num.toLocaleString('en-US');
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString: string | undefined | null): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export function calculateChannelAge(isoString: string | undefined | null): string {
  if (!isoString) return '';
  try {
    const created = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (years > 0) {
      return `${years} yr${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mo` : ''} old`;
    }
    return `${months} month${months > 1 ? 's' : ''} old`;
  } catch {
    return '';
  }
}

/**
 * Parses ISO 8601 duration (e.g. PT14M32S) to mm:ss or hh:mm:ss
 */
export function formatDuration(durationString?: string): string {
  if (!durationString) return '';
  const match = durationString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return durationString;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
}
