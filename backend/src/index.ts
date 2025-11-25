import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { testConnection } from "./utils/db.js";
import {
  errorHandler,
  notFound,
  requestLogger,
  sanitizeInput,
  pagination,
  generalLimiter,
  corsOptions,
} from "./middlewares/index.js";
import apiRoutes from "./routes/index.js";

config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors(corsOptions));

// Request Logging
app.use(requestLogger);

// Rate Limiting
app.use(generalLimiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input Sanitization
app.use(sanitizeInput);

// Pagination Middleware
app.use(pagination);

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api", apiRoutes);

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
});
