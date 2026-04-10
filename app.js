import "./utils/LoadEnvConfig.js"; // Load environment variables from .env file
import express from "express";
import path from "path";
import { projectRoot } from "./utils/Paths.js";
import authRoutes from "./routes/auth-router.js";
import connectDB from "./utils/MongooseConnection.js"; // Import the MongoDB connection utility
import cors from "cors";
import { setupSwagger } from "./utils/SwaggerConfig.js"

const app = express();

// Set up static file serving and body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(projectRoot, "public")));


if (process.env.NODE_ENV !== "production") {
  setupSwagger(app);
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"],
    methods: process.env.CORS_METHODS.split(",") || "OPTIONS,GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS.split(",") || "Content-Type, Authorization",
  })
);

//routes
app.use("/api/", authRoutes);

// Error Handling Middleware
app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const data = error.data || null;

  res.status(statusCode).json({ message, data });
});

//404
app.use((req, res) => {
  res.status(404).json({ message: "404 not found" });
});

try {
  // Connect to MongoDB
  await connectDB();
  app.listen(process.env.PORT || 5000);
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
} catch (err) {
  console.error("Error setting up the application:", err);
}