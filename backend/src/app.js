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
  origin: function (origin, callback) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (!origin && !isProduction) callback(null, true);
    else if (isProduction) {
      const allowedOrigins = [process.env.PROD_FRONTEND_URL || 'https://test.com'];
      allowedOrigins.indexOf(origin) !== -1
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'), false);
    } else callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

const isProduction = process.env.NODE_ENV === 'production';

let API_PREFIX = process.env.API_PREFIX || '/api';
if (API_PREFIX === '0') API_PREFIX = '';
const HOST = isProduction ? process.env.PROD_HOST || 'https://test.com' : process.env.HOST || 'http://localhost';
const PORT = parseInt(process.env.PORT || (isProduction ? process.env.PROD_PORT || '80' : '3000'));
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

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Swagger UI available at ${HOST}:${PORT}/api-docs`);
  });
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});
