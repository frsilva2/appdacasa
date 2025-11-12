// Sistema Compra Programada PJ v2.0
// Empório Tecidos - Com navegação por etapas

let currentStep = 1;
let currentCategory = null;
let currentProduct = null;
let selectedColor = null;
let orderItems = [];
let empresaData = {};

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    setupCNPJSearch();
    setupCEPSearch();
    setupMasks();
    loadCategories();
});

// ETAPA 1: DADOS DA EMPRESA

// Buscar dados por CNPJ
function setupCNPJSearch() {
    const cnpjInput = document.getElementById('cnpj');
    let timeout;
    
    cnpjInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const cnpj = e.target.value.replace(/\D/g, '');
        
        if (cnpj.length === 14) {
            timeout = setTimeout(() => {
                buscarEmpresaPorCNPJ(cnpj);
            }, 500);
        }
    });
}

function buscarEmpresaPorCNPJ(cnpj) {
    document.getElementById('loadingCNPJ').style.display = 'block';
    
    // Simular busca no banco
    setTimeout(() => {
        const empresa = DATABASE_PJ.buscarClientePorCNPJ(cnpj);
        document.getElementById('loadingCNPJ').style.display = 'none';
        
        if (empresa) {
            // Preencher campos
            document.getElementById('razaoSocial').value = empresa.razaoSocial;
            document.getElementById('inscricaoEstadual').value = empresa.inscricaoEstadual;
            document.getElementById('regimeTributario').value = empresa.regimeTributario;
            document.getElementById('cep').value = CEP_SERVICE.formatarCEP(empresa.cep);
            document.getElementById('endereco').value = empresa.endereco;
            document.getElementById('numero').value = empresa.numero;
            document.getElementById('complemento').value = empresa.complemento;
            document.getElementById('bairro').value = empresa.bairro;
            document.getElementById('cidade').value = empresa.cidade;
            document.getElementById('whatsapp').value = formatarTelefone(empresa.whatsapp);
            document.getElementById('email').value = empresa.email;
            
            // Marcar campos como preenchidos
            document.getElementById('empresaData').style.display = 'block';
            
            // Atualizar info ICMS
            updateICMSInfo();
            
            // Salvar dados
            empresaData = empresa;
            
            showNotification('success', 'Empresa Encontrada', 
                `Dados de ${empresa.razaoSocial} preenchidos automaticamente!`);
        } else {
            showNotification('warning', 'Empresa não cadastrada', 
                'Preencha os dados manualmente para continuar.');
        }
    }, 1000);
}

// Buscar CEP
function setupCEPSearch() {
    const cepInput = document.getElementById('cep');
    let timeout;
    
    cepInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const cep = e.target.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            timeout = setTimeout(() => {
                buscarEnderecoPorCEP(cep);
            }, 500);
        }
    });
}

async function buscarEnderecoPorCEP(cep) {
    const result = await CEP_SERVICE.buscarCEP(cep);
    
    if (result.success) {
        document.getElementById('endereco').value = result.data.logradouro;
        document.getElementById('bairro').value = result.data.bairro;
        document.getElementById('cidade').value = result.data.cidade;
        
        // Verificar entrega grátis
        const freteGratis = CEP_SERVICE.verificarEntregaGratis(result.data.cidade);
        if (freteGratis) {
            showNotification('success', 'Frete Grátis!', 
                `Entrega gratuita disponível em ${result.data.cidade}`);
        }
        
        // Focar no número
        document.getElementById('numero').focus();
    } else {
        if (result.error === 'CEP fora de Minas Gerais. Atendemos apenas MG.') {
            showNotification('error', 'CEP Inválido', result.error);
            document.getElementById('cep').classList.add('error');
        } else {
            showNotification('warning', 'CEP não encontrado', 
                'Digite o endereço manualmente');
        }
    }
}

// Máscaras
function setupMasks() {
    // CNPJ
    document.getElementById('cnpj').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);
        
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{3})/, '$1.$2');
        }
        
        e.target.value = value;
    });
    
    // CEP
    document.getElementById('cep').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        
        e.target.value = value;
    });
    
    // Telefone
    document.getElementById('whatsapp').addEventListener('input', function(e) {
        e.target.value = formatarTelefone(e.target.value);
    });
}

function formatarTelefone(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    }
    
    return value;
}

// Atualizar info ICMS
function updateICMSInfo() {
    const regime = document.getElementById('regimeTributario').value;
    const alertBox = document.getElementById('icmsAlert');
    const infoBox = document.getElementById('icmsInfo');
    
    if (regime === 'SIMPLES NACIONAL') {
        alertBox.style.display = 'block';
        infoBox.style.display = 'none';
    } else if (regime === 'LUCRO REAL' || regime === 'LUCRO PRESUMIDO') {
        alertBox.style.display = 'none';
        infoBox.style.display = 'block';
    } else {
        alertBox.style.display = 'none';
        infoBox.style.display = 'none';
    }
}

// Validar e avançar para produtos
function avancarParaProdutos() {
    // Validar campos
    const requiredFields = [
        'cnpj', 'razaoSocial', 'inscricaoEstadual', 'regimeTributario',
        'cep', 'endereco', 'numero', 'bairro', 'cidade',
        'whatsapp', 'email'
    ];
    
    let valid = true;
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value.trim()) {
            element.classList.add('error');
            valid = false;
        } else {
            element.classList.remove('error');
        }
    });
    
    if (!valid) {
        showNotification('error', 'Campos obrigatórios', 
            'Preencha todos os campos marcados com *');
        return;
    }
    
    // Salvar dados
    empresaData = {
        cnpj: document.getElementById('cnpj').value,
        razaoSocial: document.getElementById('razaoSocial').value,
        inscricaoEstadual: document.getElementById('inscricaoEstadual').value,
        regimeTributario: document.getElementById('regimeTributario').value,
        cep: document.getElementById('cep').value,
        endereco: document.getElementById('endereco').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        whatsapp: document.getElementById('whatsapp').value,
        email: document.getElementById('email').value
    };
    
    // Avançar etapa
    goToStep(2);
}

// ETAPA 2: SELEÇÃO DE PRODUTOS

// Carregar categorias
function loadCategories() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    
    let html = '';
    DATABASE_PJ.categorias.forEach(categoria => {
        const produtos = DATABASE_PJ.obterProdutosPorCategoria(categoria.nome);
        const qtd = produtos.length;
        
        html += `
            <div class="category-card" onclick="selecionarCategoria('${categoria.nome}')">
                <div class="category-icon">${categoria.icon}</div>
                <div class="category-name">${categoria.nome}</div>
                <div class="category-description">${categoria.descricao}</div>
                <div style="margin-top: 10px; color: #667eea; font-weight: bold;">
                    ${qtd} produto${qtd !== 1 ? 's' : ''} disponíve${qtd !== 1 ? 'is' : 'l'}
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// Selecionar categoria
function selecionarCategoria(categoria) {
    currentCategory = categoria;
    loadProducts(categoria);
    
    document.getElementById('categoryView').style.display = 'none';
    document.getElementById('productView').style.display = 'block';
    document.getElementById('categoryTitle').textContent = categoria;
}

// Carregar produtos da categoria
function loadProducts(categoria) {
    const grid = document.getElementById('productGrid');
    const produtos = DATABASE_PJ.obterProdutosPorCategoria(categoria);
    
    let html = '';
    produtos.forEach(produto => {
        const disponivel = produto.disponivel && produto.estoque > 0;
        
        html += `
            <div class="product-card ${!disponivel ? 'unavailable' : ''}" 
                 ${disponivel ? `onclick="selecionarProduto(${produto.id})"` : ''}>
                ${!disponivel ? '<span class="product-badge badge-unavailable">Indisponível</span>' : ''}
                <div class="product-name">${produto.nome}</div>
                <div style="color: #6c757d; font-size: 14px; margin: 5px 0;">
                    Estoque: ${produto.estoque}m
                </div>
                <div class="product-prices">
                    <div class="price-metro">R$ ${produto.precoMetro.toFixed(2)}/m</div>
                    <div class="price-rolo">Rolo (60m): R$ ${produto.precoRolo.toFixed(2)}</div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// Selecionar produto
function selecionarProduto(produtoId) {
    const produto = DATABASE_PJ.config.produtosDisponiveis.find(p => p.id === produtoId);
    currentProduct = produto;
    
    loadColors(produto);
    
    document.getElementById('productView').style.display = 'none';
    document.getElementById('colorView').style.display = 'block';
    document.getElementById('productTitle').textContent = `${produto.nome} - Selecione as Cores`;
}

// Carregar cores do produto
function loadColors(produto) {
    const grid = document.getElementById('colorGrid');
    const cores = DATABASE_PJ.obterCoresDisponiveis(produto.id);
    
    let html = '';
    cores.forEach(cor => {
        html += `
            <div class="color-card" onclick="selecionarCor(${cor.id})" id="color-${cor.id}">
                <div class="color-preview" style="background-color: ${cor.hex};"></div>
                <div class="color-name">${cor.nome}</div>
                <div class="color-code">Cód: ${cor.id}</div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Resetar quantidade
    document.getElementById('quantidade').value = 60;
}

// Selecionar cor
function selecionarCor(corId) {
    // Desmarcar outras
    document.querySelectorAll('.color-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Marcar selecionada
    document.getElementById(`color-${corId}`).classList.add('selected');
    selectedColor = corId;
}

// Quantidade
function aumentarQuantidade() {
    const input = document.getElementById('quantidade');
    input.value = parseInt(input.value) + 60;
}

function diminuirQuantidade() {
    const input = document.getElementById('quantidade');
    const newValue = parseInt(input.value) - 60;
    if (newValue >= 60) {
        input.value = newValue;
    }
}

// Confirmar item
function confirmarItem() {
    if (!selectedColor) {
        showNotification('error', 'Selecione uma cor', 
            'É necessário escolher pelo menos uma cor para continuar');
        return;
    }
    
    const cor = DATABASE_PJ.config.coresDisponiveis[selectedColor];
    const quantidade = parseInt(document.getElementById('quantidade').value);
    
    // Adicionar ao pedido
    orderItems.push({
        produto: currentProduct,
        cor: cor,
        corId: selectedColor,
        quantidade: quantidade,
        total: quantidade * currentProduct.precoMetro
    });
    
    // Atualizar carrinho
    updateCart();
    
    // Mostrar notificação
    const total = calcularTotal();
    const falta = Math.max(0, 500 - total);
    
    if (falta > 0) {
        showNotification('warning', 'Item Adicionado', 
            `${currentProduct.nome} adicionado! Faltam R$ ${falta.toFixed(2)} para o pedido mínimo.`);
    } else {
        showNotification('success', 'Item Adicionado', 
            `${currentProduct.nome} adicionado ao carrinho!`);
    }
    
    // Voltar para categorias
    voltarParaCategorias();
    
    // Resetar seleção
    selectedColor = null;
    currentProduct = null;
}

// Navegação
function voltarParaCategorias() {
    document.getElementById('categoryView').style.display = 'block';
    document.getElementById('productView').style.display = 'none';
    document.getElementById('colorView').style.display = 'none';
}

function voltarParaProdutos() {
    document.getElementById('productView').style.display = 'block';
    document.getElementById('colorView').style.display = 'none';
    selectedColor = null;
}

// Atualizar carrinho
function updateCart() {
    const total = calcularTotal();
    const falta = Math.max(0, 500 - total);
    const progress = Math.min(100, (total / 500) * 100);
    
    document.getElementById('cartSummary').style.display = 'block';
    document.getElementById('cartTotal').textContent = total.toFixed(2).replace('.', ',');
    document.getElementById('cartProgress').style.width = `${progress}%`;
    
    if (falta > 0) {
        document.getElementById('cartMissing').textContent = `Faltam R$ ${falta.toFixed(2)}`;
        document.getElementById('cartMissing').style.color = '#dc3545';
        document.getElementById('btnFinalizar').disabled = true;
    } else {
        document.getElementById('cartMissing').textContent = 'Pedido mínimo atingido ✓';
        document.getElementById('cartMissing').style.color = '#28a745';
        document.getElementById('btnFinalizar').disabled = false;
    }
}

function calcularTotal() {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
}

// Finalizar pedido
function finalizarPedido() {
    const total = calcularTotal();
    
    if (total < 500) {
        showNotification('error', 'Pedido Mínimo', 
            `O pedido mínimo é de R$ 500,00. Valor atual: R$ ${total.toFixed(2)}`);
        return;
    }
    
    // Preparar dados para revisão
    goToStep(3);
    mostrarRevisao();
}

// Mostrar revisão
function mostrarRevisao() {
    const container = document.getElementById('orderReview');
    const total = calcularTotal();
    
    let html = `
        <div class="info-box success">
            <strong>Dados da Empresa:</strong><br>
            ${empresaData.razaoSocial}<br>
            CNPJ: ${empresaData.cnpj}<br>
            ${empresaData.endereco}, ${empresaData.numero} - ${empresaData.cidade}/MG
        </div>
        
        <h3>Itens do Pedido</h3>
        <table style="width: 100%; margin: 20px 0;">
            <thead>
                <tr style="border-bottom: 2px solid #e9ecef;">
                    <th style="padding: 10px; text-align: left;">Produto</th>
                    <th style="padding: 10px; text-align: left;">Cor</th>
                    <th style="padding: 10px; text-align: center;">Qtd</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    orderItems.forEach(item => {
        html += `
            <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px;">${item.produto.nome}</td>
                <td style="padding: 10px;">
                    <span style="display: inline-block; width: 20px; height: 20px; 
                          background: ${item.cor.hex}; border: 1px solid #dee2e6; 
                          border-radius: 3px; vertical-align: middle;"></span>
                    ${item.cor.nome}
                </td>
                <td style="padding: 10px; text-align: center;">${item.quantidade}m</td>
                <td style="padding: 10px; text-align: right;">R$ ${item.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Frete:</span>
                <span style="color: #28a745;">GRÁTIS</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.2em; font-weight: bold; 
                        border-top: 2px solid #dee2e6; padding-top: 10px;">
                <span>Total:</span>
                <span style="color: #667eea;">R$ ${total.toFixed(2)}</span>
            </div>
        </div>
        
        ${empresaData.regimeTributario === 'SIMPLES NACIONAL' ? `
        <div class="info-box alert">
            <strong>⚠️ Importante - Diferencial de ICMS</strong><br>
            Sua empresa deverá recolher o diferencial de alíquota de ICMS de 18% 
            por estar enquadrada no SIMPLES NACIONAL.
        </div>
        ` : ''}
        
        <div class="button-group">
            <button class="btn btn-secondary" onclick="goToStep(2)">
                ← Adicionar mais produtos
            </button>
            <button class="btn btn-success" onclick="goToStep(4)">
                Escolher forma de pagamento →
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

// Sistema de navegação
function goToStep(step) {
    // Esconder todos os steps
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Mostrar step atual
    document.getElementById(`step${step}`).classList.add('active');
    
    // Atualizar progresso
    const progress = (step / 4) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Atualizar indicadores
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index < step - 1) {
            stepEl.classList.add('completed');
        } else if (index === step - 1) {
            stepEl.classList.add('active');
        }
    });
    
    // Mostrar/esconder botão voltar
    document.getElementById('backBtn').style.display = step > 1 ? 'block' : 'none';
    
    // Esconder carrinho em algumas etapas
    if (step === 1 || step === 3 || step === 4) {
        document.getElementById('cartSummary').style.display = 'none';
    } else if (step === 2 && orderItems.length > 0) {
        document.getElementById('cartSummary').style.display = 'block';
    }
    
    currentStep = step;
}

function voltarEtapa() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

// Sistema de notificações
function showNotification(type, title, message) {
    const notification = document.getElementById('notification');
    
    notification.className = `notification ${type}`;
    document.getElementById('notificationTitle').textContent = title;
    document.getElementById('notificationMessage').textContent = message;
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Salvar pedido
function salvarPedido(formaPagamento) {
    const pedido = {
        id: `PED-${Date.now()}`,
        tipo: 'COMPRA_PROGRAMADA_PJ',
        empresa: empresaData,
        itens: orderItems,
        total: calcularTotal(),
        pagamento: formaPagamento,
        status: 'aguardando_confirmacao',
        dataPedido: new Date().toISOString(),
        prazoEntrega: '15 dias corridos após pagamento',
        observacoes: {
            freteGratis: true,
            entregaCidades: CEP_SERVICE.verificarEntregaGratis(empresaData.cidade) ? 
                ['Belo Horizonte', 'Betim', 'Contagem'] : [empresaData.cidade],
            icms: empresaData.regimeTributario === 'SIMPLES NACIONAL' ? 
                'Necessário recolher diferencial de alíquota ICMS 18%' : 
                'ICMS recolhido normalmente na venda'
        }
    };
    
    // Salvar no localStorage
    let pedidos = JSON.parse(localStorage.getItem('pedidos_programados_v2') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos_programados_v2', JSON.stringify(pedidos));
    
    // Gerar mensagem WhatsApp
    const mensagem = DATABASE_PJ.templates.pedidoRecebido(pedido);
    const linkWhatsApp = DATABASE_PJ.gerarLinkWhatsApp('31999999999', mensagem);
    
    // Mostrar confirmação
    alert(`Pedido ${pedido.id} enviado com sucesso!\n\nVocê receberá a confirmação em até 1 dia útil.`);
    
    // Abrir WhatsApp
    if (confirm('Deseja enviar os detalhes por WhatsApp?')) {
        window.open(linkWhatsApp, '_blank');
    }
    
    // Limpar e reiniciar
    setTimeout(() => {
        if (confirm('Deseja fazer um novo pedido?')) {
            location.reload();
        }
    }, 1000);
}