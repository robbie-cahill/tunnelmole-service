export default function parseJson(body: Buffer): any {
    return JSON.parse(body.toString());
}