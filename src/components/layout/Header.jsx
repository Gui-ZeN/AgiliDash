import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, ChevronDown, Building2, Check, Layers } from 'lucide-react';
import Logo from './Logo';
import { useEmpresa } from '../../context/EmpresaContext';

/**
 * Header do Dashboard
 * Contém logo, navegação por tabs, seletor de CNPJ e informações do cliente
 */
const Header = ({ activeTab, onTabChange, showTabs = true }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    cnpjInfo,
    listaCnpjs,
    selecionarCnpj,
    cnpjSelecionado,
    isConsolidado,
    toggleModoConsolidado
  } = useEmpresa();

  const tabs = [
    { id: 'gerais', label: 'INFO. GERAIS' },
    { id: 'contabil', label: 'CONTÁBIL' },
    { id: 'fiscal', label: 'FISCAL' },
    { id: 'pessoal', label: 'PESSOAL' },
    { id: 'administrativo', label: 'ADMINISTRATIVO' }
  ];

  const handleLogout = () => {
    // TODO: Integrar com Firebase Auth para logout
    navigate('/');
  };

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCnpj = (cnpjId) => {
    selecionarCnpj(cnpjId);
    setDropdownOpen(false);
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

        {/* Área direita: Seletor de CNPJ + Ações */}
        <div className="flex items-center gap-4">
          {/* Seletor de CNPJ */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-slate-200 hover:border-[#0e4f6d] hover:bg-slate-50 transition-all min-w-[220px]"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center">
                {isConsolidado ? (
                  <Layers className="w-4 h-4 text-white" />
                ) : (
                  <Building2 className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-left flex-1">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                  {isConsolidado ? 'Visão Consolidada' : cnpjInfo.tipo}
                </p>
                <p className="text-sm font-bold text-[#0e4f6d] truncate max-w-[140px]">
                  {isConsolidado ? 'Todos os CNPJs' : cnpjInfo.nomeFantasia}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Opção Consolidado */}
                <button
                  onClick={() => {
                    toggleModoConsolidado();
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${isConsolidado ? 'bg-[#0e4f6d]/5' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConsolidado ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                    <Layers className={`w-5 h-5 ${isConsolidado ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800">Visão Consolidada</p>
                    <p className="text-xs text-slate-500">Dados de todos os CNPJs</p>
                  </div>
                  {isConsolidado && <Check className="w-5 h-5 text-[#0e4f6d]" />}
                </button>

                <div className="h-px bg-slate-100 my-2" />

                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  CNPJs Cadastrados
                </p>

                {/* Lista de CNPJs */}
                {listaCnpjs.map((cnpj) => (
                  <button
                    key={cnpj.id}
                    onClick={() => handleSelectCnpj(cnpj.id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'bg-[#0e4f6d]/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                      <Building2 className={`w-5 h-5 ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800">{cnpj.nomeFantasia}</p>
                      <p className="text-xs text-slate-500">{cnpj.cnpj}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d]/10 text-[#0e4f6d]' : 'bg-slate-100 text-slate-600'}`}>
                        {cnpj.tipo}
                      </span>
                      {cnpjSelecionado === cnpj.id && !isConsolidado && <Check className="w-5 h-5 text-[#0e4f6d]" />}
                    </div>
                  </button>
                ))}

                <div className="h-px bg-slate-100 my-2" />

                {/* Link para gerenciar CNPJs */}
                <Link
                  to="/configuracoes"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-4 py-2 flex items-center gap-2 text-sm text-[#0e4f6d] hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Gerenciar CNPJs</span>
                </Link>
              </div>
            )}
          </div>

          {/* Info do Exercício */}
          <div className="hidden lg:block text-right border-l border-slate-100 pl-4">
            <p className="text-[10px] text-slate-400 font-medium">Exercício</p>
            <p className="text-sm font-bold text-[#0e4f6d]">{cnpjInfo.exercicio}</p>
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
