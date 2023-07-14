export default interface WebSocketOpenMessage {
  type: "WebSocketOpenMessage";
  socketId: string;
  url: string;
  headers: any;
}
