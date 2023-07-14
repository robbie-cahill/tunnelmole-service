export default interface WebSocketClientMessage {
  type: "WebSocketClientMessage";
  socketId: string;
  data: string; // Not base64 encoded
}
