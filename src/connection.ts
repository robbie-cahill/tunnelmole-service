import HostipWebSocket from './websocket/host-ip-websocket';

export default class Connection
{
    hostname : string;
    clientId : string;
    websocket: HostipWebSocket;
}