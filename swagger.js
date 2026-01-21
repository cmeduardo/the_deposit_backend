require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Normaliza base URL (evita doble // en paths)
function normalizeBaseUrl(url) {
  if (!url) return "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const RUTA = normalizeBaseUrl(process.env.BASE_URL) || "http://localhost:3000";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API - THE DEPOSIT (Guatemala)",
      version: "1.0.0",
      description:
        "Backend para tienda en línea y sistema de gestión de depósito en Guatemala.",
      contact: {
        name: "THE DEPOSIT - Backend",
        // email: "soporte@tudominio.com",
      },
      license: {
        name: "MIT",
        // url: "https://opensource.org/licenses/MIT",
      },
    },

    servers: [
      {
        url: RUTA,
        description: "Servidor principal",
      },
    ],

    /**
     * 🔐 Seguridad global:
     * - Si la mayoría requiere JWT, esto es lo mejor.
     * - Para endpoints públicos, en el swagger del endpoint pon: security: []
     */
    security: [{ bearerAuth: [] }],

    tags: [
      { name: "Auth", description: "Autenticación y gestión de sesiones" },
      { name: "Usuarios", description: "Gestión de usuarios y roles" },

      { name: "Unidades", description: "Unidades de medida" },

      { name: "Productos", description: "Gestión de productos" },
      {
        name: "PresentacionesProductos",
        description: "Gestión de presentaciones (SKU)",
      },
      {
        name: "CategoriasProductos",
        description: "Gestión de categorías de productos",
      },
      { name: "Proveedores", description: "Gestión de proveedores" },

      {
        name: "UbicacionesInventario",
        description: "Gestión de ubicaciones de inventario",
      },
      { name: "Inventario", description: "Consulta y ajustes de inventario" },

      { name: "Compras", description: "Compras y entradas a inventario" },
      { name: "Consignaciones", description: "Salidas por consignación" },

      { name: "Pedidos", description: "Gestión de pedidos" },
      { name: "Ventas", description: "Ventas y detalle de ventas" },

      { name: "Cobros", description: "Cobros asociados a ventas" },
      { name: "CuentasPorCobrar", description: "Cuentas por cobrar" },

      { name: "Envios", description: "Envíos y seguimiento" },
      { name: "Facturas", description: "Facturación" },

      { name: "CategoriasGastos", description: "Categorías de gastos" },
      { name: "Gastos", description: "Registro y consulta de gastos" },

      { name: "KPI", description: "Indicadores clave" },
    ],

    externalDocs: {
      description: "Repositorio / documentación adicional",
      // url: "https://github.com/tu-repo",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            'Pega el token sin comillas. Si tu middleware espera el prefijo, usa: "Bearer <token>".',
        },
      },

      /**
       * ✅ Schemas globales reutilizables
       */
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            mensaje: { type: "string", example: "Error interno del servidor" },
          },
          required: ["mensaje"],
        },

        OkMessage: {
          type: "object",
          properties: {
            mensaje: { type: "string", example: "Operación realizada correctamente" },
          },
          required: ["mensaje"],
        },

        MetaPaginacion: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 123 },
            total_pages: { type: "integer", example: 7 },
            sort: { type: "string", example: "created_at" },
            order: { type: "string", example: "desc" },
            filtros: { type: "object", additionalProperties: true },
          },
        },

        PaginatedResponse: {
          type: "object",
          properties: {
            meta: { $ref: "#/components/schemas/MetaPaginacion" },
            data: { type: "array", items: { type: "object" } },
          },
        },
      },

      /**
       * ✅ Responses globales reutilizables
       */
      responses: {
        UnauthorizedError: {
          description: "No autenticado (token faltante o inválido)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { mensaje: "No autenticado" },
            },
          },
        },

        ForbiddenError: {
          description: "No autorizado (sin permisos)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { mensaje: "No tienes permisos para esta acción" },
            },
          },
        },

        NotFoundError: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { mensaje: "Recurso no encontrado" },
            },
          },
        },

        ValidationError: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { mensaje: "Faltan campos obligatorios" },
            },
          },
        },

        ConflictError: {
          description: "Conflicto / duplicado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { mensaje: "El recurso ya existe o entra en conflicto" },
            },
          },
        },

        ServerError: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { mensaje: "Error interno del servidor" },
            },
          },
        },
      },

      /**
       * ✅ Parámetros globales reutilizables (te ahorra repetir en endpoints)
       */
      parameters: {
        IdPathParam: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 1,
          description: "ID del recurso",
        },

        FechaDesdeQuery: {
          name: "fecha_desde",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
          example: "2026-01-01",
        },

        FechaHastaQuery: {
          name: "fecha_hasta",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
          example: "2026-01-31",
        },

        PageQuery: {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, default: 1 },
          example: 1,
        },

        LimitQuery: {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, maximum: 200, default: 20 },
          example: 20,
        },

        SortQuery: {
          name: "sort",
          in: "query",
          required: false,
          schema: { type: "string", default: "created_at" },
          example: "created_at",
        },

        OrderQuery: {
          name: "order",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          example: "desc",
        },
      },

      /**
       * ✅ RequestBodies globales (solo si te conviene reutilizar)
       * Puedes ir agregando aquí con el tiempo.
       */
      requestBodies: {
        // Ejemplo para futuro:
        // UploadImage: {
        //   required: true,
        //   content: {
        //     "multipart/form-data": {
        //       schema: {
        //         type: "object",
        //         properties: {
        //           file: { type: "string", format: "binary" }
        //         },
        //         required: ["file"]
        //       }
        //     }
        //   }
        // }
      },
    },
  },

  /**
   * ✅ Importante: soporta rutas en subcarpetas también
   * (si en el futuro separas por módulos)
   */
  apis: ["./app/routes/*.js", "./app/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions: {
    explorer: true,
    persistAuthorization: true, // ✅ mantiene token en UI
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      displayRequestDuration: true,
    },
  },
};
