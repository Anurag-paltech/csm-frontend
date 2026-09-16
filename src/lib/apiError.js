/**
 * Normalized error thrown by the API client. Every rejected request from
 * `apiClient` rejects with an instance of this, so callers (and TanStack Query)
 * can rely on a consistent shape.
 */
export class ApiError extends Error {
  constructor({ status, message, code, data }) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.code = code ?? null;
    this.data = data ?? null;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}

/**
 * Safe accessor for a user-facing message from any thrown value.
 */
export function getErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.',
) {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
