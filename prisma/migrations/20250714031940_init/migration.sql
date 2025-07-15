-- CreateTable
CREATE TABLE `websites` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` ENUM('HTTP', 'HTTPS', 'PING') NOT NULL DEFAULT 'HTTP',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_checks` (
    `id` VARCHAR(191) NOT NULL,
    `websiteId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `responseTime` INTEGER NULL,
    `statusCode` INTEGER NULL,
    `errorMessage` TEXT NULL,
    `checkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `status_checks_websiteId_checkedAt_idx`(`websiteId`, `checkedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `status_checks` ADD CONSTRAINT `status_checks_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `websites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
