import moment from "moment-timezone";
import config from "../../config";
import { getConnection } from "../mysql/connection";

export default async function addClientLog(clientId: string, eventKey: string, eventValue: string): Promise<void> {
    const enableLogging = config.runtime.enableLogging ?? false;

    if (!enableLogging) {
        return;
    }

    const connection = await getConnection();

    const date = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');
    await connection.query(
        `INSERT INTO client_log
         VALUES (
             0,
             "${connection.escape(clientId)}",
             "${connection.escape(eventKey)}",
             "${connection.escape(eventValue)}",
             "${date}"
        )
    `);
}
