const express = require("express");
const sequelize = require("./config/db-config.js");
const routes = require("./routes.js");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "https://test.com"]
        : ["http://localhost:1000", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Configuration
const isProduction = process.env.NODE_ENV === "production";
let API_PREFIX = process.env.API_PREFIX || "/api";
if (API_PREFIX === "0") API_PREFIX = "";
const HOST = isProduction
  ? process.env.PROD_HOST || "https://test.com"
  : process.env.HOST || "http://localhost";
const PORT = parseInt(
  process.env.PORT || (isProduction ? process.env.PROD_PORT || "80" : "1221")
);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Graphic Editor API",
      version: "1.0.0",
      description: "Simple API for graphic editor with projects and layers",
    },
    servers: [
      {
        url: `${HOST}:${PORT}${API_PREFIX}`,
      },
    ],
  },
  apis: ["./routes.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customSiteTitle: "Graphic Editor API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("Query:", req.query);
  }
  next();
});

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use(API_PREFIX, routes);

// Error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Database connection with retry logic
const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected successfully");
      await sequelize.sync();
      console.log("✅ Database synced");
      return true;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${i + 1} failed:`,
        error.message
      );
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error("❌ Failed to connect to database after retries");
  return false;
};

// Start server
connectWithRetry().then((connected) => {
  if (connected) {
    app.listen(PORT, () => {
      console.log("\n🚀 Server started successfully!");
      console.log(`📍 Running on: ${HOST}:${PORT}`);
      console.log(`📚 Swagger UI: ${HOST}:${PORT}/api-docs`);
      console.log(`🔧 Test endpoint: ${HOST}:${PORT}/test`);
      console.log("\n📋 Available API endpoints:");
      console.log(`  Projects:`);
      console.log(`    GET    ${API_PREFIX}/projects`);
      console.log(`    POST   ${API_PREFIX}/projects`);
      console.log(`    PATCH  ${API_PREFIX}/projects/{projectId}`);
      console.log(`    DELETE ${API_PREFIX}/projects/{projectId}`);
      console.log("  Layers:");
      console.log(`    GET    ${API_PREFIX}/layers?projectId={id}`);
      console.log(`    POST   ${API_PREFIX}/layers`);
      console.log(`    PATCH  ${API_PREFIX}/layers/{layerId}`);
      console.log(`    DELETE ${API_PREFIX}/layers/{layerId}`);
      console.log(`  History:`);
      console.log(`    GET    ${API_PREFIX}/history?projectId={id}`);
      console.log(`    POST   ${API_PREFIX}/history`);
      console.log(`    DELETE ${API_PREFIX}/history/{historyId}`);
      console.log("\n✨ Ready to accept requests!\n");
    });
  } else {
    console.error(
      "❌ Server failed to start due to database connection issues"
    );
    process.exit(1);
  }
});

module.exports = app;
