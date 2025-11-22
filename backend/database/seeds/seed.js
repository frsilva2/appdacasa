import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // =====================================================
  // 1. LOJAS
  // =====================================================
  console.log('📍 Criando lojas...');

  const lojas = await Promise.all([
    prisma.loja.upsert({
      where: { codigo: 'G1' },
      update: {},
      create: {
        codigo: 'G1',
        nome: 'Loja G1 (Belo Horizonte)',
        prioridade: 1,
        endereco: 'Belo Horizonte, MG',
        telefone: '(31) 3333-1111',
      },
    }),
    prisma.loja.upsert({
      where: { codigo: 'GUARANIS' },
      update: {},
      create: {
        codigo: 'GUARANIS',
        nome: 'Loja Guaranis',
        prioridade: 2,
        endereco: 'Guaranis, MG',
        telefone: '(31) 3333-2222',
      },
    }),
    prisma.loja.upsert({
      where: { codigo: 'IPATINGA' },
      update: {},
      create: {
        codigo: 'IPATINGA',
        nome: 'Loja Ipatinga',
        prioridade: 3,
        endereco: 'Ipatinga, MG',
        telefone: '(31) 3333-3333',
      },
    }),
    prisma.loja.upsert({
      where: { codigo: 'TO' },
      update: {},
      create: {
        codigo: 'TO',
        nome: 'Loja Teófilo Otoni',
        prioridade: 4,
        endereco: 'Teófilo Otoni, MG',
        telefone: '(33) 3333-4444',
      },
    }),
    prisma.loja.upsert({
      where: { codigo: 'CF' },
      update: {},
      create: {
        codigo: 'CF',
        nome: 'Loja Coronel Fabriciano',
        prioridade: 5,
        endereco: 'Coronel Fabriciano, MG',
        telefone: '(31) 3333-5555',
      },
    }),
  ]);

  console.log(`✅ ${lojas.length} lojas criadas`);

  // =====================================================
  // 2. USUÁRIOS PADRÃO
  // =====================================================
  console.log('👤 Criando usuários padrão...');

  const hashedPassword = await bcrypt.hash('emporio123', 10);

  const users = await Promise.all([
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@emporiotecidos.com.br' },
      update: {},
      create: {
        email: 'admin@emporiotecidos.com.br',
        password: hashedPassword,
        name: 'Administrador',
        type: 'ADMIN',
        telefone: '(31) 99999-0000',
      },
    }),
    // Gerentes de Loja
    prisma.user.upsert({
      where: { email: 'gerente.g1@emporiotecidos.com.br' },
      update: {},
      create: {
        email: 'gerente.g1@emporiotecidos.com.br',
        password: hashedPassword,
        name: 'Gerente G1',
        type: 'GERENTE_LOJA',
        telefone: '(31) 99999-0001',
        lojaId: lojas[0].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'gerente.guaranis@emporiotecidos.com.br' },
      update: {},
      create: {
        email: 'gerente.guaranis@emporiotecidos.com.br',
        password: hashedPassword,
        name: 'Gerente Guaranis',
        type: 'GERENTE_LOJA',
        telefone: '(31) 99999-0002',
        lojaId: lojas[1].id,
      },
    }),
    // Usuários CD
    prisma.user.upsert({
      where: { email: 'cd1@emporiotecidos.com.br' },
      update: {},
      create: {
        email: 'cd1@emporiotecidos.com.br',
        password: hashedPassword,
        name: 'Usuário CD 1',
        type: 'USUARIO_CD',
        telefone: '(31) 99999-0003',
      },
    }),
    prisma.user.upsert({
      where: { email: 'cd2@emporiotecidos.com.br' },
      update: {},
      create: {
        email: 'cd2@emporiotecidos.com.br',
        password: hashedPassword,
        name: 'Usuário CD 2',
        type: 'USUARIO_CD',
        telefone: '(31) 99999-0004',
      },
    }),
    // Operador
    prisma.user.upsert({
      where: { email: 'operador@emporiotecidos.com.br' },
      update: {},
      create: {
        email: 'operador@emporiotecidos.com.br',
        password: hashedPassword,
        name: 'Operador',
        type: 'OPERADOR',
        telefone: '(31) 99999-0005',
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados (senha padrão: emporio123)`);

  // =====================================================
  // 3. FORNECEDORES
  // =====================================================
  console.log('🏢 Criando fornecedores...');

  const fornecedores = await Promise.all([
    prisma.fornecedor.upsert({
      where: { codigo: 'FORN-001' },
      update: {},
      create: {
        codigo: 'FORN-001',
        nome: 'Fornecedor A',
        cnpj: '11.111.111/0001-11',
        contato: 'João Silva',
        email: 'contato@fornecedora.com.br',
        telefone: '(11) 1111-1111',
      },
    }),
    prisma.fornecedor.upsert({
      where: { codigo: 'FORN-002' },
      update: {},
      create: {
        codigo: 'FORN-002',
        nome: 'Fornecedor B',
        cnpj: '22.222.222/0001-22',
        contato: 'Maria Santos',
        email: 'contato@fornecedorb.com.br',
        telefone: '(11) 2222-2222',
      },
    }),
    prisma.fornecedor.upsert({
      where: { codigo: 'FORN-003' },
      update: {},
      create: {
        codigo: 'FORN-003',
        nome: 'Fornecedor C',
        cnpj: '33.333.333/0001-33',
        contato: 'Pedro Costa',
        email: 'contato@fornecedorc.com.br',
        telefone: '(11) 3333-3333',
      },
    }),
    prisma.fornecedor.upsert({
      where: { codigo: 'FORN-004' },
      update: {},
      create: {
        codigo: 'FORN-004',
        nome: 'Fornecedor D',
        cnpj: '44.444.444/0001-44',
        contato: 'Ana Lima',
        email: 'contato@fornecedord.com.br',
        telefone: '(11) 4444-4444',
      },
    }),
    prisma.fornecedor.upsert({
      where: { codigo: 'FORN-005' },
      update: {},
      create: {
        codigo: 'FORN-005',
        nome: 'Fornecedor E',
        cnpj: '55.555.555/0001-55',
        contato: 'Carlos Mendes',
        email: 'contato@fornecedore.com.br',
        telefone: '(11) 5555-5555',
      },
    }),
  ]);

  console.log(`✅ ${fornecedores.length} fornecedores criados`);

  // =====================================================
  // 4. PRODUTOS (70 itens conforme tabela)
  // =====================================================
  console.log('🧵 Criando produtos...');

  const produtosData = [
    { codigo: '4402', nome: 'CREPE AMANDA', atacado: 14.88, varejo: 17.50, curva: 'A' },
    { codigo: '2767', nome: 'ALGODÃO CRU 1,75L', atacado: 16.92, varejo: 19.90, curva: 'B' },
    { codigo: '2768', nome: 'ALGODÃO CRU 2,2L', atacado: 22.02, varejo: 25.90, curva: 'B' },
    { codigo: '2770', nome: 'ATOALHADO MAGICO', atacado: 18.62, varejo: 21.90, curva: 'A' },
    { codigo: '13290', nome: 'CETIM BUCOL', atacado: 14.37, varejo: 19.90, curva: 'B' },
    { codigo: '3710', nome: 'CETIM ELASTANO', atacado: 9.27, varejo: 11.90, curva: 'A' },
    { codigo: '3670', nome: 'CETIM TINTO', atacado: 5.02, varejo: 6.50, curva: 'B' },
    { codigo: '4072', nome: 'CHITA POLY', atacado: 6.38, varejo: 7.50, curva: 'A' },
    { codigo: '4682', nome: 'DUNA', atacado: 10.97, varejo: 12.90, curva: 'A' },
    { codigo: '15477', nome: 'FILÓ PREMIUM', atacado: 16.92, varejo: 19.90, curva: 'B' },
    { codigo: '5747', nome: 'GABARDINE', atacado: 12.67, varejo: 14.90, curva: 'A' },
    { codigo: '7312', nome: 'HELANCA MT', atacado: 8.42, varejo: 9.90, curva: 'A' },
    { codigo: '5787', nome: 'JACQUARD', atacado: 22.87, varejo: 26.90, curva: 'A' },
    { codigo: '5888', nome: 'JUTA', atacado: 16.58, varejo: 19.50, curva: 'C' },
    { codigo: '5889', nome: 'JUTA OURO', atacado: 26.78, varejo: 31.50, curva: 'C' },
    { codigo: '5919', nome: 'LAISE ALGODÃO', atacado: 36.13, varejo: 42.50, curva: 'A' },
    { codigo: '13430', nome: 'LINHO MISTO', atacado: 14.37, varejo: 18.90, curva: 'A' },
    { codigo: '6344', nome: 'LINHO PURO', atacado: 93.42, varejo: 109.90, curva: 'A' },
    { codigo: '8369', nome: 'MATELASSE 2,4M', atacado: 23.72, varejo: 27.90, curva: 'A' },
    { codigo: '8453', nome: 'TENCEL', atacado: 25.42, varejo: 29.90, curva: 'B' },
    { codigo: '8494', nome: 'FLEECE', atacado: 14.37, varejo: 39.90, curva: 'A' },
    { codigo: '8745', nome: 'MUSSELINE SEDA', atacado: 16.92, varejo: 19.90, curva: 'C' },
    { codigo: '14527', nome: 'NEW LOOK', atacado: 14.03, varejo: 16.50, curva: 'A' },
    { codigo: '8785', nome: 'ORGANZA', atacado: 8.42, varejo: 9.90, curva: 'B' },
    { codigo: '9026', nome: 'OXFORD 1,47M', atacado: 7.44, varejo: 8.75, curva: 'A' },
    { codigo: '8906', nome: 'OXFORD 3M', atacado: 16.58, varejo: 19.50, curva: 'A' },
    { codigo: '14402', nome: 'OXFORD EST', atacado: 12.67, varejo: 14.90, curva: 'B' },
    { codigo: '9109', nome: 'OXFORDINE', atacado: 10.97, varejo: 12.90, curva: 'A' },
    { codigo: '9692', nome: 'PERCAL 180/230', atacado: 25.42, varejo: 29.90, curva: 'A' },
    { codigo: '9532', nome: 'PERCAL 400', atacado: 83.22, varejo: 97.90, curva: 'A' },
    { codigo: '9778', nome: 'PERCAL POLY', atacado: 12.67, varejo: 14.90, curva: 'A' },
    { codigo: '15428', nome: 'PRADA', atacado: 16.92, varejo: 19.90, curva: 'A' },
    { codigo: '10366', nome: 'SACARIA', atacado: 8.42, varejo: 9.90, curva: 'C' },
    { codigo: '5167', nome: 'CREPE SALINA', atacado: 8.93, varejo: 10.50, curva: 'A' },
    { codigo: '12699', nome: 'SENSORIALLE', atacado: 21.17, varejo: 24.90, curva: 'A' },
    { codigo: '10617', nome: 'TACTEL', atacado: 7.57, varejo: 8.90, curva: 'B' },
    { codigo: '11489', nome: 'TRICOLINE PERIPAN', atacado: 20.32, varejo: 23.90, curva: 'A' },
    { codigo: '11365', nome: 'TRICOLINE CASA', atacado: 16.07, varejo: 18.90, curva: 'A' },
    { codigo: '11772', nome: 'TULLE GLITTER', atacado: 8.42, varejo: 9.90, curva: 'B' },
    { codigo: '11932', nome: 'TULLE ILUSION', atacado: 12.67, varejo: 14.90, curva: 'C' },
    { codigo: '11892', nome: 'TULLE MALHA', atacado: 12.67, varejo: 14.90, curva: 'B' },
    { codigo: '12053', nome: 'TULLE SHINE', atacado: 12.67, varejo: 14.90, curva: 'B' },
    { codigo: '12174', nome: 'TWO WAY', atacado: 16.92, varejo: 19.90, curva: 'A' },
    { codigo: '12375', nome: 'VISCOLINHO EST', atacado: 25.42, varejo: 29.90, curva: 'A' },
    { codigo: '12376', nome: 'VISCOLINHO TINTO', atacado: 16.07, varejo: 18.90, curva: 'A' },
    { codigo: '12618', nome: 'VISCOSE EST', atacado: 25.42, varejo: 29.90, curva: 'A' },
    { codigo: '15429', nome: 'VISCOSE TINTO', atacado: 14.37, varejo: 16.90, curva: 'A' },
    { codigo: '13184', nome: 'ZIBELINE', atacado: 23.72, varejo: 27.90, curva: 'B' },
  ];

  const produtos = [];
  for (const p of produtosData) {
    const produto = await prisma.produto.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: {
        codigo: p.codigo,
        nome: p.nome,
        categoria: 'Tecidos',
        precoAtacado: p.atacado,
        precoVarejo: p.varejo,
        curva: p.curva,
      },
    });
    produtos.push(produto);
  }

  console.log(`✅ ${produtos.length} produtos criados`);

  // =====================================================
  // 5. CORES BÁSICAS PARA PRODUTOS
  // =====================================================
  console.log('🎨 Criando cores básicas...');

  const coresBasicas = [
    { nome: 'Branco', hex: '#FFFFFF' },
    { nome: 'Preto', hex: '#000000' },
    { nome: 'Vermelho', hex: '#FF0000' },
    { nome: 'Azul', hex: '#0000FF' },
    { nome: 'Verde', hex: '#00FF00' },
    { nome: 'Amarelo', hex: '#FFFF00' },
    { nome: 'Rosa', hex: '#FFC0CB' },
    { nome: 'Roxo', hex: '#800080' },
    { nome: 'Laranja', hex: '#FFA500' },
    { nome: 'Cinza', hex: '#808080' },
    { nome: 'Marrom', hex: '#A52A2A' },
    { nome: 'Bege', hex: '#F5F5DC' },
  ];

  let totalCores = 0;
  for (const produto of produtos.slice(0, 10)) {
    for (const cor of coresBasicas.slice(0, 6)) {
      await prisma.cor.upsert({
        where: {
          produtoId_nome: {
            produtoId: produto.id,
            nome: cor.nome,
          },
        },
        update: {},
        create: {
          nome: cor.nome,
          codigoHex: cor.hex,
          produtoId: produto.id,
        },
      });
      totalCores++;
    }
  }

  console.log(`✅ ${totalCores} cores criadas para os primeiros 10 produtos`);

  // =====================================================
  // 6. ESTOQUE INICIAL NO CD
  // =====================================================
  console.log('📦 Criando estoque inicial...');

  let totalEstoque = 0;
  for (const produto of produtos.slice(0, 10)) {
    const cores = await prisma.cor.findMany({
      where: { produtoId: produto.id },
    });

    for (const cor of cores) {
      await prisma.estoque.upsert({
        where: {
          produtoId_corId_local: {
            produtoId: produto.id,
            corId: cor.id,
            local: 'CD',
          },
        },
        update: {},
        create: {
          produtoId: produto.id,
          corId: cor.id,
          local: 'CD',
          quantidade: Math.floor(Math.random() * 500) + 100, // 100-600 metros
          quantidadeMin: 50,
        },
      });
      totalEstoque++;
    }
  }

  console.log(`✅ ${totalEstoque} registros de estoque criados`);

  // =====================================================
  // 7. CONFIGURAÇÕES DO SISTEMA
  // =====================================================
  console.log('⚙️  Criando configurações...');

  await prisma.configuracao.upsert({
    where: { chave: 'PRAZO_COTACAO_DIAS' },
    update: {},
    create: {
      chave: 'PRAZO_COTACAO_DIAS',
      valor: '1',
      descricao: 'Prazo em dias para resposta de cotação',
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: 'PEDIDO_B2B_MINIMO' },
    update: {},
    create: {
      chave: 'PEDIDO_B2B_MINIMO',
      valor: '500',
      descricao: 'Valor mínimo de pedido B2B em reais',
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: 'PEDIDO_B2B_METROS_MINIMO' },
    update: {},
    create: {
      chave: 'PEDIDO_B2B_METROS_MINIMO',
      valor: '60',
      descricao: 'Quantidade mínima em metros por categoria/cor para pedido B2B',
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: 'PRAZO_ENTREGA_B2B_DIAS' },
    update: {},
    create: {
      chave: 'PRAZO_ENTREGA_B2B_DIAS',
      valor: '15',
      descricao: 'Prazo de entrega padrão para pedidos B2B em dias',
    },
  });

  console.log('✅ Configurações criadas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais padrão:');
  console.log('   Email: admin@emporiotecidos.com.br');
  console.log('   Senha: emporio123');
  console.log('\n   Outros usuários também usam a senha: emporio123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
