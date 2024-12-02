import {Server} from "node:http";
import {Router, WebSocketExpress} from "websocket-express";
import WsRouter from "./routes/routers/WsRouter";
import cors from "cors";
import bodyParser from "body-parser";
import * as OpenApiValidator from "express-openapi-validator";
import api_schema from "./models/stock_api.json";
import {OpenAPIV3} from "express-openapi-validator/dist/framework/types";
import routes from "./routes/routers/HttpRouter";
import {errorHandler} from "./middleware/ErrorHandler";
import logger from "pino-http";

export class TruckBaseServer {
    readonly server: Server;

    constructor() {
        const app = new WebSocketExpress();

        // Create separate router for HTTP routes
        const httpRouter =  new Router();

        // Create separate router for WebSocket
        const wsRouter = WsRouter;

        // Load Middleware
        app.use(cors({
            origin: '*',
        }));
        app.use(logger({useLevel: 'error'}));
        app.useHTTP(bodyParser.json());
        app.useHTTP(bodyParser.urlencoded({ extended: false }));

        // Loads OpenAPI 3 schema to validate incoming REST API Requests.
        app.use(
            OpenApiValidator.middleware({
                apiSpec: api_schema as OpenAPIV3.DocumentV3,
                validateRequests: true, //will be implemented in step2
                validateResponses: true, //will be implemented in step2
            })
        );

        // Load HTTP Routes
        httpRouter.use(routes);

        app.useHTTP(httpRouter);
        app.use(wsRouter);


        // Use customer Error Handler
        // Error Handler Middleware needs to be set after the routes are set https://expressjs.com/en/guide/error-handling.html
        app.use(errorHandler);

        this.server = app.createServer();
    }
}