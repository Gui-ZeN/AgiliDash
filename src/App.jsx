import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Logs = lazy(() => import('./pages/Logs'));

function App() {
  const pageLoader = (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Carregando página...</p>
    </div>
  );

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <DataProvider>
            <EmpresaProvider>
              <Suspense fallback={pageLoader}>
                <Routes>
                  <Route path="/" element={<Login />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/configuracoes"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Configuracoes />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/logs"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Logs />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/admin" element={<Navigate to="/configuracoes" replace />} />
                  <Route path="/usuarios" element={<Navigate to="/configuracoes" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </EmpresaProvider>
          </DataProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
