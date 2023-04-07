import { Request, Response } from "express";
import parseJson from "../express/parse-json";
import { logTelemetryMessage } from "../logging/log-telemetry-message";
import { Message } from "../telemetry/message";

const logTelemetry = async function(request : Request, response : Response) {
    const payload = parseJson(request.body);

    if (payload.type === undefined) {
        console.warn(`Invalid telemetry message received: ${JSON.stringify(payload)}`);
        return;
    }

    if (!payload.data) {
        console.warn(`Invalid telemetry message received: ${JSON.stringify(payload)}`);
        return
    }

    const message: Message = payload;

    await logTelemetryMessage(message);

    response.status(204);
    response.end();
}

export default logTelemetry;