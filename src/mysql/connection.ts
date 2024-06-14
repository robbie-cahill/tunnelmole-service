import config from "../../config";
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    waitForConnections: true,
    connectionLimit: 10, // You can adjust this based on your needs
    queueLimit: 0
});

const getConnection = async () => {
    return pool;
}

export {
    getConnection,
};