import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Package, FileText, ShoppingCart, Archive } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Requisições Pendentes',
      value: '12',
      icon: Package,
      color: 'bg-blue-500',
      roles: ['ADMIN', 'GERENTE_LOJA', 'USUARIO_CD'],
    },
    {
      name: 'Cotações Abertas',
      value: '5',
      icon: FileText,
      color: 'bg-yellow-500',
      roles: ['ADMIN', 'USUARIO_CD'],
    },
    {
      name: 'Pedidos B2B',
      value: '8',
      icon: ShoppingCart,
      color: 'bg-green-500',
      roles: ['ADMIN', 'OPERADOR'],
    },
    {
      name: 'Divergências Estoque',
      value: '3',
      icon: Archive,
      color: 'bg-red-500',
      roles: ['ADMIN', 'USUARIO_CD'],
    },
  ];

  const filteredStats = stats.filter((stat) => stat.roles.includes(user?.type));

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {filteredStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card hover:shadow-medium transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atividades Recentes</h2>
        <div className="empty-state">
          <p className="empty-state-title">Nenhuma atividade recente</p>
          <p className="empty-state-description">
            As atividades recentes aparecerão aqui quando você começar a usar o sistema.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
