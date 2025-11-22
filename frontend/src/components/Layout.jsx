import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Package,
  FileText,
  ShoppingCart,
  Archive,
  Users,
  Store,
  Box,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['ADMIN', 'GERENTE_LOJA', 'USUARIO_CD', 'OPERADOR'] },
    {
      name: 'Requisições',
      path: '/requisicoes',
      icon: Package,
      roles: ['ADMIN', 'GERENTE_LOJA', 'USUARIO_CD'],
    },
    { name: 'Cotações', path: '/cotacoes', icon: FileText, roles: ['ADMIN', 'USUARIO_CD'] },
    { name: 'Pedidos B2B', path: '/pedidos-b2b', icon: ShoppingCart, roles: ['ADMIN', 'OPERADOR', 'CLIENTE_B2B'] },
    { name: 'Inventário', path: '/inventario', icon: Archive, roles: ['ADMIN', 'USUARIO_CD'] },
    { name: 'Usuários', path: '/admin/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Lojas', path: '/admin/lojas', icon: Store, roles: ['ADMIN'] },
    { name: 'Produtos', path: '/admin/produtos', icon: Box, roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.type));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-bold text-primary">Empório Tecidos</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.type?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              title="Sair"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="container-app py-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
