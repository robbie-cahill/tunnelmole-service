//@ts-ignore
import tunnelmoleConnections from './src/handlers/tunnelmole-connections';
import handleRequest from './src/handlers/handle-request';
import logTelemetry from './src/handlers/log-telemetry';

import express from 'express';
import getRawBody from 'raw-body';
import unreserveSubdomain from './src/handlers/unreserve-subdomain';
import config from './config';
const app = express();

app.use(async (req, res, next) => {
    try {
        const body = await getRawBody(req, {
            limit: config.server.maxRequestSize ?? '5mb',
        });
        req.body = body;
        next();
    } catch (error) {
        if (error.type === 'entity.too.large') {
            res.status(413).send('Request entity too large');
        } else {
            next(error);
        }
    }
});

app.get("/tunnelmole-connections", tunnelmoleConnections);
app.post("/tunnelmole-log-telemetry", logTelemetry);
app.delete("/tunnelmole/unreserve-subdomain", unreserveSubdomain);

/**
 * Handle incoming HTTP(s) requests for existing connections
 */
app.all("*", handleRequest);

/**
 * Initialize a new WebSocket connection with a Client
 */
export default app;