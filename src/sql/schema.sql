CREATE TABLE IF NOT EXISTS `client_telemetry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `data` text DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `reserved_domains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apiKey` VARCHAR(255) NOT NULL,
  `subdomain` VARCHAR(255) NOT NULL
)