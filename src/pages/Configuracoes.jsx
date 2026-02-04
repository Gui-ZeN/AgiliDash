import { useState, useRef } from 'react';
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
  Users,
  Upload,
  FileSpreadsheet,
  Shield,
  Eye,
  Mail,
  Phone,
  Download,
  Activity
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

/**
 * Pagina Administrativa Central
 * Gerenciamento completo: Grupos, CNPJs, Usuarios e Importacao
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
    addUsuario,
    updateUsuario,
    deleteUsuario,
    getCnpjsByGrupo,
    getUsuariosByGrupo,
    getStats,
    setoresDisponiveis
  } = useData();

  // Tab ativa
  const [activeTab, setActiveTab] = useState('grupos');

  // Estado para expansao de itens
  const [expandedGrupos, setExpandedGrupos] = useState([grupos[0]?.id]);

  // Estado para modais
  const [modalGrupo, setModalGrupo] = useState({ open: false, mode: 'add', data: null });
  const [modalCnpj, setModalCnpj] = useState({ open: false, mode: 'add', data: null, grupoId: null });
  const [modalUsuario, setModalUsuario] = useState({ open: false, mode: 'add', data: null });
  const [modalDelete, setModalDelete] = useState({ open: false, type: null, item: null });
  const [successMessage, setSuccessMessage] = useState('');

  // Formularios
  const [formGrupo, setFormGrupo] = useState({ nome: '', descricao: '' });
  const [formCnpj, setFormCnpj] = useState({
    cnpj: '', razaoSocial: '', nomeFantasia: '', tipo: 'Filial',
    regimeTributario: 'Lucro Real', cidade: '', estado: ''
  });
  const [formUsuario, setFormUsuario] = useState({
    nome: '', email: '', telefone: '', perfil: 'Visualizador',
    status: 'Ativo', grupoId: '', setoresAcesso: []
  });

  // Importacao CSV
  const fileInputRef = useRef(null);
  const [importType, setImportType] = useState('grupos');
  const [importPreview, setImportPreview] = useState(null);

  // Toggle expansao
  const toggleGrupo = (grupoId) => {
    setExpandedGrupos(prev =>
      prev.includes(grupoId) ? prev.filter(id => id !== grupoId) : [...prev, grupoId]
    );
  };

  // Mostrar mensagem de sucesso
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ===== HANDLERS GRUPO =====
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

  // ===== HANDLERS CNPJ =====
  const handleAddCnpj = (grupoId) => {
    setFormCnpj({
      cnpj: '', razaoSocial: '', nomeFantasia: '', tipo: 'Filial',
      regimeTributario: 'Lucro Real', cidade: '', estado: ''
    });
    setModalCnpj({ open: true, mode: 'add', data: null, grupoId });
  };

  const handleEditCnpj = (cnpj) => {
    setFormCnpj({
      cnpj: cnpj.cnpj, razaoSocial: cnpj.razaoSocial, nomeFantasia: cnpj.nomeFantasia,
      tipo: cnpj.tipo, regimeTributario: cnpj.regimeTributario,
      cidade: cnpj.cidade || '', estado: cnpj.estado || ''
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

  // ===== HANDLERS USUARIO =====
  const handleAddUsuario = () => {
    setFormUsuario({
      nome: '', email: '', telefone: '', perfil: 'Visualizador',
      status: 'Ativo', grupoId: grupos[0]?.id || '', setoresAcesso: []
    });
    setModalUsuario({ open: true, mode: 'add', data: null });
  };

  const handleEditUsuario = (usuario) => {
    setFormUsuario({
      nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '',
      perfil: usuario.perfil, status: usuario.status,
      grupoId: usuario.grupoId || '', setoresAcesso: usuario.setoresAcesso || []
    });
    setModalUsuario({ open: true, mode: 'edit', data: usuario });
  };

  const handleSaveUsuario = () => {
    if (!formUsuario.nome.trim() || !formUsuario.email.trim()) return;
    if (modalUsuario.mode === 'add') {
      addUsuario(formUsuario);
      showSuccess('Usuario criado com sucesso!');
    } else {
      updateUsuario(modalUsuario.data.id, formUsuario);
      showSuccess('Usuario atualizado com sucesso!');
    }
    setModalUsuario({ open: false, mode: 'add', data: null });
  };

  const toggleSetor = (setorId) => {
    setFormUsuario(prev => ({
      ...prev,
      setoresAcesso: prev.setoresAcesso.includes(setorId)
        ? prev.setoresAcesso.filter(s => s !== setorId)
        : [...prev.setoresAcesso, setorId]
    }));
  };

  // ===== HANDLER DELETE =====
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
    } else if (modalDelete.type === 'Usuario') {
      deleteUsuario(modalDelete.item.id);
      showSuccess('Usuario excluido com sucesso!');
    }
    setModalDelete({ open: false, type: null, item: null });
  };

  // ===== HANDLERS IMPORTACAO =====
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
      });
      setImportPreview({ headers, data, file: file.name });
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    if (!importPreview) return;

    let count = 0;
    if (importType === 'grupos') {
      importPreview.data.forEach(row => {
        if (row.nome) {
          addGrupo({ nome: row.nome, descricao: row.descricao || '' });
          count++;
        }
      });
    } else if (importType === 'cnpjs') {
      importPreview.data.forEach(row => {
        if (row.cnpj && row.razaoSocial && row.grupoId) {
          addCnpj({
            cnpj: row.cnpj, razaoSocial: row.razaoSocial,
            nomeFantasia: row.nomeFantasia || '', tipo: row.tipo || 'Filial',
            regimeTributario: row.regimeTributario || 'Lucro Real',
            cidade: row.cidade || '', estado: row.estado || '',
            grupoId: row.grupoId
          });
          count++;
        }
      });
    } else if (importType === 'usuarios') {
      importPreview.data.forEach(row => {
        if (row.nome && row.email) {
          addUsuario({
            nome: row.nome, email: row.email, telefone: row.telefone || '',
            perfil: row.perfil || 'Visualizador', status: 'Ativo',
            grupoId: row.grupoId || '', setoresAcesso: row.setores ? row.setores.split(';') : []
          });
          count++;
        }
      });
    }

    showSuccess(`${count} registro(s) importado(s) com sucesso!`);
    setImportPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = (type) => {
    let content = '';
    if (type === 'grupos') {
      content = 'nome,descricao\nGrupo Exemplo,Descricao do grupo';
    } else if (type === 'cnpjs') {
      content = 'cnpj,razaoSocial,nomeFantasia,tipo,regimeTributario,cidade,estado,grupoId\n12.345.678/0001-90,Empresa Exemplo Ltda,Empresa Exemplo,Matriz,Lucro Real,Sao Paulo,SP,grupo_001';
    } else {
      content = 'nome,email,telefone,perfil,grupoId,setores\nJoao Silva,joao@email.com,(11) 99999-9999,Visualizador,grupo_001,contabil;fiscal';
    }
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
  };

  // Estatisticas
  const stats = getStats();

  const getGrupoNome = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo?.nome || 'Sem grupo';
  };

  // Tabs
  const tabs = [
    { id: 'grupos', label: 'Grupos e CNPJs', icon: FolderTree },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'importacao', label: 'Importacao CSV', icon: Upload },
    { id: 'logs', label: 'Logs', icon: Activity }
  ];

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
          <h1 className="text-lg font-bold text-[#0e4f6d] dark:text-cyan-400">Painel Administrativo</h1>
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalGrupos}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Grupos</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalCnpjs}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">CNPJs</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsuarios}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'logs' ? window.location.href = '/logs' : setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0e4f6d] text-[#0e4f6d] dark:text-cyan-400 dark:border-cyan-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Grupos e CNPJs */}
          {activeTab === 'grupos' && (
            <div>
              <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Grupos e CNPJs</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Crie grupos e vincule CNPJs a eles</p>
                </div>
                <button
                  onClick={handleAddGrupo}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Grupo</span>
                </button>
              </div>

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
                    const isExpanded = expandedGrupos.includes(grupo.id);

                    return (
                      <div key={grupo.id}>
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleGrupo(grupo.id)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                              {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                            </button>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                              <FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 dark:text-white truncate">{grupo.nome}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {cnpjsDoGrupo.length} CNPJ(s) | {grupo.descricao || 'Sem descricao'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleAddCnpj(grupo.id)} className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30" title="Adicionar CNPJ">
                              <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            </button>
                            <button onClick={() => handleEditGrupo(grupo)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar">
                              <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </button>
                            <button onClick={() => handleDelete('Grupo', grupo)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" title="Excluir">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-50/50 dark:bg-slate-900/50">
                            {cnpjsDoGrupo.length === 0 ? (
                              <div className="p-4 pl-14 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Nenhum CNPJ neste grupo</p>
                                <button onClick={() => handleAddCnpj(grupo.id)} className="text-sm text-[#0e4f6d] dark:text-cyan-400 hover:underline">
                                  + Adicionar CNPJ
                                </button>
                              </div>
                            ) : (
                              cnpjsDoGrupo.map((cnpj) => (
                                <div key={cnpj.id} className="flex items-center justify-between p-4 pl-14 border-l-4 border-teal-200 dark:border-teal-800 ml-6 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
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
                                    <button onClick={() => handleEditCnpj(cnpj)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar">
                                      <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    </button>
                                    <button onClick={() => handleDelete('CNPJ', cnpj)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" title="Excluir">
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
          )}

          {/* Tab: Usuarios */}
          {activeTab === 'usuarios' && (
            <div>
              <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Usuarios</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie usuarios, vincule a grupos e defina permissoes por setor</p>
                </div>
                <button
                  onClick={handleAddUsuario}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Usuario</span>
                </button>
              </div>

              {usuarios.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Nenhum usuario cadastrado</p>
                  <button onClick={handleAddUsuario} className="px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors">
                    Criar Primeiro Usuario
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Contato</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Grupo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Perfil</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Setores</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {usuarios.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center text-white font-bold text-sm">
                                {user.nome.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">{user.nome}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                  {user.status}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                            {user.telefone && (
                              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {user.telefone}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <FolderTree className="w-4 h-4 text-amber-500" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">{getGrupoNome(user.grupoId)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.perfil === 'Admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {user.perfil === 'Admin' ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {user.perfil}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(user.setoresAcesso || []).map(setor => (
                                <span key={setor} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs capitalize">
                                  {setor}
                                </span>
                              ))}
                              {(!user.setoresAcesso || user.setoresAcesso.length === 0) && (
                                <span className="text-xs text-slate-400">Nenhum</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => handleEditUsuario(user)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar">
                              <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </button>
                            <button onClick={() => handleDelete('Usuario', user)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" title="Excluir">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Importacao */}
          {activeTab === 'importacao' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Importacao via CSV</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Importe dados em massa a partir de arquivos CSV</p>
              </div>

              {/* Tipo de importacao */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Tipo de Dados</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'grupos', label: 'Grupos', icon: FolderTree },
                    { id: 'cnpjs', label: 'CNPJs', icon: Building2 },
                    { id: 'usuarios', label: 'Usuarios', icon: Users }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setImportType(type.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-colors ${
                        importType === type.id
                          ? 'border-[#0e4f6d] bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${importType === type.id ? 'text-[#0e4f6d] dark:text-cyan-400' : 'text-slate-400'}`} />
                      <span className={`font-medium ${importType === type.id ? 'text-[#0e4f6d] dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download template */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Baixe o modelo CSV para preencher:</p>
                <button
                  onClick={() => downloadTemplate(importType)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Baixar template_{importType}.csv</span>
                </button>
              </div>

              {/* Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Selecionar Arquivo</label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-[#0e4f6d] dark:hover:border-cyan-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300 mb-2">Clique para selecionar ou arraste o arquivo</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Apenas arquivos .csv</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preview */}
              {importPreview && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{importPreview.file}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{importPreview.data.length} registro(s) encontrado(s)</p>
                    </div>
                    <button
                      onClick={() => setImportPreview(null)}
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          {importPreview.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {importPreview.data.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {importPreview.headers.map((h, j) => (
                              <td key={j} className="px-3 py-2 text-slate-600 dark:text-slate-300">{row[h] || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button
                      onClick={() => setImportPreview(null)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImportConfirm}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560]"
                    >
                      <Upload className="w-4 h-4" />
                      Importar {importPreview.data.length} registro(s)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Grupo */}
      {modalGrupo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {modalGrupo.mode === 'add' ? 'Novo Grupo' : 'Editar Grupo'}
              </h2>
              <button onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Grupo *</label>
                <input
                  type="text"
                  value={formGrupo.nome}
                  onChange={(e) => setFormGrupo({ ...formGrupo, nome: e.target.value })}
                  placeholder="Ex: Grupo ABC"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
                <textarea
                  value={formGrupo.descricao}
                  onChange={(e) => setFormGrupo({ ...formGrupo, descricao: e.target.value })}
                  placeholder="Descricao do grupo..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0e4f6d] outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSaveGrupo} disabled={!formGrupo.nome.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CNPJ */}
      {modalCnpj.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {modalCnpj.mode === 'add' ? 'Novo CNPJ' : 'Editar CNPJ'}
              </h2>
              <button onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ *</label>
                  <input type="text" value={formCnpj.cnpj} onChange={(e) => setFormCnpj({ ...formCnpj, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razao Social *</label>
                  <input type="text" value={formCnpj.razaoSocial} onChange={(e) => setFormCnpj({ ...formCnpj, razaoSocial: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Fantasia</label>
                  <input type="text" value={formCnpj.nomeFantasia} onChange={(e) => setFormCnpj({ ...formCnpj, nomeFantasia: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                  <select value={formCnpj.tipo} onChange={(e) => setFormCnpj({ ...formCnpj, tipo: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none">
                    <option value="Matriz">Matriz</option>
                    <option value="Filial">Filial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Regime Tributario</label>
                  <select value={formCnpj.regimeTributario} onChange={(e) => setFormCnpj({ ...formCnpj, regimeTributario: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none">
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                  <input type="text" value={formCnpj.cidade} onChange={(e) => setFormCnpj({ ...formCnpj, cidade: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                  <select value={formCnpj.estado} onChange={(e) => setFormCnpj({ ...formCnpj, estado: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none">
                    <option value="">Selecione...</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSaveCnpj} disabled={!formCnpj.cnpj.trim() || !formCnpj.razaoSocial.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usuario */}
      {modalUsuario.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {modalUsuario.mode === 'add' ? 'Novo Usuario' : 'Editar Usuario'}
              </h2>
              <button onClick={() => setModalUsuario({ open: false, mode: 'add', data: null })} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                  <input type="text" value={formUsuario.nome} onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })} placeholder="Nome completo" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} placeholder="email@exemplo.com" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input type="tel" value={formUsuario.telefone} onChange={(e) => setFormUsuario({ ...formUsuario, telefone: e.target.value })} placeholder="(00) 00000-0000" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select value={formUsuario.status} onChange={(e) => setFormUsuario({ ...formUsuario, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none">
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vincular ao Grupo</label>
                <select value={formUsuario.grupoId} onChange={(e) => setFormUsuario({ ...formUsuario, grupoId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none">
                  <option value="">Selecione um grupo...</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Perfil de Acesso</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'Admin', label: 'Administrador', desc: 'Acesso total', icon: Shield },
                    { value: 'Visualizador', label: 'Visualizador', desc: 'Apenas visualizacao', icon: Eye }
                  ].map(p => (
                    <button
                      key={p.value}
                      onClick={() => setFormUsuario({ ...formUsuario, perfil: p.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${formUsuario.perfil === p.value ? 'border-[#0e4f6d] bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20' : 'border-slate-200 dark:border-slate-600'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p.icon className={`w-4 h-4 ${formUsuario.perfil === p.value ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                        <span className={`font-medium ${formUsuario.perfil === p.value ? 'text-[#0e4f6d] dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>{p.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Setores com Acesso</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {setoresDisponiveis.map(setor => (
                    <button
                      key={setor.id}
                      onClick={() => toggleSetor(setor.id)}
                      className={`p-3 rounded-lg border text-center transition-colors ${formUsuario.setoresAcesso.includes(setor.id) ? 'border-[#0e4f6d] bg-[#0e4f6d] text-white' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#0e4f6d]'}`}
                    >
                      <span className="text-sm font-medium">{setor.nome}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Selecione quais setores este usuario podera visualizar</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalUsuario({ open: false, mode: 'add', data: null })} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSaveUsuario} disabled={!formUsuario.nome.trim() || !formUsuario.email.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
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
                  <p className="text-xs text-red-500 mt-2">Atencao: Todos os CNPJs e usuarios deste grupo serao excluidos!</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalDelete({ open: false, type: null, item: null })} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
