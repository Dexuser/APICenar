import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"
import path from "path";
import { projectRoot } from "./Paths.js";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "AssetsApp API",
        version: "1.0.0",
        description: "API documentation for AssetsApp",
    },
    servers: [
        {
            url: process.env.APP_URL || "http://localhost:8080",
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    //(Optional) apply security to all operations
   /*  security: [
        {
            BearerAuth: [],
        },
    ], */
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [ path.join(projectRoot, "routes/*router.js")], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app) {
    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}