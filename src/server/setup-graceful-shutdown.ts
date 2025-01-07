import ClientMessage from "../messages/client-message";
import Proxy from "../proxy";

const setupGracefulShutdown = () => {
    const handleShutdown = () => {
        console.log("The Server is shutting down. Notifying clients... ");

        const proxy = Proxy.getInstance();

        proxy.connections.forEach((connection) => {
            const { websocket } = connection;

            const clientMessage: ClientMessage = {
                type: "clientMessage",
                logLevel: "info",
                message: "The server is restarting for maintenance. Please reconnect shortly.",
            };
            try {
                websocket.sendMessage(clientMessage);
                websocket.close(); // Close the connection after notifying
            } catch (err) {
                console.error("Error notifying websocket during shutdown:", err);
            }
        });
        
        console.log("All clients have been notified of shutdown, shutting down");
        process.exit(0);
    };

    // Listen for shutdown signals
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
}

export { setupGracefulShutdown }