export default interface WebSocketHostMessage {
  type: "WebSocketHostMessage";
  socketId: string;
  data: string; // Not base64 encodedfer
}
