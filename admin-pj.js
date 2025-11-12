// Painel Administrativo - Compra Programada PJ
// Empório Tecidos

let pedidos = [];
let produtosConfig = [];
let clientesDB = [];
let currentTab = 'pedidos';

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    carregarPedidos();
    carregarProdutos();
    carregarClientes();
    calcularEstatisticas();
});

// Sistema de abas
function switchTab(tabName) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Esconder tab ativa
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.classList.add('active');
    
    currentTab = tabName;
    
    // Recarregar dados da aba
    if (tabName === 'pedidos') carregarPedidos();
    if (tabName === 'produtos') carregarProdutos();
    if (tabName === 'clientes') carregarClientes();
    if (tabName === 'relatorios') calcularRelatorios();
}

// PEDIDOS
function carregarPedidos() {
    const container = document.getElementById('pedidosList');
    pedidos = JSON.parse(localStorage.getItem('pedidos_programados_v2') || '[]');
    
    if (pedidos.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #6c757d;">Nenhum pedido encontrado</div>';
        return;
    }
    
    let html = '';
    pedidos.reverse().forEach(pedido => {
        const statusClass = `status-${pedido.status.replace('_', '')}`;
        const statusText = formatarStatus(pedido.status);
        
        html += `
            <div class="pedido-row">
                <div>${pedido.id}</div>
                <div>${pedido.empresa.razaoSocial}</div>
                <div>R$ ${pedido.total.toFixed(2)}</div>
                <div>${new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}</div>
                <div><span class="status-badge ${statusClass}">${statusText}</span></div>
                <div>${pedido.pagamento.toUpperCase()}</div>
                <div class="actions-group">
                    <button class="btn btn-sm btn-primary" onclick="verDetalhesPedido('${pedido.id}')">Ver</button>
                    <button class="btn btn-sm btn-success" onclick="confirmarPedido('${pedido.id}')">✓</button>
                    <button class="btn btn-sm btn-danger" onclick="cancelarPedido('${pedido.id}')">✕</button>
                    <button class="btn btn-sm btn-info" onclick="enviarWhatsApp('${pedido.id}')">📱</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Ver detalhes do pedido
function verDetalhesPedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    let html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
                <h3>Dados da Empresa</h3>
                <table style="width: 100%; margin-top: 10px;">
                    <tr><td style="padding: 8px;"><strong>CNPJ:</strong></td><td>${pedido.empresa.cnpj}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Razão Social:</strong></td><td>${pedido.empresa.razaoSocial}</td></tr>
                    <tr><td style="padding: 8px;"><strong>IE:</strong></td><td>${pedido.empresa.inscricaoEstadual}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Regime:</strong></td><td>${pedido.empresa.regimeTributario}</td></tr>
                    <tr><td style="padding: 8px;"><strong>WhatsApp:</strong></td><td>${pedido.empresa.whatsapp}</td></tr>
                    <tr><td style="padding: 8px;"><strong>E-mail:</strong></td><td>${pedido.empresa.email}</td></tr>
                </table>
            </div>
            
            <div>
                <h3>Informações do Pedido</h3>
                <table style="width: 100%; margin-top: 10px;">
                    <tr><td style="padding: 8px;"><strong>Pedido:</strong></td><td>${pedido.id}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Data:</strong></td><td>${new Date(pedido.dataPedido).toLocaleString('pt-BR')}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Status:</strong></td><td>${formatarStatus(pedido.status)}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Pagamento:</strong></td><td>${pedido.pagamento.toUpperCase()}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Total:</strong></td><td><strong>R$ ${pedido.total.toFixed(2)}</strong></td></tr>
                    <tr><td style="padding: 8px;"><strong>Prazo:</strong></td><td>${pedido.prazoEntrega}</td></tr>
                </table>
            </div>
        </div>
        
        <h3 style="margin-top: 30px;">Endereço de Entrega</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
            ${pedido.empresa.endereco}, ${pedido.empresa.numero}
            ${pedido.empresa.complemento ? ` - ${pedido.empresa.complemento}` : ''}<br>
            ${pedido.empresa.bairro} - ${pedido.empresa.cidade}/MG<br>
            CEP: ${pedido.empresa.cep}
        </div>
        
        <h3 style="margin-top: 30px;">Itens do Pedido</h3>
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Produto</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Cor</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qtd</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Unit.</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${pedido.itens.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.produto.nome}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">
                            <span style="display: inline-block; width: 20px; height: 20px; background: ${item.cor.hex}; 
                                  border: 1px solid #dee2e6; border-radius: 3px; vertical-align: middle;"></span>
                            ${item.cor.nome}
                        </td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e9ecef;">
                            ${item.quantidade}m
                        </td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e9ecef;">
                            R$ ${item.produto.precoMetro.toFixed(2)}
                        </td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e9ecef;">
                            R$ ${item.total.toFixed(2)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        ${pedido.empresa.regimeTributario === 'SIMPLES NACIONAL' ? `
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <strong>⚠️ ATENÇÃO - Diferencial de ICMS</strong><br>
            Cliente enquadrado no SIMPLES NACIONAL - Necessário recolher diferencial de alíquota de 18%
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center;">
            <button class="btn btn-success" onclick="confirmarPedido('${pedido.id}')">
                ✅ Confirmar Pedido
            </button>
            <button class="btn btn-info" onclick="gerarLinkPagamento('${pedido.id}')">
                💳 Gerar Link Pagamento
            </button>
            <button class="btn btn-primary" onclick="enviarWhatsApp('${pedido.id}')">
                📱 Enviar WhatsApp
            </button>
            <button class="btn btn-danger" onclick="cancelarPedido('${pedido.id}')">
                ❌ Cancelar Pedido
            </button>
        </div>
    `;
    
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalPedido').style.display = 'block';
}

// Confirmar pedido
function confirmarPedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.status = 'confirmado';
    pedido.dataConfirmacao = new Date().toISOString();
    
    salvarPedidos();
    
    // Gerar mensagem WhatsApp
    const mensagem = DATABASE_PJ.templates.pedidoConfirmado(pedido);
    const link = DATABASE_PJ.gerarLinkWhatsApp(pedido.empresa.whatsapp, mensagem);
    
    if (confirm('Pedido confirmado! Deseja enviar notificação por WhatsApp?')) {
        window.open(link, '_blank');
    }
    
    carregarPedidos();
    fecharModal();
}

// Cancelar pedido
function cancelarPedido(pedidoId) {
    const motivo = prompt('Motivo do cancelamento:');
    if (!motivo) return;
    
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.status = 'cancelado';
    pedido.dataCancelamento = new Date().toISOString();
    pedido.motivoCancelamento = motivo;
    
    salvarPedidos();
    
    // Gerar mensagem WhatsApp
    const mensagem = DATABASE_PJ.templates.pedidoCancelado(pedido, motivo);
    const link = DATABASE_PJ.gerarLinkWhatsApp(pedido.empresa.whatsapp, mensagem);
    
    if (confirm('Pedido cancelado! Deseja enviar notificação por WhatsApp?')) {
        window.open(link, '_blank');
    }
    
    carregarPedidos();
    fecharModal();
}

// Enviar WhatsApp
function enviarWhatsApp(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    let mensagem = `*PEDIDO ${pedido.id}*\n\n`;
    mensagem += `Empresa: ${pedido.empresa.razaoSocial}\n`;
    mensagem += `CNPJ: ${pedido.empresa.cnpj}\n`;
    mensagem += `Total: R$ ${pedido.total.toFixed(2)}\n`;
    mensagem += `Status: ${formatarStatus(pedido.status)}\n\n`;
    
    mensagem += `*ITENS:*\n`;
    pedido.itens.forEach(item => {
        mensagem += `• ${item.produto.nome} - ${item.cor.nome} - ${item.quantidade}m\n`;
    });
    
    const link = DATABASE_PJ.gerarLinkWhatsApp(pedido.empresa.whatsapp, mensagem);
    window.open(link, '_blank');
}

// PRODUTOS
function carregarProdutos() {
    const container = document.getElementById('productGrid');
    produtosConfig = DATABASE_PJ.config.produtosDisponiveis;
    
    let html = '';
    produtosConfig.forEach(produto => {
        html += `
            <div class="product-card ${!produto.disponivel ? 'disabled' : ''}">
                <div class="product-header">
                    <div class="product-name">${produto.nome}</div>
                    <label class="switch">
                        <input type="checkbox" ${produto.disponivel ? 'checked' : ''} 
                               onchange="toggleProduto(${produto.id}, this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div style="margin: 15px 0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="font-size: 12px; color: #6c757d;">Preço/Metro:</label>
                            <input type="number" class="price-input" value="${produto.precoMetro}" 
                                   onchange="atualizarPreco(${produto.id}, this.value, 'metro')">
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d;">Preço/Rolo:</label>
                            <input type="number" class="price-input" value="${produto.precoRolo}" 
                                   onchange="atualizarPreco(${produto.id}, this.value, 'rolo')">
                        </div>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <label style="font-size: 12px; color: #6c757d;">Estoque (metros):</label>
                        <input type="number" class="price-input" value="${produto.estoque}" 
                               onchange="atualizarEstoque(${produto.id}, this.value)">
                    </div>
                </div>
                
                <div>
                    <label style="font-size: 12px; color: #6c757d;">Cores Disponíveis:</label>
                    <div class="color-chips">
                        ${produto.coresDisponiveis.map(corId => {
                            const cor = DATABASE_PJ.config.coresDisponiveis[corId];
                            return cor ? `
                                <div class="color-chip ${!cor.disponivel ? 'disabled' : ''}" 
                                     style="background: ${cor.hex};"
                                     title="${cor.nome}"
                                     onclick="toggleCor(${produto.id}, ${corId})"></div>
                            ` : '';
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Toggle produto
function toggleProduto(produtoId, ativo) {
    const produto = produtosConfig.find(p => p.id === produtoId);
    if (produto) {
        produto.disponivel = ativo;
        salvarConfiguracoes();
        carregarProdutos();
    }
}

// Atualizar preço
function atualizarPreco(produtoId, valor, tipo) {
    const produto = produtosConfig.find(p => p.id === produtoId);
    if (!produto) return;
    
    if (tipo === 'metro') {
        produto.precoMetro = parseFloat(valor);
        produto.precoRolo = produto.precoMetro * 60;
    } else {
        produto.precoRolo = parseFloat(valor);
        produto.precoMetro = produto.precoRolo / 60;
    }
    
    salvarConfiguracoes();
    carregarProdutos();
}

// Atualizar estoque
function atualizarEstoque(produtoId, valor) {
    const produto = produtosConfig.find(p => p.id === produtoId);
    if (produto) {
        produto.estoque = parseInt(valor);
        salvarConfiguracoes();
    }
}

// CLIENTES
function carregarClientes() {
    const container = document.getElementById('clientesList');
    clientesDB = DATABASE_PJ.clientes;
    
    let html = '';
    clientesDB.forEach(cliente => {
        html += `
            <tr>
                <td style="padding: 12px;">${formatarCNPJ(cliente.cnpj)}</td>
                <td style="padding: 12px;">${cliente.razaoSocial}</td>
                <td style="padding: 12px;">${cliente.regimeTributario}</td>
                <td style="padding: 12px;">${cliente.cidade}</td>
                <td style="padding: 12px;">${cliente.whatsapp}</td>
                <td style="padding: 12px;">R$ ${cliente.limiteCredito.toFixed(2)}</td>
                <td style="padding: 12px;">
                    <button class="btn btn-sm btn-primary" onclick="editarCliente('${cliente.cnpj}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="removerCliente('${cliente.cnpj}')">Remover</button>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

// ESTATÍSTICAS
function calcularEstatisticas() {
    const hoje = new Date().toDateString();
    const pedidosHoje = pedidos.filter(p => new Date(p.dataPedido).toDateString() === hoje);
    const aguardando = pedidos.filter(p => p.status === 'aguardando_confirmacao');
    const confirmados = pedidos.filter(p => p.status === 'confirmado');
    
    const mesAtual = new Date().getMonth();
    const pedidosMes = pedidos.filter(p => new Date(p.dataPedido).getMonth() === mesAtual);
    const faturamentoMes = pedidosMes.reduce((sum, p) => sum + p.total, 0);
    
    document.getElementById('totalPedidosHoje').textContent = pedidosHoje.length;
    document.getElementById('pedidosAguardando').textContent = aguardando.length;
    document.getElementById('pedidosConfirmados').textContent = confirmados.length;
    document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2).replace('.', ',')}`;
}

// RELATÓRIOS
function calcularRelatorios() {
    const mesAtual = new Date().getMonth();
    const pedidosMes = pedidos.filter(p => new Date(p.dataPedido).getMonth() === mesAtual);
    
    const totalVendas = pedidosMes.reduce((sum, p) => sum + p.total, 0);
    const ticketMedio = pedidosMes.length > 0 ? totalVendas / pedidosMes.length : 0;
    
    // Produto mais vendido
    const produtosVendidos = {};
    pedidosMes.forEach(pedido => {
        pedido.itens.forEach(item => {
            if (!produtosVendidos[item.produto.nome]) {
                produtosVendidos[item.produto.nome] = 0;
            }
            produtosVendidos[item.produto.nome] += item.quantidade;
        });
    });
    
    const produtoMaisVendido = Object.keys(produtosVendidos).reduce((a, b) => 
        produtosVendidos[a] > produtosVendidos[b] ? a : b, '');
    
    // Clientes ativos
    const clientesUnicos = new Set(pedidosMes.map(p => p.empresa.cnpj));
    
    document.getElementById('totalVendasMes').textContent = `R$ ${totalVendas.toFixed(2).replace('.', ',')}`;
    document.getElementById('ticketMedio').textContent = `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`;
    document.getElementById('produtoMaisVendido').textContent = produtoMaisVendido || '-';
    document.getElementById('clientesAtivos').textContent = clientesUnicos.size;
}

// Exportar pedidos
function exportarPedidos() {
    alert('Função de exportação será implementada. Integrará com biblioteca de geração de Excel.');
}

// Relatório ICMS
function relatorioICMS() {
    const simplesNacional = pedidos.filter(p => p.empresa.regimeTributario === 'SIMPLES NACIONAL');
    const totalICMS = simplesNacional.reduce((sum, p) => sum + (p.total * 0.18), 0);
    
    alert(`Relatório ICMS\n\nEmpresas SIMPLES NACIONAL: ${simplesNacional.length}\nDiferencial ICMS a recolher: R$ ${totalICMS.toFixed(2)}`);
}

// Utilitários
function formatarStatus(status) {
    const statusMap = {
        'aguardando_confirmacao': 'Aguardando',
        'confirmado': 'Confirmado',
        'pago': 'Pago',
        'cancelado': 'Cancelado',
        'entregue': 'Entregue'
    };
    return statusMap[status] || status;
}

function formatarCNPJ(cnpj) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function fecharModal() {
    document.getElementById('modalPedido').style.display = 'none';
}

function salvarPedidos() {
    localStorage.setItem('pedidos_programados_v2', JSON.stringify(pedidos));
}

function salvarConfiguracoes() {
    localStorage.setItem('config_sistema_pj', JSON.stringify(DATABASE_PJ.config));
}

function carregarDados() {
    // Carregar configurações salvas se existirem
    const configSalva = localStorage.getItem('config_sistema_pj');
    if (configSalva) {
        Object.assign(DATABASE_PJ.config, JSON.parse(configSalva));
    }
}

// Event listeners
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}