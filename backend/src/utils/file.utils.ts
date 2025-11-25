// ============================================================
// utils/file.utils.ts - File Handling Helper Functions
// ============================================================

import fs from "fs/promises";
import path from "path";

/**
 * Delete a file
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

/**
 * Check if file exists
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

/**
 * Validate file type
 */
export const isValidFileType = (
  filename: string,
  allowedTypes: string[]
): boolean => {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
};

/**
 * Get file size in bytes
 */
export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  return `${timestamp}-${random}${ext}`;
};
