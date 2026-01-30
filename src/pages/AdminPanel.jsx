import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Users,
  ArrowLeft,
  FileSpreadsheet,
  Search,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { usuariosMock, setoresUpload } from '../data/mockData';

/**
 * Painel Administrativo
 * Upload de CSV e Gerenciamento de Usuários
 * TODO: Integrar com Firebase para funcionalidade real
 */
const AdminPanel = () => {
  const [selectedSetor, setSelectedSetor] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState(usuariosMock);

  // Filtrar usuários pela busca
  const filteredUsuarios = usuarios.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    // TODO: Implementar upload para Firebase Storage
    alert('Upload será implementado com integração Firebase');
  };

  // Status badges
  const StatusBadge = ({ status }) => {
    const styles = {
      Ativo: 'bg-green-100 text-green-700',
      Inativo: 'bg-red-100 text-red-700',
      Pendente: 'bg-yellow-100 text-yellow-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.Ativo}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header simplificado */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
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

              {/* Input: CNPJ */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  CNPJ do Cliente
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent transition-all"
                />
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

              {/* Botão Upload */}
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedSetor || !cnpj || !file}
                onClick={handleUpload}
                className="w-full"
              >
                <Upload className="w-5 h-5" />
                Fazer Upload
              </Button>

              {/* Aviso */}
              <p className="text-xs text-slate-400 text-center">
                * Funcionalidade será habilitada após integração com Firebase
              </p>
            </div>
          </Card>

          {/* Seção: Gerenciar Usuários */}
          <Card>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
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
              <Button variant="outline" size="sm" disabled>
                <UserPlus className="w-4 h-4" />
                Novo
              </Button>
            </div>

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
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
                        <div>
                          <p className="font-semibold text-slate-800">{usuario.nome}</p>
                          <p className="text-xs text-slate-400">{usuario.email}</p>
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
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar"
                            disabled
                          >
                            <Edit3 className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                            disabled
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
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

            {/* Aviso */}
            <p className="text-xs text-slate-400 text-center mt-6">
              * Gerenciamento completo será habilitado após integração com Firebase Auth
            </p>
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
                  <span>Validação automática</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <X className="w-4 h-4 text-red-500" />
                  <span>Funcionalidade pendente</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
