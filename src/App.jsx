import { Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Configuracoes from './pages/Configuracoes';

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
 * → /admin (painel admin)
 * → /configuracoes (configurações da empresa)
 *
 * TODO: Integrar com Firebase Auth para proteção de rotas
 */
function App() {
  // TODO: Implementar verificação de autenticação com Firebase
  // const isAuthenticated = useAuth();

  return (
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

        {/* Redireciona rotas desconhecidas para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </EmpresaProvider>
  );
}

export default App;
