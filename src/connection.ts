import HostipWebSocket from './websocket/host-ip-websocket';

export default class Connection
{
    hostname : string;
    clientId : string;
    ipAddress: string;
    apiKey: string;
    websocket: HostipWebSocket;
}