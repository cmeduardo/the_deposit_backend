require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const RUTA = process.env.BASE_URL;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - THE DEPOSIT (Guatemala)",
      version: "1.0.0",
      description:
        "Backend para tienda en línea y sistema de gestión de depósito en Guatemala.",
    },
    servers: [
      {
        url: RUTA,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Archivos donde leer anotaciones JSDoc de Swagger
  apis: ["./app/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
