import { Request, Response } from "express";
import config from "../../config";
import Connection from "../connection";
import Proxy from "../proxy";

const topSecretPassword = config.server.password;

const tunnelmoleConnections = async function (req: Request, res: Response) {
  const password = req.query.password;

  // Empty password is not allowed
  if (!password || password !== topSecretPassword) {
    res.status(401);
    res.send("Unauthorized. Your attempt has been logged");
    return;
  }

  const proxy = Proxy.getInstance();
  const connectionsList = proxy.listConnections();
  const connectionsReport = connectionsList.map((connection: Connection) => {
    const { hostname, clientId } = connection;
    const ipAddress = connection.websocket.ipAddress;

    return {
      hostname,
      clientId,
      ipAddress,
    };
  });

  res.send(connectionsReport);
};

export default tunnelmoleConnections;
