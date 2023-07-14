// This makes Node report Typescript line numbers in the stacktrace for less confusion
require("source-map-support").install();

import app from "../app";
import config from "../config";
import * as WebSocket from "ws";
import websocket from "../websocket";
import HostipWebSocket from "../src/websocket/host-ip-websocket";
import moment from "moment";
import { TWELVE_HOURS_IN_SECONDS } from "../constants";
import { createServer } from "http";

const HTTP_PORT = config.server.httpPort || null;

const SAME_PORT = HTTP_PORT === config.server.websocketPort;

const perMessageDeflate = {
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
};

let wss: WebSocket.Server;
if (SAME_PORT) {
  const server = createServer(app);
  wss = new WebSocket.Server({
    clientTracking: false,
    noServer: true,
    perMessageDeflate,
  });

  server.on("upgrade", function (request, socket, head) {
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit("connection", ws, request);
    });
  });

  server.listen(HTTP_PORT, function () {
    console.log(
      "Tunnelmole Service listening on http://localhost:" + HTTP_PORT,
    );
  });
} else {
  app.listen(HTTP_PORT, () => {
    console.log(
      "Tunnelmole Service listening on http://localhost:" + HTTP_PORT,
    );
  });
  wss = new WebSocket.Server(
    {
      port: config.server.websocketPort,
      perMessageDeflate,
    },
    () => {
      console.log(
        "Tunnelmole Service listening on ws://localhost:" +
          config.server.websocketPort,
      );
    },
  );
}

wss.on("connection", websocket);

// Ping/pong to stop connection timing out after 60 seconds (websocket default)
function noop() {}
const interval = setInterval(function ping() {
  wss.clients?.forEach(function each(websocket: HostipWebSocket) {
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

// Listen for termination signals allows Ctrl+C in docker run
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
