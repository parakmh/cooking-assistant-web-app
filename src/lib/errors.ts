/**
 * API Error types and utilities for better error handling
 */

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[] | string>;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, string[] | string>;

  constructor(message: string, status: number, code?: string, details?: Record<string, string[] | string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Get user-friendly error message from API response
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiError
  if (error instanceof ApiError) {
    return error.message;
  }

  // Handle network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // Handle object with error property
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    
    // Backend error format: { error: string, code?: string, details?: object }
    if (err.error) {
      return err.error;
    }
    
    // Legacy format: { message: string }
    if (err.message) {
      return err.message;
    }
    
    // DRF validation errors format
    if (err.detail) {
      if (typeof err.detail === 'string') {
        return err.detail;
      }
      if (Array.isArray(err.detail)) {
        return err.detail.join(', ');
      }
    }
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get field-specific validation errors
 */
export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (error instanceof ApiError && error.details) {
    const fieldErrors: Record<string, string> = {};
    
    for (const [field, messages] of Object.entries(error.details)) {
      if (Array.isArray(messages)) {
        fieldErrors[field] = messages.join(', ');
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    }
    
    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
  }
  
  return null;
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message === 'Failed to fetch';
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.code === 'AUTHENTICATION_FAILED';
  }
  return false;
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 400 || error.code === 'VALIDATION_ERROR';
  }
  return false;
}
