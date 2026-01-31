import { Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import Logs from './pages/Logs';

/**
 * App Principal
 * Configura as rotas da aplicação
 *
 * Estrutura de Navegação:
 * / (Login)
 * → /dashboard (após login)
 *   - Tab: Gerais
 *   - Tab: Contábil
 *   - Tab: Fiscal
 *   - Tab: Pessoal
 *   - Tab: Administrativo
 * → /admin (painel admin)
 * → /configuracoes (configurações da empresa)
 * → /usuarios (gestão de usuários)
 * → /logs (logs de atividade)
 *
 * TODO: Integrar com Firebase Auth para proteção de rotas
 */
function App() {
  // TODO: Implementar verificação de autenticação com Firebase
  // const isAuthenticated = useAuth();

  return (
    <ThemeProvider>
      <EmpresaProvider>
        <Routes>
          {/* Rota de Login */}
          <Route path="/" element={<Login />} />

          {/* Rota do Dashboard Principal */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rota do Painel Admin */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Rota de Configurações */}
          <Route path="/configuracoes" element={<Configuracoes />} />

          {/* Rota de Gestão de Usuários */}
          <Route path="/usuarios" element={<Usuarios />} />

          {/* Rota de Logs de Atividade */}
          <Route path="/logs" element={<Logs />} />

          {/* Redireciona rotas desconhecidas para o login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </EmpresaProvider>
    </ThemeProvider>
  );
}

export default App;
