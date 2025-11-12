// Serviço de CEP - Base de dados de Minas Gerais
// Em produção usar ViaCEP API ou similar

const CEP_DATABASE_MG = {
    // Belo Horizonte
    "30110010": {
        logradouro: "Praça Sete de Setembro",
        bairro: "Centro",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "31510000": {
        logradouro: "Rua das Flores",
        bairro: "Pampulha",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "31270700": {
        logradouro: "Avenida Portugal",
        bairro: "Itapoã",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "31310370": {
        logradouro: "Rua Professor Magalhães Penido",
        bairro: "São Luiz",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "31365450": {
        logradouro: "Rua das Gabirobas",
        bairro: "Eldorado",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "30130100": {
        logradouro: "Avenida Afonso Pena",
        bairro: "Centro",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "30140071": {
        logradouro: "Rua da Bahia",
        bairro: "Centro",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "31170300": {
        logradouro: "Rua Platina",
        bairro: "Prado",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "30190060": {
        logradouro: "Avenida do Contorno",
        bairro: "Floresta",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    "30310000": {
        logradouro: "Rua Pernambuco",
        bairro: "Savassi",
        cidade: "Belo Horizonte",
        estado: "MG"
    },
    
    // Betim
    "32600000": {
        logradouro: "Rua Principal",
        bairro: "Centro",
        cidade: "Betim",
        estado: "MG"
    },
    "32671172": {
        logradouro: "Rua Rosário",
        bairro: "Jardim Teresópolis",
        cidade: "Betim",
        estado: "MG"
    },
    "32673764": {
        logradouro: "Rua São Paulo",
        bairro: "PTB",
        cidade: "Betim",
        estado: "MG"
    },
    "32650000": {
        logradouro: "Avenida Amazonas",
        bairro: "Brasiléia",
        cidade: "Betim",
        estado: "MG"
    },
    
    // Contagem
    "32041020": {
        logradouro: "Rua Bernardo Monteiro",
        bairro: "Centro",
        cidade: "Contagem",
        estado: "MG"
    },
    "32140110": {
        logradouro: "Avenida João César de Oliveira",
        bairro: "Eldorado",
        cidade: "Contagem",
        estado: "MG"
    },
    "32310200": {
        logradouro: "Rua Rio Comprido",
        bairro: "Cinco",
        cidade: "Contagem",
        estado: "MG"
    },
    
    // Ipatinga
    "35160114": {
        logradouro: "Avenida Carlos Chagas",
        bairro: "Cidade Nobre",
        cidade: "Ipatinga",
        estado: "MG"
    },
    "35162036": {
        logradouro: "Rua Diamantina",
        bairro: "Veneza",
        cidade: "Ipatinga",
        estado: "MG"
    },
    
    // Coronel Fabriciano
    "35170001": {
        logradouro: "Rua Pedro Nolasco",
        bairro: "Centro",
        cidade: "Coronel Fabriciano",
        estado: "MG"
    },
    "35171230": {
        logradouro: "Avenida Magalhães Pinto",
        bairro: "Giovannini",
        cidade: "Coronel Fabriciano",
        estado: "MG"
    },
    
    // Teófilo Otoni
    "39800000": {
        logradouro: "Praça Tiradentes",
        bairro: "Centro",
        cidade: "Teófilo Otoni",
        estado: "MG"
    },
    "39803297": {
        logradouro: "Rua Doutor Manoel Esteves",
        bairro: "Castro Pires",
        cidade: "Teófilo Otoni",
        estado: "MG"
    }
};

// Função para buscar CEP
async function buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Primeiro tentar no banco local
    if (CEP_DATABASE_MG[cepLimpo]) {
        return {
            success: true,
            data: {
                cep: cepLimpo,
                ...CEP_DATABASE_MG[cepLimpo]
            }
        };
    }
    
    // Se não encontrar localmente, tentar ViaCEP API
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro && data.uf === 'MG') {
            return {
                success: true,
                data: {
                    cep: cepLimpo,
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    estado: data.uf
                }
            };
        }
        
        if (data.uf !== 'MG') {
            return {
                success: false,
                error: 'CEP fora de Minas Gerais. Atendemos apenas MG.'
            };
        }
        
        return {
            success: false,
            error: 'CEP não encontrado'
        };
    } catch (error) {
        // Se API falhar, retornar erro
        return {
            success: false,
            error: 'Erro ao buscar CEP. Digite o endereço manualmente.'
        };
    }
}

// Função para formatar CEP
function formatarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
        return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
}

// Função para validar se CEP é de MG
function validarCEPMinasGerais(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return false;
    
    // Faixas de CEP de Minas Gerais (30000000 a 39999999)
    const cepNumero = parseInt(cepLimpo);
    return cepNumero >= 30000000 && cepNumero <= 39999999;
}

// Lista de principais cidades atendidas
const CIDADES_ATENDIDAS = [
    "Belo Horizonte",
    "Betim",
    "Contagem",
    "Ipatinga",
    "Coronel Fabriciano",
    "Teófilo Otoni",
    "Uberlândia",
    "Juiz de Fora",
    "Governador Valadares",
    "Montes Claros",
    "Uberaba",
    "Divinópolis",
    "Sete Lagoas",
    "Poços de Caldas",
    "Varginha"
];

// Função para verificar se cidade é atendida com entrega grátis
function verificarEntregaGratis(cidade) {
    const cidadesGratis = ["Belo Horizonte", "Betim", "Contagem"];
    return cidadesGratis.includes(cidade);
}

// Função para calcular frete (simulado)
function calcularFrete(cidade, valorPedido) {
    if (verificarEntregaGratis(cidade)) {
        return 0;
    }
    
    // Outras cidades de MG - frete grátis acima de R$ 500
    if (valorPedido >= 500) {
        return 0;
    }
    
    // Frete padrão para outras situações
    const fretes = {
        "Ipatinga": 45.00,
        "Coronel Fabriciano": 45.00,
        "Teófilo Otoni": 55.00,
        "Uberlândia": 65.00,
        "Juiz de Fora": 50.00,
        "Governador Valadares": 48.00,
        "Montes Claros": 70.00
    };
    
    return fretes[cidade] || 75.00; // Valor padrão para outras cidades
}

// Exportar para uso global
window.CEP_SERVICE = {
    buscarCEP,
    formatarCEP,
    validarCEPMinasGerais,
    verificarEntregaGratis,
    calcularFrete,
    cidadesAtendidas: CIDADES_ATENDIDAS,
    database: CEP_DATABASE_MG
};