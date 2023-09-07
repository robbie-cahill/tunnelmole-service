import config from "../../config";

import mysql from 'mysql2/promise';

let connection: mysql.Connection;

const getConnection = async () => {
    if (!connection) {
        connection = await mysql.createConnection({
            host     : config.mysql.host,
            user     : config.mysql.user,
            password : config.mysql.password,
            database : config.mysql.database
        });
    }

    return connection;
}

export {
    getConnection
};