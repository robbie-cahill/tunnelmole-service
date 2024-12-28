import moment from "moment";
import HostipWebSocket from "./host-ip-websocket";
import { TWELVE_HOURS_IN_SECONDS } from "../../constants";
import ClientMessage from "../messages/client-message";
import config from "../../config";

/**
 * Prevent the websocket default timeout of 60 seconds and manage the timeout ourselves
 * 
 * @param clients 
 * @returns 
 */
const connectionTimeoutLoop = (clients: any): NodeJS.Timeout => {
    return setInterval(function ping() {
        clients.forEach(function each(websocket: HostipWebSocket) {
            const now = moment().unix();
            
            // Tunnelmole connection timeout - set from config, or default to 12 hours
            const timeout = config.runtime.connectionTimeout ?? TWELVE_HOURS_IN_SECONDS;
            const connectionExpiry = websocket.connectionStart + timeout;

            if (now > connectionExpiry) {
                console.info("Connection timeout of " + timeout + " seconds has passed, terminating connection");
                const message: ClientMessage = {
                    type: "clientMessage",
                    logLevel: "error",
                    message: "Your Tunnelmole connection has timed out. The current timeout is 12 hours"
                }

                websocket.sendMessage(message);

                return websocket.terminate();
            }

            function noop() {}

            // Client will send back pong automatically as per the Websocket spec
            websocket.ping(noop);
        });
    }, config.runtime.timeoutCheckFrequency ?? 45000); // per config, or default to 45 seconds
}

export { connectionTimeoutLoop }