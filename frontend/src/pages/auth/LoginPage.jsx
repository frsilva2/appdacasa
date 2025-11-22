import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Empório Tecidos</h1>
          <p className="text-gray-600">Sistema de Gestão</p>
        </div>

        {/* Card de Login */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Entrar</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Credenciais de teste */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-2">Credenciais de teste:</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <strong>Admin:</strong> admin@emporiotecidos.com.br
              </p>
              <p>
                <strong>Gerente G1:</strong> gerente.g1@emporiotecidos.com.br
              </p>
              <p>
                <strong>Senha:</strong> emporio123
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Empório Tecidos. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
