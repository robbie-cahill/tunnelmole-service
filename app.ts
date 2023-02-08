//@ts-ignore
import tunnelmoleConnections from './src/handlers/tunnelmole-connections';
import handleRequest from './src/handlers/handle-request';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Body will be a Buffer, easy to transfer to the client untouched
const options = {
  inflate: false,
  type: '*/*'
};

app.use(bodyParser.raw(options));

app.get("/tunnelmole-connections", tunnelmoleConnections);

/**
 * Handle incoming HTTP(s) requests for existing connections
 */
app.all("*", handleRequest);

/**
 * Initialize a new WebSocket connection with a Client
 */
export default app;