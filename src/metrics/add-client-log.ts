import moment from "moment-timezone";
import config from "../../config";
import connection from "../mysql/connection";

export default function addClientLog(clientId: string, eventKey: string, eventValue: string): void {
    const enableLogging = config.runtime.enableLogging ?? false;

    if (!enableLogging) {
        return;
    }

    const date = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');
    connection.query(
        `INSERT INTO client_log
         VALUES (
             0,
             "${connection.escape(clientId)}",
             "${connection.escape(eventKey)}",
             "${connection.escape(eventValue)}",
             "${date}"
        )
    `, (error: any, results: any, fields: any) => {
        if (error !== null) {
            console.error(error);
        }
    });
}
