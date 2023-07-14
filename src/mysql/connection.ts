import config from "../../config";

import mysql from "mysql2";

const connection =
  typeof config.mysql === "string"
    ? mysql.createConnection(config.mysql)
    : config.mysql
    ? mysql.createConnection(config.mysql)
    : null;

export default connection;
