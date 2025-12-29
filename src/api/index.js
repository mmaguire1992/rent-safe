/**
 * API Barrel Exports
 * Central export point for all API functions
 */

// Export auth API
export * from './auth';

// Export properties API
export * from './properties';
export { getMyActiveProperties } from './properties';

// Export API client
export { default as apiClient } from './apiClient';
export { useGetApi, usePostApi, usePutApi, useDeleteApi, usePatchApi } from './apiClient';

// Export routes
export * from './routes';

