// This makes Node report Typescript line numbers in the stacktrace for less confusion
require("source-map-support").install();

import app from "../app";
import config from "../config";
import { Request, Response } from "express";
import * as WebSocket from "ws";
import websocket from "../websocket";
import HostipWebSocket from "../src/websocket/host-ip-websocket";
import moment from "moment";
import { TWELVE_HOURS_IN_SECONDS } from "../constants";

const HTTP_PORT = config.server.httpPort || null;
const ENVIRONMENT = config.environment;

app.listen(HTTP_PORT, () => {
  console.log("Tunnelmole Service listening on http port " + HTTP_PORT);
});

// Set up WebSocket server
const wss = new WebSocket.Server(
  {
    port: config.server.websocketPort,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  },
  () => {
    console.log(
      "Tunnelmole Service listening on websocket port " +
        config.server.websocketPort,
    );
  },
);

wss.on("connection", websocket);

// Ping/pong to stop connection timing out after 60 seconds (websocket default)
function noop() {}
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(websocket: HostipWebSocket) {
    const now = moment().unix();
    const timeout = TWELVE_HOURS_IN_SECONDS;
    const connectionExpiry = websocket.connectionStart + timeout;

    if (now > connectionExpiry) {
      console.info(
        "Connection timeout of " +
          timeout +
          " seconds has passed, terminating connection",
      );
      return websocket.terminate();
    }

    console.info("Sending ping");

    // Client will send back pong automatically as per the Websocket spec
    websocket.ping(noop);
  });
}, 45000);

wss.on("close", function close() {
  clearInterval(interval);
});
