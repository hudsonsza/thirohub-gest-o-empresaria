CREATE TABLE `adminUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` text NOT NULL,
	`name` varchar(255),
	`sessionToken` varchar(255),
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminUsers_email_unique` UNIQUE(`email`),
	CONSTRAINT `adminUsers_sessionToken_unique` UNIQUE(`sessionToken`)
);
