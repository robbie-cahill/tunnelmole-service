//@ts-ignore
import tunnelmoleConnections from './src/handlers/tunnelmole-connections';
import handleRequest from './src/handlers/handle-request';
import logTelemetry from './src/handlers/log-telemetry';

import express from 'express';
import bodyParser from 'body-parser';
import unreserveSubdomain from './src/handlers/unreserve-subdomain';
const app = express();

// Body will be a Buffer, easy to transfer to the client untouched
const options = {
  inflate: false,
  type: '*/*'
};

app.use(bodyParser.raw(options));

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