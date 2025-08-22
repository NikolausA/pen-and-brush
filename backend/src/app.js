const express = require('express');
const sequelize = require('./config/db-config.js');
const errorHandler = require('./middleware/error-handler.js');
const projectRoutes = require('./routes/projects.js');
const layerRoutes = require('./routes/layers.js');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

const isProduction = process.env.NODE_ENV === 'production';

let API_PREFIX = process.env.API_PREFIX || '/api';
if (API_PREFIX === '0') API_PREFIX = '';
const HOST = isProduction ? process.env.PROD_HOST || 'https://test.com' : process.env.HOST || 'http://localhost';
const PORT = parseInt(process.env.PORT || (isProduction ? process.env.PROD_PORT || '80' : '1221'));
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Graphic Editor API',
      version: '1.0.0',
      description: 'API documentation for the Graphic Editor application',
    },
    servers: [
      {
        url: `${HOST}:${PORT}${API_PREFIX}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customSiteTitle: 'Graphic Editor API Docs',
  customCss: '.swagger-ui .topbar { display: none }'
}));

app.use(`${API_PREFIX}/projects`, projectRoutes);
app.use(`${API_PREFIX}/projects`, layerRoutes);
app.use(errorHandler);

const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully');
      await sequelize.sync();
      console.log('Database synced');
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Failed to connect to database after retries');
  return false;
};

connectWithRetry().then(connected => {
  if (connected) {
    app.listen(PORT, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
      console.log(`Swagger UI available at ${HOST}:${PORT}/api-docs`);
    });
  } else {
    console.error('Server failed to start due to database connection issues');
    process.exit(1);
  }
});