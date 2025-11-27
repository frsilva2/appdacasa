import { useState } from 'react';
import { X, Package } from 'lucide-react';
import api from '../../services/api';

const AtenderRequisicaoModal = ({ requisicao, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    requisicao.items.map(item => {
      const quantidadeAprovada = item.quantidadeAprovada || item.quantidadeSolicitada;
      return {
        itemId: item.id,
        quantidadeAprovada,
        quantidadeAtendida: quantidadeAprovada, // Por padrão atende tudo aprovado
        produto: item.produto,
        cor: item.cor,
      };
    })
  );

  const atualizarQuantidade = (index, valor) => {
    const novosItems = [...items];
    novosItems[index].quantidadeAtendida = valor;
    setItems(novosItems);
  };

  const atenderTudo = () => {
    const novosItems = items.map(item => ({
      ...item,
      quantidadeAtendida: item.quantidadeAprovada,
    }));
    setItems(novosItems);
  };

  const calcularResumo = () => {
    let totalAtendido = 0;
    let totalParcial = 0;
    let totalNaoAtendido = 0;

    items.forEach(item => {
      const atendida = parseFloat(item.quantidadeAtendida || 0);
      const aprovada = parseFloat(item.quantidadeAprovada);

      if (atendida === 0) {
        totalNaoAtendido++;
      } else if (atendida < aprovada) {
        totalParcial++;
      } else {
        totalAtendido++;
      }
    });

    return { totalAtendido, totalParcial, totalNaoAtendido };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = {
        items: items.map(item => ({
          itemId: item.itemId,
          quantidadeAtendida: parseFloat(item.quantidadeAtendida || 0),
        })),
      };

      await api.post(`/requisicoes-abastecimento/${requisicao.id}/atender`, data);

      const resumo = calcularResumo();
      if (resumo.totalParcial > 0 || resumo.totalNaoAtendido > 0) {
        alert('Requisição atendida parcialmente!');
      } else {
        alert('Requisição totalmente atendida!');
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao atender requisição:', error);
      alert(error.response?.data?.message || 'Erro ao atender requisição');
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
            <h2 className="text-2xl font-bold text-gray-900">Atender Requisição</h2>
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
                onClick={atenderTudo}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Package size={20} />
                Atender Tudo Aprovado
              </button>
            </div>

            {/* Resumo */}
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-medium text-green-900 mb-2">Resumo do Atendimento</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Totalmente atendido:</span>
                  <p className="font-bold text-green-900">{resumo.totalAtendido}/{items.length}</p>
                </div>
                <div>
                  <span className="text-green-600">Parcialmente atendido:</span>
                  <p className="font-bold text-green-900">{resumo.totalParcial}/{items.length}</p>
                </div>
                <div>
                  <span className="text-green-600">Não atendido:</span>
                  <p className="font-bold text-green-900">{resumo.totalNaoAtendido}/{items.length}</p>
                </div>
              </div>
            </div>

            {/* Lista de Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Itens Aprovados</h3>
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
                        Quantidade Aprovada
                      </label>
                      <input
                        type="text"
                        value={`${item.quantidadeAprovada}m`}
                        className="input bg-gray-200"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade Atendida *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={item.quantidadeAtendida}
                          onChange={(e) => atualizarQuantidade(index, e.target.value)}
                          className="input"
                          min="0"
                          max={item.quantidadeAprovada}
                          step="0.1"
                          required
                        />
                        <span className="flex items-center text-gray-600">m</span>
                      </div>
                      {item.quantidadeAtendida < item.quantidadeAprovada && item.quantidadeAtendida > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Atendimento parcial
                        </p>
                      )}
                      {item.quantidadeAtendida == 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Item não atendido
                        </p>
                      )}
                      {item.quantidadeAtendida == item.quantidadeAprovada && item.quantidadeAtendida > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Totalmente atendido
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Aviso */}
            <div className="card bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Atenção:</strong> Informe a quantidade real que será enviada para a loja.
                Após confirmar o atendimento, você poderá marcar a requisição como "Enviada" quando
                os produtos forem efetivamente despachados.
              </p>
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
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AtenderRequisicaoModal;
