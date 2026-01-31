import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, ChevronDown, Building2, Check, Layers, FolderTree, Building, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useEmpresa } from '../../context/EmpresaContext';

/**
 * Header do Dashboard
 * Contém logo, navegação por tabs, seletor hierárquico (Grupo/Empresa/CNPJ) e informações do cliente
 */
const Header = ({ activeTab, onTabChange, showTabs = true }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    cnpjInfo,
    grupoAtual,
    empresaAtual,
    listaGrupos,
    listaEmpresas,
    listaCnpjs,
    selecionarGrupo,
    selecionarEmpresa,
    selecionarCnpj,
    cnpjSelecionado,
    modoVisualizacao,
    isConsolidado,
    toggleModoConsolidado,
    modoLabel
  } = useEmpresa();

  const tabs = [
    { id: 'gerais', label: 'INFO. GERAIS' },
    { id: 'contabil', label: 'CONTABIL' },
    { id: 'fiscal', label: 'FISCAL' },
    { id: 'pessoal', label: 'PESSOAL' },
    { id: 'administrativo', label: 'ADMIN' }
  ];

  const handleLogout = () => {
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

  const handleSelectEmpresa = (empresaId) => {
    selecionarEmpresa(empresaId);
  };

  const handleSelectGrupo = (grupoId) => {
    selecionarGrupo(grupoId);
  };

  const handleConsolidado = (modo) => {
    toggleModoConsolidado(modo);
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Main Header Row */}
      <div className="w-full px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/dashboard">
            <Logo width={140} height={50} className="lg:w-[180px] lg:h-[65px]" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        {showTabs && (
          <nav className="hidden lg:flex h-full items-center mx-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 xl:px-6 h-full flex items-center font-bold text-xs xl:text-sm tracking-wide transition-all
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

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Hierarchical Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-2 rounded-lg border border-slate-200 hover:border-[#0e4f6d] hover:bg-slate-50 transition-all min-w-[140px] lg:min-w-[260px]"
            >
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center flex-shrink-0">
                {isConsolidado ? (
                  <Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[9px] lg:text-[10px] text-slate-400 font-medium uppercase tracking-wide truncate">
                  {isConsolidado ? modoLabel : `${grupoAtual?.nome || ''}`}
                </p>
                <p className="text-xs lg:text-sm font-bold text-[#0e4f6d] truncate">
                  {isConsolidado ? 'Consolidado' : cnpjInfo?.nomeFantasia}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-[340px] lg:w-[400px] bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                {/* Opções de Consolidação */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Visualizacao Consolidada
                </p>

                <button
                  onClick={() => handleConsolidado('todos')}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors ${modoVisualizacao === 'todos' ? 'bg-[#0e4f6d]/5' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modoVisualizacao === 'todos' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                    <Layers className={`w-4 h-4 ${modoVisualizacao === 'todos' ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800 text-sm">Todos os Grupos</p>
                    <p className="text-xs text-slate-500">Visao completa do sistema</p>
                  </div>
                  {modoVisualizacao === 'todos' && <Check className="w-5 h-5 text-[#0e4f6d]" />}
                </button>

                <button
                  onClick={() => handleConsolidado('grupo')}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors ${modoVisualizacao === 'grupo' ? 'bg-[#0e4f6d]/5' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modoVisualizacao === 'grupo' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                    <FolderTree className={`w-4 h-4 ${modoVisualizacao === 'grupo' ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800 text-sm">Grupo: {grupoAtual?.nome}</p>
                    <p className="text-xs text-slate-500">Todas as empresas do grupo</p>
                  </div>
                  {modoVisualizacao === 'grupo' && <Check className="w-5 h-5 text-[#0e4f6d]" />}
                </button>

                <button
                  onClick={() => handleConsolidado('empresa')}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors ${modoVisualizacao === 'empresa' ? 'bg-[#0e4f6d]/5' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modoVisualizacao === 'empresa' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                    <Building className={`w-4 h-4 ${modoVisualizacao === 'empresa' ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800 text-sm">Empresa: {empresaAtual?.nomeFantasia}</p>
                    <p className="text-xs text-slate-500">Todos os CNPJs da empresa</p>
                  </div>
                  {modoVisualizacao === 'empresa' && <Check className="w-5 h-5 text-[#0e4f6d]" />}
                </button>

                <div className="h-px bg-slate-100 my-2" />

                {/* Seletor de Grupo */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Grupos
                </p>
                {listaGrupos.map((grupo) => (
                  <button
                    key={grupo.id}
                    onClick={() => handleSelectGrupo(grupo.id)}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${grupo.id === grupoAtual?.id ? 'bg-amber-50' : ''}`}
                  >
                    <FolderTree className={`w-4 h-4 ${grupo.id === grupoAtual?.id ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left text-sm ${grupo.id === grupoAtual?.id ? 'font-semibold text-amber-700' : 'text-slate-700'}`}>
                      {grupo.nome}
                    </span>
                    {grupo.id === grupoAtual?.id && <Check className="w-4 h-4 text-amber-600" />}
                  </button>
                ))}

                <div className="h-px bg-slate-100 my-2" />

                {/* Seletor de Empresa */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Empresas do {grupoAtual?.nome}
                </p>
                {listaEmpresas.map((empresa) => (
                  <button
                    key={empresa.id}
                    onClick={() => handleSelectEmpresa(empresa.id)}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${empresa.id === empresaAtual?.id ? 'bg-blue-50' : ''}`}
                  >
                    <Building className={`w-4 h-4 ${empresa.id === empresaAtual?.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left text-sm ${empresa.id === empresaAtual?.id ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
                      {empresa.nomeFantasia}
                    </span>
                    {empresa.id === empresaAtual?.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}

                <div className="h-px bg-slate-100 my-2" />

                {/* Lista de CNPJs */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  CNPJs de {empresaAtual?.nomeFantasia}
                </p>

                {listaCnpjs.map((cnpj) => (
                  <button
                    key={cnpj.id}
                    onClick={() => handleSelectCnpj(cnpj.id)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'bg-[#0e4f6d]/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                      <Building2 className={`w-4 h-4 ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{cnpj.nomeFantasia}</p>
                      <p className="text-xs text-slate-500">{cnpj.cnpj}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d]/10 text-[#0e4f6d]' : 'bg-slate-100 text-slate-600'}`}>
                        {cnpj.tipo}
                      </span>
                      {cnpjSelecionado === cnpj.id && !isConsolidado && <Check className="w-4 h-4 text-[#0e4f6d]" />}
                    </div>
                  </button>
                ))}

                <div className="h-px bg-slate-100 my-2" />

                {/* Link para configurações */}
                <Link
                  to="/configuracoes"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-[#0e4f6d] hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Gerenciar Grupos, Empresas e CNPJs</span>
                </Link>
              </div>
            )}
          </div>

          {/* Exercício - Hidden on small screens */}
          <div className="hidden xl:block text-right border-l border-slate-100 pl-4">
            <p className="text-[10px] text-slate-400 font-medium">Exercicio</p>
            <p className="text-sm font-bold text-[#0e4f6d]">{cnpjInfo?.exercicio || '2025'}</p>
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-100 pl-4">
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

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      {showTabs && (
        <div className="lg:hidden border-t border-slate-100 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 min-w-[70px] px-3 py-2.5 text-[10px] font-bold tracking-wide transition-all whitespace-nowrap
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

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 w-64 h-full bg-white shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium mb-1">Exercicio</p>
                <p className="text-lg font-bold text-[#0e4f6d]">{cnpjInfo?.exercicio || '2025'}</p>
              </div>

              <Link
                to="/admin"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-700">Painel Admin</span>
              </Link>

              <Link
                to="/configuracoes"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-700">Configuracoes</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-600">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
