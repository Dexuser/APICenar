import "./utils/LoadEnvConfig.js";

import express from "express";
import path from "path";
import { apiErrorHandler, apiNotFoundHandler } from "./middlewares/apiErrorHandler.js";
import apiRouter from "./routes/api-router.js";
import { projectRoot } from "./utils/Paths.js";
import { sendError, sendSuccess } from "./utils/apiResponses.js";
import connectDB from "./utils/MongooseConnection.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(projectRoot, "public")));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : "*",

    methods: process.env.CORS_METHODS
      ? process.env.CORS_METHODS.split(",")
      : ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],

    allowedHeaders: process.env.CORS_ALLOWED_HEADERS
      ? process.env.CORS_ALLOWED_HEADERS.split(",")
      : ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) =>
  sendSuccess(res, 200, {
    name: "ApiCenar API",
    apiBaseUrl: "/api",
    docsUrl: "/api-docs",
  })
);

app.use("/api", apiRouter);
app.get("/api-docs", (req, res) => res.redirect("/swagger/"));
app.use("/api", apiNotFoundHandler);

app.use((req, res) => sendError(res, 404, "Endpoint not found."));
app.use(apiErrorHandler);

try {
  await connectDB();
  app.listen(process.env.PORT || 5000);
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
} catch (error) {
  console.error("Error setting up the application:", error);
}
