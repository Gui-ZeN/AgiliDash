import { Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import Logs from './pages/Logs';

/**
 * App Principal
 * Rotas simplificadas:
 * - / = Login
 * - /dashboard = Dashboard com 5 abas
 * - /configuracoes = Painel Admin (Grupos, CNPJs, Usuarios, Importacao)
 * - /logs = Logs de atividade
 */
function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <EmpresaProvider>
          <Routes>
            {/* Login */}
            <Route path="/" element={<Login />} />

            {/* Dashboard Principal */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Painel Administrativo */}
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* Logs de Atividade */}
            <Route path="/logs" element={<Logs />} />

            {/* Redirecionamentos */}
            <Route path="/admin" element={<Navigate to="/configuracoes" replace />} />
            <Route path="/usuarios" element={<Navigate to="/configuracoes" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EmpresaProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
