-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'GERENTE_LOJA', 'USUARIO_CD', 'FORNECEDOR', 'CLIENTE_B2B', 'OPERADOR');

-- CreateEnum
CREATE TYPE "RequisicaoStatus" AS ENUM ('PENDENTE', 'APROVADA', 'APROVADA_PARCIAL', 'RECUSADA', 'ATENDIDA_PARCIAL', 'ATENDIDA', 'ENVIADA');

-- CreateEnum
CREATE TYPE "CotacaoStatus" AS ENUM ('ENVIADA', 'RESPONDENDO', 'COMPLETA', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "PedidoB2BStatus" AS ENUM ('AGUARDANDO_APROVACAO', 'APROVADO', 'RECUSADO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CurvaABC" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE', 'INVENTARIO');

-- CreateEnum
CREATE TYPE "InventarioTipo" AS ENUM ('INVENTARIO', 'CONFERENCIA');

-- CreateEnum
CREATE TYPE "InventarioStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "telefone" TEXT,
    "lojaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loja" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "prioridade" INTEGER NOT NULL DEFAULT 5,
    "endereco" TEXT,
    "telefone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precoAtacado" DECIMAL(10,2) NOT NULL,
    "precoVarejo" DECIMAL(10,2) NOT NULL,
    "curva" "CurvaABC" NOT NULL DEFAULT 'B',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "larguraMetros" DECIMAL(5,2),
    "composicao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigoHex" TEXT,
    "arquivoImagem" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "produtoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" TEXT NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "quantidadeMin" DECIMAL(10,2),
    "produtoId" TEXT NOT NULL,
    "corId" TEXT NOT NULL,
    "local" TEXT NOT NULL DEFAULT 'CD',
    "ultimaContagem" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisicoesAbastecimento" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "RequisicaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "lojaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "aprovadoEm" TIMESTAMP(3),
    "justificativaRecusa" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequisicoesAbastecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisicoesAbastecimentoItem" (
    "id" TEXT NOT NULL,
    "requisicaoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT NOT NULL,
    "quantidadeSolicitada" DECIMAL(10,2) NOT NULL,
    "quantidadeAprovada" DECIMAL(10,2),
    "quantidadeAtendida" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequisicoesAbastecimentoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotacao" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "CotacaoStatus" NOT NULL DEFAULT 'ENVIADA',
    "criadorId" TEXT NOT NULL,
    "automatica" BOOLEAN NOT NULL DEFAULT false,
    "requisicaoOrigemId" TEXT,
    "prazoResposta" TIMESTAMP(3) NOT NULL,
    "aprovadaEm" TIMESTAMP(3),
    "fornecedorEscolhidoId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotacaoItem" (
    "id" TEXT NOT NULL,
    "cotacaoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT NOT NULL,
    "quantidadeSolicitada" DECIMAL(10,2) NOT NULL,
    "ultimoPrecoCompra" DECIMAL(10,2),
    "dataUltimaCompra" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotacaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tokenPublico" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespostaCotacao" (
    "id" TEXT NOT NULL,
    "cotacaoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL,
    "quantidadeDisponivel" DECIMAL(10,2),
    "precoUnitario" DECIMAL(10,2),
    "prazoEntrega" INTEGER,
    "observacoes" TEXT,
    "variacao" DECIMAL(10,2),
    "melhorOpcao" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RespostaCotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotacaoFornecedorToken" (
    "id" TEXT NOT NULL,
    "cotacaoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "respondido" BOOLEAN NOT NULL DEFAULT false,
    "dataResposta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotacaoFornecedorToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotacaoItemResposta" (
    "id" TEXT NOT NULL,
    "cotacaoItemId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "prazoEntrega" INTEGER,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotacaoItemResposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoPrecosXML" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "dataCompra" TIMESTAMP(3) NOT NULL,
    "numeroNF" TEXT,
    "chaveNF" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoPrecosXML_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteB2B" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "aprovadoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteB2B_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoB2B" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "PedidoB2BStatus" NOT NULL DEFAULT 'AGUARDANDO_APROVACAO',
    "clienteId" TEXT NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "valorFrete" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "formaPagamento" TEXT,
    "linkPagamento" TEXT,
    "pagoEm" TIMESTAMP(3),
    "dataPagamentoConfirmado" TIMESTAMP(3),
    "lojaDestinoId" TEXT,
    "enderecoEntrega" TEXT,
    "prazoEntrega" INTEGER NOT NULL DEFAULT 15,
    "dataPrevisaoEntrega" TIMESTAMP(3),
    "dataEnvio" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "numeroNFe" TEXT,
    "chaveNFe" TEXT,
    "dataEmissaoNFe" TIMESTAMP(3),
    "justificativaRecusa" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PedidoB2B_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoB2BItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoB2BItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "quantidadeAntes" DECIMAL(10,2) NOT NULL,
    "quantidadeDepois" DECIMAL(10,2) NOT NULL,
    "local" TEXT NOT NULL,
    "numeroNF" TEXT,
    "romaneioId" TEXT,
    "imagemUrl" TEXT,
    "ocrData" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Romaneio" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "requisicaoId" TEXT NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "dataSeparacao" TIMESTAMP(3) NOT NULL,
    "dataEnvio" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Romaneio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DEPARA" (
    "id" TEXT NOT NULL,
    "nomeFornecedor" TEXT NOT NULL,
    "nomeERP" TEXT NOT NULL,
    "produtoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DEPARA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" TEXT,
    "newData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "InventarioTipo" NOT NULL,
    "status" "InventarioStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "responsavelId" TEXT NOT NULL,
    "observacoes" TEXT,
    "dataFinalizacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioItem" (
    "id" TEXT NOT NULL,
    "inventarioId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT NOT NULL,
    "quantidadeSistema" VARCHAR(20) NOT NULL DEFAULT '0',
    "quantidadeContada" VARCHAR(20) NOT NULL DEFAULT '0',
    "divergencia" VARCHAR(20) NOT NULL DEFAULT '0',
    "lote" VARCHAR(50),
    "observacoes" TEXT,
    "ocrData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventarioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_type_idx" ON "User"("type");

-- CreateIndex
CREATE INDEX "User_lojaId_idx" ON "User"("lojaId");

-- CreateIndex
CREATE UNIQUE INDEX "Loja_codigo_key" ON "Loja"("codigo");

-- CreateIndex
CREATE INDEX "Loja_codigo_idx" ON "Loja"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_codigo_key" ON "Produto"("codigo");

-- CreateIndex
CREATE INDEX "Produto_codigo_idx" ON "Produto"("codigo");

-- CreateIndex
CREATE INDEX "Produto_curva_idx" ON "Produto"("curva");

-- CreateIndex
CREATE INDEX "Produto_categoria_idx" ON "Produto"("categoria");

-- CreateIndex
CREATE INDEX "Cor_produtoId_idx" ON "Cor"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "Cor_produtoId_nome_key" ON "Cor"("produtoId", "nome");

-- CreateIndex
CREATE INDEX "Estoque_produtoId_idx" ON "Estoque"("produtoId");

-- CreateIndex
CREATE INDEX "Estoque_corId_idx" ON "Estoque"("corId");

-- CreateIndex
CREATE INDEX "Estoque_local_idx" ON "Estoque"("local");

-- CreateIndex
CREATE UNIQUE INDEX "Estoque_produtoId_corId_local_key" ON "Estoque"("produtoId", "corId", "local");

-- CreateIndex
CREATE UNIQUE INDEX "RequisicoesAbastecimento_numero_key" ON "RequisicoesAbastecimento"("numero");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimento_numero_idx" ON "RequisicoesAbastecimento"("numero");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimento_lojaId_idx" ON "RequisicoesAbastecimento"("lojaId");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimento_status_idx" ON "RequisicoesAbastecimento"("status");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimento_createdAt_idx" ON "RequisicoesAbastecimento"("createdAt");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimentoItem_requisicaoId_idx" ON "RequisicoesAbastecimentoItem"("requisicaoId");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimentoItem_produtoId_idx" ON "RequisicoesAbastecimentoItem"("produtoId");

-- CreateIndex
CREATE INDEX "RequisicoesAbastecimentoItem_corId_idx" ON "RequisicoesAbastecimentoItem"("corId");

-- CreateIndex
CREATE UNIQUE INDEX "Cotacao_numero_key" ON "Cotacao"("numero");

-- CreateIndex
CREATE INDEX "Cotacao_numero_idx" ON "Cotacao"("numero");

-- CreateIndex
CREATE INDEX "Cotacao_status_idx" ON "Cotacao"("status");

-- CreateIndex
CREATE INDEX "Cotacao_createdAt_idx" ON "Cotacao"("createdAt");

-- CreateIndex
CREATE INDEX "CotacaoItem_cotacaoId_idx" ON "CotacaoItem"("cotacaoId");

-- CreateIndex
CREATE INDEX "CotacaoItem_produtoId_idx" ON "CotacaoItem"("produtoId");

-- CreateIndex
CREATE INDEX "CotacaoItem_corId_idx" ON "CotacaoItem"("corId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_codigo_key" ON "Fornecedor"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_tokenPublico_key" ON "Fornecedor"("tokenPublico");

-- CreateIndex
CREATE INDEX "Fornecedor_codigo_idx" ON "Fornecedor"("codigo");

-- CreateIndex
CREATE INDEX "Fornecedor_cnpj_idx" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE INDEX "Fornecedor_tokenPublico_idx" ON "Fornecedor"("tokenPublico");

-- CreateIndex
CREATE INDEX "RespostaCotacao_cotacaoId_idx" ON "RespostaCotacao"("cotacaoId");

-- CreateIndex
CREATE INDEX "RespostaCotacao_fornecedorId_idx" ON "RespostaCotacao"("fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "RespostaCotacao_cotacaoId_fornecedorId_key" ON "RespostaCotacao"("cotacaoId", "fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoFornecedorToken_token_key" ON "CotacaoFornecedorToken"("token");

-- CreateIndex
CREATE INDEX "CotacaoFornecedorToken_token_idx" ON "CotacaoFornecedorToken"("token");

-- CreateIndex
CREATE INDEX "CotacaoFornecedorToken_cotacaoId_idx" ON "CotacaoFornecedorToken"("cotacaoId");

-- CreateIndex
CREATE INDEX "CotacaoFornecedorToken_fornecedorId_idx" ON "CotacaoFornecedorToken"("fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoFornecedorToken_cotacaoId_fornecedorId_key" ON "CotacaoFornecedorToken"("cotacaoId", "fornecedorId");

-- CreateIndex
CREATE INDEX "CotacaoItemResposta_cotacaoItemId_idx" ON "CotacaoItemResposta"("cotacaoItemId");

-- CreateIndex
CREATE INDEX "CotacaoItemResposta_fornecedorId_idx" ON "CotacaoItemResposta"("fornecedorId");

-- CreateIndex
CREATE INDEX "CotacaoItemResposta_tokenId_idx" ON "CotacaoItemResposta"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoItemResposta_cotacaoItemId_fornecedorId_key" ON "CotacaoItemResposta"("cotacaoItemId", "fornecedorId");

-- CreateIndex
CREATE INDEX "HistoricoPrecosXML_produtoId_idx" ON "HistoricoPrecosXML"("produtoId");

-- CreateIndex
CREATE INDEX "HistoricoPrecosXML_fornecedorId_idx" ON "HistoricoPrecosXML"("fornecedorId");

-- CreateIndex
CREATE INDEX "HistoricoPrecosXML_dataCompra_idx" ON "HistoricoPrecosXML"("dataCompra");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteB2B_cnpj_key" ON "ClienteB2B"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteB2B_email_key" ON "ClienteB2B"("email");

-- CreateIndex
CREATE INDEX "ClienteB2B_cnpj_idx" ON "ClienteB2B"("cnpj");

-- CreateIndex
CREATE INDEX "ClienteB2B_email_idx" ON "ClienteB2B"("email");

-- CreateIndex
CREATE INDEX "ClienteB2B_aprovado_idx" ON "ClienteB2B"("aprovado");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoB2B_numero_key" ON "PedidoB2B"("numero");

-- CreateIndex
CREATE INDEX "PedidoB2B_numero_idx" ON "PedidoB2B"("numero");

-- CreateIndex
CREATE INDEX "PedidoB2B_clienteId_idx" ON "PedidoB2B"("clienteId");

-- CreateIndex
CREATE INDEX "PedidoB2B_status_idx" ON "PedidoB2B"("status");

-- CreateIndex
CREATE INDEX "PedidoB2B_createdAt_idx" ON "PedidoB2B"("createdAt");

-- CreateIndex
CREATE INDEX "PedidoB2BItem_pedidoId_idx" ON "PedidoB2BItem"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoB2BItem_produtoId_idx" ON "PedidoB2BItem"("produtoId");

-- CreateIndex
CREATE INDEX "PedidoB2BItem_corId_idx" ON "PedidoB2BItem"("corId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_produtoId_idx" ON "MovimentacaoEstoque"("produtoId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_corId_idx" ON "MovimentacaoEstoque"("corId");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_local_idx" ON "MovimentacaoEstoque"("local");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_tipo_idx" ON "MovimentacaoEstoque"("tipo");

-- CreateIndex
CREATE INDEX "MovimentacaoEstoque_createdAt_idx" ON "MovimentacaoEstoque"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Romaneio_numero_key" ON "Romaneio"("numero");

-- CreateIndex
CREATE INDEX "Romaneio_numero_idx" ON "Romaneio"("numero");

-- CreateIndex
CREATE INDEX "Romaneio_requisicaoId_idx" ON "Romaneio"("requisicaoId");

-- CreateIndex
CREATE INDEX "Romaneio_createdAt_idx" ON "Romaneio"("createdAt");

-- CreateIndex
CREATE INDEX "DEPARA_nomeFornecedor_idx" ON "DEPARA"("nomeFornecedor");

-- CreateIndex
CREATE INDEX "DEPARA_nomeERP_idx" ON "DEPARA"("nomeERP");

-- CreateIndex
CREATE UNIQUE INDEX "DEPARA_nomeFornecedor_key" ON "DEPARA"("nomeFornecedor");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_chave_key" ON "Configuracao"("chave");

-- CreateIndex
CREATE INDEX "Configuracao_chave_idx" ON "Configuracao"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "Inventario_numero_key" ON "Inventario"("numero");

-- CreateIndex
CREATE INDEX "Inventario_numero_idx" ON "Inventario"("numero");

-- CreateIndex
CREATE INDEX "Inventario_status_idx" ON "Inventario"("status");

-- CreateIndex
CREATE INDEX "Inventario_responsavelId_idx" ON "Inventario"("responsavelId");

-- CreateIndex
CREATE INDEX "Inventario_createdAt_idx" ON "Inventario"("createdAt");

-- CreateIndex
CREATE INDEX "InventarioItem_inventarioId_idx" ON "InventarioItem"("inventarioId");

-- CreateIndex
CREATE INDEX "InventarioItem_produtoId_idx" ON "InventarioItem"("produtoId");

-- CreateIndex
CREATE INDEX "InventarioItem_corId_idx" ON "InventarioItem"("corId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cor" ADD CONSTRAINT "Cor_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicoesAbastecimento" ADD CONSTRAINT "RequisicoesAbastecimento_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicoesAbastecimento" ADD CONSTRAINT "RequisicoesAbastecimento_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicoesAbastecimentoItem" ADD CONSTRAINT "RequisicoesAbastecimentoItem_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "RequisicoesAbastecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicoesAbastecimentoItem" ADD CONSTRAINT "RequisicoesAbastecimentoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicoesAbastecimentoItem" ADD CONSTRAINT "RequisicoesAbastecimentoItem_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotacao" ADD CONSTRAINT "Cotacao_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotacao" ADD CONSTRAINT "Cotacao_fornecedorEscolhidoId_fkey" FOREIGN KEY ("fornecedorEscolhidoId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoItem" ADD CONSTRAINT "CotacaoItem_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoItem" ADD CONSTRAINT "CotacaoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoItem" ADD CONSTRAINT "CotacaoItem_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaCotacao" ADD CONSTRAINT "RespostaCotacao_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaCotacao" ADD CONSTRAINT "RespostaCotacao_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoFornecedorToken" ADD CONSTRAINT "CotacaoFornecedorToken_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoFornecedorToken" ADD CONSTRAINT "CotacaoFornecedorToken_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoItemResposta" ADD CONSTRAINT "CotacaoItemResposta_cotacaoItemId_fkey" FOREIGN KEY ("cotacaoItemId") REFERENCES "CotacaoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoItemResposta" ADD CONSTRAINT "CotacaoItemResposta_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotacaoItemResposta" ADD CONSTRAINT "CotacaoItemResposta_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "CotacaoFornecedorToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoPrecosXML" ADD CONSTRAINT "HistoricoPrecosXML_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoPrecosXML" ADD CONSTRAINT "HistoricoPrecosXML_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoB2B" ADD CONSTRAINT "PedidoB2B_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteB2B"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoB2B" ADD CONSTRAINT "PedidoB2B_lojaDestinoId_fkey" FOREIGN KEY ("lojaDestinoId") REFERENCES "Loja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoB2B" ADD CONSTRAINT "PedidoB2B_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoB2BItem" ADD CONSTRAINT "PedidoB2BItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "PedidoB2B"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoB2BItem" ADD CONSTRAINT "PedidoB2BItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoB2BItem" ADD CONSTRAINT "PedidoB2BItem_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_romaneioId_fkey" FOREIGN KEY ("romaneioId") REFERENCES "Romaneio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romaneio" ADD CONSTRAINT "Romaneio_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "RequisicoesAbastecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "Inventario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

