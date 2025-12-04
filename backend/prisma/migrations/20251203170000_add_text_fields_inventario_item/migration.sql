-- AlterTable: Adicionar campos de texto e tornar IDs opcionais no InventarioItem
-- Adicionar novos campos de texto
ALTER TABLE `InventarioItem` ADD COLUMN `produtoNome` VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE `InventarioItem` ADD COLUMN `corNome` VARCHAR(100) NULL;
ALTER TABLE `InventarioItem` ADD COLUMN `codigoCor` VARCHAR(20) NULL;
ALTER TABLE `InventarioItem` ADD COLUMN `fonteOCR` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `InventarioItem` ADD COLUMN `produtoNoDEPARA` BOOLEAN NOT NULL DEFAULT false;

-- Preencher produtoNome com dados existentes (se houver)
UPDATE `InventarioItem` i
INNER JOIN `Produto` p ON i.produtoId = p.id
SET i.produtoNome = p.nome
WHERE i.produtoNome = '';

-- Tornar produtoId e corId opcionais
ALTER TABLE `InventarioItem` MODIFY `produtoId` VARCHAR(191) NULL;
ALTER TABLE `InventarioItem` MODIFY `corId` VARCHAR(191) NULL;

-- Adicionar índice no produtoNome
CREATE INDEX `InventarioItem_produtoNome_idx` ON `InventarioItem`(`produtoNome`);
