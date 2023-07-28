import fs from "fs";
import toml from "toml";

// Read config from environment variables
let config = {
  environment: process.env.NODE_ENV || "local",
  server: {
    httpPort:
      parseInt(process.env.TUNNELMOLE_PORT) || parseInt(process.env.PORT) || 80,
    websocketPort:
      parseInt(process.env.TUNNELMOLE_WEBSOCKET_PORT) ||
      parseInt(process.env.TUNNELMOLE_PORT) ||
      parseInt(process.env.PORT) ||
      80,
    domain: process.env.TUNNELMOLE_DOMAIN || "localhost",
    // If empty, admin endpoints will be disabled
    password: process.env.TUNNELMOLE_PASSWORD || "",
    // If empty, will load from /src/authentication/apiKeys.json
    apiKeys: splitComma(process.env.TUNNELMOLE_API_KEYS),
    bannedIps: splitComma(process.env.TUNNELMOLE_BANNED_IPS),
    bannedClientIds: splitComma(process.env.TUNNELMOLE_BANNED_CLIENT_IDS),
    bannedHostnames: splitComma(process.env.TUNNELMOLE_BANNED_HOSTNAMES),
  },
  mysql:
    // Connection string like mysql://user:password@host:port/database
    process.env.MYSQL ??
    (process.env.MYSQL_DATABASE
      ? {
          host: process.env.MYSQL_HOST || "localhost",
          user: process.env.MYSQL_USER || "root",
          password: process.env.MYSQL_PASSWORD || "",
          database: process.env.MYSQL_DATABASE || "tunnelmole",
        }
      : undefined),
  runtime: {
    debug: !!process.env.DEBUG,
    enableLogging: !!(process.env.MYSQL || process.env.MYSQL_DATABASE),
  },
};

// Override config with config.toml
// TODO: consider env vars over config.toml
try {
  Object.assign(config, toml.parse(fs.readFileSync("config.toml").toString()));
} catch (error) {}

export default config;

function splitComma(input: string | undefined) {
  return typeof input === "string" ? input.split(",") : [];
}
