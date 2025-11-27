import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import UsersPage from './pages/admin/UsersPage';
import LojasPage from './pages/admin/LojasPage';
import ProdutosPage from './pages/admin/ProdutosPage';
import CoresPage from './pages/admin/CoresPage';

// App 1: Requisição de Abastecimento
import RequisicoesAbastecimentoPage from './pages/requisicoes/RequisicoesAbastecimentoPage';

// App 2: Cotações
import CotacoesPage from './pages/cotacoes/CotacoesPage';
import FornecedorCotacaoPage from './pages/cotacoes/FornecedorCotacaoPage';

// App 3: Pedidos B2B
import PedidosB2BPage from './pages/pedidos-b2b/PedidosB2BPage';

// App 4: Inventário
import InventarioPage from './pages/inventario/InventarioPage';

// Páginas Públicas B2B
import LojaB2BPage from './pages/public/LojaB2BPage';
import CheckoutB2BPage from './pages/public/CheckoutB2BPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cotacao/:token" element={<FornecedorCotacaoPage />} />
        <Route path="/loja-b2b" element={<LojaB2BPage />} />
        <Route path="/checkout-b2b" element={<CheckoutB2BPage />} />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedTypes={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lojas"
          element={
            <ProtectedRoute allowedTypes={['ADMIN']}>
              <LojasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute allowedTypes={['ADMIN']}>
              <ProdutosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cores"
          element={
            <ProtectedRoute allowedTypes={['ADMIN']}>
              <CoresPage />
            </ProtectedRoute>
          }
        />

        {/* App 1: Requisições de Abastecimento */}
        <Route
          path="/requisicoes"
          element={
            <ProtectedRoute allowedTypes={['ADMIN', 'GERENTE_LOJA', 'USUARIO_CD']}>
              <RequisicoesAbastecimentoPage />
            </ProtectedRoute>
          }
        />

        {/* App 2: Cotações */}
        <Route
          path="/cotacoes"
          element={
            <ProtectedRoute allowedTypes={['ADMIN', 'USUARIO_CD']}>
              <CotacoesPage />
            </ProtectedRoute>
          }
        />

        {/* App 3: Pedidos B2B */}
        <Route
          path="/pedidos-b2b"
          element={
            <ProtectedRoute allowedTypes={['ADMIN', 'OPERADOR', 'CLIENTE_B2B']}>
              <PedidosB2BPage />
            </ProtectedRoute>
          }
        />

        {/* App 4: Inventário */}
        <Route
          path="/inventario"
          element={
            <ProtectedRoute allowedTypes={['ADMIN', 'USUARIO_CD']}>
              <InventarioPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
