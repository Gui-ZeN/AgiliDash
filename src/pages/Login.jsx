import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Building2, Shield, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Página de Login
 * Visual limpo e moderno sem degradês
 */
const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Lado esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0e4f6d] relative overflow-hidden">
        {/* padrão geométrico sutil */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Círculos decorativos */}
          <div className="absolute -top-20 -left-20 w-80 h-80 border border-white/10 rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] border border-white/10 rounded-full" />
          <div className="absolute top-1/3 right-10 w-4 h-4 bg-[#58a3a4] rounded-full" />
          <div className="absolute top-2/3 left-20 w-3 h-3 bg-white/30 rounded-full" />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-12">
            {/* Logo */}
            <svg width="260" height="100" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="70" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="72" fill="white">Agili</text>
              <rect x="170" y="55" width="12" height="15" rx="2" fill="#58a3a4" />
              <rect x="186" y="45" width="12" height="25" rx="2" fill="#6bb3b4" />
              <rect x="202" y="38" width="12" height="32" rx="2" fill="#7dc3c4" />
              <rect x="218" y="30" width="12" height="40" rx="2" fill="white" />
              <rect x="170" y="78" width="75" height="4" rx="2" fill="white" />
              <text x="172" y="100" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="24" fill="white">Complex</text>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-3 text-center">Portal do Cliente</h1>
          <p className="text-white/60 text-center max-w-sm">
            Acesse seu dashboard fiscal, contabil e pessoal de forma segura e integrada.
          </p>

          {/* Features */}
          <div className="mt-16 space-y-4 w-full max-w-xs">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Gestão Empresarial</h3>
                <p className="text-white/50 text-xs">Dados em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Segurança Total</h3>
                <p className="text-white/50 text-xs">Dados protegidos</p>
              </div>
            </div>
          </div>

          {/* Versão */}
          <p className="absolute bottom-8 text-white/30 text-xs">v1.0.0</p>
        </div>
      </div>

      {/* Lado direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-slate-50">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 pointer-events-none">
          {/* padrão de pontos sutis */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#0e4f6d"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          {/* Formas geométricas decorativas */}
          <div className="absolute -top-24 -right-24 w-64 h-64 border-2 border-[#0e4f6d]/5 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 border-2 border-[#58a3a4]/5 rounded-full" />
          <div className="absolute top-1/4 right-8 w-3 h-3 bg-[#58a3a4]/20 rounded-full" />
          <div className="absolute bottom-1/4 left-12 w-2 h-2 bg-[#0e4f6d]/20 rounded-full" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <svg width="180" height="70" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg">
              <text x="30" y="70" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="72" fill="#0e4f6d">Agili</text>
              <rect x="200" y="55" width="12" height="15" rx="2" fill="#58a3a4" />
              <rect x="216" y="45" width="12" height="25" rx="2" fill="#0e4f6d" />
              <rect x="232" y="38" width="12" height="32" rx="2" fill="#58a3a4" />
              <rect x="248" y="30" width="12" height="40" rx="2" fill="#0e4f6d" />
            </svg>
            <p className="text-sm text-slate-500 mt-2">Portal do Cliente</p>
          </div>

          {/* Card de login */}
          <div className="bg-white rounded-lg p-8 sm:p-10 shadow-sm border border-slate-200/80">
            {/* Header do card com linha decorativa */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mb-4">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-1">Bem-vindo</h2>
              <p className="text-slate-500 text-sm">Entre com suas credenciais para acessar</p>
            </div>

            {/* Info de usuários de teste */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200/80">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Credenciais de teste
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white rounded-md border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-xs font-medium">Admin</span>
                    <span className="text-slate-600 font-mono">admin@agili.com.br</span>
                  </div>
                  <span className="text-slate-400 font-mono">admin123</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-md border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-500 text-white rounded text-xs font-medium">User</span>
                    <span className="text-slate-600 font-mono">usuario@agili.com.br</span>
                  </div>
                  <span className="text-slate-400 font-mono">usuario123</span>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Email */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all duration-200 bg-white text-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all duration-200 bg-white text-slate-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-md text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-xs">Agili Complex</span>
              <div className="h-px w-12 bg-slate-200" />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Portal seguro de acesso ao dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
