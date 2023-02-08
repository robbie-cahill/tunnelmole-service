export default interface ForwardedRequestMessage
{
    type: string,
    requestId: string,
    url: string,
    method: string,
    headers: any,
    body: string, // Will always be base64 encoded from a Buffer
}