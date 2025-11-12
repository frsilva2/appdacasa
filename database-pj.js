// Database simulado - Compra Programada PJ
// Em produção, usar backend real com API

// Clientes PJ cadastrados
const CLIENTES_PJ = [
    {
        cnpj: "11222333000144",
        razaoSocial: "Confecções Silva LTDA",
        inscricaoEstadual: "062.000.123",
        regimeTributario: "SIMPLES NACIONAL",
        cep: "31510000",
        endereco: "Rua das Flores",
        numero: "123",
        complemento: "Loja A",
        bairro: "Pampulha",
        cidade: "Belo Horizonte",
        estado: "MG",
        whatsapp: "31999887766",
        email: "compras@confeccoessilva.com.br",
        limiteCredito: 5000,
        historicoPedidos: []
    },
    {
        cnpj: "22333444000155",
        razaoSocial: "Modas Premium EIRELI",
        inscricaoEstadual: "063.111.456",
        regimeTributario: "LUCRO PRESUMIDO",
        cep: "31270700",
        endereco: "Avenida Portugal",
        numero: "3456",
        complemento: "",
        bairro: "Itapoã",
        cidade: "Belo Horizonte",
        estado: "MG",
        whatsapp: "31988776655",
        email: "financeiro@modaspremium.com.br",
        limiteCredito: 10000,
        historicoPedidos: []
    },
    {
        cnpj: "33444555000166",
        razaoSocial: "Tecidos e Cia ME",
        inscricaoEstadual: "064.222.789",
        regimeTributario: "SIMPLES NACIONAL",
        cep: "32600000",
        endereco: "Rua Principal",
        numero: "789",
        complemento: "Galpão 2",
        bairro: "Centro",
        cidade: "Betim",
        estado: "MG",
        whatsapp: "31977665544",
        email: "tecidos@tecidosecia.com.br",
        limiteCredito: 3000,
        historicoPedidos: []
    }
];

// Configurações do Sistema (simulando backend admin)
const CONFIG_SISTEMA = {
    pedidoMinimo: 500,
    prazoEntrega: 15, // dias
    parcelamentoMaximo: 4,
    freteGratis: true,
    cidadesEntrega: ["Belo Horizonte", "Betim", "Contagem"],
    icmsSimples: 18, // percentual
    
    // Produtos disponíveis com preços atualizados
    produtosDisponiveis: [
        {
            id: 1,
            nome: "ATOALHADO",
            categoria: "Tecidos Especiais",
            precoMetro: 22.90,
            precoRolo: 1374.00, // 60m
            disponivel: true,
            estoque: 500,
            coresDisponiveis: [100, 205, 912, 999, 975, 224, 379, 640, 300, 410]
        },
        {
            id: 2,
            nome: "CETIM BUCOL",
            categoria: "Cetins",
            precoMetro: 19.90,
            precoRolo: 1194.00,
            disponivel: true,
            estoque: 800,
            coresDisponiveis: [100, 205, 999, 975, 379, 640]
        },
        {
            id: 3,
            nome: "CETIM TINTO",
            categoria: "Cetins",
            precoMetro: 21.50,
            precoRolo: 1290.00,
            disponivel: true,
            estoque: 600,
            coresDisponiveis: [100, 912, 999, 224, 379, 300]
        },
        {
            id: 4,
            nome: "CREPE AMANDA",
            categoria: "Crepes",
            precoMetro: 17.90,
            precoRolo: 1074.00,
            disponivel: true,
            estoque: 1000,
            coresDisponiveis: [100, 205, 912, 999, 975, 224, 379, 640, 300, 410, 500, 520]
        },
        {
            id: 5,
            nome: "OXFORD",
            categoria: "Tecidos Básicos",
            precoMetro: 15.90,
            precoRolo: 954.00,
            disponivel: true,
            estoque: 1200,
            coresDisponiveis: [100, 912, 999, 975]
        },
        {
            id: 6,
            nome: "LINHO MISTO",
            categoria: "Linhos",
            precoMetro: 34.90,
            precoRolo: 2094.00,
            disponivel: true,
            estoque: 300,
            coresDisponiveis: [100, 205, 224, 640]
        },
        {
            id: 7,
            nome: "VISCOSE LISA",
            categoria: "Viscoses",
            precoMetro: 18.50,
            precoRolo: 1110.00,
            disponivel: true,
            estoque: 700,
            coresDisponiveis: [100, 912, 999, 379, 640, 300]
        },
        {
            id: 8,
            nome: "GABARDINE",
            categoria: "Tecidos Básicos",
            precoMetro: 25.90,
            precoRolo: 1554.00,
            disponivel: false, // Fora de estoque
            estoque: 0,
            coresDisponiveis: []
        },
        {
            id: 9,
            nome: "MALHA ROMA",
            categoria: "Malhas",
            precoMetro: 16.90,
            precoRolo: 1014.00,
            disponivel: true,
            estoque: 900,
            coresDisponiveis: [100, 912, 999, 975, 379]
        },
        {
            id: 10,
            nome: "SARJA ACETINADA",
            categoria: "Sarjas",
            precoMetro: 29.90,
            precoRolo: 1794.00,
            disponivel: true,
            estoque: 400,
            coresDisponiveis: [100, 999, 975, 224, 640]
        }
    ],
    
    // Cores com disponibilidade
    coresDisponiveis: {
        100: { nome: "Branco", hex: "#FFFFFF", disponivel: true },
        205: { nome: "Bege Claro", hex: "#F5E6D3", disponivel: true },
        912: { nome: "Cinza Grafite", hex: "#4A4A4A", disponivel: true },
        999: { nome: "Preto", hex: "#000000", disponivel: true },
        975: { nome: "Azul Marinho", hex: "#1B2951", disponivel: true },
        224: { nome: "Bege Escuro", hex: "#C4A57B", disponivel: true },
        379: { nome: "Roxo", hex: "#6B46C1", disponivel: true },
        640: { nome: "Verde Militar", hex: "#4B5320", disponivel: true },
        300: { nome: "Rosa Claro", hex: "#FFB6C1", disponivel: true },
        410: { nome: "Amarelo", hex: "#FFD700", disponivel: true },
        500: { nome: "Vermelho", hex: "#DC143C", disponivel: false }, // Temporariamente indisponível
        520: { nome: "Marsala", hex: "#955251", disponivel: true }
    }
};

// Categorias de produtos
const CATEGORIAS_PRODUTOS = [
    {
        nome: "Cetins",
        icon: "✨",
        descricao: "Tecidos com brilho acetinado"
    },
    {
        nome: "Crepes",
        icon: "🎭",
        descricao: "Tecidos versáteis e elegantes"
    },
    {
        nome: "Tecidos Básicos",
        icon: "📐",
        descricao: "Oxford, Gabardine e mais"
    },
    {
        nome: "Tecidos Especiais",
        icon: "⭐",
        descricao: "Atoalhado e exclusivos"
    },
    {
        nome: "Linhos",
        icon: "🌿",
        descricao: "Naturais e mistos"
    },
    {
        nome: "Viscoses",
        icon: "💫",
        descricao: "Leves e fluidas"
    },
    {
        nome: "Malhas",
        icon: "🧵",
        descricao: "Confortáveis e elásticas"
    },
    {
        nome: "Sarjas",
        icon: "💎",
        descricao: "Resistentes e sofisticadas"
    }
];

// Templates de mensagens WhatsApp
const TEMPLATES_WHATSAPP = {
    pedidoRecebido: (pedido) => `
🎉 *PEDIDO RECEBIDO*

Olá ${pedido.empresa.razaoSocial}!

Recebemos seu pedido ${pedido.id}

📦 *Resumo:*
• Itens: ${pedido.itens.length}
• Total: R$ ${pedido.total.toFixed(2)}
• Pagamento: ${pedido.pagamento}

⏰ *Próximos passos:*
Analisaremos a disponibilidade dos produtos e confirmaremos em até 1 dia útil.

Qualquer dúvida, estamos à disposição!

Empório Tecidos
    `,
    
    pedidoConfirmado: (pedido) => `
✅ *PEDIDO CONFIRMADO*

${pedido.empresa.razaoSocial}

Seu pedido ${pedido.id} foi confirmado!

💰 *Pagamento:*
${pedido.pagamento === 'pix' ? 
`Chave PIX: 11.222.333/0001-44
Valor: R$ ${pedido.total.toFixed(2)}` : 
pedido.pagamento === 'cartao' ?
`Link para pagamento:
https://pagar.emporiotecidos.com.br/${pedido.id}
Parcelamento em até 4x` :
`Aguardamos o pagamento na loja.
Valor: R$ ${pedido.total.toFixed(2)}`}

📅 *Entrega:*
15 dias corridos após confirmação do pagamento.

${pedido.empresa.regimeTributario === 'SIMPLES NACIONAL' ? 
'⚠️ *Importante:* Será necessário recolher diferencial de ICMS de 18%' : ''}

Obrigado pela preferência!
    `,
    
    pedidoCancelado: (pedido, motivo) => `
❌ *PEDIDO CANCELADO*

${pedido.empresa.razaoSocial}

Infelizmente precisamos cancelar o pedido ${pedido.id}.

📋 *Motivo:*
${motivo}

Pedimos desculpas pelo transtorno.

Para mais informações ou novo pedido:
📞 (31) 3333-3333
💬 WhatsApp: (31) 99999-9999

Empório Tecidos
    `
};

// Funções auxiliares para backend simulado
function buscarClientePorCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return CLIENTES_PJ.find(c => c.cnpj === cnpjLimpo);
}

function obterProdutosPorCategoria(categoria) {
    return CONFIG_SISTEMA.produtosDisponiveis.filter(p => 
        p.categoria === categoria && p.disponivel
    );
}

function obterCoresDisponiveis(produtoId) {
    const produto = CONFIG_SISTEMA.produtosDisponiveis.find(p => p.id === produtoId);
    if (!produto) return [];
    
    return produto.coresDisponiveis
        .map(corId => ({
            id: corId,
            ...CONFIG_SISTEMA.coresDisponiveis[corId]
        }))
        .filter(cor => cor.disponivel);
}

function calcularTotalPedido(itens) {
    return itens.reduce((total, item) => {
        const produto = CONFIG_SISTEMA.produtosDisponiveis.find(p => p.id === item.produtoId);
        return total + (produto.precoMetro * item.quantidade);
    }, 0);
}

function gerarLinkWhatsApp(numero, mensagem) {
    const numeroLimpo = numero.replace(/\D/g, '');
    const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
}

// Exportar para uso global
window.DATABASE_PJ = {
    clientes: CLIENTES_PJ,
    config: CONFIG_SISTEMA,
    categorias: CATEGORIAS_PRODUTOS,
    templates: TEMPLATES_WHATSAPP,
    
    // Funções
    buscarClientePorCNPJ,
    obterProdutosPorCategoria,
    obterCoresDisponiveis,
    calcularTotalPedido,
    gerarLinkWhatsApp
};