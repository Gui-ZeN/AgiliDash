import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Building2 } from 'lucide-react';
import Logo from '../components/layout/Logo';
import Button from '../components/common/Button';

/**
 * Página de Login
 * Página empresarial estilosa com autenticação mock
 * TODO: Integrar com Firebase Auth
 */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // TODO: Integrar com Firebase Auth
    // Por enquanto, qualquer credencial funciona (mock)
    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock: aceita qualquer credencial
      if (email && password) {
        navigate('/dashboard');
      } else {
        setError('Por favor, preencha todos os campos.');
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex">
      {/* Lado esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0e4f6d] relative overflow-hidden">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#58a3a4] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-12">
            {/* Logo em branco */}
            <svg width="280" height="105" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="70" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="75" fill="white">Ágili</text>
              <rect x="175" y="55" width="14" height="15" rx="2" fill="#58a3a4" />
              <rect x="194" y="45" width="14" height="25" rx="2" fill="#6bb3b4" />
              <rect x="213" y="40" width="14" height="30" rx="2" fill="#7dc3c4" />
              <rect x="232" y="35" width="14" height="35" rx="2" fill="#8fd3d4" />
              <rect x="251" y="30" width="14" height="40" rx="2" fill="white" />
              <rect x="175" y="78" width="105" height="5" rx="2" fill="white" />
              <text x="180" y="102" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="28" fill="white">Complex</text>
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">Portal do Cliente</h1>
          <p className="text-white/70 text-lg text-center max-w-md leading-relaxed">
            Acesse seu dashboard fiscal, contábil e pessoal de forma segura e integrada.
          </p>

          {/* Features */}
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Gestão Empresarial</h3>
                <p className="text-white/60 text-sm">Dados em tempo real da sua empresa</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Segurança Total</h3>
                <p className="text-white/60 text-sm">Seus dados protegidos e criptografados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo width={180} height={68} />
          </div>

          {/* Card de login */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo de volta!</h2>
              <p className="text-slate-400">Entre com suas credenciais para acessar</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Esqueceu a senha */}
              <div className="text-right">
                <a href="#" className="text-sm text-[#0e4f6d] hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-4 text-xs text-slate-400 uppercase tracking-widest">ou</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Contato suporte */}
            <p className="text-center text-sm text-slate-400">
              Não tem uma conta?{' '}
              <a href="#" className="text-[#0e4f6d] font-semibold hover:underline">
                Fale com o suporte
              </a>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-8">
            © 2025 Ágili Complex. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
