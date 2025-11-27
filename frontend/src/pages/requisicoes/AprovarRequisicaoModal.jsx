import { useState } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import api from '../../services/api';

const AprovarRequisicaoModal = ({ requisicao, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    requisicao.items.map(item => ({
      itemId: item.id,
      quantidadeSolicitada: item.quantidadeSolicitada,
      quantidadeAprovada: item.quantidadeSolicitada, // Por padrão aprova tudo
      produto: item.produto,
      cor: item.cor,
    }))
  );
  const [justificativaRecusa, setJustificativaRecusa] = useState('');
  const [tipoAcao, setTipoAcao] = useState('aprovar'); // aprovar ou recusar

  const atualizarQuantidade = (index, valor) => {
    const novosItems = [...items];
    novosItems[index].quantidadeAprovada = valor;
    setItems(novosItems);
  };

  const aprovarTudo = () => {
    const novosItems = items.map(item => ({
      ...item,
      quantidadeAprovada: item.quantidadeSolicitada,
    }));
    setItems(novosItems);
    setTipoAcao('aprovar');
  };

  const recusarTudo = () => {
    const novosItems = items.map(item => ({
      ...item,
      quantidadeAprovada: 0,
    }));
    setItems(novosItems);
    setTipoAcao('recusar');
  };

  const calcularResumo = () => {
    let totalAprovado = 0;
    let totalRecusado = 0;
    let parcial = false;

    items.forEach(item => {
      const aprovada = parseFloat(item.quantidadeAprovada || 0);
      const solicitada = parseFloat(item.quantidadeSolicitada);

      if (aprovada > 0) {
        totalAprovado++;
        if (aprovada < solicitada) {
          parcial = true;
        }
      } else {
        totalRecusado++;
      }
    });

    return { totalAprovado, totalRecusado, parcial };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resumo = calcularResumo();

    // Se recusou tudo, precisa de justificativa
    if (resumo.totalRecusado === items.length && !justificativaRecusa.trim()) {
      alert('Justificativa é obrigatória para recusa total');
      return;
    }

    try {
      setLoading(true);

      const data = {
        items: items.map(item => ({
          itemId: item.itemId,
          quantidadeAprovada: parseFloat(item.quantidadeAprovada || 0),
        })),
        justificativaRecusa: justificativaRecusa.trim() || undefined,
      };

      await api.post(`/requisicoes-abastecimento/${requisicao.id}/aprovar`, data);

      if (resumo.totalRecusado === items.length) {
        alert('Requisição recusada com sucesso!');
      } else if (resumo.parcial) {
        alert('Requisição aprovada parcialmente!');
      } else {
        alert('Requisição aprovada com sucesso!');
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao processar requisição:', error);
      alert(error.response?.data?.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  const resumo = calcularResumo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aprovar/Recusar Requisição</h2>
            <p className="text-sm text-gray-600 mt-1">
              {requisicao.numero} - {requisicao.loja.nome}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Ações Rápidas */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={aprovarTudo}
                className="btn-success flex-1 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Aprovar Tudo
              </button>
              <button
                type="button"
                onClick={recusarTudo}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Recusar Tudo
              </button>
            </div>

            {/* Resumo */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Resumo</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Itens aprovados:</span>
                  <p className="font-bold text-blue-900">{resumo.totalAprovado}/{items.length}</p>
                </div>
                <div>
                  <span className="text-blue-600">Itens recusados:</span>
                  <p className="font-bold text-blue-900">{resumo.totalRecusado}/{items.length}</p>
                </div>
                <div>
                  <span className="text-blue-600">Status:</span>
                  <p className="font-bold text-blue-900">
                    {resumo.totalRecusado === items.length ? 'Recusa Total' :
                     resumo.parcial ? 'Aprovação Parcial' : 'Aprovação Total'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Itens da Requisição</h3>
              {items.map((item, index) => (
                <div key={item.itemId} className="card bg-gray-50">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: item.cor.codigoHex }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.produto.nome}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Cor: {item.cor.nome} | Código: {item.produto.codigo}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                        item.produto.curva === 'A' ? 'bg-green-100 text-green-800' :
                        item.produto.curva === 'B' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Curva {item.produto.curva}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade Solicitada
                      </label>
                      <input
                        type="text"
                        value={`${item.quantidadeSolicitada}m`}
                        className="input bg-gray-200"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade Aprovada *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={item.quantidadeAprovada}
                          onChange={(e) => atualizarQuantidade(index, e.target.value)}
                          className="input"
                          min="0"
                          max={item.quantidadeSolicitada}
                          step="0.1"
                          required
                        />
                        <span className="flex items-center text-gray-600">m</span>
                      </div>
                      {item.quantidadeAprovada < item.quantidadeSolicitada && item.quantidadeAprovada > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Aprovação parcial
                        </p>
                      )}
                      {item.quantidadeAprovada == 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Item recusado
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Justificativa (obrigatória para recusa total) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificativa {resumo.totalRecusado === items.length && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={justificativaRecusa}
                onChange={(e) => setJustificativaRecusa(e.target.value)}
                className="input"
                rows={3}
                placeholder={resumo.totalRecusado === items.length ?
                  "Justificativa obrigatória para recusa total..." :
                  "Justificativa (opcional)..."
                }
                required={resumo.totalRecusado === items.length}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn-primary ${
                resumo.totalRecusado === items.length ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Processando...' :
               resumo.totalRecusado === items.length ? 'Recusar Requisição' :
               resumo.parcial ? 'Aprovar Parcialmente' : 'Aprovar Requisição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AprovarRequisicaoModal;
