export default interface WebSocketCloseMessage {
  type: "WebSocketCloseMessage";
  socketId: string;
  code?: number;
  data?: string;
}
