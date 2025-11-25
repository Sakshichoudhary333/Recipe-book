// ============================================================
// utils/validation.utils.ts - Validation Helper Functions
// ============================================================

/**
 * Check if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password meets requirements
 */
export const isValidPassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  return { valid: true };
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (text: string): string => {
  return text.replace(/<[^>]*>/g, "");
};

/**
 * Validate and sanitize input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>/g, "");
};
