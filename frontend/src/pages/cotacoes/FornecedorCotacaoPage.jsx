import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const FornecedorCotacaoPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cotacao, setCotacao] = useState(null);
  const [fornecedor, setFornecedor] = useState(null);
  const [error, setError] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [jaRespondeu, setJaRespondeu] = useState(false);

  useEffect(() => {
    carregarCotacao();
  }, [token]);

  const carregarCotacao = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/cotacoes/public/${token}`);
      const data = response.data.data;

      setCotacao(data.cotacao);
      setFornecedor(data.fornecedor);

      // Verificar se já respondeu
      const jaRespondido = data.cotacao.items.every(item =>
        item.respostasFornecedor.some(r => r.fornecedorId === data.fornecedor.id)
      );
      setJaRespondeu(jaRespondido);

      // Inicializar respostas
      const respostasIniciais = data.cotacao.items.map(item => {
        const respostaExistente = item.respostasFornecedor.find(
          r => r.fornecedorId === data.fornecedor.id
        );

        return {
          itemId: item.id,
          precoUnitario: respostaExistente?.precoUnitario || '',
          prazoEntrega: respostaExistente?.prazoEntrega || '',
          observacoes: respostaExistente?.observacoes || '',
        };
      });

      setRespostas(respostasIniciais);
    } catch (error) {
      console.error('Erro ao carregar cotação:', error);
      setError(error.response?.data?.message || 'Token inválido ou cotação não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleRespostaChange = (itemId, field, value) => {
    setRespostas(prev =>
      prev.map(r =>
        r.itemId === itemId ? { ...r, [field]: value } : r
      )
    );
  };

  const validarFormulario = () => {
    for (let i = 0; i < respostas.length; i++) {
      const resposta = respostas[i];

      if (!resposta.precoUnitario || !resposta.prazoEntrega) {
        alert(`Item ${i + 1}: preencha o preço unitário e o prazo de entrega`);
        return false;
      }

      if (parseFloat(resposta.precoUnitario) <= 0) {
        alert(`Item ${i + 1}: preço unitário deve ser maior que zero`);
        return false;
      }

      if (parseInt(resposta.prazoEntrega) <= 0) {
        alert(`Item ${i + 1}: prazo de entrega deve ser maior que zero`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!confirm('Tem certeza que deseja enviar sua resposta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setSubmitting(true);

      await api.post(`/cotacoes/public/${token}/responder`, {
        respostas: respostas.map(r => ({
          itemId: r.itemId,
          preco: parseFloat(r.precoUnitario),
          prazoEntrega: parseInt(r.prazoEntrega),
          observacoes: r.observacoes || null,
        })),
      });

      alert('Resposta enviada com sucesso! Obrigado pela sua cotação.');
      setJaRespondeu(true);
      carregarCotacao(); // Recarregar para mostrar os dados enviados
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert(error.response?.data?.message || 'Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const calcularTotal = () => {
    return cotacao.items.reduce((acc, item, index) => {
      const resposta = respostas[index];
      if (resposta?.precoUnitario) {
        return acc + parseFloat(resposta.precoUnitario) * item.quantidade;
      }
      return acc;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao Carregar Cotação
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Ir para Página Inicial
          </button>
        </div>
      </div>
    );
  }

  const prazoExpirado = new Date(cotacao.prazoExpiracao) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-600 rounded-lg shadow-xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Requisição de Cotação</h1>
              <p className="text-blue-100">{cotacao.numero}</p>
            </div>
            {jaRespondeu && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="font-semibold">Respondido</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Fornecedor</p>
              <p className="font-bold text-lg">{fornecedor.nome}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Prazo de Resposta</p>
              <p className={`font-bold text-lg ${prazoExpirado ? 'text-red-200' : ''}`}>
                {new Date(cotacao.prazoExpiracao).toLocaleDateString('pt-BR')}
                {prazoExpirado && ' (Expirado)'}
              </p>
            </div>
          </div>
        </div>

        {/* Avisos */}
        {prazoExpirado && !jaRespondeu && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Prazo de resposta expirado
              </p>
              <p className="text-sm text-gray-700">
                O prazo para responder esta cotação já passou, mas você ainda pode enviar sua proposta.
              </p>
            </div>
          </div>
        )}

        {cotacao.observacoes && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h3 className="font-bold text-gray-900 mb-2">Observações do Solicitante:</h3>
            <p className="text-gray-700">{cotacao.observacoes}</p>
          </div>
        )}

        {jaRespondeu && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Você já respondeu esta cotação
              </p>
              <p className="text-sm text-gray-700">
                Sua resposta foi enviada com sucesso. Abaixo você pode visualizar os valores que informou.
              </p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={24} className="text-blue-500" />
              Produtos para Cotação
            </h2>

            <div className="space-y-6">
              {cotacao.items.map((item, index) => {
                const resposta = respostas[index];
                const subtotal = resposta?.precoUnitario
                  ? parseFloat(resposta.precoUnitario) * item.quantidade
                  : 0;

                return (
                  <div key={item.id} className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
                    {/* Cabeçalho do Produto */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: item.cor.codigoHex }}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {item.produto.nome}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cor: {item.cor.nome} | Quantidade: {item.quantidade}m
                        </p>
                      </div>
                      {subtotal > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-xl font-bold text-green-600">
                            R$ {subtotal.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Campos de Resposta */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preço Unitário (R$/m) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={resposta?.precoUnitario || ''}
                          onChange={(e) =>
                            handleRespostaChange(item.id, 'precoUnitario', e.target.value)
                          }
                          className="input"
                          placeholder="0.00"
                          required
                          disabled={jaRespondeu}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prazo de Entrega (dias) *
                        </label>
                        <input
                          type="number"
                          value={resposta?.prazoEntrega || ''}
                          onChange={(e) =>
                            handleRespostaChange(item.id, 'prazoEntrega', e.target.value)
                          }
                          className="input"
                          placeholder="0"
                          required
                          disabled={jaRespondeu}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observações
                        </label>
                        <input
                          type="text"
                          value={resposta?.observacoes || ''}
                          onChange={(e) =>
                            handleRespostaChange(item.id, 'observacoes', e.target.value)
                          }
                          className="input"
                          placeholder="Opcional"
                          disabled={jaRespondeu}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            {respostas.some(r => r.precoUnitario) && (
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Valor Total da Proposta</p>
                    <p className="text-sm text-gray-500">
                      Soma de todos os itens cotados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-blue-600">
                      R$ {calcularTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Envio */}
          {!jaRespondeu && (
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-start gap-3 mb-4 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Antes de enviar, verifique:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Todos os preços estão corretos</li>
                    <li>Os prazos de entrega são factíveis</li>
                    <li>Você preencheu observações importantes (se houver)</li>
                  </ul>
                  <p className="mt-2 font-semibold">
                    Esta ação não pode ser desfeita após o envio.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Proposta
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Empório Tecidos - Sistema de Cotações</p>
          <p className="mt-1">
            Dúvidas? Entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FornecedorCotacaoPage;
