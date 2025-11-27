-- CreateTable
CREATE TABLE `Inventario` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `tipo` ENUM('INVENTARIO', 'CONFERENCIA') NOT NULL,
    `status` ENUM('EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'EM_ANDAMENTO',
    `responsavelId` VARCHAR(191) NOT NULL,
    `observacoes` TEXT NULL,
    `dataFinalizacao` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Inventario_numero_key`(`numero`),
    INDEX `Inventario_numero_idx`(`numero`),
    INDEX `Inventario_status_idx`(`status`),
    INDEX `Inventario_responsavelId_idx`(`responsavelId`),
    INDEX `Inventario_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventarioItem` (
    `id` VARCHAR(191) NOT NULL,
    `inventarioId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `corId` VARCHAR(191) NOT NULL,
    `quantidadeSistema` VARCHAR(20) NOT NULL DEFAULT '0',
    `quantidadeContada` VARCHAR(20) NOT NULL DEFAULT '0',
    `divergencia` VARCHAR(20) NOT NULL DEFAULT '0',
    `lote` VARCHAR(50) NULL,
    `observacoes` TEXT NULL,
    `ocrData` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InventarioItem_inventarioId_idx`(`inventarioId`),
    INDEX `InventarioItem_produtoId_idx`(`produtoId`),
    INDEX `InventarioItem_corId_idx`(`corId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventarioItem` ADD CONSTRAINT `InventarioItem_inventarioId_fkey` FOREIGN KEY (`inventarioId`) REFERENCES `Inventario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventarioItem` ADD CONSTRAINT `InventarioItem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventarioItem` ADD CONSTRAINT `InventarioItem_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `Cor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
