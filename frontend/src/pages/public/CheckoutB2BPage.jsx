import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, CreditCard, Check } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckoutB2BPage = () => {
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState(1); // 1: Dados, 2: Revisão, 3: Sucesso
  const navigate = useNavigate();

  // Dados do formulário
  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    inscricaoEstadual: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'MG',
    telefone: '',
    email: '',
    formaPagamento: '',
    parcelas: '1', // À vista por padrão
    observacoes: ''
  });

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const carregarCarrinho = () => {
    const carrinhoSalvo = localStorage.getItem('carrinho_b2b');
    if (carrinhoSalvo) {
      const itens = JSON.parse(carrinhoSalvo);
      if (itens.length === 0) {
        alert('Carrinho vazio! Redirecionando...');
        navigate('/loja-b2b');
        return;
      }
      setCarrinho(itens);
    } else {
      navigate('/loja-b2b');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const buscarCEPAutomatico = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf
      }));
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const validarFormulario = () => {
    const camposObrigatorios = [
      'razaoSocial', 'cnpj', 'inscricaoEstadual', 'cep', 'endereco',
      'numero', 'bairro', 'cidade', 'estado', 'telefone', 'email', 'formaPagamento'
    ];

    for (const campo of camposObrigatorios) {
      if (!formData[campo]) {
        alert(`Campo obrigatório: ${campo}`);
        return false;
      }
    }

    // Validar CNPJ (formato básico)
    const cnpj = formData.cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      alert('CNPJ inválido (deve ter 14 dígitos)');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Email inválido');
      return false;
    }

    // Validar estado MG
    if (formData.estado !== 'MG') {
      alert('Atendemos apenas empresas de Minas Gerais (MG)');
      return false;
    }

    // Validar parcelas para cartão
    if (formData.formaPagamento === 'CARTAO' && !formData.parcelas) {
      alert('Selecione o número de parcelas');
      return false;
    }

    return true;
  };

  const avancarParaRevisao = () => {
    if (validarFormulario()) {
      setEtapa(2);
    }
  };

  const finalizarPedido = async () => {
    try {
      setLoading(true);

      // 1. Criar/buscar cliente
      const clienteResponse = await api.post('/clientes-b2b', {
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.razaoSocial, // Usando razão social como nome fantasia
        cnpj: formData.cnpj.replace(/\D/g, ''),
        inscricaoEstadual: formData.inscricaoEstadual,
        cep: formData.cep.replace(/\D/g, ''),
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento || null,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        telefone: formData.telefone,
        email: formData.email,
        observacoes: formData.observacoes || null
      });

      const clienteId = clienteResponse.data.data.id;

      // 2. Calcular total
      const valorTotal = carrinho.reduce((total, item) => {
        return total + (parseFloat(item.produto.precoAtacado) * item.quantidade);
      }, 0);

      // 3. Montar forma de pagamento
      let formaPagamentoTexto = formData.formaPagamento;
      if (formData.formaPagamento === 'CARTAO') {
        const numParcelas = parseInt(formData.parcelas);
        if (numParcelas === 1) {
          formaPagamentoTexto = 'CARTAO_AVISTA';
        } else {
          formaPagamentoTexto = `CARTAO_${numParcelas}X`;
        }
      }

      // 4. Criar pedido
      const pedidoResponse = await api.post('/pedidos-b2b/publico', {
        clienteId,
        formaPagamento: formaPagamentoTexto,
        valorTotal,
        enderecoEntrega: `${formData.endereco}, ${formData.numero}${formData.complemento ? ', ' + formData.complemento : ''} - ${formData.bairro}, ${formData.cidade}/${formData.estado} - CEP: ${formData.cep}`,
        observacoes: formData.observacoes || null,
        items: carrinho.map(item => ({
          produtoId: item.produtoId,
          corId: item.corId,
          quantidade: item.quantidade,
          precoUnitario: parseFloat(item.produto.precoAtacado)
        }))
      });

      // 5. Limpar carrinho
      localStorage.removeItem('carrinho_b2b');

      // 6. Mostrar sucesso
      setEtapa(3);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      return total + (parseFloat(item.produto.precoAtacado) * item.quantidade);
    }, 0);
  };

  const getColorImageUrl = (arquivoImagem) => {
    if (!arquivoImagem) return null;
    return `http://localhost:5000/assets/cores/fotos/${arquivoImagem}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Etapa 3: Sucesso
  if (etapa === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Seu pedido foi recebido e está aguardando aprovação da nossa equipe.
            Em breve você receberá um e-mail com as instruções de pagamento.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/loja-b2b')}
              className="btn-primary w-full"
            >
              Fazer Novo Pedido
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => etapa === 1 ? navigate('/loja-b2b') : setEtapa(1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-600">
                Etapa {etapa} de 2: {etapa === 1 ? 'Dados Cadastrais' : 'Revisão do Pedido'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            {etapa === 1 ? (
              <FormularioCadastro
                formData={formData}
                onChange={handleChange}
                onBuscarCEPAutomatico={buscarCEPAutomatico}
              />
            ) : (
              <RevisaoPedido
                formData={formData}
                carrinho={carrinho}
                getColorImageUrl={getColorImageUrl}
              />
            )}
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <ResumoCarrinho
              carrinho={carrinho}
              total={calcularTotal()}
              etapa={etapa}
              onAvancar={avancarParaRevisao}
              onFinalizar={finalizarPedido}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente FormularioCadastro
const FormularioCadastro = ({ formData, onChange, onBuscarCEPAutomatico }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Building className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Dados da Empresa</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razão Social *
          </label>
          <input
            type="text"
            name="razaoSocial"
            value={formData.razaoSocial}
            onChange={onChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ *
          </label>
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={onChange}
            className="input"
            placeholder="00.000.000/0000-00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inscrição Estadual *
          </label>
          <input
            type="text"
            name="inscricaoEstadual"
            value={formData.inscricaoEstadual}
            onChange={onChange}
            className="input"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pb-4 border-b mt-8">
        <MapPin className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Endereço de Entrega</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP *
          </label>
          <input
            type="text"
            name="cep"
            value={formData.cep}
            onChange={onChange}
            onBlur={(e) => onBuscarCEPAutomatico(e.target.value)}
            className="input"
            placeholder="00000-000"
            required
          />
          <p className="text-xs text-gray-500 mt-1">O endereço será preenchido automaticamente</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço *
          </label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={onChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número *
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={onChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complemento
          </label>
          <input
            type="text"
            name="complemento"
            value={formData.complemento}
            onChange={onChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro *
          </label>
          <input
            type="text"
            name="bairro"
            value={formData.bairro}
            onChange={onChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade *
          </label>
          <input
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={onChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={onChange}
            className="input"
            required
          >
            <option value="MG">MG - Minas Gerais</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Atendemos apenas MG</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone com WhatsApp *
          </label>
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={onChange}
            className="input"
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="input"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pb-4 border-b mt-8">
        <CreditCard className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Forma de Pagamento</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a forma de pagamento *
          </label>
          <select
            name="formaPagamento"
            value={formData.formaPagamento}
            onChange={onChange}
            className="input"
            required
          >
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="TRANSFERENCIA">Transferência Bancária</option>
            <option value="BOLETO">Boleto</option>
            <option value="CARTAO">Cartão de Crédito</option>
          </select>
        </div>

        {/* Opções de parcelas para Cartão */}
        {formData.formaPagamento === 'CARTAO' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Parcelas *
            </label>
            <select
              name="parcelas"
              value={formData.parcelas}
              onChange={onChange}
              className="input"
              required
            >
              <option value="1">À vista (sem juros)</option>
              <option value="2">2x sem juros</option>
              <option value="3">3x sem juros</option>
              <option value="4">4x sem juros</option>
            </select>
            <p className="text-xs text-gray-600 mt-2">
              ✓ Parcelamento sem juros em até 4x
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações
        </label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={onChange}
          className="input"
          rows="3"
          placeholder="Informações adicionais sobre o pedido"
        />
      </div>
    </div>
  );
};

// Componente RevisaoPedido
const RevisaoPedido = ({ formData, carrinho, getColorImageUrl }) => {
  // Formatar forma de pagamento para exibição
  const formatarFormaPagamento = () => {
    if (formData.formaPagamento === 'CARTAO') {
      const numParcelas = parseInt(formData.parcelas);
      if (numParcelas === 1) {
        return 'Cartão de Crédito - À vista';
      } else {
        return `Cartão de Crédito - ${numParcelas}x sem juros`;
      }
    }
    return formData.formaPagamento;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">Revisão do Pedido</h2>

      {/* Dados da Empresa */}
      <div className="border-b pb-4">
        <h3 className="font-semibold mb-2">Dados da Empresa</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Razão Social:</strong> {formData.razaoSocial}</p>
          <p><strong>CNPJ:</strong> {formData.cnpj}</p>
          <p><strong>IE:</strong> {formData.inscricaoEstadual}</p>
        </div>
      </div>

      {/* Endereço */}
      <div className="border-b pb-4">
        <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
        <p className="text-sm text-gray-600">
          {formData.endereco}, {formData.numero}
          {formData.complemento && `, ${formData.complemento}`}<br />
          {formData.bairro} - {formData.cidade}/{formData.estado}<br />
          CEP: {formData.cep}
        </p>
      </div>

      {/* Contato */}
      <div className="border-b pb-4">
        <h3 className="font-semibold mb-2">Contato</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Telefone WhatsApp:</strong> {formData.telefone}</p>
          <p><strong>E-mail:</strong> {formData.email}</p>
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="border-b pb-4">
        <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
        <p className="text-sm text-gray-600">{formatarFormaPagamento()}</p>
      </div>

      {/* Produtos */}
      <div>
        <h3 className="font-semibold mb-3">Produtos ({carrinho.length})</h3>
        <div className="space-y-2">
          {carrinho.map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-sm border-b pb-2">
              {item.cor.arquivoImagem && (
                <img
                  src={getColorImageUrl(item.cor.arquivoImagem)}
                  alt={item.cor.nome}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.produto.nome}</p>
                <p className="text-gray-600">{item.cor.nome} - {item.quantidade}m</p>
              </div>
              <p className="font-medium">
                R$ {(parseFloat(item.produto.precoAtacado) * item.quantidade).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente ResumoCarrinho
const ResumoCarrinho = ({ carrinho, total, etapa, onAvancar, onFinalizar, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Itens ({carrinho.length})</span>
          <span>{carrinho.reduce((sum, item) => sum + item.quantidade, 0)}m</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Frete</span>
          <span className="text-green-600">Grátis</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {etapa === 1 ? (
          <button
            onClick={onAvancar}
            className="btn-primary w-full"
          >
            Avançar para Revisão
          </button>
        ) : (
          <button
            onClick={onFinalizar}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Finalizando...' : 'Finalizar Pedido'}
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>✓ Frete grátis para todo MG</p>
        <p>✓ Prazo de entrega: 15 dias após pagamento</p>
        <p>✓ Pagamento após aprovação</p>
      </div>
    </div>
  );
};

export default CheckoutB2BPage;
