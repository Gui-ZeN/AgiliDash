import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import Logo from './Logo';
import { empresaInfo } from '../../data/mockData';

/**
 * Header do Dashboard
 * Contém logo, navegação por tabs e informações do cliente
 */
const Header = ({ activeTab, onTabChange, showTabs = true }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'gerais', label: 'INFO. GERAIS' },
    { id: 'contabil', label: 'CONTÁBIL' },
    { id: 'fiscal', label: 'FISCAL' },
    { id: 'pessoal', label: 'PESSOAL' }
  ];

  const handleLogout = () => {
    // TODO: Integrar com Firebase Auth para logout
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        {/* Logo Ágili Complex */}
        <div className="flex items-center">
          <Link to="/dashboard">
            <Logo width={200} height={75} />
          </Link>
        </div>

        {/* Menus de Navegação (Tabs) */}
        {showTabs && (
          <nav className="hidden md:flex h-full items-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-6 h-full flex items-center font-bold text-sm tracking-wide transition-all
                  ${activeTab === tab.id
                    ? 'text-[#0e4f6d] border-b-[3px] border-[#0e4f6d]'
                    : 'text-slate-500 hover:text-cyan-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* Área direita: Cliente + Ações */}
        <div className="flex items-center gap-4">
          {/* Identificação do Cliente */}
          <div className="text-right border-l border-slate-100 pl-6">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Cliente Selecionado
            </p>
            <h2 className="text-sm font-bold text-[#0e4f6d] uppercase">
              {empresaInfo.nomeFantasia}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium italic">
              Exercício: {empresaInfo.exercicio}
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Painel Admin"
            >
              <Settings className="w-5 h-5 text-slate-500" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile (tabs) */}
      {showTabs && (
        <div className="md:hidden border-t border-slate-100 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 px-4 py-3 text-xs font-bold tracking-wide transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-[#0e4f6d] border-b-2 border-[#0e4f6d] bg-slate-50'
                    : 'text-slate-500'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
