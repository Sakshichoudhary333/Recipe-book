// ============================================================
// utils/response.utils.ts - Consistent Response Helpers
// ============================================================

import type { Response } from "express";
import type { ApiResponse, PaginationMeta } from "../types/index.js";

/**
 * Send a successful response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
  meta?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  message: string = "An error occurred",
  statusCode: number = 500,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: error || message,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully"
): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send a bad request response (400)
 */
export const sendBadRequest = (
  res: Response,
  message: string = "Bad request",
  error?: string
): Response => {
  return sendError(res, message, 400, error);
};

/**
 * Send an unauthorized response (401)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = "Unauthorized"
): Response => {
  return sendError(res, message, 401);
};

/**
 * Send a forbidden response (403)
 */
export const sendForbidden = (
  res: Response,
  message: string = "Forbidden"
): Response => {
  return sendError(res, message, 403);
};

/**
 * Send a not found response (404)
 */
export const sendNotFound = (
  res: Response,
  message: string = "Resource not found"
): Response => {
  return sendError(res, message, 404);
};

/**
 * Send a conflict response (409)
 */
export const sendConflict = (
  res: Response,
  message: string = "Resource already exists"
): Response => {
  return sendError(res, message, 409);
};

/**
 * Send a validation error response (422)
 */
export const sendValidationError = (
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = "Validation failed"
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(422).json(response);
};

/**
 * Send a paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = "Success"
): Response => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };

  return sendSuccess(res, data, message, 200, meta);
};

/**
 * Calculate pagination metadata
 */
export const calculatePaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};
