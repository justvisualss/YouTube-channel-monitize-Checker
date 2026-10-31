export type InputClassification =
  | { type: 'channel_id'; value: string }
  | { type: 'handle'; value: string }
  | { type: 'legacy_user'; value: string }
  | { type: 'search_query'; value: string };

/**
 * Parses and normalizes various user inputs:
 * - Direct Channel ID (UC...)
 * - @handle or handle
 * - youtube.com/channel/UC...
 * - youtube.com/@handle
 * - youtube.com/user/username
 * - youtube.com/c/customName
 * - plain name queries
 */
export function classifyChannelInput(input: string): InputClassification {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'search_query', value: '' };
  }

  // Check if it's a URL
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = urlObj.hostname.toLowerCase();
    
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const pathname = urlObj.pathname;

      // youtube.com/channel/UC...
      const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
      if (channelMatch) {
        return { type: 'channel_id', value: channelMatch[1] };
      }

      // youtube.com/@handle
      const handleMatch = pathname.match(/\/@([a-zA-Z0-9_.-]+)/i);
      if (handleMatch) {
        return { type: 'handle', value: handleMatch[1] };
      }

      // youtube.com/user/username
      const userMatch = pathname.match(/\/user\/([a-zA-Z0-9_.-]+)/i);
      if (userMatch) {
        return { type: 'legacy_user', value: userMatch[1] };
      }

      // youtube.com/c/customName
      const customMatch = pathname.match(/\/c\/([a-zA-Z0-9_.-]+)/i);
      if (customMatch) {
        return { type: 'search_query', value: customMatch[1] };
      }

      // If it's simply youtube.com/handleName without @
      const barePath = pathname.replace(/^\/+/, '').split('/')[0];
      if (barePath && !['watch', 'feed', 'playlist', 'results', 'gaming'].includes(barePath)) {
        if (barePath.startsWith('@')) {
          return { type: 'handle', value: barePath.slice(1) };
        }
        return { type: 'search_query', value: barePath };
      }
    }
  } catch {
    // Not a valid URL, treat as direct text input
  }

  // Direct UC channel ID check (24 characters starting with UC)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return { type: 'channel_id', value: trimmed };
  }

  // Handle with leading @
  if (trimmed.startsWith('@')) {
    const handleValue = trimmed.slice(1);
    if (handleValue.length > 0) {
      return { type: 'handle', value: handleValue };
    }
  }

  // Fallback to search query
  return { type: 'search_query', value: trimmed };
}
