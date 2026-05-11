import HostipWebSocket from '../websocket/host-ip-websocket';
import InitialiseMessage from '../messages/initialise-message';
import InvalidSubscriptionMessage from '../messages/invalid-subscription-message';
import initialise from '../message-handlers/initialise';
import { isAuthorizedApiKey } from './api-key';

const authorize = async(message: InitialiseMessage, websocket: HostipWebSocket, randomSubdomain: string) : Promise<boolean> => {
    const { apiKey } = message;

    if (process.env.LOG_CONNECTION_INFO) {
        console.info(JSON.stringify(message.connectionInfo));
    }

    // No API key record. Send back a message, close the connection and return false 
    if (!isAuthorizedApiKey(apiKey)) {
        const invalidSubscriptionMessage : InvalidSubscriptionMessage = {
            type: "invalidSubscription",
            apiKey: apiKey
        }

        websocket.sendMessage(invalidSubscriptionMessage);
        websocket.close();
        return false;
    }

    return true;
}

export {
    authorize
}
