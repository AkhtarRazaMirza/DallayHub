import type { Request, Response } from "express";

/**
 * Standardized API Response Wrapper
 * Provides consistent response format for all successful API operations
 * 
 * Standard Response Format:
 * {
 *   success: true,
 *   message: "Operation description",
 *   data: { ...response data }
 * }
 */
class ApiResponse {
  /**
   * 200 OK - Successful GET/general operation
   * @param res - Express Response object
   * @param message - User-friendly message
   * @param data - Response data
   */
  static ok(res: Response, message: string, data: any) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * 201 Created - Successful POST/resource creation
   * @param res - Express Response object
   * @param message - User-friendly message
   * @param data - Created resource data
   */
  static created(res: Response, message: string, data: any) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * 204 No Content - Successful operation with no response body
   * Typically used for DELETE operations
   */
  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export default ApiResponse;
