import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Configurar token no header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Buscar dados do usuário
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password, userType) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        userType,
      });

      const { user, token } = response.data.data;

      // Salvar token
      localStorage.setItem('token', token);

      // Configurar token no header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Salvar usuário
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  // Alterar senha
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar senha',
      };
    }
  };

  // Verificar se usuário tem permissão
  const hasPermission = (allowedTypes) => {
    if (!user) return false;
    if (!allowedTypes || allowedTypes.length === 0) return true;
    return allowedTypes.includes(user.type);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
    hasPermission,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
