import moment from "moment-timezone";
import config from "../../config";
import { Message } from "../telemetry/message";
import { getConnection } from "../mysql/connection";

const logTelemetryMessage = async function(message: Message) {
    const connection = getConnection();
    const enableLogging = config.runtime.enableLogging ?? false;

    if (!enableLogging) {
        return;
    }

    const date = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');
    const sql = `
        INSERT INTO client_telemetry
        (
            \`date\`,
            type,
            data
        )
        VALUES (
             "${date}",
             ${connection.escape(message.type)},
             '${JSON.stringify(message.data)}'
        )
    `;
    connection.query(sql, (error: any, results: any, fields: any) => {
        if (error !== null) {
            console.error(error);
        }
    });
}

export { logTelemetryMessage };
