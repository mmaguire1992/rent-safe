/**
 * Property share URL helpers.
 * Supports both local and production by preferring configured base URLs,
 * and falling back to current browser origin.
 */

const getConfiguredShareBaseUrl = () => {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_SHARE_BASE_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    '';

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return '';
};

export const buildPropertyShareUrl = (propertyId) => {
  if (!propertyId) return '';
  const baseUrl = getConfiguredShareBaseUrl();
  if (!baseUrl) return '';
  return `${baseUrl}/properties/${encodeURIComponent(String(propertyId))}`;
};

