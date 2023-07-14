import { messageHandlers } from "./message-handlers";
import HostipWebSocket from "./src/websocket/host-ip-websocket";
import log from "./src/logging/log";
import moment from "moment";
import Proxy from "./src/proxy";
import { IncomingMessage } from "http";
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
    const dynamicallyHandledMessageTypes = ["forwardedResponse"];

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
  websocket.on("message", (text: string) => {
    const message = JSON.parse(text);
    log(Date.now() + " Received " + message.type + " message:", "info");
    log(message, "info");
  });

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
