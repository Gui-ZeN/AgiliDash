import { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Contexto de Autenticação
 * Gerencia login, logout e controle de acesso
 */
const AuthContext = createContext(null);

// Usuários mock (futuro: Firebase Auth)
const USERS = [
  {
    id: 'admin_001',
    email: 'admin@agili.com.br',
    password: 'admin123',
    nome: 'Administrador',
    perfil: 'Admin',
    avatar: null
  },
  {
    id: 'user_001',
    email: 'usuario@agili.com.br',
    password: 'usuario123',
    nome: 'Usuário Comum',
    perfil: 'Visualizador',
    avatar: null
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agili_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persistir usuário no localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('agili_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agili_auth_user');
    }
  }, [user]);

  // Login
  const login = useCallback(async (email, password) => {
    setIsLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    setIsLoading(false);

    if (foundUser) {
      // Não salvar a senha no estado
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Email ou senha incorretos' };
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('agili_auth_user');
  }, []);

  // Verificar se é admin
  const isAdmin = user?.perfil === 'Admin';

  // Verificar se está autenticado
  const isAuthenticated = !!user;

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
