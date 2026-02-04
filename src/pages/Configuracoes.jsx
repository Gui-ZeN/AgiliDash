import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle,
  Save,
  Check,
  Users
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

/**
 * Pagina de Configuracoes
 * Gerenciamento hierarquico: Grupos -> CNPJs
 */
const Configuracoes = () => {
  const { isDarkMode } = useTheme();
  const {
    grupos,
    cnpjs,
    usuarios,
    addGrupo,
    updateGrupo,
    deleteGrupo,
    addCnpj,
    updateCnpj,
    deleteCnpj,
    getCnpjsByGrupo,
    getUsuariosByGrupo,
    getStats
  } = useData();

  // Estado para expansao de itens
  const [expandedGrupos, setExpandedGrupos] = useState([grupos[0]?.id]);

  // Estado para modais
  const [modalGrupo, setModalGrupo] = useState({ open: false, mode: 'add', data: null });
  const [modalCnpj, setModalCnpj] = useState({ open: false, mode: 'add', data: null, grupoId: null });
  const [modalDelete, setModalDelete] = useState({ open: false, type: null, item: null });
  const [successMessage, setSuccessMessage] = useState('');

  // Formularios
  const [formGrupo, setFormGrupo] = useState({ nome: '', descricao: '' });
  const [formCnpj, setFormCnpj] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    tipo: 'Filial',
    regimeTributario: 'Lucro Real',
    cidade: '',
    estado: ''
  });

  // Toggle expansao
  const toggleGrupo = (grupoId) => {
    setExpandedGrupos(prev =>
      prev.includes(grupoId)
        ? prev.filter(id => id !== grupoId)
        : [...prev, grupoId]
    );
  };

  // Mostrar mensagem de sucesso
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handlers de modal - GRUPO
  const handleAddGrupo = () => {
    setFormGrupo({ nome: '', descricao: '' });
    setModalGrupo({ open: true, mode: 'add', data: null });
  };

  const handleEditGrupo = (grupo) => {
    setFormGrupo({ nome: grupo.nome, descricao: grupo.descricao || '' });
    setModalGrupo({ open: true, mode: 'edit', data: grupo });
  };

  const handleSaveGrupo = () => {
    if (!formGrupo.nome.trim()) return;

    if (modalGrupo.mode === 'add') {
      addGrupo(formGrupo);
      showSuccess('Grupo criado com sucesso!');
    } else {
      updateGrupo(modalGrupo.data.id, formGrupo);
      showSuccess('Grupo atualizado com sucesso!');
    }
    setModalGrupo({ open: false, mode: 'add', data: null });
  };

  // Handlers de modal - CNPJ
  const handleAddCnpj = (grupoId) => {
    setFormCnpj({
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      tipo: 'Filial',
      regimeTributario: 'Lucro Real',
      cidade: '',
      estado: ''
    });
    setModalCnpj({ open: true, mode: 'add', data: null, grupoId });
  };

  const handleEditCnpj = (cnpj) => {
    setFormCnpj({
      cnpj: cnpj.cnpj,
      razaoSocial: cnpj.razaoSocial,
      nomeFantasia: cnpj.nomeFantasia,
      tipo: cnpj.tipo,
      regimeTributario: cnpj.regimeTributario,
      cidade: cnpj.cidade || '',
      estado: cnpj.estado || ''
    });
    setModalCnpj({ open: true, mode: 'edit', data: cnpj, grupoId: cnpj.grupoId });
  };

  const handleSaveCnpj = () => {
    if (!formCnpj.cnpj.trim() || !formCnpj.razaoSocial.trim()) return;

    if (modalCnpj.mode === 'add') {
      addCnpj({ ...formCnpj, grupoId: modalCnpj.grupoId });
      showSuccess('CNPJ cadastrado com sucesso!');
    } else {
      updateCnpj(modalCnpj.data.id, formCnpj);
      showSuccess('CNPJ atualizado com sucesso!');
    }
    setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null });
  };

  // Handler de exclusao
  const handleDelete = (type, item) => {
    setModalDelete({ open: true, type, item });
  };

  const handleConfirmDelete = () => {
    if (modalDelete.type === 'Grupo') {
      deleteGrupo(modalDelete.item.id);
      showSuccess('Grupo excluido com sucesso!');
    } else if (modalDelete.type === 'CNPJ') {
      deleteCnpj(modalDelete.item.id);
      showSuccess('CNPJ excluido com sucesso!');
    }
    setModalDelete({ open: false, type: null, item: null });
  };

  // Estatisticas
  const stats = getStats();

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

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="fixed top-24 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <main className="w-full px-4 lg:px-6 py-6 lg:py-8">
        {/* Cards de estatisticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FolderTree className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stats.totalGrupos}</p>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Grupos</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stats.totalCnpjs}</p>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">CNPJs</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stats.totalUsuarios}</p>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Usuarios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links rapidos */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            to="/usuarios"
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[#0e4f6d] dark:hover:border-cyan-400 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white group-hover:text-[#0e4f6d] dark:group-hover:text-cyan-400">Gestao de Usuarios</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciar usuarios e permissoes</p>
              </div>
            </div>
          </Link>
          <Link
            to="/logs"
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[#0e4f6d] dark:hover:border-cyan-400 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <FolderTree className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white group-hover:text-[#0e4f6d] dark:group-hover:text-cyan-400">Logs de Atividade</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Historico de acoes</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Secao principal - Grupos e CNPJs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header da secao */}
          <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Estrutura Organizacional</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie grupos e CNPJs</p>
            </div>
            <button
              onClick={handleAddGrupo}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Grupo</span>
            </button>
          </div>

          {/* Lista hierarquica */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {grupos.length === 0 ? (
              <div className="p-12 text-center">
                <FolderTree className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">Nenhum grupo cadastrado</p>
                <button
                  onClick={handleAddGrupo}
                  className="px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
                >
                  Criar Primeiro Grupo
                </button>
              </div>
            ) : (
              grupos.map((grupo) => {
                const cnpjsDoGrupo = getCnpjsByGrupo(grupo.id);
                const usuariosDoGrupo = getUsuariosByGrupo(grupo.id);
                const isGrupoExpanded = expandedGrupos.includes(grupo.id);

                return (
                  <div key={grupo.id} className="bg-white dark:bg-slate-800">
                    {/* Grupo */}
                    <div className="flex items-center justify-between p-4 lg:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleGrupo(grupo.id)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          {isGrupoExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 dark:text-white truncate">{grupo.nome}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {cnpjsDoGrupo.length} CNPJ(s) | {usuariosDoGrupo.length} Usuario(s) | {grupo.descricao || 'Sem descricao'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddCnpj(grupo.id)}
                          className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                          title="Adicionar CNPJ"
                        >
                          <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </button>
                        <button
                          onClick={() => handleEditGrupo(grupo)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDelete('Grupo', grupo)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* CNPJs do grupo */}
                    {isGrupoExpanded && (
                      <div className="bg-slate-50/50 dark:bg-slate-900/50">
                        {cnpjsDoGrupo.length === 0 ? (
                          <div className="p-6 pl-14 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Nenhum CNPJ neste grupo</p>
                            <button
                              onClick={() => handleAddCnpj(grupo.id)}
                              className="text-sm text-[#0e4f6d] dark:text-cyan-400 hover:underline"
                            >
                              + Adicionar CNPJ
                            </button>
                          </div>
                        ) : (
                          cnpjsDoGrupo.map((cnpj) => (
                            <div
                              key={cnpj.id}
                              className="flex items-center justify-between p-4 lg:p-5 pl-14 lg:pl-16 border-l-4 border-teal-200 dark:border-teal-800 ml-6 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg ${cnpj.tipo === 'Matriz' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
                                  <Building2 className={`w-4 h-4 ${cnpj.tipo === 'Matriz' ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-medium text-slate-800 dark:text-white truncate">{cnpj.nomeFantasia || cnpj.razaoSocial}</h5>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                      {cnpj.tipo}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{cnpj.cnpj}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditCnpj(cnpj)}
                                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </button>
                                <button
                                  onClick={() => handleDelete('CNPJ', cnpj)}
                                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal Grupo */}
      {modalGrupo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {modalGrupo.mode === 'add' ? 'Novo Grupo' : 'Editar Grupo'}
                </h2>
                <button
                  onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Grupo *</label>
                <input
                  type="text"
                  value={formGrupo.nome}
                  onChange={(e) => setFormGrupo({ ...formGrupo, nome: e.target.value })}
                  placeholder="Ex: Grupo ABC"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
                <textarea
                  value={formGrupo.descricao}
                  onChange={(e) => setFormGrupo({ ...formGrupo, descricao: e.target.value })}
                  placeholder="Descricao do grupo..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGrupo}
                disabled={!formGrupo.nome.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {modalCnpj.mode === 'add' ? 'Novo CNPJ' : 'Editar CNPJ'}
                </h2>
                <button
                  onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    value={formCnpj.cnpj}
                    onChange={(e) => setFormCnpj({ ...formCnpj, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razao Social *</label>
                  <input
                    type="text"
                    value={formCnpj.razaoSocial}
                    onChange={(e) => setFormCnpj({ ...formCnpj, razaoSocial: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formCnpj.nomeFantasia}
                    onChange={(e) => setFormCnpj({ ...formCnpj, nomeFantasia: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                  <select
                    value={formCnpj.tipo}
                    onChange={(e) => setFormCnpj({ ...formCnpj, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="Matriz">Matriz</option>
                    <option value="Filial">Filial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Regime Tributario</label>
                  <select
                    value={formCnpj.regimeTributario}
                    onChange={(e) => setFormCnpj({ ...formCnpj, regimeTributario: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formCnpj.cidade}
                    onChange={(e) => setFormCnpj({ ...formCnpj, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                  <select
                    value={formCnpj.estado}
                    onChange={(e) => setFormCnpj({ ...formCnpj, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="">Selecione...</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCnpj}
                disabled={!formCnpj.cnpj.trim() || !formCnpj.razaoSocial.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Confirmar Exclusao</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Esta acao nao pode ser desfeita.</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Voce esta prestes a excluir o {modalDelete.type?.toLowerCase()}:
                </p>
                <p className="font-bold text-slate-800 dark:text-white mt-1">
                  {modalDelete.item?.nome || modalDelete.item?.nomeFantasia || modalDelete.item?.razaoSocial}
                </p>
                {modalDelete.type === 'Grupo' && (
                  <p className="text-xs text-red-500 mt-2">
                    Atencao: Todos os CNPJs e usuarios deste grupo serao excluidos!
                  </p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setModalDelete({ open: false, type: null, item: null })}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
