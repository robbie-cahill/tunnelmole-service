CREATE TABLE IF NOT EXISTS `client_telemetry` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATETIME DEFAULT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `data` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `reserved_domains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apiKey` VARCHAR(255) NOT NULL,
  `subdomain` VARCHAR(255) NOT NULL,
  `lastUseDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `client_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` varchar(255) DEFAULT NULL,
  `eventKey` varchar(255) DEFAULT NULL,
  `eventValue` text,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);