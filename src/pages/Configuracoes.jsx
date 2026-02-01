import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Building,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle,
  Save,
  Check
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import { useEmpresa } from '../context/EmpresaContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { getCnpjsByEmpresa, getEmpresasByGrupo } from '../data/mockData';

/**
 * Pagina de Configuracoes
 * Gerenciamento hierarquico: Grupos -> Empresas -> CNPJs
 */
const Configuracoes = () => {
  const {
    todosGrupos,
    todasEmpresas,
    todosCnpjs,
    grupoAtual,
    empresaAtual
  } = useEmpresa();
  const { isDarkMode } = useTheme();

  // Estado para tabs
  const [activeSection, setActiveSection] = useState('grupos');

  // Estado para expansao de itens
  const [expandedGrupos, setExpandedGrupos] = useState([grupoAtual?.id || 'grupo_001']);
  const [expandedEmpresas, setExpandedEmpresas] = useState([empresaAtual?.id || 'empresa_001']);

  // Estado para modais
  const [modalGrupo, setModalGrupo] = useState({ open: false, mode: 'add', data: null });
  const [modalEmpresa, setModalEmpresa] = useState({ open: false, mode: 'add', data: null, grupoId: null });
  const [modalCnpj, setModalCnpj] = useState({ open: false, mode: 'add', data: null, empresaId: null });
  const [modalDelete, setModalDelete] = useState({ open: false, type: null, item: null });

  // Formularios
  const [formGrupo, setFormGrupo] = useState({ nome: '', descricao: '' });
  const [formEmpresa, setFormEmpresa] = useState({
    razaoSocial: '', nomeFantasia: '', cnpjPrincipal: '', regimeTributario: 'Lucro Real',
    email: '', telefone: '', cidade: '', estado: ''
  });
  const [formCnpj, setFormCnpj] = useState({
    cnpj: '', razaoSocial: '', nomeFantasia: '', tipo: 'Filial',
    regimeTributario: 'Lucro Real', cidade: '', estado: '',
    responsavelNome: '', responsavelCargo: ''
  });

  // Toggle expansao
  const toggleGrupo = (grupoId) => {
    setExpandedGrupos(prev =>
      prev.includes(grupoId)
        ? prev.filter(id => id !== grupoId)
        : [...prev, grupoId]
    );
  };

  const toggleEmpresa = (empresaId) => {
    setExpandedEmpresas(prev =>
      prev.includes(empresaId)
        ? prev.filter(id => id !== empresaId)
        : [...prev, empresaId]
    );
  };

  // Handlers de modal
  const handleAddGrupo = () => {
    setFormGrupo({ nome: '', descricao: '' });
    setModalGrupo({ open: true, mode: 'add', data: null });
  };

  const handleEditGrupo = (grupo) => {
    setFormGrupo({ nome: grupo.nome, descricao: grupo.descricao || '' });
    setModalGrupo({ open: true, mode: 'edit', data: grupo });
  };

  const handleAddEmpresa = (grupoId) => {
    setFormEmpresa({
      razaoSocial: '', nomeFantasia: '', cnpjPrincipal: '', regimeTributario: 'Lucro Real',
      email: '', telefone: '', cidade: '', estado: ''
    });
    setModalEmpresa({ open: true, mode: 'add', data: null, grupoId });
  };

  const handleEditEmpresa = (empresa) => {
    setFormEmpresa({
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      cnpjPrincipal: empresa.cnpjPrincipal,
      regimeTributario: empresa.regimeTributario,
      email: empresa.email || '',
      telefone: empresa.telefone || '',
      cidade: empresa.endereco?.cidade || '',
      estado: empresa.endereco?.estado || ''
    });
    setModalEmpresa({ open: true, mode: 'edit', data: empresa, grupoId: empresa.grupoId });
  };

  const handleAddCnpj = (empresaId) => {
    setFormCnpj({
      cnpj: '', razaoSocial: '', nomeFantasia: '', tipo: 'Filial',
      regimeTributario: 'Lucro Real', cidade: '', estado: '',
      responsavelNome: '', responsavelCargo: ''
    });
    setModalCnpj({ open: true, mode: 'add', data: null, empresaId });
  };

  const handleEditCnpj = (cnpj) => {
    setFormCnpj({
      cnpj: cnpj.cnpj,
      razaoSocial: cnpj.razaoSocial,
      nomeFantasia: cnpj.nomeFantasia,
      tipo: cnpj.tipo,
      regimeTributario: cnpj.regimeTributario,
      cidade: cnpj.endereco?.cidade || '',
      estado: cnpj.endereco?.estado || '',
      responsavelNome: cnpj.responsavel?.nome || '',
      responsavelCargo: cnpj.responsavel?.cargo || ''
    });
    setModalCnpj({ open: true, mode: 'edit', data: cnpj, empresaId: cnpj.empresaId });
  };

  const handleDelete = (type, item) => {
    setModalDelete({ open: true, type, item });
  };

  // Salvar (mock)
  const handleSave = (type) => {
    alert(`${type} salvo com sucesso! (Integracao Firebase pendente)`);
    if (type === 'Grupo') setModalGrupo({ open: false, mode: 'add', data: null });
    if (type === 'Empresa') setModalEmpresa({ open: false, mode: 'add', data: null, grupoId: null });
    if (type === 'CNPJ') setModalCnpj({ open: false, mode: 'add', data: null, empresaId: null });
  };

  const handleConfirmDelete = () => {
    alert(`${modalDelete.type} excluido com sucesso! (Integracao Firebase pendente)`);
    setModalDelete({ open: false, type: null, item: null });
  };

  // Estatisticas
  const stats = {
    grupos: todosGrupos.length,
    empresas: todasEmpresas.length,
    cnpjs: todosCnpjs.length
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="w-full px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <Logo width={140} height={50} />
          </div>
          <h1 className="text-lg font-bold text-[#0e4f6d] dark:text-cyan-400">Configuracoes</h1>
        </div>
      </header>

      <main className="w-full px-4 lg:px-6 py-6 lg:py-8">
        {/* Cards de estatisticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FolderTree className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stats.grupos}</p>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Grupos</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stats.empresas}</p>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Empresas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stats.cnpjs}</p>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">CNPJs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secao principal */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header da secao */}
          <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Estrutura Organizacional</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie grupos, empresas e CNPJs</p>
            </div>
            <button
              onClick={handleAddGrupo}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Grupo</span>
            </button>
          </div>

          {/* Lista hierarquica */}
          <div className="divide-y divide-slate-100">
            {todosGrupos.map((grupo) => {
              const empresasDoGrupo = getEmpresasByGrupo(grupo.id);
              const isGrupoExpanded = expandedGrupos.includes(grupo.id);

              return (
                <div key={grupo.id} className="bg-white">
                  {/* Grupo */}
                  <div className="flex items-center justify-between p-4 lg:p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleGrupo(grupo.id)}
                        className="p-1 rounded hover:bg-slate-200 transition-colors"
                      >
                        {isGrupoExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <FolderTree className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{grupo.nome}</h3>
                        <p className="text-xs text-slate-500">
                          {empresasDoGrupo.length} empresa(s) | {grupo.descricao || 'Sem descricao'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAddEmpresa(grupo.id)}
                        className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Adicionar Empresa"
                      >
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleEditGrupo(grupo)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete('Grupo', grupo)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Empresas do grupo */}
                  {isGrupoExpanded && empresasDoGrupo.map((empresa) => {
                    const cnpjsDaEmpresa = getCnpjsByEmpresa(empresa.id);
                    const isEmpresaExpanded = expandedEmpresas.includes(empresa.id);

                    return (
                      <div key={empresa.id} className="bg-slate-50/50">
                        {/* Empresa */}
                        <div className="flex items-center justify-between p-4 lg:p-5 pl-12 lg:pl-14 hover:bg-slate-100/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleEmpresa(empresa.id)}
                              className="p-1 rounded hover:bg-slate-200 transition-colors"
                            >
                              {isEmpresaExpanded ? (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Building className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800 truncate">{empresa.nomeFantasia}</h4>
                              <p className="text-xs text-slate-500 truncate">
                                {cnpjsDaEmpresa.length} CNPJ(s) | {empresa.regimeTributario}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAddCnpj(empresa.id)}
                              className="p-2 rounded-lg hover:bg-teal-50 transition-colors"
                              title="Adicionar CNPJ"
                            >
                              <Plus className="w-4 h-4 text-teal-600" />
                            </button>
                            <button
                              onClick={() => handleEditEmpresa(empresa)}
                              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => handleDelete('Empresa', empresa)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {/* CNPJs da empresa */}
                        {isEmpresaExpanded && cnpjsDaEmpresa.map((cnpj) => (
                          <div
                            key={cnpj.id}
                            className="flex items-center justify-between p-4 lg:p-5 pl-20 lg:pl-24 bg-white border-l-4 border-teal-200 ml-12 lg:ml-14 hover:bg-teal-50/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg ${cnpj.tipo === 'Matriz' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-teal-100'}`}>
                                <Building2 className={`w-4 h-4 ${cnpj.tipo === 'Matriz' ? 'text-white' : 'text-teal-600'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-medium text-slate-800 truncate">{cnpj.nomeFantasia}</h5>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d] text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {cnpj.tipo}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-mono">{cnpj.cnpj}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditCnpj(cnpj)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4 text-slate-500" />
                              </button>
                              {cnpj.tipo !== 'Matriz' && (
                                <button
                                  onClick={() => handleDelete('CNPJ', cnpj)}
                                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal Grupo */}
      {modalGrupo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {modalGrupo.mode === 'add' ? 'Novo Grupo' : 'Editar Grupo'}
                </h2>
                <button
                  onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Grupo</label>
                <input
                  type="text"
                  value={formGrupo.nome}
                  onChange={(e) => setFormGrupo({ ...formGrupo, nome: e.target.value })}
                  placeholder="Ex: Grupo ABC"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descricao</label>
                <textarea
                  value={formGrupo.descricao}
                  onChange={(e) => setFormGrupo({ ...formGrupo, descricao: e.target.value })}
                  placeholder="Descricao do grupo..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave('Grupo')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Empresa */}
      {modalEmpresa.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {modalEmpresa.mode === 'add' ? 'Nova Empresa' : 'Editar Empresa'}
                </h2>
                <button
                  onClick={() => setModalEmpresa({ open: false, mode: 'add', data: null, grupoId: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razao Social</label>
                  <input
                    type="text"
                    value={formEmpresa.razaoSocial}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, razaoSocial: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formEmpresa.nomeFantasia}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, nomeFantasia: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ Principal</label>
                  <input
                    type="text"
                    value={formEmpresa.cnpjPrincipal}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, cnpjPrincipal: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Regime Tributario</label>
                  <select
                    value={formEmpresa.regimeTributario}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, regimeTributario: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formEmpresa.email}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formEmpresa.telefone}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formEmpresa.cidade}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formEmpresa.estado}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="">Selecione...</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalEmpresa({ open: false, mode: 'add', data: null, grupoId: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave('Empresa')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CNPJ */}
      {modalCnpj.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {modalCnpj.mode === 'add' ? 'Novo CNPJ' : 'Editar CNPJ'}
                </h2>
                <button
                  onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, empresaId: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formCnpj.cnpj}
                    onChange={(e) => setFormCnpj({ ...formCnpj, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razao Social</label>
                  <input
                    type="text"
                    value={formCnpj.razaoSocial}
                    onChange={(e) => setFormCnpj({ ...formCnpj, razaoSocial: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formCnpj.nomeFantasia}
                    onChange={(e) => setFormCnpj({ ...formCnpj, nomeFantasia: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formCnpj.tipo}
                    onChange={(e) => setFormCnpj({ ...formCnpj, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="Matriz">Matriz</option>
                    <option value="Filial">Filial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formCnpj.cidade}
                    onChange={(e) => setFormCnpj({ ...formCnpj, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formCnpj.estado}
                    onChange={(e) => setFormCnpj({ ...formCnpj, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="">Selecione...</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsavel</label>
                  <input
                    type="text"
                    value={formCnpj.responsavelNome}
                    onChange={(e) => setFormCnpj({ ...formCnpj, responsavelNome: e.target.value })}
                    placeholder="Nome do responsavel"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={formCnpj.responsavelCargo}
                    onChange={(e) => setFormCnpj({ ...formCnpj, responsavelCargo: e.target.value })}
                    placeholder="Cargo do responsavel"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, empresaId: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave('CNPJ')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusao */}
      {modalDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Confirmar Exclusao</h2>
                  <p className="text-sm text-slate-500">Esta acao nao pode ser desfeita.</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Voce esta prestes a excluir o {modalDelete.type?.toLowerCase()}:
                </p>
                <p className="font-bold text-slate-800 mt-1">
                  {modalDelete.item?.nome || modalDelete.item?.nomeFantasia}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalDelete({ open: false, type: null, item: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
