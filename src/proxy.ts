import Connection from "./connection";
import HostipWebSocket from "./websocket/host-ip-websocket";

export default class Proxy {
    private static instance : Proxy;

    // @todo: see if any cleanup is needed i.e. when clients disconnect
    connections : Array<Connection> = [];

    findConnectionByClientId(clientId : string) : Connection|undefined {
        const connection : Connection|undefined = this.connections.find(connection => connection.clientId === clientId);
        return connection;
    }

    findConnectionsByClientId(clientId: string): Connection[] {
        return this.connections.filter((connection: Connection) => connection.clientId === clientId);        
    }

    findConnectionByHostname(hostname : string) : Connection|undefined {
        const connection : Connection|undefined = this.connections.find(connection => connection.hostname === hostname);
        return connection;
    }

    addConnection(hostname: string, websocket: HostipWebSocket, clientId: string, apiKey: string, ipAddress: string): void {
        websocket.tunnelmoleClientId = clientId;

        const connection : Connection = {
            hostname,
            clientId,
            ipAddress,
            apiKey,
            websocket
        };

        this.connections.push(connection);
    }

    deleteConnection(clientId: string) {
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];

            if (connection.clientId === clientId) {
                this.connections.splice(i, 1);
            }
        }
    }

    listConnections() {
        return this.connections;
    }

    replaceWebsocket(hostname : string, websocket: HostipWebSocket) : void {
        const connection : Connection = this.findConnectionByHostname(hostname);
        connection.websocket.close(); // clean up existing connection
        connection.websocket = websocket; // overwrite connection
    }

    public static getInstance(): Proxy {
        if (!Proxy.instance) {
            Proxy.instance = new Proxy();
        }

        return Proxy.instance;
    }
}