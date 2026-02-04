import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Building2, FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown,
  X, AlertTriangle, Save, Check, Users, Upload, FileSpreadsheet, Shield, Eye,
  Mail, Phone, Download, Activity, Calculator, FileText, Briefcase, Scale,
  ChevronLeft, Database, Table, AlertCircle, CheckCircle2
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

// Definicao dos setores e seus relatorios
const SETORES_CONFIG = {
  contabil: {
    id: 'contabil',
    nome: 'Contabil',
    icon: Calculator,
    cor: 'emerald',
    relatorios: [
      { id: 'balancete', nome: 'Balancete Mensal', descricao: 'Exportar do Dominio: Relatorios > Contabil > Balancete', formato: 'dominio' },
      { id: 'analiseHorizontal', nome: 'Analise Horizontal (DRE)', descricao: 'Exportar do Dominio: Relatorios > Contabil > Analise Horizontal do DRE', formato: 'dominio' },
      { id: 'dreComparativa', nome: 'DRE Comparativa', descricao: 'Exportar do Dominio: Relatorios > Contabil > DRE Comparativa (Anual)', formato: 'dominio' },
      { id: 'dreMensal', nome: 'DRE Mensal', descricao: 'Exportar do Dominio: Relatorios > Contabil > DRE do Periodo', formato: 'dominio' }
    ]
  },
  fiscal: {
    id: 'fiscal',
    nome: 'Fiscal',
    icon: FileText,
    cor: 'blue',
    relatorios: [
      { id: 'icms', nome: 'Apuracao ICMS', campos: ['periodo', 'icmsEntradas', 'icmsSaidas', 'icmsAPagar', 'icmsCredito'] },
      { id: 'pisCofins', nome: 'Apuracao PIS/COFINS', campos: ['periodo', 'pisDebito', 'pisCredito', 'cofinsDebito', 'cofinsCredito'] },
      { id: 'irpjCsll', nome: 'IRPJ e CSLL', campos: ['trimestre', 'lucroReal', 'irpj', 'adicionalIR', 'csll'] },
      { id: 'notasFiscais', nome: 'Notas Fiscais', campos: ['numero', 'data', 'cnpjEmitente', 'valor', 'icms', 'pis', 'cofins', 'tipo'] },
      { id: 'spedFiscal', nome: 'SPED Fiscal', campos: ['registro', 'campo1', 'campo2', 'campo3', 'campo4'] }
    ]
  },
  pessoal: {
    id: 'pessoal',
    nome: 'Pessoal',
    icon: Users,
    cor: 'violet',
    relatorios: [
      { id: 'folha', nome: 'Folha de Pagamento', campos: ['matricula', 'nome', 'cargo', 'salarioBruto', 'inss', 'irrf', 'valeTransporte', 'salarioLiquido'] },
      { id: 'funcionarios', nome: 'Cadastro de Funcionarios', campos: ['matricula', 'nome', 'cpf', 'cargo', 'departamento', 'dataAdmissao', 'salario'] },
      { id: 'ferias', nome: 'Controle de Ferias', campos: ['matricula', 'nome', 'periodoAquisitivo', 'diasDireito', 'diasGozados', 'saldo'] },
      { id: 'rescisoes', nome: 'Rescisoes', campos: ['matricula', 'nome', 'dataDesligamento', 'motivoDesligamento', 'valorRescisao'] },
      { id: 'encargos', nome: 'Encargos Sociais', campos: ['competencia', 'inssEmpresa', 'fgts', 'rat', 'terceiros', 'total'] }
    ]
  },
  administrativo: {
    id: 'administrativo',
    nome: 'Administrativo',
    icon: Briefcase,
    cor: 'amber',
    relatorios: [
      { id: 'contratos', nome: 'Contratos', campos: ['numero', 'fornecedor', 'objeto', 'valor', 'dataInicio', 'dataFim', 'status'] },
      { id: 'despesas', nome: 'Despesas Administrativas', campos: ['data', 'categoria', 'descricao', 'valor', 'fornecedor', 'centroCusto'] },
      { id: 'patrimonio', nome: 'Patrimonio/Ativos', campos: ['codigo', 'descricao', 'dataAquisicao', 'valorOriginal', 'depreciacao', 'valorAtual'] },
      { id: 'fornecedores', nome: 'Cadastro de Fornecedores', campos: ['cnpj', 'razaoSocial', 'nomeFantasia', 'telefone', 'email', 'categoria'] }
    ]
  }
};

const Configuracoes = () => {
  const { isDarkMode } = useTheme();
  const {
    grupos, cnpjs, usuarios, addGrupo, updateGrupo, deleteGrupo,
    addCnpj, updateCnpj, deleteCnpj, addUsuario, updateUsuario, deleteUsuario,
    getCnpjsByGrupo, getStats, setoresDisponiveis, importarRelatorioContabil
  } = useData();

  // Estados principais
  const [activeTab, setActiveTab] = useState('grupos');
  const [expandedGrupos, setExpandedGrupos] = useState([grupos[0]?.id]);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados de modais
  const [modalGrupo, setModalGrupo] = useState({ open: false, mode: 'add', data: null });
  const [modalCnpj, setModalCnpj] = useState({ open: false, mode: 'add', data: null, grupoId: null });
  const [modalUsuario, setModalUsuario] = useState({ open: false, mode: 'add', data: null });
  const [modalDelete, setModalDelete] = useState({ open: false, type: null, item: null });

  // Estados de formularios
  const [formGrupo, setFormGrupo] = useState({ nome: '', descricao: '' });
  const [formCnpj, setFormCnpj] = useState({ cnpj: '', razaoSocial: '', nomeFantasia: '', tipo: 'Filial', regimeTributario: 'Lucro Real', cidade: '', estado: '' });
  const [formUsuario, setFormUsuario] = useState({ nome: '', email: '', telefone: '', perfil: 'Visualizador', status: 'Ativo', grupoId: '', setoresAcesso: [] });

  // Estados de importacao
  const fileInputRef = useRef(null);
  const [importStep, setImportStep] = useState(1); // 1: Selecao, 2: Upload, 3: Preview, 4: Confirmacao
  const [importCategory, setImportCategory] = useState('cadastros'); // 'cadastros' ou 'setores'
  const [importType, setImportType] = useState('grupos');
  const [importSetor, setImportSetor] = useState(null);
  const [importRelatorio, setImportRelatorio] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importMapping, setImportMapping] = useState({});
  const [selectedCnpjImport, setSelectedCnpjImport] = useState('');

  // Helpers
  const toggleGrupo = (grupoId) => {
    setExpandedGrupos(prev => prev.includes(grupoId) ? prev.filter(id => id !== grupoId) : [...prev, grupoId]);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getGrupoNome = (grupoId) => grupos.find(g => g.id === grupoId)?.nome || 'Sem grupo';

  // Handlers CRUD Grupo
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
      showSuccess('Grupo criado!');
    } else {
      updateGrupo(modalGrupo.data.id, formGrupo);
      showSuccess('Grupo atualizado!');
    }
    setModalGrupo({ open: false, mode: 'add', data: null });
  };

  // Handlers CRUD CNPJ
  const handleAddCnpj = (grupoId) => {
    setFormCnpj({ cnpj: '', razaoSocial: '', nomeFantasia: '', tipo: 'Filial', regimeTributario: 'Lucro Real', cidade: '', estado: '' });
    setModalCnpj({ open: true, mode: 'add', data: null, grupoId });
  };

  const handleEditCnpj = (cnpj) => {
    setFormCnpj({ cnpj: cnpj.cnpj, razaoSocial: cnpj.razaoSocial, nomeFantasia: cnpj.nomeFantasia, tipo: cnpj.tipo, regimeTributario: cnpj.regimeTributario, cidade: cnpj.cidade || '', estado: cnpj.estado || '' });
    setModalCnpj({ open: true, mode: 'edit', data: cnpj, grupoId: cnpj.grupoId });
  };

  const handleSaveCnpj = () => {
    if (!formCnpj.cnpj.trim() || !formCnpj.razaoSocial.trim()) return;
    if (modalCnpj.mode === 'add') {
      addCnpj({ ...formCnpj, grupoId: modalCnpj.grupoId });
      showSuccess('CNPJ cadastrado!');
    } else {
      updateCnpj(modalCnpj.data.id, formCnpj);
      showSuccess('CNPJ atualizado!');
    }
    setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null });
  };

  // Handlers CRUD Usuario
  const handleAddUsuario = () => {
    setFormUsuario({ nome: '', email: '', telefone: '', perfil: 'Visualizador', status: 'Ativo', grupoId: grupos[0]?.id || '', setoresAcesso: [] });
    setModalUsuario({ open: true, mode: 'add', data: null });
  };

  const handleEditUsuario = (usuario) => {
    setFormUsuario({ nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '', perfil: usuario.perfil, status: usuario.status, grupoId: usuario.grupoId || '', setoresAcesso: usuario.setoresAcesso || [] });
    setModalUsuario({ open: true, mode: 'edit', data: usuario });
  };

  const handleSaveUsuario = () => {
    if (!formUsuario.nome.trim() || !formUsuario.email.trim()) return;
    if (modalUsuario.mode === 'add') {
      addUsuario(formUsuario);
      showSuccess('Usuario criado!');
    } else {
      updateUsuario(modalUsuario.data.id, formUsuario);
      showSuccess('Usuario atualizado!');
    }
    setModalUsuario({ open: false, mode: 'add', data: null });
  };

  const toggleSetor = (setorId) => {
    setFormUsuario(prev => ({
      ...prev,
      setoresAcesso: prev.setoresAcesso.includes(setorId) ? prev.setoresAcesso.filter(s => s !== setorId) : [...prev.setoresAcesso, setorId]
    }));
  };

  // Handler Delete
  const handleDelete = (type, item) => setModalDelete({ open: true, type, item });

  const handleConfirmDelete = () => {
    if (modalDelete.type === 'Grupo') { deleteGrupo(modalDelete.item.id); showSuccess('Grupo excluido!'); }
    else if (modalDelete.type === 'CNPJ') { deleteCnpj(modalDelete.item.id); showSuccess('CNPJ excluido!'); }
    else if (modalDelete.type === 'Usuario') { deleteUsuario(modalDelete.item.id); showSuccess('Usuario excluido!'); }
    setModalDelete({ open: false, type: null, item: null });
  };

  // Handlers Importacao
  const resetImport = () => {
    setImportStep(1);
    setImportCategory('cadastros');
    setImportType('grupos');
    setImportSetor(null);
    setImportRelatorio(null);
    setImportPreview(null);
    setImportMapping({});
    setSelectedCnpjImport('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;

      // Verificar se e formato Dominio (setor contabil) ou CSV normal
      const isContabilDominio = importCategory === 'setores' && importSetor === 'contabil';

      if (isContabilDominio) {
        // Para relatorios do Dominio, armazenar o conteudo bruto
        // O parser sera aplicado na confirmacao
        const lines = text.split('\n').filter(line => line.trim());

        // Melhor preview para formato Domínio - mostrar primeiras colunas estruturadas
        const previewData = lines.slice(0, 15).map((line, i) => {
          const cols = line.split(';').map(c => c.trim());
          return {
            '#': i + 1,
            'Codigo': cols[0]?.substring(0, 15) || '-',
            'Descricao': cols[1]?.substring(0, 40) || '-',
            'Valor/Info': cols[2]?.substring(0, 20) || cols[3]?.substring(0, 20) || '-'
          };
        });

        setImportPreview({
          headers: ['#', 'Codigo', 'Descricao', 'Valor/Info'],
          data: previewData,
          file: file.name,
          totalRows: lines.length,
          rawContent: text,
          isDominioFormat: true,
          tipoRelatorio: importRelatorio
        });
        setImportStep(3);
      } else {
        // Formato CSV padrao (virgula)
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj = {};
          headers.forEach((h, i) => obj[h] = values[i] || '');
          return obj;
        });

        // Auto-mapping
        const mapping = {};
        const expectedCampos = importCategory === 'setores' && importRelatorio
          ? SETORES_CONFIG[importSetor]?.relatorios.find(r => r.id === importRelatorio)?.campos || []
          : [];

        headers.forEach(h => {
          const lowerH = h.toLowerCase();
          expectedCampos.forEach(campo => {
            if (lowerH.includes(campo.toLowerCase()) || campo.toLowerCase().includes(lowerH)) {
              mapping[campo] = h;
            }
          });
        });

        setImportPreview({ headers, data, file: file.name, totalRows: data.length });
        setImportMapping(mapping);
        setImportStep(3);
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    if (!importPreview) return;

    let count = 0;
    let errorMsg = null;

    if (importCategory === 'cadastros') {
      if (importType === 'grupos') {
        importPreview.data.forEach(row => {
          if (row.nome) { addGrupo({ nome: row.nome, descricao: row.descricao || '' }); count++; }
        });
      } else if (importType === 'cnpjs') {
        importPreview.data.forEach(row => {
          if (row.cnpj && row.razaoSocial) {
            const grupoId = row.grupoId || grupos[0]?.id;
            addCnpj({ cnpj: row.cnpj, razaoSocial: row.razaoSocial, nomeFantasia: row.nomeFantasia || '', tipo: row.tipo || 'Filial', regimeTributario: row.regimeTributario || 'Lucro Real', cidade: row.cidade || '', estado: row.estado || '', grupoId });
            count++;
          }
        });
      } else if (importType === 'usuarios') {
        importPreview.data.forEach(row => {
          if (row.nome && row.email) {
            addUsuario({ nome: row.nome, email: row.email, telefone: row.telefone || '', perfil: row.perfil || 'Visualizador', status: 'Ativo', grupoId: row.grupoId || '', setoresAcesso: row.setores ? row.setores.split(';') : [] });
            count++;
          }
        });
      }
    } else if (importCategory === 'setores' && importSetor === 'contabil' && importPreview.isDominioFormat) {
      // Usar parser especifico do Dominio para setor contabil
      const result = importarRelatorioContabil(selectedCnpjImport, importRelatorio, importPreview.rawContent);

      if (result.success) {
        count = 1;
        showSuccess(`Relatorio ${SETORES_CONFIG.contabil.relatorios.find(r => r.id === importRelatorio)?.nome} importado com sucesso!`);
      } else {
        errorMsg = result.error || 'Erro ao processar arquivo';
      }
    } else {
      // Para outros setores, salvamos no localStorage por enquanto (futuro: Firebase)
      const storageKey = `agili_import_${importSetor}_${importRelatorio}_${selectedCnpjImport}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newData = [...existingData, ...importPreview.data];
      localStorage.setItem(storageKey, JSON.stringify(newData));
      count = importPreview.data.length;
    }

    if (errorMsg) {
      showSuccess(`Erro: ${errorMsg}`);
    } else if (count > 0) {
      showSuccess(`${count} registro(s) importado(s) com sucesso!`);
      setImportStep(4);
    }
  };

  const downloadTemplate = () => {
    let content = '';
    let filename = '';

    if (importCategory === 'cadastros') {
      if (importType === 'grupos') {
        content = 'nome,descricao\nGrupo Exemplo,Descricao do grupo';
        filename = 'template_grupos.csv';
      } else if (importType === 'cnpjs') {
        content = 'cnpj,razaoSocial,nomeFantasia,tipo,regimeTributario,cidade,estado,grupoId\n12.345.678/0001-90,Empresa Ltda,Empresa,Matriz,Lucro Real,Sao Paulo,SP,';
        filename = 'template_cnpjs.csv';
      } else {
        content = 'nome,email,telefone,perfil,grupoId,setores\nJoao Silva,joao@email.com,(11)99999-9999,Visualizador,,contabil;fiscal';
        filename = 'template_usuarios.csv';
      }
    } else if (importSetor && importRelatorio) {
      const relatorio = SETORES_CONFIG[importSetor]?.relatorios.find(r => r.id === importRelatorio);
      if (relatorio) {
        content = relatorio.campos.join(',') + '\n' + relatorio.campos.map(() => 'exemplo').join(',');
        filename = `template_${importSetor}_${importRelatorio}.csv`;
      }
    }

    if (content) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }
  };

  const stats = getStats();

  // Tabs config
  const tabs = [
    { id: 'grupos', label: 'Grupos e CNPJs', icon: FolderTree },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'importacao', label: 'Importacao', icon: Upload },
    { id: 'logs', label: 'Logs', icon: Activity, isLink: true }
  ];

  const getCorClasses = (cor) => {
    const cores = {
      emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
      violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500' },
      amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500' }
    };
    return cores[cor] || cores.blue;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="w-full px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <Logo width={140} height={50} />
          </div>
          <h1 className="text-lg font-bold text-[#0e4f6d] dark:text-cyan-400">Painel Administrativo</h1>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <Check className="w-5 h-5" />{successMessage}
        </div>
      )}

      <main className="w-full px-4 lg:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalGrupos}</p><p className="text-xs text-slate-500">Grupos</p></div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg"><Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" /></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalCnpjs}</p><p className="text-xs text-slate-500">CNPJs</p></div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsuarios}</p><p className="text-xs text-slate-500">Usuarios</p></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.isLink ? window.location.href = '/logs' : setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#0e4f6d] text-[#0e4f6d] dark:text-cyan-400 dark:border-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Grupos */}
          {activeTab === 'grupos' && (
            <div>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Grupos e CNPJs</h2><p className="text-sm text-slate-500">Crie grupos e vincule CNPJs</p></div>
                <button onClick={handleAddGrupo} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560]"><Plus className="w-4 h-4" />Novo Grupo</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {grupos.length === 0 ? (
                  <div className="p-12 text-center">
                    <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">Nenhum grupo cadastrado</p>
                    <button onClick={handleAddGrupo} className="px-4 py-2 bg-[#0e4f6d] text-white rounded-lg">Criar Primeiro Grupo</button>
                  </div>
                ) : grupos.map(grupo => {
                  const cnpjsDoGrupo = getCnpjsByGrupo(grupo.id);
                  const isExpanded = expandedGrupos.includes(grupo.id);
                  return (
                    <div key={grupo.id}>
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button onClick={() => toggleGrupo(grupo.id)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                          </button>
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 dark:text-white truncate">{grupo.nome}</h3>
                            <p className="text-xs text-slate-500">{cnpjsDoGrupo.length} CNPJ(s) | {grupo.descricao || 'Sem descricao'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleAddCnpj(grupo.id)} className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30" title="Adicionar CNPJ"><Plus className="w-4 h-4 text-teal-600" /></button>
                          <button onClick={() => handleEditGrupo(grupo)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                          <button onClick={() => handleDelete('Grupo', grupo)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/50">
                          {cnpjsDoGrupo.length === 0 ? (
                            <div className="p-4 pl-14 text-center">
                              <p className="text-sm text-slate-500 mb-2">Nenhum CNPJ neste grupo</p>
                              <button onClick={() => handleAddCnpj(grupo.id)} className="text-sm text-[#0e4f6d] hover:underline">+ Adicionar CNPJ</button>
                            </div>
                          ) : cnpjsDoGrupo.map(cnpj => (
                            <div key={cnpj.id} className="flex items-center justify-between p-4 pl-14 border-l-4 border-teal-200 dark:border-teal-800 ml-6 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg ${cnpj.tipo === 'Matriz' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
                                  <Building2 className={`w-4 h-4 ${cnpj.tipo === 'Matriz' ? 'text-white' : 'text-teal-600'}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-medium text-slate-800 dark:text-white truncate">{cnpj.nomeFantasia || cnpj.razaoSocial}</h5>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d] text-white' : 'bg-slate-200 text-slate-600'}`}>{cnpj.tipo}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-mono">{cnpj.cnpj}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleEditCnpj(cnpj)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                                <button onClick={() => handleDelete('CNPJ', cnpj)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Usuarios */}
          {activeTab === 'usuarios' && (
            <div>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Usuarios</h2><p className="text-sm text-slate-500">Gerencie usuarios e permissoes por setor</p></div>
                <button onClick={handleAddUsuario} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560]"><Plus className="w-4 h-4" />Novo Usuario</button>
              </div>
              {usuarios.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Nenhum usuario cadastrado</p>
                  <button onClick={handleAddUsuario} className="px-4 py-2 bg-[#0e4f6d] text-white rounded-lg">Criar Primeiro Usuario</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contato</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Grupo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Perfil</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Setores</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {usuarios.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center text-white font-bold text-sm">{user.nome.substring(0, 2).toUpperCase()}</div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">{user.nome}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{user.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</div>
                            {user.telefone && <div className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{user.telefone}</div>}
                          </td>
                          <td className="px-4 py-4"><div className="flex items-center gap-2"><FolderTree className="w-4 h-4 text-amber-500" /><span className="text-sm text-slate-600 dark:text-slate-300">{getGrupoNome(user.grupoId)}</span></div></td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.perfil === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {user.perfil === 'Admin' ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{user.perfil}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(user.setoresAcesso || []).map(setor => (<span key={setor} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded text-xs capitalize">{setor}</span>))}
                              {(!user.setoresAcesso || user.setoresAcesso.length === 0) && <span className="text-xs text-slate-400">Nenhum</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => handleEditUsuario(user)} className="p-2 rounded-lg hover:bg-slate-100"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                            <button onClick={() => handleDelete('Usuario', user)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
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
              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3, 4].map((step, idx) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${importStep >= step ? 'bg-[#0e4f6d] text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {importStep > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    {idx < 3 && <div className={`w-16 h-1 ${importStep > step ? 'bg-[#0e4f6d]' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500">
                  {importStep === 1 && 'Selecione o tipo de importacao'}
                  {importStep === 2 && 'Faca upload do arquivo CSV'}
                  {importStep === 3 && 'Confira os dados antes de importar'}
                  {importStep === 4 && 'Importacao concluida!'}
                </p>
              </div>

              {/* Step 1: Selecao */}
              {importStep === 1 && (
                <div className="max-w-4xl mx-auto">
                  {/* Categoria */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">O que voce deseja importar?</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { setImportCategory('cadastros'); setImportSetor(null); setImportRelatorio(null); }}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${importCategory === 'cadastros' ? 'border-[#0e4f6d] bg-[#0e4f6d]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                        <Database className={`w-8 h-8 mb-3 ${importCategory === 'cadastros' ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                        <h3 className={`font-bold mb-1 ${importCategory === 'cadastros' ? 'text-[#0e4f6d]' : 'text-slate-700 dark:text-slate-300'}`}>Cadastros</h3>
                        <p className="text-sm text-slate-500">Grupos, CNPJs e Usuarios</p>
                      </button>
                      <button onClick={() => { setImportCategory('setores'); setImportType(''); }}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${importCategory === 'setores' ? 'border-[#0e4f6d] bg-[#0e4f6d]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                        <Table className={`w-8 h-8 mb-3 ${importCategory === 'setores' ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                        <h3 className={`font-bold mb-1 ${importCategory === 'setores' ? 'text-[#0e4f6d]' : 'text-slate-700 dark:text-slate-300'}`}>Dados dos Setores</h3>
                        <p className="text-sm text-slate-500">Contabil, Fiscal, Pessoal, Administrativo</p>
                      </button>
                    </div>
                  </div>

                  {/* Se Cadastros */}
                  {importCategory === 'cadastros' && (
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Tipo de cadastro</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[{ id: 'grupos', label: 'Grupos', icon: FolderTree }, { id: 'cnpjs', label: 'CNPJs', icon: Building2 }, { id: 'usuarios', label: 'Usuarios', icon: Users }].map(t => (
                          <button key={t.id} onClick={() => setImportType(t.id)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${importType === t.id ? 'border-[#0e4f6d] bg-[#0e4f6d]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                            <t.icon className={`w-6 h-6 mx-auto mb-2 ${importType === t.id ? 'text-[#0e4f6d]' : 'text-slate-400'}`} />
                            <span className={`font-medium ${importType === t.id ? 'text-[#0e4f6d]' : 'text-slate-600'}`}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Se Setores */}
                  {importCategory === 'setores' && (
                    <>
                      {/* Selecao de Setor */}
                      <div className="mb-8">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Selecione o setor</label>
                        <div className="grid grid-cols-4 gap-4">
                          {Object.values(SETORES_CONFIG).map(setor => {
                            const cores = getCorClasses(setor.cor);
                            return (
                              <button key={setor.id} onClick={() => { setImportSetor(setor.id); setImportRelatorio(null); }}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${importSetor === setor.id ? `${cores.border} ${cores.bg}` : 'border-slate-200 hover:border-slate-300'}`}>
                                <setor.icon className={`w-6 h-6 mx-auto mb-2 ${importSetor === setor.id ? cores.text : 'text-slate-400'}`} />
                                <span className={`font-medium text-sm ${importSetor === setor.id ? cores.text : 'text-slate-600'}`}>{setor.nome}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selecao de Relatorio */}
                      {importSetor && (
                        <div className="mb-8">
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Selecione o tipo de relatorio</label>
                          <div className="grid grid-cols-2 gap-3">
                            {SETORES_CONFIG[importSetor].relatorios.map(rel => (
                              <button key={rel.id} onClick={() => setImportRelatorio(rel.id)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${importRelatorio === rel.id ? 'border-[#0e4f6d] bg-[#0e4f6d]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                                <p className={`font-medium ${importRelatorio === rel.id ? 'text-[#0e4f6d]' : 'text-slate-700 dark:text-slate-300'}`}>{rel.nome}</p>
                                <p className="text-xs text-slate-500 mt-1">{rel.campos.length} campos</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Selecao de CNPJ */}
                      {importSetor && importRelatorio && (
                        <div className="mb-8">
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Para qual CNPJ?</label>
                          <select value={selectedCnpjImport} onChange={(e) => setSelectedCnpjImport(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white">
                            <option value="">Selecione o CNPJ...</option>
                            {cnpjs.map(c => <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial} - {c.cnpj}</option>)}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {/* Botoes */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={downloadTemplate} disabled={importCategory === 'setores' && (!importSetor || !importRelatorio)}
                      className="flex items-center gap-2 px-4 py-2 text-[#0e4f6d] border border-[#0e4f6d] rounded-lg hover:bg-[#0e4f6d]/5 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Download className="w-4 h-4" />Baixar Template
                    </button>
                    <button onClick={() => setImportStep(2)}
                      disabled={(importCategory === 'cadastros' && !importType) || (importCategory === 'setores' && (!importSetor || !importRelatorio || !selectedCnpjImport))}
                      className="flex items-center gap-2 px-6 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50 disabled:cursor-not-allowed">
                      Continuar<ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Upload */}
              {importStep === 2 && (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Importando:</strong> {importCategory === 'cadastros' ? importType.charAt(0).toUpperCase() + importType.slice(1) : `${SETORES_CONFIG[importSetor]?.nome} - ${SETORES_CONFIG[importSetor]?.relatorios.find(r => r.id === importRelatorio)?.nome}`}
                    </p>
                  </div>

                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center hover:border-[#0e4f6d] transition-colors cursor-pointer">
                    <FileSpreadsheet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Clique para selecionar o arquivo CSV</p>
                    <p className="text-sm text-slate-500">ou arraste e solte aqui</p>
                    <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                  </div>

                  <div className="flex justify-between mt-6">
                    <button onClick={() => setImportStep(1)} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                      <ChevronLeft className="w-4 h-4" />Voltar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {importStep === 3 && importPreview && (
                <div className="max-w-6xl mx-auto">
                  {/* Info do arquivo */}
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">{importPreview.file}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {importPreview.totalRows} linha(s) no arquivo
                        {importPreview.isDominioFormat && ` - Formato Domínio (${importPreview.tipoRelatorio})`}
                      </p>
                    </div>
                  </div>

                  {/* Info especial para formato Domínio */}
                  {importPreview.isDominioFormat && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Relatório do Sistema Domínio</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            {importPreview.tipoRelatorio === 'balancete' && 'O Balancete Mensal será processado para extrair: Receitas, Custos, Estoques, Movimentação Bancária e Aplicações Financeiras.'}
                            {importPreview.tipoRelatorio === 'analiseHorizontal' && 'A Análise Horizontal (DRE) será processada para extrair: Receita Bruta, Despesas Operacionais e Lucro por mês.'}
                            {importPreview.tipoRelatorio === 'dreComparativa' && 'A DRE Comparativa será processada para comparação entre anos.'}
                            {importPreview.tipoRelatorio === 'dreMensal' && 'A DRE Mensal será processada para análise mensal detalhada.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview da tabela */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        Preview dos dados (primeiras {Math.min(10, importPreview.data.length)} linhas)
                      </h3>
                    </div>
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-700">#</th>
                            {importPreview.headers.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {importPreview.data.slice(0, 10).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                              <td className="px-3 py-2 text-slate-400 border-r border-slate-200 dark:border-slate-700">{i + 1}</td>
                              {importPreview.headers.map((h, j) => (
                                <td key={j} className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row[h] || <span className="text-slate-400">-</span>}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importPreview.totalRows > 10 && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-sm text-slate-500">... e mais {importPreview.totalRows - 10} registro(s)</p>
                      </div>
                    )}
                  </div>

                  {/* Alerta */}
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">Revise os dados antes de confirmar</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">Os dados serao importados para o sistema. Esta acao pode ser desfeita apenas manualmente.</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button onClick={() => { setImportPreview(null); setImportStep(2); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                      <ChevronLeft className="w-4 h-4" />Voltar
                    </button>
                    <button onClick={handleImportConfirm}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      <Upload className="w-4 h-4" />Confirmar Importacao ({importPreview.totalRows} registros)
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Sucesso */}
              {importStep === 4 && (
                <div className="max-w-lg mx-auto text-center py-12">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Importacao Concluida!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">Os dados foram importados com sucesso para o sistema.</p>
                  <button onClick={resetImport} className="px-6 py-3 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560]">
                    Nova Importacao
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modais */}
      {/* Modal Grupo */}
      {modalGrupo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{modalGrupo.mode === 'add' ? 'Novo Grupo' : 'Editar Grupo'}</h2>
              <button onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                <input type="text" value={formGrupo.nome} onChange={(e) => setFormGrupo({ ...formGrupo, nome: e.target.value })} placeholder="Nome do grupo" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#0e4f6d]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
                <textarea value={formGrupo.descricao} onChange={(e) => setFormGrupo({ ...formGrupo, descricao: e.target.value })} placeholder="Descricao..." rows={3} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveGrupo} disabled={!formGrupo.nome.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50"><Save className="w-4 h-4" />Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CNPJ */}
      {modalCnpj.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{modalCnpj.mode === 'add' ? 'Novo CNPJ' : 'Editar CNPJ'}</h2>
              <button onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ *</label><input type="text" value={formCnpj.cnpj} onChange={(e) => setFormCnpj({ ...formCnpj, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razao Social *</label><input type="text" value={formCnpj.razaoSocial} onChange={(e) => setFormCnpj({ ...formCnpj, razaoSocial: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Fantasia</label><input type="text" value={formCnpj.nomeFantasia} onChange={(e) => setFormCnpj({ ...formCnpj, nomeFantasia: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label><select value={formCnpj.tipo} onChange={(e) => setFormCnpj({ ...formCnpj, tipo: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none"><option value="Matriz">Matriz</option><option value="Filial">Filial</option></select></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Regime Tributario</label><select value={formCnpj.regimeTributario} onChange={(e) => setFormCnpj({ ...formCnpj, regimeTributario: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none"><option value="Lucro Real">Lucro Real</option><option value="Lucro Presumido">Lucro Presumido</option><option value="Simples Nacional">Simples Nacional</option></select></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label><input type="text" value={formCnpj.cidade} onChange={(e) => setFormCnpj({ ...formCnpj, cidade: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label><select value={formCnpj.estado} onChange={(e) => setFormCnpj({ ...formCnpj, estado: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none"><option value="">Selecione...</option>{['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}</select></div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveCnpj} disabled={!formCnpj.cnpj.trim() || !formCnpj.razaoSocial.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50"><Save className="w-4 h-4" />Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usuario */}
      {modalUsuario.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{modalUsuario.mode === 'add' ? 'Novo Usuario' : 'Editar Usuario'}</h2>
              <button onClick={() => setModalUsuario({ open: false, mode: 'add', data: null })} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label><input type="text" value={formUsuario.nome} onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label><input type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label><input type="tel" value={formUsuario.telefone} onChange={(e) => setFormUsuario({ ...formUsuario, telefone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grupo</label><select value={formUsuario.grupoId} onChange={(e) => setFormUsuario({ ...formUsuario, grupoId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none"><option value="">Selecione...</option>{grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Perfil</label>
                <div className="grid grid-cols-2 gap-4">
                  {[{ v: 'Admin', l: 'Administrador', d: 'Acesso total', i: Shield }, { v: 'Visualizador', l: 'Visualizador', d: 'Apenas visualizacao', i: Eye }].map(p => (
                    <button key={p.v} onClick={() => setFormUsuario({ ...formUsuario, perfil: p.v })} className={`p-4 rounded-xl border-2 text-left ${formUsuario.perfil === p.v ? 'border-[#0e4f6d] bg-[#0e4f6d]/5' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-1"><p.i className={`w-4 h-4 ${formUsuario.perfil === p.v ? 'text-[#0e4f6d]' : 'text-slate-400'}`} /><span className={`font-medium ${formUsuario.perfil === p.v ? 'text-[#0e4f6d]' : 'text-slate-700'}`}>{p.l}</span></div>
                      <p className="text-xs text-slate-500">{p.d}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Setores com Acesso</label>
                <div className="grid grid-cols-4 gap-3">
                  {setoresDisponiveis.map(setor => (
                    <button key={setor.id} onClick={() => toggleSetor(setor.id)} className={`p-3 rounded-lg border text-center ${formUsuario.setoresAcesso.includes(setor.id) ? 'border-[#0e4f6d] bg-[#0e4f6d] text-white' : 'border-slate-200 text-slate-600 hover:border-[#0e4f6d]'}`}>
                      <span className="text-sm font-medium">{setor.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalUsuario({ open: false, mode: 'add', data: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveUsuario} disabled={!formUsuario.nome.trim() || !formUsuario.email.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] disabled:opacity-50"><Save className="w-4 h-4" />Salvar</button>
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
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Confirmar Exclusao</h2><p className="text-sm text-slate-500">Esta acao nao pode ser desfeita.</p></div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-sm text-slate-600">Excluir {modalDelete.type?.toLowerCase()}: <strong>{modalDelete.item?.nome || modalDelete.item?.nomeFantasia || modalDelete.item?.razaoSocial}</strong></p>
                {modalDelete.type === 'Grupo' && <p className="text-xs text-red-500 mt-2">Todos os CNPJs e usuarios deste grupo serao excluidos!</p>}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalDelete({ open: false, type: null, item: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleConfirmDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 className="w-4 h-4" />Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
