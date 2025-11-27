import { useState, useEffect } from 'react';
import { Plus, Edit, Power, Search, Store, MapPin } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const LojasPage = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarLojas();
  }, []);

  const carregarLojas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lojas');
      setLojas(response.data.data || response.data);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      alert('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-gray-100 text-gray-800',
      5: 'bg-gray-50 text-gray-600',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[prioridade] || 'bg-gray-100 text-gray-800'}`}>
        Prioridade {prioridade}
      </span>
    );
  };

  const getStatusBadge = (ativo) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {ativo ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  const filteredLojas = lojas.filter(loja =>
    !searchTerm ||
    loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loja.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lojasAtivas = lojas.filter(loja => loja.ativo).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Gerenciar Lojas
            </h1>
            <p className="text-gray-600 mt-2">
              {lojasAtivas} lojas ativas de {lojas.length} cadastradas
            </p>
          </div>

          <button
            onClick={() => alert('Função de adicionar loja em desenvolvimento')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Loja
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  placeholder="Código ou nome da loja..."
                />
              </div>
            </div>
          </div>

          {searchTerm && (
            <div className="mt-4">
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Limpar Busca
              </button>
            </div>
          )}
        </div>

        {/* Lojas Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLojas.map((loja) => (
                    <tr key={loja.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{loja.codigo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{loja.nome}</div>
                        {loja.cidade && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin size={12} />
                            {loja.cidade}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPrioridadeBadge(loja.prioridade)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{loja.telefone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(loja.ativo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => alert(`Editar loja ${loja.nome}`)}
                          className="text-primary hover:text-primary-dark mr-3"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja ${loja.ativo ? 'desativar' : 'ativar'} ${loja.nome}?`)) {
                              alert('Função de ativar/desativar em desenvolvimento');
                            }
                          }}
                          className={`${loja.ativo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={loja.ativo ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLojas.length === 0 && (
              <div className="text-center py-12">
                <Store className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma loja encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? 'Tente ajustar a busca'
                    : 'Comece criando uma nova loja'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Lojas Ativas</h3>
            <p className="text-2xl font-bold text-green-700">
              {lojasAtivas}
            </p>
            <p className="text-sm text-green-600">em operação</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Prioridade 1</h3>
            <p className="text-2xl font-bold text-red-700">
              {lojas.filter(l => l.prioridade === 1).length}
            </p>
            <p className="text-sm text-red-600">lojas</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">Prioridade 2</h3>
            <p className="text-2xl font-bold text-orange-700">
              {lojas.filter(l => l.prioridade === 2).length}
            </p>
            <p className="text-sm text-orange-600">lojas</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Prioridade 3</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {lojas.filter(l => l.prioridade === 3).length}
            </p>
            <p className="text-sm text-yellow-600">lojas</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Prioridade 4-5</h3>
            <p className="text-2xl font-bold text-gray-700">
              {lojas.filter(l => l.prioridade >= 4).length}
            </p>
            <p className="text-sm text-gray-600">lojas</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LojasPage;
