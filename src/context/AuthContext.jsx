/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Authentication context
 * Handles login, logout and profile access info.
 */
const AuthContext = createContext(null);

// Mock users (future: Firebase Auth)
const USERS = [
  {
    id: 'admin_001',
    email: 'admin@agili.com.br',
    password: 'admin123',
    nome: 'Administrador',
    perfil: 'Admin',
    avatar: null,
    acesso: null
  },
  {
    id: 'user_001',
    email: 'usuario@agili.com.br',
    password: 'usuario123',
    nome: 'Usuario Comum',
    perfil: 'Visualizador',
    avatar: null,
    acesso: {
      grupoIds: ['grupo_001'],
      empresaIds: ['empresa_001'],
      cnpjIds: []
    }
  }
];

const normalizarUsuarioSalvo = (rawUser) => {
  if (!rawUser) return null;

  const usuarioBase = USERS.find(
    u => u.id === rawUser.id || u.email.toLowerCase() === String(rawUser.email || '').toLowerCase()
  );

  if (!usuarioBase) return rawUser;

  const { password: _, ...baseSemSenha } = usuarioBase;
  return {
    ...baseSemSenha,
    ...rawUser,
    acesso: rawUser.acesso ?? baseSemSenha.acesso ?? null
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agili_auth_user');
    if (!saved) return null;

    try {
      return normalizarUsuarioSalvo(JSON.parse(saved));
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist user in localStorage
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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    setIsLoading(false);

    if (foundUser) {
      // Do not keep password in state
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

  // Role checks
  const isAdmin = user?.perfil === 'Admin';
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
