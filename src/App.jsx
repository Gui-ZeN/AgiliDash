import { Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import Logs from './pages/Logs';

/**
 * App Principal
 * Rotas:
 * - / = Login (público)
 * - /dashboard = Dashboard com 5 abas (requer autenticaÇão)
 * - /configuracoes = Painel Admin (requer Admin)
 * - /logs = Logs de atividade (requer Admin)
 */
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <DataProvider>
            <EmpresaProvider>
              <Routes>
                {/* Login - Público */}
                <Route path="/" element={<Login />} />

                {/* Dashboard - Requer autenticaÇão */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Configurações - Requer Admin */}
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Configuracoes />
                    </ProtectedRoute>
                  }
                />

                {/* Logs - Requer Admin */}
                <Route
                  path="/logs"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Logs />
                    </ProtectedRoute>
                  }
                />

                {/* Redirecionamentos */}
                <Route path="/admin" element={<Navigate to="/configuracoes" replace />} />
                <Route path="/usuarios" element={<Navigate to="/configuracoes" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </EmpresaProvider>
          </DataProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
