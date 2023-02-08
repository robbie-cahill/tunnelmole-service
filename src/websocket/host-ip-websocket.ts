import WebSocket from 'ws';

export default class HostipWebSocket extends WebSocket
{
    tunnelmoleClientId: string;
    connectionStart: number;
    isAlive: boolean;
    ipAddress: string;
    // stub for websocket
    sendMessage(object : any) {}
}