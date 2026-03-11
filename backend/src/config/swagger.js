const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Logistics Delivery Management API',
      version: '1.0.0',
      description: 'REST API for managing deliveries, orders, drivers, and customers',
    },
    servers: [{ url: 'http://localhost:3001/api', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'driver', 'admin'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            customer_id: { type: 'string' },
            pickup_address: { type: 'string' },
            delivery_address: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'assigned', 'picked', 'delivered'] },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Delivery: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            order_id: { type: 'string' },
            driver_id: { type: 'string' },
            assigned_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
