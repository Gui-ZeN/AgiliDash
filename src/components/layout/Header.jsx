import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, ChevronDown, Building2, Check, Layers, FolderTree, Building, Menu, X, Sun, Moon, Users, Activity, User, Search } from 'lucide-react';
import Logo from './Logo';
import { useEmpresa } from '../../context/EmpresaContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

/**
 * Header do Dashboard
 * Contém logo, navegação por tabs, seletor hierárquico (Grupo/Empresa/CNPJ), dark mode e informações do cliente
 */
const Header = ({ activeTab, onTabChange, showTabs = true }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const { isSecaoVisivel } = useData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchGrupo, setSearchGrupo] = useState('');
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [searchCnpj, setSearchCnpj] = useState('');
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

  const tabsVisiveis = tabs.filter(tab => isSecaoVisivel(cnpjInfo?.id, tab.id));

  const handleLogout = () => {
    logout();
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

  useEffect(() => {
    if (!dropdownOpen) {
      setSearchGrupo('');
      setSearchEmpresa('');
      setSearchCnpj('');
    }
  }, [dropdownOpen]);

  const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const matchesSearch = (value, term) => {
    if (!term) return true;
    return normalizeText(value).includes(normalizeText(term));
  };

  const gruposFiltrados = listaGrupos.filter(grupo =>
    matchesSearch(grupo.nome, searchGrupo)
  );

  const empresasFiltradas = listaEmpresas.filter(empresa =>
    matchesSearch(empresa.nomeFantasia, searchEmpresa) ||
    matchesSearch(empresa.razaoSocial, searchEmpresa) ||
    matchesSearch(empresa.cnpjPrincipal, searchEmpresa)
  );

  const cnpjsFiltrados = listaCnpjs.filter(cnpj =>
    matchesSearch(cnpj.nomeFantasia, searchCnpj) ||
    matchesSearch(cnpj.razaoSocial, searchCnpj) ||
    matchesSearch(cnpj.cnpj, searchCnpj) ||
    matchesSearch(cnpj.codigoCliente, searchCnpj)
  );

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
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
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
            {tabsVisiveis.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 xl:px-5 h-full flex items-center font-medium text-xs xl:text-sm tracking-wide transition-all duration-200
                  ${activeTab === tab.id
                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* Hierarchical Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 min-w-[140px] lg:min-w-[260px]"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-md bg-slate-800 flex items-center justify-center flex-shrink-0">
                {isConsolidado ? (
                  <Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider truncate">
                  {isConsolidado ? modoLabel : `${grupoAtual?.nome || ''}`}
                </p>
                <p className="text-xs lg:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {isConsolidado ? 'Consolidado' : cnpjInfo?.nomeFantasia}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-[340px] lg:w-[400px] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200/80 dark:border-slate-700/80 py-2 z-50 max-h-[80vh] overflow-y-auto">
                {/* Opções de Consolidação */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Visualizacao Consolidada
                </p>

                {isAdmin && (
                  <button
                    onClick={() => handleConsolidado('todos')}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${modoVisualizacao === 'todos' ? 'bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modoVisualizacao === 'todos' ? 'bg-[#0e4f6d]' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <Layers className={`w-4 h-4 ${modoVisualizacao === 'todos' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">Todos os Grupos</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Visao completa do sistema</p>
                    </div>
                    {modoVisualizacao === 'todos' && <Check className="w-5 h-5 text-[#0e4f6d] dark:text-teal-500" />}
                  </button>
                )}

                <button
                  onClick={() => handleConsolidado('grupo')}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${modoVisualizacao === 'grupo' ? 'bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modoVisualizacao === 'grupo' ? 'bg-[#0e4f6d]' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <FolderTree className={`w-4 h-4 ${modoVisualizacao === 'grupo' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Grupo: {grupoAtual?.nome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Todas as empresas do grupo</p>
                  </div>
                  {modoVisualizacao === 'grupo' && <Check className="w-5 h-5 text-[#0e4f6d] dark:text-teal-500" />}
                </button>

                <button
                  onClick={() => handleConsolidado('empresa')}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${modoVisualizacao === 'empresa' ? 'bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modoVisualizacao === 'empresa' ? 'bg-[#0e4f6d]' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Building className={`w-4 h-4 ${modoVisualizacao === 'empresa' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Empresa: {empresaAtual?.nomeFantasia}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Todos os CNPJs da empresa</p>
                  </div>
                  {modoVisualizacao === 'empresa' && <Check className="w-5 h-5 text-[#0e4f6d] dark:text-teal-500" />}
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                {/* Seletor de Grupo */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Grupos
                </p>
                <div className="px-4 pb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchGrupo}
                      onChange={(e) => setSearchGrupo(e.target.value)}
                      placeholder="Buscar grupo..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#0e4f6d]"
                    />
                  </div>
                </div>
                {gruposFiltrados.map((grupo) => (
                  <button
                    key={grupo.id}
                    onClick={() => handleSelectGrupo(grupo.id)}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${grupo.id === grupoAtual?.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                  >
                    <FolderTree className={`w-4 h-4 ${grupo.id === grupoAtual?.id ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left text-sm ${grupo.id === grupoAtual?.id ? 'font-semibold text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {grupo.nome}
                    </span>
                    {grupo.id === grupoAtual?.id && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </button>
                ))}
                {gruposFiltrados.length === 0 && (
                  <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">Nenhum grupo encontrado.</p>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                {/* Seletor de Empresa */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Empresas do {grupoAtual?.nome}
                </p>
                <div className="px-4 pb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchEmpresa}
                      onChange={(e) => setSearchEmpresa(e.target.value)}
                      placeholder="Buscar empresa..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#0e4f6d]"
                    />
                  </div>
                </div>
                {empresasFiltradas.map((empresa) => (
                  <button
                    key={empresa.id}
                    onClick={() => handleSelectEmpresa(empresa.id)}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${empresa.id === empresaAtual?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <Building className={`w-4 h-4 ${empresa.id === empresaAtual?.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left text-sm ${empresa.id === empresaAtual?.id ? 'font-semibold text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {empresa.nomeFantasia}
                    </span>
                    {empresa.id === empresaAtual?.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
                {empresasFiltradas.length === 0 && (
                  <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">Nenhuma empresa encontrada.</p>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                {/* Lista de CNPJs */}
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  CNPJs de {empresaAtual?.nomeFantasia}
                </p>
                <div className="px-4 pb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchCnpj}
                      onChange={(e) => setSearchCnpj(e.target.value)}
                      placeholder="Buscar CNPJ, nome ou código..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#0e4f6d]"
                    />
                  </div>
                </div>

                {cnpjsFiltrados.map((cnpj) => (
                  <button
                    key={cnpj.id}
                    onClick={() => handleSelectCnpj(cnpj.id)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'bg-[#0e4f6d]' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <Building2 className={`w-4 h-4 ${cnpjSelecionado === cnpj.id && !isConsolidado ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{cnpj.nomeFantasia}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cnpj.cnpj}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d]/10 dark:bg-[#0e4f6d]/30 text-[#0e4f6d] dark:text-teal-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {cnpj.tipo}
                      </span>
                      {cnpjSelecionado === cnpj.id && !isConsolidado && <Check className="w-4 h-4 text-[#0e4f6d] dark:text-teal-500" />}
                    </div>
                  </button>
                ))}
                {cnpjsFiltrados.length === 0 && (
                  <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">Nenhum CNPJ encontrado.</p>
                )}

                {isAdmin && (
                  <>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                    {/* Link para configurações - Apenas Admin */}
                    <Link
                      to="/configuracoes"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-[#0e4f6d] dark:text-teal-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Gerenciar Grupos, Empresas e CNPJs</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Exercício - Hidden on small screens */}
          <div className="hidden xl:block text-right border-l border-slate-200/80 dark:border-slate-700/80 pl-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Exercício</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cnpjInfo?.exercicio || '2025'}</p>
          </div>

          {/* User Info */}
          <div className="hidden lg:flex items-center gap-3 border-l border-slate-200/80 dark:border-slate-700/80 pl-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.nome}</p>
                <p className={`text-xs ${isAdmin ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {user?.perfil}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-200/80 dark:border-slate-700/80 pl-4">
            {isAdmin && (
              <Link
                to="/configuracoes"
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                title="Painel Administrativo"
              >
                <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      {showTabs && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {tabsVisiveis.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 min-w-[70px] px-3 py-2.5 text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-700/50'
                    : 'text-slate-500 dark:text-slate-400'
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
            className="absolute right-0 top-0 w-64 h-full bg-white dark:bg-slate-800 shadow-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* User Info */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#0e4f6d] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.nome}</p>
                    <p className={`text-xs font-medium ${isAdmin ? 'text-[#0e4f6d] dark:text-teal-500' : 'text-slate-400 dark:text-slate-500'}`}>
                      {user?.perfil}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pb-4 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Exercicio</p>
                <p className="text-lg font-bold text-[#0e4f6d] dark:text-teal-500">{cnpjInfo?.exercicio || '2025'}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <span className="font-medium text-slate-700 dark:text-slate-300">Tema</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-white dark:bg-slate-600 shadow-sm"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>

              {isAdmin && (
                <Link
                  to="/configuracoes"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Painel Administrativo</span>
                </Link>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
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
