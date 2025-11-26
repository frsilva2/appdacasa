-- CreateTable
CREATE TABLE `CotacaoFornecedorToken` (
    `id` VARCHAR(191) NOT NULL,
    `cotacaoId` VARCHAR(191) NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `respondido` BOOLEAN NOT NULL DEFAULT false,
    `dataResposta` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CotacaoFornecedorToken_token_key`(`token`),
    INDEX `CotacaoFornecedorToken_token_idx`(`token`),
    INDEX `CotacaoFornecedorToken_cotacaoId_idx`(`cotacaoId`),
    INDEX `CotacaoFornecedorToken_fornecedorId_idx`(`fornecedorId`),
    UNIQUE INDEX `CotacaoFornecedorToken_cotacaoId_fornecedorId_key`(`cotacaoId`, `fornecedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CotacaoItemResposta` (
    `id` VARCHAR(191) NOT NULL,
    `cotacaoItemId` VARCHAR(191) NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,
    `tokenId` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `prazoEntrega` INTEGER NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CotacaoItemResposta_cotacaoItemId_idx`(`cotacaoItemId`),
    INDEX `CotacaoItemResposta_fornecedorId_idx`(`fornecedorId`),
    INDEX `CotacaoItemResposta_tokenId_idx`(`tokenId`),
    UNIQUE INDEX `CotacaoItemResposta_cotacaoItemId_fornecedorId_key`(`cotacaoItemId`, `fornecedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CotacaoFornecedorToken` ADD CONSTRAINT `CotacaoFornecedorToken_cotacaoId_fkey` FOREIGN KEY (`cotacaoId`) REFERENCES `Cotacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoFornecedorToken` ADD CONSTRAINT `CotacaoFornecedorToken_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `Fornecedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoItemResposta` ADD CONSTRAINT `CotacaoItemResposta_cotacaoItemId_fkey` FOREIGN KEY (`cotacaoItemId`) REFERENCES `CotacaoItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoItemResposta` ADD CONSTRAINT `CotacaoItemResposta_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `Fornecedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoItemResposta` ADD CONSTRAINT `CotacaoItemResposta_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `CotacaoFornecedorToken`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
