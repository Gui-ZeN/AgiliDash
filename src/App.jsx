import { Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import Logs from './pages/Logs';

/**
 * App Principal
 * Configura as rotas da aplicacao
 */
function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <EmpresaProvider>
          <Routes>
            {/* Rota de Login */}
            <Route path="/" element={<Login />} />

            {/* Rota do Dashboard Principal */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Rota do Painel Admin */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Rota de Configuracoes - Grupos e CNPJs */}
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* Rota de Gestao de Usuarios */}
            <Route path="/usuarios" element={<Usuarios />} />

            {/* Rota de Logs de Atividade */}
            <Route path="/logs" element={<Logs />} />

            {/* Redireciona rotas desconhecidas para o login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EmpresaProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
