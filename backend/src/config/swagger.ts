import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Treecovery API',
    version: '1.0.0',
    description: 'API documentation for Treecovery - Green Spaces Management Platform',
    contact: {
      name: 'Treecovery Support',
      email: 'support@treecovery.kz',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error type',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
          code: {
            type: 'string',
            description: 'Error code',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'super_admin'],
          },
          cityId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          accessToken: {
            type: 'string',
          },
          refreshToken: {
            type: 'string',
          },
        },
      },
      GreenSpace: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          type: {
            type: 'string',
            enum: ['tree', 'park', 'alley', 'garden'],
          },
          species_ru: {
            type: 'string',
          },
          species_kz: {
            type: 'string',
            nullable: true,
          },
          species_en: {
            type: 'string',
            nullable: true,
          },
          species_scientific: {
            type: 'string',
            nullable: true,
          },
          latitude: {
            type: 'number',
          },
          longitude: {
            type: 'number',
          },
          city_id: {
            type: 'string',
            format: 'uuid',
          },
          district_id: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          planting_date: {
            type: 'string',
            format: 'date',
          },
          status: {
            type: 'string',
            enum: ['alive', 'attention_needed', 'dead', 'removed'],
          },
          notes: {
            type: 'string',
            nullable: true,
          },
          responsible_org: {
            type: 'string',
            nullable: true,
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Green Spaces',
      description: 'Green spaces management endpoints',
    },
    {
      name: 'Cities',
      description: 'Cities management endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);

