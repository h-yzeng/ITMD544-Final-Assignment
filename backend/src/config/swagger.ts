import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather App API',
      version: '1.0.0',
      description: 'REST API for weather data powered by Open-Meteo',
    },
    servers: [{ url: '/api' }],
    components: {
      schemas: {
        Location: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            country: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            color: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
