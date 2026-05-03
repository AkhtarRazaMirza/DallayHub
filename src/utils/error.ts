/**
 * Custom API Error Class
 * Extends Error to include HTTP status codes for proper response handling
 * All application errors should be instances of this class
 */
class ApiError extends Error {
  statusCode: number;

  /**
   * @param {number} statusCode - HTTP status code (200, 400, 401, etc.)
   * @param {string} message - Error message to send to client
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    
    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 400 Bad Request - Client sent invalid data
   * Use for validation errors, missing fields, malformed requests
   */
  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  /**
   * 401 Unauthorized - User is not authenticated
   * Use for missing/invalid tokens, expired credentials
   */
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  /**
   * 403 Forbidden - User lacks permission
   * Use for insufficient privileges, role-based access denial
   */
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  /**
   * 404 Not Found - Resource doesn't exist
   * Use when user/post/item is not found
   */
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  /**
   * 409 Conflict - Resource already exists
   * Use for duplicate email, username already taken, etc.
   */
  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  /**
   * 500 Internal Server Error - Server-side failure
   * Use for unexpected errors, database failures
   */
  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }

  /**
   * 429 Too Many Requests - Rate limit exceeded
   * Use when client makes too many requests in a time window
   */
  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }
}

export default ApiError;
