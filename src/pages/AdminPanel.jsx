import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Users,
  ArrowLeft,
  FileSpreadsheet,
  Search,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Save,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  History,
  FileText,
  ChevronDown
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useEmpresa } from '../context/EmpresaContext';
import {
  usuariosMock,
  setoresUpload,
  perfisUsuario,
  statusUsuario,
  cnpjsEmpresa,
  historicoImportacoes
} from '../data/mockData';

/**
 * Painel Administrativo
 * Upload de CSV e Gerenciamento de Usuários
 */
const AdminPanel = () => {
  const { listaCnpjs } = useEmpresa();

  // Estados Upload CSV
  const [selectedSetor, setSelectedSetor] = useState('');
  const [selectedCnpj, setSelectedCnpj] = useState('');
  const [file, setFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Estados Usuários
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState(usuariosMock);

  // Estados Modais
  const [modalUsuario, setModalUsuario] = useState({ open: false, mode: 'add', data: null });
  const [modalDelete, setModalDelete] = useState({ open: false, usuario: null });

  // Estado do formulário de usuário
  const [formUsuario, setFormUsuario] = useState({
    nome: '',
    email: '',
    perfil: '',
    status: 'Ativo',
    cnpjsAcesso: []
  });

  // Tab ativa (usuarios ou historico)
  const [activeTab, setActiveTab] = useState('usuarios');

  // Filtrar usuários pela busca
  const filteredUsuarios = usuarios.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler para mudança de arquivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simular preview do CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').slice(0, 6); // Primeiras 5 linhas + header
        const headers = lines[0]?.split(',') || [];
        const rows = lines.slice(1).map(line => line.split(','));
        setCsvPreview({ headers, rows, totalLines: text.split('\n').length - 1 });
      };
      reader.readAsText(selectedFile);
    }
  };

  // Handler para upload
  const handleUpload = () => {
    alert(`Upload do arquivo "${file.name}" para o setor ${selectedSetor} será processado quando Firebase estiver integrado.`);
    setFile(null);
    setCsvPreview(null);
    setSelectedSetor('');
    setSelectedCnpj('');
    setShowPreview(false);
  };

  // Abrir modal para adicionar usuário
  const handleAddUsuario = () => {
    setFormUsuario({
      nome: '',
      email: '',
      perfil: '',
      status: 'Ativo',
      cnpjsAcesso: []
    });
    setModalUsuario({ open: true, mode: 'add', data: null });
  };

  // Abrir modal para editar usuário
  const handleEditUsuario = (usuario) => {
    setFormUsuario({
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      status: usuario.status,
      cnpjsAcesso: usuario.cnpjsAcesso || []
    });
    setModalUsuario({ open: true, mode: 'edit', data: usuario });
  };

  // Abrir modal para excluir usuário
  const handleDeleteUsuario = (usuario) => {
    setModalDelete({ open: true, usuario });
  };

  // Salvar usuário
  const handleSaveUsuario = () => {
    if (modalUsuario.mode === 'add') {
      const novoUsuario = {
        id: Date.now(),
        ...formUsuario
      };
      setUsuarios([...usuarios, novoUsuario]);
      alert('Usuário adicionado com sucesso!');
    } else {
      setUsuarios(usuarios.map(u =>
        u.id === modalUsuario.data.id ? { ...u, ...formUsuario } : u
      ));
      alert('Usuário atualizado com sucesso!');
    }
    setModalUsuario({ open: false, mode: 'add', data: null });
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    setUsuarios(usuarios.filter(u => u.id !== modalDelete.usuario.id));
    alert('Usuário removido com sucesso!');
    setModalDelete({ open: false, usuario: null });
  };

  // Toggle CNPJ no formulário
  const toggleCnpjAcesso = (cnpjId) => {
    setFormUsuario(prev => ({
      ...prev,
      cnpjsAcesso: prev.cnpjsAcesso.includes(cnpjId)
        ? prev.cnpjsAcesso.filter(id => id !== cnpjId)
        : [...prev.cnpjsAcesso, cnpjId]
    }));
  };

  // Status badges
  const StatusBadge = ({ status }) => {
    const styles = {
      Ativo: 'bg-green-100 text-green-700',
      Inativo: 'bg-red-100 text-red-700',
      Pendente: 'bg-yellow-100 text-yellow-700',
      Sucesso: 'bg-green-100 text-green-700',
      Erro: 'bg-red-100 text-red-700'
    };

    const icons = {
      Sucesso: <CheckCircle className="w-3 h-3" />,
      Erro: <XCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.Ativo}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header simplificado */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-slate-500 hover:text-[#0e4f6d] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar ao Dashboard</span>
            </Link>
          </div>
          <Logo width={160} height={60} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Header da página */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#1e293b] mb-2">
            Painel Administrativo
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Gerencie uploads de dados e usuários do sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seção: Upload de CSV */}
          <Card>
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
              <div className="p-3 bg-[#0e4f6d] rounded-xl">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Upload de CSV</h2>
                <p className="text-sm text-slate-400">
                  Importe dados para o sistema
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dropdown: CNPJ */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  CNPJ
                </label>
                <select
                  value={selectedCnpj}
                  onChange={(e) => setSelectedCnpj(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent transition-all bg-white"
                >
                  <option value="">Selecione um CNPJ...</option>
                  {listaCnpjs.map((cnpj) => (
                    <option key={cnpj.id} value={cnpj.id}>
                      {cnpj.nomeFantasia} - {cnpj.cnpj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown: Setor */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Setor
                </label>
                <select
                  value={selectedSetor}
                  onChange={(e) => setSelectedSetor(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent transition-all bg-white"
                >
                  <option value="">Selecione um setor...</option>
                  {setoresUpload.map((setor) => (
                    <option key={setor.value} value={setor.value}>
                      {setor.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input: Arquivo */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Arquivo CSV
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#0e4f6d] hover:bg-slate-50 transition-all"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                    <div className="text-center">
                      {file ? (
                        <span className="text-[#0e4f6d] font-medium">{file.name}</span>
                      ) : (
                        <>
                          <span className="text-slate-600 font-medium">
                            Clique para selecionar
                          </span>
                          <span className="text-slate-400 text-sm block">
                            ou arraste o arquivo aqui
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview do CSV */}
              {csvPreview && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Preview do arquivo ({csvPreview.totalLines} linhas)
                    </span>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-[#0e4f6d] font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Ocultar' : 'Ver dados'}
                    </button>
                  </div>

                  {showPreview && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-200">
                            {csvPreview.headers.map((header, i) => (
                              <th key={i} className="px-2 py-1 text-left font-bold text-slate-600">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.rows.map((row, i) => (
                            <tr key={i} className="border-b border-slate-200">
                              {row.map((cell, j) => (
                                <td key={j} className="px-2 py-1 text-slate-600">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-xs text-slate-400 mt-2">
                        Mostrando primeiras 5 linhas de {csvPreview.totalLines}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Botão Upload */}
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedSetor || !selectedCnpj || !file}
                onClick={handleUpload}
                className="w-full"
              >
                <Upload className="w-5 h-5" />
                Fazer Upload
              </Button>
            </div>
          </Card>

          {/* Seção: Gerenciar Usuários */}
          <Card>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#58a3a4] rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gerenciar Usuários</h2>
                  <p className="text-sm text-slate-400">
                    {usuarios.length} usuários cadastrados
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddUsuario}>
                <UserPlus className="w-4 h-4" />
                Novo
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'usuarios' ? 'bg-[#0e4f6d] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('historico')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'historico' ? 'bg-[#0e4f6d] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <History className="w-4 h-4 inline mr-2" />
                Histórico
              </button>
            </div>

            {activeTab === 'usuarios' && (
              <>
                {/* Busca */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar usuário..."
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Tabela de Usuários */}
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-xs">
                          Nome
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-xs">
                          Perfil
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-xs">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-xs">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#0e4f6d] flex items-center justify-center text-white font-bold text-sm">
                                {usuario.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{usuario.nome}</p>
                                <p className="text-xs text-slate-400">{usuario.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-600">{usuario.perfil}</span>
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={usuario.status} />
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUsuario(usuario)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit3 className="w-4 h-4 text-slate-500" />
                              </button>
                              <button
                                onClick={() => handleDeleteUsuario(usuario)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
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

                {filteredUsuarios.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    Nenhum usuário encontrado.
                  </div>
                )}
              </>
            )}

            {activeTab === 'historico' && (
              <div className="space-y-4 max-h-[450px] overflow-y-auto">
                {historicoImportacoes.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${item.status === 'Sucesso' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <FileText className={`w-4 h-4 ${item.status === 'Sucesso' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.arquivo}</p>
                          <p className="text-xs text-slate-500">{item.setor} • {item.cnpj}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(item.data).toLocaleString('pt-BR')} por {item.usuario}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={item.status} />
                        <p className="text-xs text-slate-500 mt-1">
                          {item.registros > 0 ? `${item.registros} registros` : item.erro}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Card de informações */}
        <Card className="mt-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-amber-50 rounded-2xl">
              <FileSpreadsheet className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Sobre a Importação de Dados
              </h3>
              <p className="text-slate-500 leading-relaxed mb-4">
                O sistema suporta importação de arquivos CSV para os departamentos Contábil,
                Fiscal e Pessoal. Os dados serão processados e armazenados no Firebase Firestore,
                permitindo visualização em tempo real no dashboard do cliente.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Formato CSV aceito</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Preview antes do upload</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Histórico de importações</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Modal Adicionar/Editar Usuário */}
      {modalUsuario.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {modalUsuario.mode === 'add' ? 'Novo Usuário' : 'Editar Usuário'}
                </h2>
                <button
                  onClick={() => setModalUsuario({ open: false, mode: 'add', data: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formUsuario.nome}
                  onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formUsuario.email}
                  onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
                <select
                  value={formUsuario.perfil}
                  onChange={(e) => setFormUsuario({ ...formUsuario, perfil: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                >
                  <option value="">Selecione...</option>
                  {perfisUsuario.map((perfil) => (
                    <option key={perfil.value} value={perfil.value}>
                      {perfil.label} - {perfil.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formUsuario.status}
                  onChange={(e) => setFormUsuario({ ...formUsuario, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                >
                  {statusUsuario.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Acesso aos CNPJs</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {cnpjsEmpresa.map((cnpj) => (
                    <label
                      key={cnpj.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formUsuario.cnpjsAcesso.includes(cnpj.id)}
                        onChange={() => toggleCnpjAcesso(cnpj.id)}
                        className="w-4 h-4 text-[#0e4f6d] border-slate-300 rounded focus:ring-[#0e4f6d]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{cnpj.nomeFantasia}</p>
                        <p className="text-xs text-slate-500">{cnpj.cnpj}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d]/10 text-[#0e4f6d]' : 'bg-slate-100 text-slate-600'}`}>
                        {cnpj.tipo}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalUsuario({ open: false, mode: 'add', data: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUsuario}
                disabled={!formUsuario.nome || !formUsuario.email || !formUsuario.perfil}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {modalUsuario.mode === 'add' ? 'Criar Usuário' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {modalDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Confirmar Exclusão</h2>
                  <p className="text-sm text-slate-500">Esta ação não pode ser desfeita.</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Você está prestes a excluir o usuário:
                </p>
                <p className="font-bold text-slate-800 mt-1">
                  {modalDelete.usuario?.nome}
                </p>
                <p className="text-sm text-slate-500">
                  {modalDelete.usuario?.email}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalDelete({ open: false, usuario: null })}
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

export default AdminPanel;
