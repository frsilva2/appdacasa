import { useState } from 'react';
import { X, CheckCircle, DollarSign, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AprovarCotacaoModal = ({ cotacao, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  // Extrair todos os fornecedores que responderam
  const fornecedoresQueResponderam = Array.from(
    new Set(
      cotacao.items.flatMap(item =>
        item.respostasFornecedor.map(r => r.fornecedor.id)
      )
    )
  ).map(fornecedorId => {
    const primeiraResposta = cotacao.items
      .flatMap(item => item.respostasFornecedor)
      .find(r => r.fornecedor.id === fornecedorId);
    return primeiraResposta.fornecedor;
  });

  // Calcular totais por fornecedor
  const calcularTotalFornecedor = (fornecedorId) => {
    return cotacao.items.reduce((acc, item) => {
      const resposta = item.respostasFornecedor.find(
        r => r.fornecedorId === fornecedorId
      );
      if (resposta) {
        return acc + parseFloat(resposta.precoUnitario) * item.quantidade;
      }
      return acc;
    }, 0);
  };

  // Calcular prazo médio de entrega
  const calcularPrazoMedio = (fornecedorId) => {
    const respostas = cotacao.items
      .flatMap(item => item.respostasFornecedor)
      .filter(r => r.fornecedorId === fornecedorId);

    if (respostas.length === 0) return 0;

    const somaPrazos = respostas.reduce((acc, r) => acc + parseInt(r.prazoEntrega), 0);
    return Math.round(somaPrazos / respostas.length);
  };

  // Verificar se fornecedor respondeu todos os itens
  const fornecedorRespondeuTodos = (fornecedorId) => {
    return cotacao.items.every(item =>
      item.respostasFornecedor.some(r => r.fornecedorId === fornecedorId)
    );
  };

  // Calcular variação média com histórico
  const calcularVariacaoMediaHistorico = (fornecedorId) => {
    const respostasComHistorico = cotacao.items
      .flatMap(item => item.respostasFornecedor)
      .filter(r => r.fornecedorId === fornecedorId && r.precoHistorico);

    if (respostasComHistorico.length === 0) return null;

    const somaVariacoes = respostasComHistorico.reduce((acc, r) => {
      const variacao = ((parseFloat(r.precoUnitario) - parseFloat(r.precoHistorico)) / parseFloat(r.precoHistorico)) * 100;
      return acc + variacao;
    }, 0);

    return somaVariacoes / respostasComHistorico.length;
  };

  // Encontrar fornecedor com melhor preço
  const fornecedorMelhorPreco = fornecedoresQueResponderam.reduce((melhor, fornecedor) => {
    const totalAtual = calcularTotalFornecedor(fornecedor.id);
    const totalMelhor = melhor ? calcularTotalFornecedor(melhor.id) : Infinity;
    return totalAtual < totalMelhor ? fornecedor : melhor;
  }, null);

  const handleAprovar = async () => {
    if (!fornecedorSelecionado) {
      alert('Selecione um fornecedor para aprovar');
      return;
    }

    if (!confirm(`Tem certeza que deseja aprovar o fornecedor ${fornecedorSelecionado.nome}?`)) {
      return;
    }

    try {
      setLoading(true);

      await api.post(`/cotacoes/${cotacao.id}/aprovar`, {
        fornecedorId: fornecedorSelecionado.id,
      });

      alert('Fornecedor aprovado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao aprovar fornecedor:', error);
      alert(error.response?.data?.message || 'Erro ao aprovar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Aprovar Fornecedor</h2>
            <p className="text-blue-100">Cotação: {cotacao.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Aviso */}
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Atenção: Esta ação não pode ser desfeita
              </p>
              <p className="text-sm text-gray-700">
                Ao aprovar um fornecedor, a cotação será marcada como APROVADA e um pedido de compra será gerado automaticamente.
              </p>
            </div>
          </div>

          {/* Comparativo de Fornecedores */}
          <div className="space-y-4">
            {fornecedoresQueResponderam.map((fornecedor) => {
              const total = calcularTotalFornecedor(fornecedor.id);
              const prazoMedio = calcularPrazoMedio(fornecedor.id);
              const respondeuTodos = fornecedorRespondeuTodos(fornecedor.id);
              const variacaoHistorica = calcularVariacaoMediaHistorico(fornecedor.id);
              const isMelhorPreco = fornecedor.id === fornecedorMelhorPreco?.id;
              const isSelecionado = fornecedorSelecionado?.id === fornecedor.id;

              return (
                <div
                  key={fornecedor.id}
                  onClick={() => setFornecedorSelecionado(fornecedor)}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    isSelecionado
                      ? 'border-green-500 bg-green-50'
                      : isMelhorPreco
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelecionado
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelecionado && <CheckCircle size={20} className="text-white" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {fornecedor.nome}
                          {isMelhorPreco && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              Melhor Preço
                            </span>
                          )}
                          {!respondeuTodos && (
                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                              Resposta Parcial
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {fornecedor.email} | {fornecedor.telefone || 'Sem telefone'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total da Proposta</p>
                      <p className="text-3xl font-bold text-gray-900">
                        R$ {total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign size={16} />
                        <p className="text-xs">Valor Total</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        R$ {total.toFixed(2)}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock size={16} />
                        <p className="text-xs">Prazo Médio</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {prazoMedio} dias
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <CheckCircle size={16} />
                        <p className="text-xs">Itens Cotados</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {cotacao.items.filter(item =>
                          item.respostasFornecedor.some(r => r.fornecedorId === fornecedor.id)
                        ).length} / {cotacao.items.length}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        {variacaoHistorica !== null && variacaoHistorica > 0 ? (
                          <TrendingUp size={16} className="text-red-500" />
                        ) : variacaoHistorica !== null ? (
                          <TrendingDown size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                        <p className="text-xs">vs. Histórico</p>
                      </div>
                      <p className={`font-semibold ${
                        variacaoHistorica === null
                          ? 'text-gray-500'
                          : variacaoHistorica > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {variacaoHistorica === null
                          ? 'N/A'
                          : `${variacaoHistorica > 0 ? '+' : ''}${variacaoHistorica.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes dos Itens */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Itens cotados:
                    </p>
                    {cotacao.items.map((item) => {
                      const resposta = item.respostasFornecedor.find(
                        r => r.fornecedorId === fornecedor.id
                      );

                      if (!resposta) {
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-red-50 rounded text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: item.cor.codigoHex }}
                              />
                              <span className="text-gray-700">
                                {item.produto.nome} - {item.cor.nome}
                              </span>
                            </div>
                            <span className="text-red-600 font-medium">
                              Não cotado
                            </span>
                          </div>
                        );
                      }

                      const subtotal = parseFloat(resposta.precoUnitario) * item.quantidade;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-white rounded text-sm border"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: item.cor.codigoHex }}
                            />
                            <span className="text-gray-700">
                              {item.produto.nome} - {item.cor.nome}
                            </span>
                            <span className="text-gray-500">
                              ({item.quantidade}m)
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">
                              R$ {parseFloat(resposta.precoUnitario).toFixed(2)}/m
                            </span>
                            <span className="font-semibold text-gray-900">
                              R$ {subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo da Seleção */}
          {fornecedorSelecionado && (
            <div className="mt-6 p-5 bg-green-50 border-2 border-green-500 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Fornecedor Selecionado
              </h3>
              <p className="text-gray-700 mb-1">
                <strong>{fornecedorSelecionado.nome}</strong>
              </p>
              <p className="text-2xl font-bold text-green-600">
                Valor Total: R$ {calcularTotalFornecedor(fornecedorSelecionado.id).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleAprovar}
            className="btn-success flex-1"
            disabled={loading || !fornecedorSelecionado}
          >
            {loading ? <LoadingSpinner /> : 'Aprovar Fornecedor Selecionado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AprovarCotacaoModal;
