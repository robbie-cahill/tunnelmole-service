import WebSocket from 'ws';
import InitialiseMessage from '../messages/initialise-message';

export default async function genericMessageHandlerTemplate(message: InitialiseMessage, websocket: WebSocket) {
    console.log('Received message');
    console.info(message);
}