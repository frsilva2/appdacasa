/*
  Warnings:

  - You are about to alter the column `status` on the `PedidoB2B` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `PedidoB2B` ADD COLUMN `dataPagamentoConfirmado` DATETIME(3) NULL,
    ADD COLUMN `dataPrevisaoEntrega` DATETIME(3) NULL,
    MODIFY `status` ENUM('AGUARDANDO_APROVACAO', 'APROVADO', 'RECUSADO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO') NOT NULL DEFAULT 'AGUARDANDO_APROVACAO';
