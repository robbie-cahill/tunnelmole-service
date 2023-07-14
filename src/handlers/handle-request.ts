import { Request, Response } from "express";
import Proxy from "../proxy";
import Connection from "../connection";
import ForwardedRequestMessage from "../messages/forwarded-request-message";
import ForwardedResponseMessage from "../messages/forwarded-response-message";
import { nanoid } from "nanoid";
import websocket from "../../websocket";

const capitalize = require("capitalize");
const tenMinutesInMilliseconds = 300000;

const handleRequest = async function (request: Request, response: Response) {
  const proxy = Proxy.getInstance();
  const url = new URL("https://" + request.headers.host);
  const hostname = url.hostname;
  const connection: Connection = proxy.findConnectionByHostname(hostname);

  if (typeof connection === "undefined") {
    response.status(404);
    response.send("No matching tunnelmole domain for " + hostname);
    return;
  }

  const headers = {};
  for (let index = 0; index < request.rawHeaders.length; index += 2)
    headers[request.rawHeaders[index]] = request.rawHeaders[index + 1];

  const requestId = nanoid();
  const forwardedRequest: ForwardedRequestMessage = {
    requestId,
    type: "forwardedRequest",
    url: request.originalUrl,
    method: request.method,
    headers,
    // Empty body results in {} Object instead of empty Buffer
    body: Buffer.isBuffer(request.body) ? request.body.toString("base64") : "",
  };

  connection.websocket.sendMessage(forwardedRequest);

  // In theory, node will clean up this handler when there are no more references to it
  // If it doesn't find a way to destroy it manually after setTimeout()
  const forwardedResponseHandler = (text: string) => {
    try {
      const forwardedResponseMessage: ForwardedResponseMessage =
        JSON.parse(text);
      const body = Buffer.from(forwardedResponseMessage.body, "base64");
      forwardedResponseMessage.headers["x-forwarded-for"] =
        connection.websocket.ipAddress;

      // Bail if this handler is not for the request that created it
      if (forwardedResponseMessage.requestId !== requestId) {
        return;
      }

      if (forwardedResponseMessage.type === "forwardedResponse") {
        response.status(forwardedResponseMessage.statusCode);

        for (const name in forwardedResponseMessage.headers) {
          const value = forwardedResponseMessage.headers[name];
          response.header(capitalize.words(name), value);
        }

        response.send(body);
      }

      // Now that this listener has served its purpose, remove it
      connection.websocket.removeListener("message", forwardedResponseHandler);
    } catch (error) {
      // Log errors and remove listener
      console.error(
        "Caught error in forwardedResponseHandler for request id " +
          requestId +
          ":" +
          error.message,
      );
      console.error(error);
      connection.websocket.removeListener("message", forwardedResponseHandler);
    }
  };

  // Set a new message listener on the clients websocket connection to handle the response
  connection.websocket.on("message", forwardedResponseHandler);

  // Remove the listener automatically after 10 minutes, if its not already gone
  setTimeout(() => {
    connection.websocket.removeListener("message", forwardedResponseHandler);
  }, tenMinutesInMilliseconds);

  return;
};

export default handleRequest;
