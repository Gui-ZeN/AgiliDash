import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Plus, Search, Edit2, Trash2, Shield, Eye,
  Check, X, Mail, Phone, Building2, ChevronDown, Filter, MoreVertical
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useEmpresa } from '../context/EmpresaContext';
import { usuariosMock, perfisUsuario, setoresDisponiveis } from '../data/mockData';
import { logActivity, ActivityTypes, ActivityCategories } from '../utils/activityLog';

/**
 * Página de Gestão de Usuários
 * Permite cadastrar, editar e gerenciar permissões de usuários
 */
const Usuarios = () => {
  const { isDarkMode } = useTheme();
  const { todosGrupos, todasEmpresas } = useEmpresa();

  const [usuarios, setUsuarios] = useState(usuariosMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    perfil: 'Visualizador',
    status: 'Ativo',
    setoresAcesso: [],
    gruposAcesso: [],
    empresasAcesso: []
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usuarios.filter(user => {
      const matchSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPerfil = filterPerfil === 'todos' || user.perfil === filterPerfil;
      const matchStatus = filterStatus === 'todos' || user.status === filterStatus;
      return matchSearch && matchPerfil && matchStatus;
    });
  }, [usuarios, searchTerm, filterPerfil, filterStatus]);

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (user) {
      setSelectedUser(user);
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        perfil: user.perfil,
        status: user.status,
        setoresAcesso: user.setoresAcesso || [],
        gruposAcesso: user.gruposAcesso || [],
        empresasAcesso: user.empresasAcesso || []
      });
    } else {
      setSelectedUser(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        perfil: 'Visualizador',
        status: 'Ativo',
        setoresAcesso: [],
        gruposAcesso: [],
        empresasAcesso: []
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newUser = {
        id: Date.now(),
        ...formData,
        avatar: formData.nome.substring(0, 2).toUpperCase(),
        dataCadastro: new Date().toISOString()
      };
      setUsuarios([...usuarios, newUser]);
      logActivity({
        type: ActivityTypes.CREATE,
        category: ActivityCategories.CONFIG,
        description: `Usuario criado: ${formData.nome}`,
        metadata: { userId: newUser.id }
      });
    } else {
      setUsuarios(usuarios.map(u =>
        u.id === selectedUser.id ? { ...u, ...formData } : u
      ));
      logActivity({
        type: ActivityTypes.UPDATE,
        category: ActivityCategories.CONFIG,
        description: `Usuario atualizado: ${formData.nome}`,
        metadata: { userId: selectedUser.id }
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (userId) => {
    const user = usuarios.find(u => u.id === userId);
    setUsuarios(usuarios.filter(u => u.id !== userId));
    setDeleteConfirm(null);
    logActivity({
      type: ActivityTypes.DELETE,
      category: ActivityCategories.CONFIG,
      description: `Usuario removido: ${user?.nome}`,
      metadata: { userId }
    });
  };

  const toggleSetor = (setor) => {
    setFormData(prev => ({
      ...prev,
      setoresAcesso: prev.setoresAcesso.includes(setor)
        ? prev.setoresAcesso.filter(s => s !== setor)
        : [...prev.setoresAcesso, setor]
    }));
  };

  const toggleGrupo = (grupoId) => {
    setFormData(prev => ({
      ...prev,
      gruposAcesso: prev.gruposAcesso.includes(grupoId)
        ? prev.gruposAcesso.filter(g => g !== grupoId)
        : [...prev.gruposAcesso, grupoId]
    }));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-slate-50 to-cyan-50/30'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="w-full px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">Gestao de Usuarios</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{usuarios.length} usuarios cadastrados</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] hover:bg-[#0a3d54] text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Usuario</span>
          </button>
        </div>
      </header>

      <main className="w-full px-4 lg:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-2xl font-bold text-[#0e4f6d] dark:text-cyan-400">{usuarios.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Usuarios</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-2xl font-bold text-emerald-500">{usuarios.filter(u => u.status === 'Ativo').length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ativos</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-2xl font-bold text-amber-500">{usuarios.filter(u => u.perfil === 'Admin').length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Administradores</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-2xl font-bold text-blue-500">{usuarios.filter(u => u.perfil === 'Visualizador').length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Visualizadores</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent"
              />
            </div>
            <select
              value={filterPerfil}
              onChange={(e) => setFilterPerfil(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="todos">Todos os Perfis</option>
              {perfisUsuario.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="todos">Todos os Status</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contato</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Perfil</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Setores</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center text-white font-bold">
                          {user.avatar || user.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{user.nome}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {user.email}
                        </div>
                        {user.telefone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {user.telefone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.perfil === 'Admin'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {user.perfil === 'Admin' ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {user.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(user.setoresAcesso || []).slice(0, 3).map(setor => (
                          <span
                            key={setor}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs capitalize"
                          >
                            {setor}
                          </span>
                        ))}
                        {(user.setoresAcesso || []).length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-xs">
                            +{user.setoresAcesso.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Ativo'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal('edit', user)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Nenhum usuario encontrado</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {modalMode === 'create' ? 'Novo Usuario' : 'Editar Usuario'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Dados básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Perfil */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Perfil de Acesso</label>
                <div className="grid grid-cols-2 gap-4">
                  {perfisUsuario.map(perfil => (
                    <button
                      key={perfil.value}
                      onClick={() => setFormData({ ...formData, perfil: perfil.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        formData.perfil === perfil.value
                          ? 'border-[#0e4f6d] bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {perfil.value === 'Admin' ? (
                          <Shield className={`w-5 h-5 ${formData.perfil === perfil.value ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                        ) : (
                          <Eye className={`w-5 h-5 ${formData.perfil === perfil.value ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                        )}
                        <span className={`font-semibold ${formData.perfil === perfil.value ? 'text-[#0e4f6d] dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {perfil.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{perfil.descricao}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Setores */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Setores com Acesso</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {setoresDisponiveis.map(setor => (
                    <button
                      key={setor.value}
                      onClick={() => toggleSetor(setor.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.setoresAcesso.includes(setor.value)
                          ? 'border-[#0e4f6d] bg-[#0e4f6d] text-white'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#0e4f6d]'
                      }`}
                    >
                      <span className="text-sm font-medium">{setor.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grupos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Grupos com Acesso</label>
                <div className="grid grid-cols-2 gap-3">
                  {todosGrupos.map(grupo => (
                    <button
                      key={grupo.id}
                      onClick={() => toggleGrupo(grupo.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.gruposAcesso.includes(grupo.id)
                          ? 'border-[#0e4f6d] bg-[#0e4f6d]/5 dark:bg-[#0e4f6d]/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 ${formData.gruposAcesso.includes(grupo.id) ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                        <span className={`font-medium ${formData.gruposAcesso.includes(grupo.id) ? 'text-[#0e4f6d] dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {grupo.nome}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.nome || !formData.email}
                className="px-4 py-2 rounded-lg bg-[#0e4f6d] text-white hover:bg-[#0a3d54] transition-colors disabled:opacity-50"
              >
                {modalMode === 'create' ? 'Criar Usuario' : 'Salvar Alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Excluir Usuario</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
