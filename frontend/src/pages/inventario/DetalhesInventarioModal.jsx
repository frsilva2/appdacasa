import { useState, useEffect } from 'react';
import { X, Package, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getUrlFotoCor } from '../../services/assets';
import { getArquivoImagemCor } from '../../utils/coresMapping';

const DetalhesInventarioModal = ({ inventario: inventarioProp, onClose, onReload }) => {
  const { user } = useAuth();
  const getColorImageUrl = (cor) => {
    // SEMPRE usa o mapeamento primeiro (banco tem valores incorretos)
    let fileName = getArquivoImagemCor(cor.nome);
    if (!fileName) {
      fileName = cor.arquivoImagem || cor.arquivo_imagem;
    }
    if (!fileName) return null;
    return getUrlFotoCor(fileName);
  };
  const [inventario, setInventario] = useState(inventarioProp);
  const [loading, setLoading] = useState(false);
  const [editandoItem, setEditandoItem] = useState(null);
  const [quantidadeEditada, setQuantidadeEditada] = useState('');

  const isAdmin = user?.type === 'ADMIN';
  const isUsuarioCD = user?.type === 'USUARIO_CD';
  const podeEditar = (isAdmin || isUsuarioCD) && inventario.status === 'EM_ANDAMENTO';

  // Recarregar inventário completo
  useEffect(() => {
    const recarregarInventario = async () => {
      try {
        const response = await api.get(`/inventario/${inventarioProp.id}`);
        setInventario(response.data.data);
      } catch (error) {
        console.error('Erro ao recarregar inventário:', error);
      }
    };
    recarregarInventario();
  }, [inventarioProp.id]);

  const handleEditarItem = (item) => {
    setEditandoItem(item.id);
    setQuantidadeEditada(item.quantidadeContada);
  };

  const handleSalvarEdicao = async (itemId) => {
    try {
      setLoading(true);
      await api.put(`/inventario/item/${itemId}`, {
        quantidadeContada: parseFloat(quantidadeEditada),
      });

      // Recarregar inventário
      const response = await api.get(`/inventario/${inventario.id}`);
      setInventario(response.data.data);
      setEditandoItem(null);
      if (onReload) onReload();
    } catch (error) {
      console.error('Erro ao editar item:', error);
      alert(error.response?.data?.message || 'Erro ao editar item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverItem = async (itemId) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;

    try {
      setLoading(true);
      await api.delete(`/inventario/item/${itemId}`);

      // Recarregar inventário
      const response = await api.get(`/inventario/${inventario.id}`);
      setInventario(response.data.data);
      if (onReload) onReload();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      alert(error.response?.data?.message || 'Erro ao remover item');
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = (status) => {
    const badges = {
      EM_ANDAMENTO: { label: 'Em Andamento', class: 'bg-blue-100 text-blue-800' },
      FINALIZADO: { label: 'Finalizado', class: 'bg-green-100 text-green-800' },
      CANCELADO: { label: 'Cancelado', class: 'bg-gray-100 text-gray-800' },
    };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badges[status].class}`}>
      {badges[status].label}
    </span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-pink-500 to-blue-600 p-6 rounded-t-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{inventario.numero}</h2>
              <p className="text-pink-100">Responsável: {inventario.responsavel.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(inventario.status)}
              <button onClick={onClose} className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Data de Criação</p>
              <p className="font-semibold">{new Date(inventario.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total de Itens</p>
              <p className="font-semibold">{inventario.items.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Divergências</p>
              <p className="font-semibold text-orange-600">
                {inventario.items.filter(i => parseFloat(i.divergencia) !== 0).length}
              </p>
            </div>
          </div>

          {inventario.observacoes && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Observações:</h3>
              <p className="text-gray-700">{inventario.observacoes}</p>
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900 mb-4">Itens Contados</h3>

          {inventario.items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum item adicionado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inventario.items.map(item => {
                const divergencia = parseFloat(item.divergencia);
                const temDivergencia = divergencia !== 0;

                return (
                  <div key={item.id} className={`border-2 rounded-lg p-4 ${temDivergencia ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-300 overflow-hidden">
                          {getColorImageUrl(item.cor) ? (
                            <img
                              src={getColorImageUrl(item.cor)}
                              alt={item.cor.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.backgroundColor = item.cor.codigoHex || '#CCCCCC';
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: item.cor.codigoHex || '#CCCCCC' }}
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{item.produto.nome}</h4>
                          <p className="text-sm text-gray-600">Cor: {item.cor.nome}</p>
                          {item.lote && <p className="text-xs text-gray-500">Lote: {item.lote}</p>}
                        </div>
                      </div>
                      {temDivergencia && (
                        <AlertTriangle size={24} className="text-orange-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Qtd. Sistema</p>
                        <p className="font-semibold">{parseFloat(item.quantidadeSistema).toFixed(2)}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Qtd. Contada</p>
                        {editandoItem === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={quantidadeEditada}
                            onChange={(e) => setQuantidadeEditada(e.target.value)}
                            className="input w-full"
                            autoFocus
                          />
                        ) : (
                          <p className="font-semibold">{parseFloat(item.quantidadeContada).toFixed(2)}m</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">Divergência</p>
                        <p className={`font-semibold ${divergencia > 0 ? 'text-green-600' : divergencia < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {divergencia > 0 ? '+' : ''}{divergencia.toFixed(2)}m
                        </p>
                      </div>
                    </div>

                    {podeEditar && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        {editandoItem === item.id ? (
                          <>
                            <button
                              onClick={() => handleSalvarEdicao(item.id)}
                              className="btn-primary text-sm flex-1"
                              disabled={loading}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditandoItem(null)}
                              className="btn-secondary text-sm flex-1"
                              disabled={loading}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditarItem(item)}
                              className="btn-secondary text-sm flex items-center gap-1"
                              disabled={loading}
                            >
                              <Edit2 size={14} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleRemoverItem(item.id)}
                              className="btn-secondary text-sm text-red-600 flex items-center gap-1"
                              disabled={loading}
                            >
                              <Trash2 size={14} />
                              Remover
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {item.observacoes && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <p className="text-gray-600">Obs:</p>
                        <p className="text-gray-700">{item.observacoes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button onClick={onClose} className="btn-primary w-full">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default DetalhesInventarioModal;
