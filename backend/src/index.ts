import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { testConnection } from "./utils/db";
import authRoutes from "./routes/authRoutes";
import recipeRoutes from "./routes/recipeRoutes";
import categoryRoutes from "./routes/categoryRoutes";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
});
