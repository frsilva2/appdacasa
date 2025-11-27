import { useState, useEffect } from 'react';
import { Plus, Edit, Power, Search, Users, Key, Shield } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const getTipoBadge = (tipo) => {
    const configs = {
      ADMIN: { bg: 'bg-red-100', text: 'text-red-800', label: 'Admin' },
      GERENTE_LOJA: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Gerente Loja' },
      USUARIO_CD: { bg: 'bg-green-100', text: 'text-green-800', label: 'Usuário CD' },
      VISUALIZADOR: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Visualizador' },
    };
    const config = configs[tipo] || { bg: 'bg-gray-100', text: 'text-gray-800', label: tipo };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !tipoFilter || user.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const usersPorTipo = {
    ADMIN: users.filter(u => u.tipo === 'ADMIN').length,
    GERENTE_LOJA: users.filter(u => u.tipo === 'GERENTE_LOJA').length,
    USUARIO_CD: users.filter(u => u.tipo === 'USUARIO_CD').length,
    VISUALIZADOR: users.filter(u => u.tipo === 'VISUALIZADOR').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600 mt-2">
              {users.length} usuários cadastrados
            </p>
          </div>

          <button
            onClick={() => alert('Função de adicionar usuário em desenvolvimento')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Usuário
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
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
                  placeholder="Nome ou email do usuário..."
                />
              </div>
            </div>

            {/* Tipo Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuário
              </label>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="ADMIN">Admin</option>
                <option value="GERENTE_LOJA">Gerente Loja</option>
                <option value="USUARIO_CD">Usuário CD</option>
                <option value="VISUALIZADOR">Visualizador</option>
              </select>
            </div>
          </div>

          {(searchTerm || tipoFilter) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTipoFilter('');
                }}
                className="btn-secondary"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
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
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loja
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTipoBadge(user.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.loja?.nome || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.ativo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => alert(`Editar usuário ${user.nome}`)}
                          className="text-primary hover:text-primary-dark mr-3"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja ${user.ativo ? 'desativar' : 'ativar'} ${user.nome}?`)) {
                              alert('Função de ativar/desativar em desenvolvimento');
                            }
                          }}
                          className={`${user.ativo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                          title={user.ativo ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Resetar senha de ${user.nome}?`)) {
                              alert('Função de resetar senha em desenvolvimento');
                            }
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Resetar Senha"
                        >
                          <Key size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || tipoFilter
                    ? 'Tente ajustar os filtros'
                    : 'Comece criando um novo usuário'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Administradores</h3>
            <p className="text-2xl font-bold text-red-700">
              {usersPorTipo.ADMIN}
            </p>
            <p className="text-sm text-red-600">usuários</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Gerentes de Loja</h3>
            <p className="text-2xl font-bold text-blue-700">
              {usersPorTipo.GERENTE_LOJA}
            </p>
            <p className="text-sm text-blue-600">usuários</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Usuários CD</h3>
            <p className="text-2xl font-bold text-green-700">
              {usersPorTipo.USUARIO_CD}
            </p>
            <p className="text-sm text-green-600">usuários</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Visualizadores</h3>
            <p className="text-2xl font-bold text-gray-700">
              {usersPorTipo.VISUALIZADOR}
            </p>
            <p className="text-sm text-gray-600">usuários</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;
