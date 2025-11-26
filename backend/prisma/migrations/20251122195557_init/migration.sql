-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ADMIN', 'GERENTE_LOJA', 'USUARIO_CD', 'FORNECEDOR', 'CLIENTE_B2B', 'OPERADOR') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `telefone` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_type_idx`(`type`),
    INDEX `User_lojaId_idx`(`lojaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Loja` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `prioridade` INTEGER NOT NULL DEFAULT 5,
    `endereco` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Loja_codigo_key`(`codigo`),
    INDEX `Loja_codigo_idx`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produto` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `precoAtacado` DECIMAL(10, 2) NOT NULL,
    `precoVarejo` DECIMAL(10, 2) NOT NULL,
    `curva` ENUM('A', 'B', 'C') NOT NULL DEFAULT 'B',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `larguraMetros` DECIMAL(5, 2) NULL,
    `composicao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Produto_codigo_key`(`codigo`),
    INDEX `Produto_codigo_idx`(`codigo`),
    INDEX `Produto_curva_idx`(`curva`),
    INDEX `Produto_categoria_idx`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cor` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `codigoHex` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `produtoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Cor_produtoId_idx`(`produtoId`),
    UNIQUE INDEX `Cor_produtoId_nome_key`(`produtoId`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estoque` (
    `id` VARCHAR(191) NOT NULL,
    `quantidade` DECIMAL(10, 2) NOT NULL,
    `quantidadeMin` DECIMAL(10, 2) NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `corId` VARCHAR(191) NOT NULL,
    `local` VARCHAR(191) NOT NULL DEFAULT 'CD',
    `ultimaContagem` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Estoque_produtoId_idx`(`produtoId`),
    INDEX `Estoque_corId_idx`(`corId`),
    INDEX `Estoque_local_idx`(`local`),
    UNIQUE INDEX `Estoque_produtoId_corId_local_key`(`produtoId`, `corId`, `local`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequisicoesAbastecimento` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'APROVADA_PARCIAL', 'RECUSADA', 'ATENDIDA_PARCIAL', 'ATENDIDA', 'ENVIADA') NOT NULL DEFAULT 'PENDENTE',
    `lojaId` VARCHAR(191) NOT NULL,
    `solicitanteId` VARCHAR(191) NOT NULL,
    `aprovadoEm` DATETIME(3) NULL,
    `justificativaRecusa` TEXT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RequisicoesAbastecimento_numero_key`(`numero`),
    INDEX `RequisicoesAbastecimento_numero_idx`(`numero`),
    INDEX `RequisicoesAbastecimento_lojaId_idx`(`lojaId`),
    INDEX `RequisicoesAbastecimento_status_idx`(`status`),
    INDEX `RequisicoesAbastecimento_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequisicoesAbastecimentoItem` (
    `id` VARCHAR(191) NOT NULL,
    `requisicaoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `corId` VARCHAR(191) NOT NULL,
    `quantidadeSolicitada` DECIMAL(10, 2) NOT NULL,
    `quantidadeAprovada` DECIMAL(10, 2) NULL,
    `quantidadeAtendida` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RequisicoesAbastecimentoItem_requisicaoId_idx`(`requisicaoId`),
    INDEX `RequisicoesAbastecimentoItem_produtoId_idx`(`produtoId`),
    INDEX `RequisicoesAbastecimentoItem_corId_idx`(`corId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cotacao` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `status` ENUM('ENVIADA', 'RESPONDENDO', 'COMPLETA', 'APROVADA', 'RECUSADA') NOT NULL DEFAULT 'ENVIADA',
    `criadorId` VARCHAR(191) NOT NULL,
    `automatica` BOOLEAN NOT NULL DEFAULT false,
    `requisicaoOrigemId` VARCHAR(191) NULL,
    `prazoResposta` DATETIME(3) NOT NULL,
    `aprovadaEm` DATETIME(3) NULL,
    `fornecedorEscolhidoId` VARCHAR(191) NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cotacao_numero_key`(`numero`),
    INDEX `Cotacao_numero_idx`(`numero`),
    INDEX `Cotacao_status_idx`(`status`),
    INDEX `Cotacao_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CotacaoItem` (
    `id` VARCHAR(191) NOT NULL,
    `cotacaoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `corId` VARCHAR(191) NOT NULL,
    `quantidadeSolicitada` DECIMAL(10, 2) NOT NULL,
    `ultimoPrecoCompra` DECIMAL(10, 2) NULL,
    `dataUltimaCompra` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CotacaoItem_cotacaoId_idx`(`cotacaoId`),
    INDEX `CotacaoItem_produtoId_idx`(`produtoId`),
    INDEX `CotacaoItem_corId_idx`(`corId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fornecedor` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NULL,
    `contato` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `tokenPublico` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Fornecedor_codigo_key`(`codigo`),
    UNIQUE INDEX `Fornecedor_cnpj_key`(`cnpj`),
    UNIQUE INDEX `Fornecedor_tokenPublico_key`(`tokenPublico`),
    INDEX `Fornecedor_codigo_idx`(`codigo`),
    INDEX `Fornecedor_cnpj_idx`(`cnpj`),
    INDEX `Fornecedor_tokenPublico_idx`(`tokenPublico`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespostaCotacao` (
    `id` VARCHAR(191) NOT NULL,
    `cotacaoId` VARCHAR(191) NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,
    `disponivel` BOOLEAN NOT NULL,
    `quantidadeDisponivel` DECIMAL(10, 2) NULL,
    `precoUnitario` DECIMAL(10, 2) NULL,
    `prazoEntrega` INTEGER NULL,
    `observacoes` TEXT NULL,
    `variacao` DECIMAL(10, 2) NULL,
    `melhorOpcao` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RespostaCotacao_cotacaoId_idx`(`cotacaoId`),
    INDEX `RespostaCotacao_fornecedorId_idx`(`fornecedorId`),
    UNIQUE INDEX `RespostaCotacao_cotacaoId_fornecedorId_key`(`cotacaoId`, `fornecedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoPrecosXML` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,
    `precoUnitario` DECIMAL(10, 2) NOT NULL,
    `quantidade` DECIMAL(10, 2) NOT NULL,
    `dataCompra` DATETIME(3) NOT NULL,
    `numeroNF` VARCHAR(191) NULL,
    `chaveNF` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistoricoPrecosXML_produtoId_idx`(`produtoId`),
    INDEX `HistoricoPrecosXML_fornecedorId_idx`(`fornecedorId`),
    INDEX `HistoricoPrecosXML_dataCompra_idx`(`dataCompra`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClienteB2B` (
    `id` VARCHAR(191) NOT NULL,
    `razaoSocial` VARCHAR(191) NOT NULL,
    `nomeFantasia` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `inscricaoEstadual` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `aprovado` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `aprovadoEm` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ClienteB2B_cnpj_key`(`cnpj`),
    UNIQUE INDEX `ClienteB2B_email_key`(`email`),
    INDEX `ClienteB2B_cnpj_idx`(`cnpj`),
    INDEX `ClienteB2B_email_idx`(`email`),
    INDEX `ClienteB2B_aprovado_idx`(`aprovado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoB2B` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `status` ENUM('SOLICITADO', 'APROVADO', 'RECUSADO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PRODUCAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO') NOT NULL DEFAULT 'SOLICITADO',
    `clienteId` VARCHAR(191) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `valorFrete` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `formaPagamento` VARCHAR(191) NULL,
    `linkPagamento` TEXT NULL,
    `pagoEm` DATETIME(3) NULL,
    `lojaDestinoId` VARCHAR(191) NULL,
    `enderecoEntrega` TEXT NULL,
    `prazoEntrega` INTEGER NOT NULL DEFAULT 15,
    `dataEnvio` DATETIME(3) NULL,
    `dataEntrega` DATETIME(3) NULL,
    `numeroNFe` VARCHAR(191) NULL,
    `chaveNFe` VARCHAR(191) NULL,
    `dataEmissaoNFe` DATETIME(3) NULL,
    `justificativaRecusa` TEXT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PedidoB2B_numero_key`(`numero`),
    INDEX `PedidoB2B_numero_idx`(`numero`),
    INDEX `PedidoB2B_clienteId_idx`(`clienteId`),
    INDEX `PedidoB2B_status_idx`(`status`),
    INDEX `PedidoB2B_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoB2BItem` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `corId` VARCHAR(191) NOT NULL,
    `quantidade` DECIMAL(10, 2) NOT NULL,
    `precoUnitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PedidoB2BItem_pedidoId_idx`(`pedidoId`),
    INDEX `PedidoB2BItem_produtoId_idx`(`produtoId`),
    INDEX `PedidoB2BItem_corId_idx`(`corId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovimentacaoEstoque` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA', 'AJUSTE', 'INVENTARIO') NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `corId` VARCHAR(191) NOT NULL,
    `quantidade` DECIMAL(10, 2) NOT NULL,
    `quantidadeAntes` DECIMAL(10, 2) NOT NULL,
    `quantidadeDepois` DECIMAL(10, 2) NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `numeroNF` VARCHAR(191) NULL,
    `romaneioId` VARCHAR(191) NULL,
    `imagemUrl` TEXT NULL,
    `ocrData` TEXT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MovimentacaoEstoque_produtoId_idx`(`produtoId`),
    INDEX `MovimentacaoEstoque_corId_idx`(`corId`),
    INDEX `MovimentacaoEstoque_local_idx`(`local`),
    INDEX `MovimentacaoEstoque_tipo_idx`(`tipo`),
    INDEX `MovimentacaoEstoque_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Romaneio` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `requisicaoId` VARCHAR(191) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `dataSeparacao` DATETIME(3) NOT NULL,
    `dataEnvio` DATETIME(3) NULL,
    `pdfUrl` TEXT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Romaneio_numero_key`(`numero`),
    INDEX `Romaneio_numero_idx`(`numero`),
    INDEX `Romaneio_requisicaoId_idx`(`requisicaoId`),
    INDEX `Romaneio_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DEPARA` (
    `id` VARCHAR(191) NOT NULL,
    `nomeFornecedor` VARCHAR(191) NOT NULL,
    `nomeERP` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DEPARA_nomeFornecedor_idx`(`nomeFornecedor`),
    INDEX `DEPARA_nomeERP_idx`(`nomeERP`),
    UNIQUE INDEX `DEPARA_nomeFornecedor_key`(`nomeFornecedor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `oldData` TEXT NULL,
    `newData` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_entity_idx`(`entity`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracao` (
    `id` VARCHAR(191) NOT NULL,
    `chave` VARCHAR(191) NOT NULL,
    `valor` TEXT NOT NULL,
    `descricao` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Configuracao_chave_key`(`chave`),
    INDEX `Configuracao_chave_idx`(`chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cor` ADD CONSTRAINT `Cor_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estoque` ADD CONSTRAINT `Estoque_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estoque` ADD CONSTRAINT `Estoque_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `Cor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequisicoesAbastecimento` ADD CONSTRAINT `RequisicoesAbastecimento_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequisicoesAbastecimento` ADD CONSTRAINT `RequisicoesAbastecimento_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequisicoesAbastecimentoItem` ADD CONSTRAINT `RequisicoesAbastecimentoItem_requisicaoId_fkey` FOREIGN KEY (`requisicaoId`) REFERENCES `RequisicoesAbastecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequisicoesAbastecimentoItem` ADD CONSTRAINT `RequisicoesAbastecimentoItem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequisicoesAbastecimentoItem` ADD CONSTRAINT `RequisicoesAbastecimentoItem_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `Cor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cotacao` ADD CONSTRAINT `Cotacao_criadorId_fkey` FOREIGN KEY (`criadorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cotacao` ADD CONSTRAINT `Cotacao_fornecedorEscolhidoId_fkey` FOREIGN KEY (`fornecedorEscolhidoId`) REFERENCES `Fornecedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoItem` ADD CONSTRAINT `CotacaoItem_cotacaoId_fkey` FOREIGN KEY (`cotacaoId`) REFERENCES `Cotacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoItem` ADD CONSTRAINT `CotacaoItem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotacaoItem` ADD CONSTRAINT `CotacaoItem_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `Cor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespostaCotacao` ADD CONSTRAINT `RespostaCotacao_cotacaoId_fkey` FOREIGN KEY (`cotacaoId`) REFERENCES `Cotacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespostaCotacao` ADD CONSTRAINT `RespostaCotacao_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `Fornecedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoPrecosXML` ADD CONSTRAINT `HistoricoPrecosXML_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoPrecosXML` ADD CONSTRAINT `HistoricoPrecosXML_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `Fornecedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoB2B` ADD CONSTRAINT `PedidoB2B_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `ClienteB2B`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoB2B` ADD CONSTRAINT `PedidoB2B_lojaDestinoId_fkey` FOREIGN KEY (`lojaDestinoId`) REFERENCES `Loja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoB2B` ADD CONSTRAINT `PedidoB2B_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoB2BItem` ADD CONSTRAINT `PedidoB2BItem_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `PedidoB2B`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoB2BItem` ADD CONSTRAINT `PedidoB2BItem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoB2BItem` ADD CONSTRAINT `PedidoB2BItem_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `Cor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentacaoEstoque` ADD CONSTRAINT `MovimentacaoEstoque_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentacaoEstoque` ADD CONSTRAINT `MovimentacaoEstoque_corId_fkey` FOREIGN KEY (`corId`) REFERENCES `Cor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentacaoEstoque` ADD CONSTRAINT `MovimentacaoEstoque_romaneioId_fkey` FOREIGN KEY (`romaneioId`) REFERENCES `Romaneio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Romaneio` ADD CONSTRAINT `Romaneio_requisicaoId_fkey` FOREIGN KEY (`requisicaoId`) REFERENCES `RequisicoesAbastecimento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
