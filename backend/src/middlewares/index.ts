// ============================================================
// middleware/index.ts - All Middleware Functions
// ============================================================

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { body, param, query, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import type {
  AuthRequest,
  JwtPayload,
  ApiResponse,
  ValidationError,
  AppError,
  UnauthorizedException,
  ForbiddenException,
  ValidationException,
} from "../types/index.js";
import {
  AppError as AppErrorClass,
  UnauthorizedException as UnauthorizedExceptionClass,
  ForbiddenException as ForbiddenExceptionClass,
  ValidationException as ValidationExceptionClass,
} from "../types/index.js";

// ============================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppErrorClass) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: err.message,
    };

    if (err instanceof ValidationExceptionClass) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Log unexpected errors
  console.error("Unexpected Error:", err);

  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  };

  return res.status(500).json(response);
};

// ============================================================
// NOT FOUND MIDDLEWARE
// ============================================================

export const notFound = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: "Route not found",
    error: `Cannot ${req.method} ${req.originalUrl}`,
  };

  res.status(404).json(response);
};

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedExceptionClass("No token provided");
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedExceptionClass("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedExceptionClass("Token expired"));
    } else {
      next(error);
    }
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// ============================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedExceptionClass("Authentication required"));
    }

    if (roles.length > 0 && !roles.includes(req.user.role || "")) {
      return next(new ForbiddenExceptionClass("Insufficient permissions"));
    }

    next();
  };
};

// Check if user owns the resource
export const checkOwnership = (
  resourceIdParam: string = "id",
  userIdField: string = "uid"
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedExceptionClass("Authentication required"));
      }

      const resourceId = req.params[resourceIdParam];

      // This is a simplified check - in real implementation,
      // you'd query the database to check ownership
      // For now, we'll assume the resource ID matches the user ID for demonstration

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ============================================================
// VALIDATION MIDDLEWARE
// ============================================================

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors
      .array()
      .map((error: any) => ({
        field: error.path || error.param,
        message: error.msg,
      }));

    return next(new ValidationExceptionClass(validationErrors));
  }

  next();
};

// ============================================================
// VALIDATION RULES
// ============================================================

// Auth Validations
export const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("f_name").trim().notEmpty().withMessage("First name is required"),
  body("l_name").trim().notEmpty().withMessage("Last name is required"),
  body("phone_no").optional().isMobilePhone("any"),
  validate,
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Recipe Validations
export const createRecipeValidation = [
  body("name").trim().notEmpty().withMessage("Recipe name is required"),
  body("description").optional().trim(),
  body("prep_time")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Prep time must be positive"),
  body("cook_time")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Cook time must be positive"),
  body("servings")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Servings must be at least 1"),
  body("difficulty_level")
    .optional()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Invalid difficulty level"),
  body("instructions").optional().trim(),
  body("is_published").optional().isBoolean(),
  body("categories").optional().isArray(),
  body("categories.*").optional().isInt(),
  body("ingredients").optional().isArray(),
  body("ingredients.*.IID")
    .isInt()
    .withMessage("Ingredient ID must be an integer"),
  body("ingredients.*.quantity")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be positive"),
  body("ingredients.*.unit").notEmpty().withMessage("Unit is required"),
  validate,
];

export const updateRecipeValidation = [
  param("id").isInt().withMessage("Invalid recipe ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Recipe name cannot be empty"),
  body("prep_time").optional().isInt({ min: 0 }),
  body("cook_time").optional().isInt({ min: 0 }),
  body("servings").optional().isInt({ min: 1 }),
  body("difficulty_level").optional().isIn(["Easy", "Medium", "Hard"]),
  body("is_published").optional().isBoolean(),
  body("categories").optional().isArray(),
  body("ingredients").optional().isArray(),
  validate,
];

export const searchRecipeValidation = [
  query("query").optional().trim(),
  query("search_type").optional().isIn(["name", "ingredient", "both"]),
  query("category_id").optional().isInt(),
  query("difficulty_level").optional().isIn(["Easy", "Medium", "Hard"]),
  query("max_prep_time").optional().isInt({ min: 0 }),
  query("max_cook_time").optional().isInt({ min: 0 }),
  query("min_rating").optional().isFloat({ min: 0, max: 5 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sort_by").optional().isIn(["rating", "date", "views", "name"]),
  query("sort_order").optional().isIn(["asc", "desc"]),
  validate,
];

// Feedback Validations
export const createFeedbackValidation = [
  body("RID").isInt().withMessage("Recipe ID is required"),
  body("Rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("Comment_Text").optional().trim(),
  validate,
];

export const updateFeedbackValidation = [
  param("id").isInt().withMessage("Invalid feedback ID"),
  body("Rating").optional().isInt({ min: 1, max: 5 }),
  body("Comment_Text").optional().trim(),
  validate,
];

// Category Validations
export const createCategoryValidation = [
  body("CName").trim().notEmpty().withMessage("Category name is required"),
  body("Meal_Type").optional().trim(),
  body("cuisine_type").optional().trim(),
  body("description").optional().trim(),
  validate,
];

export const updateCategoryValidation = [
  param("id").isInt().withMessage("Invalid category ID"),
  body("CName").optional().trim().notEmpty(),
  body("Meal_Type").optional().trim(),
  body("cuisine_type").optional().trim(),
  body("is_active").optional().isBoolean(),
  validate,
];

// Ingredient Validations
export const createIngredientValidation = [
  body("I_Name").trim().notEmpty().withMessage("Ingredient name is required"),
  body("Unit").optional().trim(),
  body("Quantity").optional().isFloat({ min: 0 }),
  body("calories_per_unit").optional().isFloat({ min: 0 }),
  body("is_vegetarian").optional().isBoolean(),
  body("is_vegan").optional().isBoolean(),
  body("is_gluten_free").optional().isBoolean(),
  validate,
];

export const updateIngredientValidation = [
  param("id").isInt().withMessage("Invalid ingredient ID"),
  body("I_Name").optional().trim().notEmpty(),
  body("Unit").optional().trim(),
  body("Quantity").optional().isFloat({ min: 0 }),
  body("calories_per_unit").optional().isFloat({ min: 0 }),
  validate,
];

// Collection Validations
export const createCollectionValidation = [
  body("collection_name")
    .trim()
    .notEmpty()
    .withMessage("Collection name is required"),
  body("description").optional().trim(),
  body("is_public").optional().isBoolean(),
  validate,
];

export const updateCollectionValidation = [
  param("id").isInt().withMessage("Invalid collection ID"),
  body("collection_name").optional().trim().notEmpty(),
  body("description").optional().trim(),
  body("is_public").optional().isBoolean(),
  validate,
];

// ID Parameter Validation
export const idValidation = [
  param("id").isInt().withMessage("Invalid ID"),
  validate,
];

// ============================================================
// FILE UPLOAD MIDDLEWARE
// ============================================================

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "uploads/";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.")
    );
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string = "image") => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (
  fieldName: string = "images",
  maxCount: number = 5
) => {
  return upload.array(fieldName, maxCount);
};

// ============================================================
// RATE LIMITING MIDDLEWARE
// ============================================================

import rateLimit from "express-rate-limit";

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: "Too many API requests, please try again later.",
});

// ============================================================
// CORS MIDDLEWARE
// ============================================================

export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:5137",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// ============================================================
// REQUEST LOGGER MIDDLEWARE
// ============================================================

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${
        res.statusCode
      } ${duration}ms`
    );
  });

  next();
};

// ============================================================
// SANITIZATION MIDDLEWARE
// ============================================================

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove any HTML tags from string inputs
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj.replace(/<[^>]*>/g, "");
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === "object" && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Only sanitize body as query and params are readonly
  // Query and params are already validated by express-validator
  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
};

// ============================================================
// PAGINATION MIDDLEWARE
// ============================================================

export const pagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset,
  };

  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}
