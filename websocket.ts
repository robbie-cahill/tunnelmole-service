import { nanoid } from "nanoid";
import { messageHandlers } from "./message-handlers";
import HostipWebSocket from "./src/websocket/host-ip-websocket";
import log from "./src/logging/log";
import moment from "moment";
import Proxy from "./src/proxy";
import { IncomingMessage } from "http";
import config from "./config";
import type Connection from "./src/connection";
import WebSocketOpenMessage from "./src/messages/websocket-open-message";
import WebSocketCloseMessage from "./src/messages/websocket-close-message";
import WebSocketHostMessage from "./src/messages/websocket-host-message";
const inArray = require("in_array");

/**
 * Callback to initialise new websocket connections
 */
export default function websocket(
  websocket: HostipWebSocket,
  request: IncomingMessage,
) {
  websocket.isAlive = true;
  websocket.connectionStart = moment().unix();

  //@ts-ignore
  websocket.ipAddress = request.headers["x-forwarded-for"] ?? "127.0.0.1";

  // Hack: Punch in HostipWebsocket sendMessage
  websocket.sendMessage = function sendMessage(object: any) {
    const json = JSON.stringify(object);
    websocket.send(json);
  };

  /**
   * Find the handler for a message and run it
   **/
  websocket.on("message", (text: string) => {
    const message = JSON.parse(text);

    if (typeof message.type !== "string") {
      console.error("Invalid message, type is missing or invalid");
      return;
    }

    // Skip any messages that are handled dynamically using other explicitly defined 'message' callbacks
    // Example: forwardedResponse handler in handleRequest that is set dynamically for every request
    const dynamicallyHandledMessageTypes = [
      "forwardedResponse",
      "WebSocketClientMessage",
      "WebSocketCloseMessage",
    ];

    if (inArray(message.type, dynamicallyHandledMessageTypes)) {
      return;
    }

    if (typeof messageHandlers[message.type] !== "function") {
      console.error("Handler not found for message type " + message.type);
      return;
    }

    const handler = messageHandlers[message.type];
    handler(message, websocket);
  });

  // Log messages if debug is enabled
  if (config.runtime.debug)
    websocket.on("message", (text: string) => {
      const message = JSON.parse(text);
      log(Date.now() + " Received " + message.type + " message:", "info");
      log(message, "info");
    });

  socketOverSocket(websocket, request);

  websocket.on("error", (code: number, reason: string) => {
    console.info("Caught an error. Error code: " + code + " Reason: " + reason);
  });

  websocket.on("close", (code: number, reason: string) => {
    websocket.terminate();

    const proxy = Proxy.getInstance();
    proxy.deleteConnection(websocket.tunnelmoleClientId);

    console.info("Connection Closed. Code: " + code + " Reason: " + reason);
  });
}

function socketOverSocket(
  websocket: HostipWebSocket,
  request: IncomingMessage,
) {
  if (request.url !== "/") openDatatunnel();
  else {
    // Must init within 2 seconds
    setTimeout(() => {
      openDatatunnel();
    }, 2000);

    // First message must be initialise
    websocket.once("message", (text: string) => {
      try {
        const message = JSON.parse(text);
        if (message.type === "initialise") websocket.dataTunnel = false;
        else openDatatunnel();
      } catch (error) {
        openDatatunnel();
      }
    });
  }

  function openDatatunnel() {
    // Only open one data tunnel per websocket
    if (typeof websocket.dataTunnel !== "undefined") return;

    websocket.dataTunnel = true;

    const proxy = Proxy.getInstance();
    const url = new URL("https://" + request.headers.host);
    const hostname = url.hostname;
    const connection: Connection = proxy.findConnectionByHostname(hostname);
    if (!connection) return; // console.error("openDatatunnel.nope", hostname);

    // console.log("openDatatunnel", connection?.clientId);

    // Register this data tunnel
    const socketId = nanoid();
    if (!connection.sockets) connection.sockets = new Map();
    connection.sockets.set(socketId, websocket);

    // Let the client know the socket is open
    const open: WebSocketOpenMessage = {
      socketId,
      type: "WebSocketOpenMessage",
      url: request.url,
      headers: request.headers,
    };
    connection.websocket.sendMessage(open);

    // Forget socket on close
    websocket.on("close", (code, data) => {
      connection.sockets?.delete(socketId);
      const closed: WebSocketCloseMessage = {
        socketId,
        type: "WebSocketCloseMessage",
        code,
        data,
      };
      console.log("websocket.on.close", closed);
      connection.websocket.sendMessage(closed);
    });

    websocket.removeAllListeners("message");

    // Send messages to the client
    websocket.on("message", (text: string) => {
      const forward: WebSocketHostMessage = {
        socketId,
        type: "WebSocketHostMessage",
        data: text,
      };
      connection.websocket.sendMessage(forward);
    });

    // Send messages from the client
    connection.websocket.on("message", (text: string) => {
      const message = JSON.parse(text);
      if (message.socketId !== socketId) return;

      if (message.type === "WebSocketClientMessage") {
        websocket.send(message.data);
      } else if (message.type === "WebSocketCloseMessage") {
        websocket.close(message.code, message.data);
      }
    });
  }
}
