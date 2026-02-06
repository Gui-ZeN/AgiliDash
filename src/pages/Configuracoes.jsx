import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Building2, FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown,
  X, AlertTriangle, Save, Check, Users, Upload, FileSpreadsheet, Shield, Eye,
  Mail, Phone, Download, Activity, Calculator, FileText, Briefcase, Scale,
  ChevronLeft, Database, Table, AlertCircle, CheckCircle2, TrendingUp, TrendingDown
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import {
  parseAnaliseHorizontal, parseBalancete, parseDREComparativa, parseDREMensal,
  parseContribuicaoSocial, parseImpostoRenda, parseDemonstrativoFinanceiro,
  parseDemonstrativoMensal, parseResumoImpostos, parseResumoPorAcumulador,
  // Parsers do Setor Pessoal
  parseDemonstrativoFGTS, parseFolhaINSS, parseRelacaoEmpregados,
  parseSalarioBase, parseProgramacaoFerias
} from '../utils/dominioParser';
import { formatCurrency } from '../utils/formatters';

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
      { id: 'csll', nome: 'Contribuicao Social (CSLL)', descricao: 'Exportar do Dominio: Relatorios > Fiscal > Livro de Apuracao do Lucro Real > Contribuicao Social (trimestral)', formato: 'dominio' },
      { id: 'irpj', nome: 'Imposto de Renda (IRPJ)', descricao: 'Exportar do Dominio: Relatorios > Fiscal > Livro de Apuracao do Lucro Real > Imposto de Renda (trimestral)', formato: 'dominio' },
      { id: 'faturamento', nome: 'Demonstrativo Financeiro', descricao: 'Exportar do Dominio: Relatorios > Fiscal > Faturamento > Demonstrativo Financeiro', formato: 'dominio' },
      { id: 'demonstrativoMensal', nome: 'Demonstrativo Mensal', descricao: 'Exportar do Dominio: Relatorios > Fiscal > Demonstrativo Mensal de Entradas e Saidas', formato: 'dominio' },
      { id: 'resumoImpostos', nome: 'Resumo dos Impostos', descricao: 'Exportar do Dominio: Relatorios > Fiscal > Resumo dos Impostos por Periodo', formato: 'dominio' },
      { id: 'resumoAcumulador', nome: 'Resumo por Acumulador', descricao: 'Exportar do Dominio: Relatorios > Fiscal > Resumo por Acumulador', formato: 'dominio' }
    ]
  },
  pessoal: {
    id: 'pessoal',
    nome: 'Pessoal',
    icon: Users,
    cor: 'violet',
    relatorios: [
      { id: 'fgts', nome: 'Demonstrativo FGTS', descricao: 'Exportar do Dominio: Relatorios > Pessoal > Demonstrativo FGTS Folha e e-Social', formato: 'dominio' },
      { id: 'inss', nome: 'Folha de INSS', descricao: 'Exportar do Dominio: Relatorios > Pessoal > Folha de INSS', formato: 'dominio' },
      { id: 'empregados', nome: 'Relacao de Empregados', descricao: 'Exportar do Dominio: Relatorios > Pessoal > Relacao de Empregados', formato: 'dominio' },
      { id: 'salarioBase', nome: 'Salario Base', descricao: 'Exportar do Dominio: Relatorios > Pessoal > Salario Base', formato: 'dominio' },
      { id: 'ferias', nome: 'Programacao de Ferias', descricao: 'Exportar do Dominio: Relatorios > Pessoal > Programacao de Ferias', formato: 'dominio' }
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
    getCnpjsByGrupo, getStats, setoresDisponiveis, importarRelatorioContabil, importarRelatorioFiscal,
    importarRelatorioPessoal
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
  const [selectedTrimestre, setSelectedTrimestre] = useState('1'); // Para CSLL/IRPJ

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
    setSelectedTrimestre('1');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Verificar se relatorio eh trimestral (CSLL ou IRPJ)
  const isRelatorioTrimestral = importRelatorio === 'csll' || importRelatorio === 'irpj';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;

      // Verificar se e formato Dominio (setor contabil, fiscal ou pessoal) ou CSV normal
      const isDominioFormat = importCategory === 'setores' && (importSetor === 'contabil' || importSetor === 'fiscal' || importSetor === 'pessoal');

      if (isDominioFormat) {
        // Para relatórios do Domínio, parsear os dados imediatamente para preview inteligente
        let dadosParsed = null;
        let parseError = null;

        try {
          // Parsers do setor Contábil
          if (importSetor === 'contabil') {
            switch (importRelatorio) {
              case 'analiseHorizontal':
                dadosParsed = parseAnaliseHorizontal(text);
                break;
              case 'balancete':
                dadosParsed = parseBalancete(text);
                break;
              case 'dreComparativa':
                dadosParsed = parseDREComparativa(text);
                break;
              case 'dreMensal':
                dadosParsed = parseDREMensal(text);
                break;
              default:
                parseError = 'Tipo de relatorio contabil nao reconhecido';
            }
          }
          // Parsers do setor Fiscal
          else if (importSetor === 'fiscal') {
            switch (importRelatorio) {
              case 'csll':
                dadosParsed = parseContribuicaoSocial(text);
                break;
              case 'irpj':
                dadosParsed = parseImpostoRenda(text);
                break;
              case 'faturamento':
                dadosParsed = parseDemonstrativoFinanceiro(text);
                break;
              case 'demonstrativoMensal':
                dadosParsed = parseDemonstrativoMensal(text);
                break;
              case 'resumoImpostos':
                dadosParsed = parseResumoImpostos(text);
                break;
              case 'resumoAcumulador':
                dadosParsed = parseResumoPorAcumulador(text);
                break;
              default:
                parseError = 'Tipo de relatorio fiscal nao reconhecido';
            }
          }
          // Parsers do setor Pessoal
          else if (importSetor === 'pessoal') {
            switch (importRelatorio) {
              case 'fgts':
                dadosParsed = parseDemonstrativoFGTS(text);
                break;
              case 'inss':
                dadosParsed = parseFolhaINSS(text);
                break;
              case 'empregados':
                dadosParsed = parseRelacaoEmpregados(text);
                break;
              case 'salarioBase':
                dadosParsed = parseSalarioBase(text);
                break;
              case 'ferias':
                dadosParsed = parseProgramacaoFerias(text);
                break;
              default:
                parseError = 'Tipo de relatorio pessoal nao reconhecido';
            }
          }
        } catch (err) {
          parseError = err.message;
          console.error('Erro ao parsear arquivo:', err);
        }

        const lines = text.split('\n').filter(line => line.trim());

        setImportPreview({
          file: file.name,
          totalRows: lines.length,
          rawContent: text,
          isDominioFormat: true,
          tipoRelatorio: importRelatorio,
          setorRelatorio: importSetor,
          dadosParsed,
          parseError,
          trimestreSelecionado: (importRelatorio === 'csll' || importRelatorio === 'irpj') ? selectedTrimestre : null
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
    } else if (importCategory === 'setores' && importPreview.isDominioFormat) {
      // Usar parser especifico do Dominio para setor contabil, fiscal ou pessoal
      let result;

      if (importSetor === 'contabil') {
        result = importarRelatorioContabil(selectedCnpjImport, importRelatorio, importPreview.rawContent);
      } else if (importSetor === 'fiscal') {
        // Passar trimestre selecionado para CSLL e IRPJ
        const opcoes = (importRelatorio === 'csll' || importRelatorio === 'irpj')
          ? { trimestre: importPreview.trimestreSelecionado || selectedTrimestre }
          : {};
        result = importarRelatorioFiscal(selectedCnpjImport, importRelatorio, importPreview.rawContent, opcoes);
      } else if (importSetor === 'pessoal') {
        result = importarRelatorioPessoal(selectedCnpjImport, importRelatorio, importPreview.rawContent);
      }

      if (result?.success) {
        count = 1;
        const relatorioNome = SETORES_CONFIG[importSetor]?.relatorios.find(r => r.id === importRelatorio)?.nome || importRelatorio;
        const trimestreMsg = (importRelatorio === 'csll' || importRelatorio === 'irpj')
          ? ` (${selectedTrimestre}o Trimestre)`
          : '';
        showSuccess(`Relatorio ${relatorioNome}${trimestreMsg} importado com sucesso!`);
      } else {
        errorMsg = result?.error || 'Erro ao processar arquivo';
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
        // Formato Domínio não precisa de template - é exportado do sistema
        if (relatorio.formato === 'dominio') {
          showSuccess('Para este relatório, exporte diretamente do Sistema Domínio. Não há template para download.');
          return;
        }
        if (relatorio.campos) {
          content = relatorio.campos.join(',') + '\n' + relatorio.campos.map(() => 'exemplo').join(',');
          filename = `template_${importSetor}_${importRelatorio}.csv`;
        }
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
      emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-700', border: 'border-emerald-700' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
      violet: { bg: 'bg-violet-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-500', border: 'border-slate-600' },
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
          <h1 className="text-lg font-bold text-[#0e4f6d] dark:text-teal-500">Painel Administrativo</h1>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2 animate-pulse">
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
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#0e4f6d] text-[#0e4f6d] dark:text-teal-500 dark:border-teal-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Grupos */}
          {activeTab === 'grupos' && (
            <div>
              {/* Guia Rápido - aparece quando há poucos grupos ou CNPJs */}
              {grupos.length <= 1 && (
                <div className="m-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Como organizar seus dados</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Siga estes passos para configurar corretamente:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                          <span className="text-blue-800 dark:text-blue-200"><strong>Crie um Grupo</strong> - agrupe empresas relacionadas (ex: "Holding XYZ")</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                          <span className="text-blue-800 dark:text-blue-200"><strong>Adicione CNPJs ao Grupo</strong> - clique no botão verde dentro do grupo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                          <span className="text-blue-800 dark:text-blue-200"><strong>Importe Relatórios</strong> - vá na aba "Importar Dados" para enviar CSVs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Grupos e CNPJs</h2><p className="text-sm text-slate-500">Organize suas empresas em grupos para melhor gestão</p></div>
                <button onClick={handleAddGrupo} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"><Plus className="w-4 h-4" />Criar Novo Grupo</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {grupos.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderTree className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Comece criando um Grupo</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Grupos servem para organizar empresas relacionadas. Por exemplo: "Grupo ABC" pode conter a matriz e todas as filiais.</p>
                    <button onClick={handleAddGrupo} className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
                      <Plus className="w-4 h-4 inline mr-2" />Criar Primeiro Grupo
                    </button>
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
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAddCnpj(grupo.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Adicionar CNPJ</span>
                          </button>
                          <button onClick={() => handleEditGrupo(grupo)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar grupo"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                          <button onClick={() => handleDelete('Grupo', grupo)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" title="Excluir grupo"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="bg-slate-50/50 dark:bg-slate-900/50">
                          {cnpjsDoGrupo.length === 0 ? (
                            <div className="p-6 ml-6 border-l-4 border-dashed border-slate-200 dark:border-slate-700">
                              <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">Este grupo ainda não tem CNPJs</p>
                                  <p className="text-sm text-slate-500 mb-3">Adicione os CNPJs das empresas que pertencem a este grupo.</p>
                                  <button
                                    onClick={() => handleAddCnpj(grupo.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                                  >
                                    <Building2 className="w-4 h-4" />
                                    Cadastrar Primeiro CNPJ
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : cnpjsDoGrupo.map(cnpj => (
                            <div key={cnpj.id} className="flex items-center justify-between p-4 pl-14 border-l-4 border-teal-200 dark:border-teal-800 ml-6 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d]' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
                                  <Building2 className={`w-4 h-4 ${cnpj.tipo === 'Matriz' ? 'text-white' : 'text-teal-600'}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-medium text-slate-800 dark:text-white truncate">{cnpj.nomeFantasia || cnpj.razaoSocial}</h5>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d] text-white' : 'bg-slate-200 text-slate-600'}`}>{cnpj.tipo}</span>
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
                              <div className="w-10 h-10 rounded-full bg-[#0e4f6d] flex items-center justify-center text-white font-bold text-sm">{user.nome.substring(0, 2).toUpperCase()}</div>
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
                                <p className="text-xs text-slate-500 mt-1">
                                  {rel.formato === 'dominio' ? 'Formato Domínio' : `${rel.campos?.length || 0} campos`}
                                </p>
                                {rel.descricao && <p className="text-xs text-slate-400 mt-1 truncate">{rel.descricao}</p>}
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

                  {/* Seletor de Trimestre para CSLL e IRPJ */}
                  {isRelatorioTrimestral && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                      <label className="block text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                        Selecione o Trimestre do Relatorio
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { value: '1', label: '1o Tri', desc: 'Jan-Mar' },
                          { value: '2', label: '2o Tri', desc: 'Abr-Jun' },
                          { value: '3', label: '3o Tri', desc: 'Jul-Set' },
                          { value: '4', label: '4o Tri', desc: 'Out-Dez' }
                        ].map(tri => (
                          <button
                            key={tri.value}
                            onClick={() => setSelectedTrimestre(tri.value)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              selectedTrimestre === tri.value
                                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50'
                                : 'border-slate-200 dark:border-slate-600 hover:border-blue-300'
                            }`}
                          >
                            <p className={`font-bold ${selectedTrimestre === tri.value ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                              {tri.label}
                            </p>
                            <p className={`text-xs ${selectedTrimestre === tri.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                              {tri.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                        O Dominio exporta mes sequencial (jan, fev, mar, abr). Selecione o trimestre correto manualmente.
                      </p>
                    </div>
                  )}

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
                    <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">{importPreview.file}</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-700">
                        {importPreview.totalRows} linha(s) no arquivo
                        {importPreview.isDominioFormat && ` - Formato Domínio`}
                      </p>
                    </div>
                  </div>

                  {/* Erro de parse */}
                  {importPreview.parseError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-300">Erro ao processar arquivo</p>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{importPreview.parseError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview INTELIGENTE para Domínio - Análise Horizontal */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'analiseHorizontal' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      {/* Cards de Totais */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 opacity-80" />
                            <span className="text-sm opacity-80">Total Receitas (positivos)</span>
                          </div>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totais?.totalReceitas || 0)}</p>
                        </div>
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-5 h-5 opacity-80" />
                            <span className="text-sm opacity-80">Total Despesas (negativos)</span>
                          </div>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totais?.totalDespesas || 0)}</p>
                        </div>
                        <div className={`${(importPreview.dadosParsed.totais?.lucroLiquido || 0) >= 0 ? 'bg-slate-700' : 'bg-orange-600'} p-4 rounded-xl text-white`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="w-5 h-5 opacity-80" />
                            <span className="text-sm opacity-80">Resultado Líquido</span>
                          </div>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totais?.lucroLiquido || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5 opacity-80" />
                            <span className="text-sm opacity-80">Competência</span>
                          </div>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.competencia || '-'}</p>
                        </div>
                      </div>

                      {/* Tabela Mensal */}
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-800 dark:text-white">Dados Mensais Extraídos</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 sticky left-0 bg-slate-100 dark:bg-slate-800">Mês</th>
                                {importPreview.dadosParsed.meses?.map((mes, i) => (
                                  <th key={i} className="px-3 py-2 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">{mes}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              <tr className="bg-green-50 dark:bg-green-900/10">
                                <td className="px-3 py-2 font-medium text-green-700 dark:text-green-400 sticky left-0 bg-green-50 dark:bg-green-900/10">Receita Bruta</td>
                                {importPreview.dadosParsed.dados?.receitaBruta?.map((val, i) => (
                                  <td key={i} className="px-3 py-2 text-right text-green-600 dark:text-green-400 whitespace-nowrap">{formatCurrency(val)}</td>
                                ))}
                              </tr>
                              <tr className="bg-red-50 dark:bg-red-900/10">
                                <td className="px-3 py-2 font-medium text-red-700 dark:text-red-400 sticky left-0 bg-red-50 dark:bg-red-900/10">Despesas Operacionais</td>
                                {importPreview.dadosParsed.dados?.despesasOperacionais?.map((val, i) => (
                                  <td key={i} className="px-3 py-2 text-right text-red-600 dark:text-red-400 whitespace-nowrap">{formatCurrency(Math.abs(val))}</td>
                                ))}
                              </tr>
                              <tr className="bg-blue-50 dark:bg-blue-900/10">
                                <td className="px-3 py-2 font-medium text-blue-700 dark:text-blue-400 sticky left-0 bg-blue-50 dark:bg-blue-900/10">Lucro Bruto</td>
                                {importPreview.dadosParsed.dados?.lucroBruto?.map((val, i) => (
                                  <td key={i} className={`px-3 py-2 text-right whitespace-nowrap ${val >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(val)}</td>
                                ))}
                              </tr>
                              <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                                <td className="px-3 py-2 font-bold text-slate-800 dark:text-white sticky left-0 bg-slate-50 dark:bg-slate-800/50">Resultado Líquido</td>
                                {importPreview.dadosParsed.dados?.resultadoLiquido?.map((val, i) => (
                                  <td key={i} className={`px-3 py-2 text-right whitespace-nowrap font-bold ${val >= 0 ? 'text-emerald-700 dark:text-emerald-700' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(val)}</td>
                                ))}
                              </tr>
                              {/* Separador */}
                              <tr className="bg-slate-200 dark:bg-slate-700">
                                <td colSpan={13} className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Classificação Automática (positivo = receita, negativo = despesa)</td>
                              </tr>
                              <tr className="bg-emerald-50 dark:bg-emerald-900/10">
                                <td className="px-3 py-2 font-medium text-emerald-700 dark:text-emerald-700 sticky left-0 bg-emerald-50 dark:bg-emerald-900/10">Total Receitas (+)</td>
                                {importPreview.dadosParsed.receitasMensais?.map((val, i) => (
                                  <td key={i} className="px-3 py-2 text-right text-emerald-700 dark:text-emerald-700 whitespace-nowrap font-medium">{formatCurrency(val)}</td>
                                ))}
                              </tr>
                              <tr className="bg-red-50 dark:bg-red-900/10">
                                <td className="px-3 py-2 font-medium text-rose-700 dark:text-red-500 sticky left-0 bg-red-50 dark:bg-red-900/10">Total Despesas (-)</td>
                                {importPreview.dadosParsed.despesasMensais?.map((val, i) => (
                                  <td key={i} className="px-3 py-2 text-right text-rose-600 dark:text-red-500 whitespace-nowrap font-medium">{formatCurrency(val)}</td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview para Balancete */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'balancete' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-teal-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Bancos Conta Movimento</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.bancosMovimento?.saldoAtual || 0)}</p>
                        </div>
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Aplicações Financeiras</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.aplicacoesFinanceiras?.saldoAtual || 0)}</p>
                        </div>
                        <div className="bg-amber-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Estoque</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.estoque?.saldoAtual || 0)}</p>
                        </div>
                      </div>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-800 dark:text-white">Contas Extraídas ({importPreview.dadosParsed.contas?.length || 0} contas)</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Classificação</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Descrição</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Saldo Atual</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {importPreview.dadosParsed.contas?.slice(0, 20).map((conta, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{conta.classificacao}</td>
                                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{conta.descricao}</td>
                                  <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(conta.saldoAtual)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview para DRE Comparativa */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'dreComparativa' && importPreview.dadosParsed && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Comparativo Anual</h3>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Descrição</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Ano Atual</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Ano Anterior</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {['receitaBruta', 'despesasOperacionais', 'lucroBruto', 'resultadoLiquido'].map(key => (
                            <tr key={key}>
                              <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td>
                              <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{formatCurrency(importPreview.dadosParsed.dados?.anoAtual?.[key] || 0)}</td>
                              <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{formatCurrency(importPreview.dadosParsed.dados?.anoAnterior?.[key] || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Preview para DRE Mensal */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'dreMensal' && importPreview.dadosParsed && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white">DRE do Período - {importPreview.dadosParsed.periodo}</h3>
                      </div>
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {Object.entries(importPreview.dadosParsed.dados || {}).map(([key, value]) => (
                            <tr key={key}>
                              <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td>
                              <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{formatCurrency(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ===== PREVIEWS FISCAIS ===== */}

                  {/* Preview CSLL */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'csll' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                          Trimestre Selecionado: {selectedTrimestre}o Trimestre
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Arquivo indica: {importPreview.dadosParsed.trimestre || 'Nao identificado'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Base de Calculo</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.baseCalculo || 0)}</p>
                        </div>
                        <div className="bg-amber-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">CSLL Devida (9%)</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.csllDevida || 0)}</p>
                        </div>
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">CSLL a Recolher</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.csllRecolher || 0)}</p>
                        </div>
                      </div>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            <tr><td className="px-4 py-2 text-slate-600 dark:text-slate-400">Lucro Liquido antes da CSLL</td><td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-white">{formatCurrency(importPreview.dadosParsed.dados?.lucroLiquido || 0)}</td></tr>
                            <tr><td className="px-4 py-2 text-slate-600 dark:text-slate-400">(-) Compensacao</td><td className="px-4 py-2 text-right font-medium text-red-600">{formatCurrency(importPreview.dadosParsed.dados?.compensacao || 0)}</td></tr>
                            <tr><td className="px-4 py-2 text-slate-600 dark:text-slate-400">Valor a compensar proximo periodo</td><td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-white">{formatCurrency(importPreview.dadosParsed.dados?.valorCompensarProximo || 0)}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Preview IRPJ */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'irpj' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                          Trimestre Selecionado: {selectedTrimestre}o Trimestre
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Arquivo indica: {importPreview.dadosParsed.trimestre || 'Nao identificado'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Base de Calculo</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.baseCalculo || 0)}</p>
                        </div>
                        <div className="bg-amber-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">IRPJ (15%)</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.irpjDevido || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Adicional (10%)</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.adicionalIR || 0)}</p>
                        </div>
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">IRPJ a Recolher</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.dados?.irpjRecolher || 0)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Demonstrativo Mensal */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'demonstrativoMensal' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      {/* Cards de Totais Gerais */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Entradas</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totaisGerais?.entradas || 0)}</p>
                        </div>
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Saidas</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totaisGerais?.saidas || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Servicos</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totaisGerais?.servicos || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Periodos</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.movimentacao?.length || 0} meses</p>
                          <p className="text-xs opacity-70">{importPreview.dadosParsed.anosUnicos?.join(', ')}</p>
                        </div>
                      </div>

                      {/* Totais por Ano */}
                      {importPreview.dadosParsed.anosUnicos?.length > 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {importPreview.dadosParsed.anosUnicos?.map(ano => (
                            <div key={ano} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{ano}</h4>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Entradas</p>
                                  <p className="font-semibold text-green-600">{formatCurrency(importPreview.dadosParsed.totaisPorAno?.[ano]?.entradas || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Saidas</p>
                                  <p className="font-semibold text-red-600">{formatCurrency(importPreview.dadosParsed.totaisPorAno?.[ano]?.saidas || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Servicos</p>
                                  <p className="font-semibold text-blue-600">{formatCurrency(importPreview.dadosParsed.totaisPorAno?.[ano]?.servicos || 0)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tabela de Movimentacao */}
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-800 dark:text-white">Movimentacao Mensal Completa</h3>
                        </div>
                        <div className="overflow-x-auto max-h-72">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Mes</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">Ano</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Entradas</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Saidas</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Servicos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {importPreview.dadosParsed.movimentacao?.map((m, i) => (
                                <tr key={i} className={m.ano !== importPreview.dadosParsed.movimentacao[i-1]?.ano ? 'border-t-2 border-slate-300 dark:border-slate-600' : ''}>
                                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{m.mes}</td>
                                  <td className="px-3 py-2 text-center text-slate-500">{m.ano}</td>
                                  <td className="px-3 py-2 text-right text-green-600">{formatCurrency(m.entradas)}</td>
                                  <td className="px-3 py-2 text-right text-red-600">{formatCurrency(m.saidas)}</td>
                                  <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(m.servicos)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Resumo dos Impostos */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'resumoImpostos' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      {/* Cards de Resumo */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Impostos a Recolher</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(Object.values(importPreview.dadosParsed.totaisPorImposto || {}).reduce((acc, i) => acc + (i.recolher || 0), 0))}
                          </p>
                        </div>
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Saldo Credor</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(Object.values(importPreview.dadosParsed.totaisPorImposto || {}).reduce((acc, i) => acc + (i.credito || 0), 0))}
                          </p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Periodos Importados</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.periodosImportados || Object.keys(importPreview.dadosParsed.impostosPorMes || {}).length} meses</p>
                        </div>
                      </div>

                      {/* Tabela de Totais por Imposto */}
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-800 dark:text-white">Totais por Tipo de Imposto (Ano)</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Imposto</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Debitos</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Creditos</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">A Recolher</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Saldo Credor</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {Object.entries(importPreview.dadosParsed.totaisPorImposto || {}).map(([nome, valores]) => (
                                <tr key={nome}>
                                  <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{nome}</td>
                                  <td className="px-4 py-2 text-right text-orange-600">{formatCurrency(valores.debitos || 0)}</td>
                                  <td className="px-4 py-2 text-right text-blue-600">{formatCurrency(valores.creditos || 0)}</td>
                                  <td className="px-4 py-2 text-right text-red-600 font-semibold">{formatCurrency(valores.recolher || 0)}</td>
                                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(valores.credito || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Detalhamento por Mes */}
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-800 dark:text-white">Detalhamento por Mes</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {Object.entries(importPreview.dadosParsed.impostosPorMes || {}).sort().map(([mes, dados]) => (
                            <details key={mes} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                              <summary className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-center">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {mes} - {dados.impostos?.length || 0} impostos
                                </span>
                                <span className="text-sm text-red-600 font-semibold">
                                  A Recolher: {formatCurrency(dados.impostos?.reduce((acc, i) => acc + (i.impostoRecolher || 0), 0) || 0)}
                                </span>
                              </summary>
                              <div className="px-4 pb-3 bg-slate-50/50 dark:bg-slate-900/30">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-slate-500">
                                      <th className="py-1 text-left">Imposto</th>
                                      <th className="py-1 text-right">Saldo Ant.</th>
                                      <th className="py-1 text-right">Debitos</th>
                                      <th className="py-1 text-right">Creditos</th>
                                      <th className="py-1 text-right">A Recolher</th>
                                      <th className="py-1 text-right">Saldo Cred.</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(dados.impostos || []).map((imp, idx) => (
                                      <tr key={idx} className="border-t border-slate-100 dark:border-slate-700">
                                        <td className="py-1 text-slate-700 dark:text-slate-300">{imp.nome}</td>
                                        <td className="py-1 text-right text-slate-600">{formatCurrency(imp.saldoCredorAnterior || 0)}</td>
                                        <td className="py-1 text-right text-orange-600">{formatCurrency(imp.debitos || 0)}</td>
                                        <td className="py-1 text-right text-blue-600">{formatCurrency(imp.creditos || 0)}</td>
                                        <td className="py-1 text-right text-red-600 font-semibold">{formatCurrency(imp.impostoRecolher || 0)}</td>
                                        <td className="py-1 text-right text-green-600">{formatCurrency(imp.saldoCredorFinal || 0)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Resumo por Acumulador */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'resumoAcumulador' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Entradas</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totais?.entradas || 0)}</p>
                        </div>
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Saidas</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totais?.saidas || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Compra Comercializacao</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.categorias?.compraComercializacao || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Venda Mercadoria</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.categorias?.vendaMercadoria || 0)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Calculo 380</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-amber-600 dark:text-amber-400">Esperado (Compra x 1.25)</p>
                            <p className="font-bold text-amber-800 dark:text-amber-200">{formatCurrency(importPreview.dadosParsed.categorias?.esperado380 || 0)}</p>
                          </div>
                          <div>
                            <p className="text-amber-600 dark:text-amber-400">Vendido</p>
                            <p className="font-bold text-amber-800 dark:text-amber-200">{formatCurrency(importPreview.dadosParsed.categorias?.vendaMercadoria || 0)}</p>
                          </div>
                          <div>
                            <p className="text-amber-600 dark:text-amber-400">Situacao</p>
                            <p className={`font-bold ${(importPreview.dadosParsed.categorias?.vendaMercadoria || 0) >= (importPreview.dadosParsed.categorias?.esperado380 || 0) ? 'text-green-600' : 'text-red-600'}`}>
                              {(importPreview.dadosParsed.categorias?.vendaMercadoria || 0) >= (importPreview.dadosParsed.categorias?.esperado380 || 0) ? 'OK' : 'Pendente'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================ */}
                  {/* PREVIEWS DO SETOR PESSOAL */}
                  {/* ============================================ */}

                  {/* Preview Demonstrativo FGTS */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'fgts' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total FGTS</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totalGeral?.valorFGTS || 0)}</p>
                        </div>
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Base de Calculo</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totalGeral?.base || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Competencias</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.competencias?.length || 0}</p>
                        </div>
                        <div className="bg-teal-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Registros</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.registros?.length || 0}</p>
                        </div>
                      </div>
                      {importPreview.dadosParsed.totaisPorTipo && Object.keys(importPreview.dadosParsed.totaisPorTipo).length > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">FGTS por Tipo de Recolhimento</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(importPreview.dadosParsed.totaisPorTipo).map(([tipo, dados]) => (
                              <div key={tipo} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <p className="text-xs text-blue-600 dark:text-blue-400">{tipo}</p>
                                <p className="font-bold text-blue-800 dark:text-blue-200">{formatCurrency(dados.valorFGTS || 0)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Folha de INSS */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'inss' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total INSS</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totalGeral?.valorINSS || 0)}</p>
                        </div>
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Base de Calculo</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.totalGeral?.baseCalculo || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Guias Originais</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.totaisPorTipo?.original || 0}</p>
                        </div>
                        <div className="bg-amber-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Retificadores</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.totaisPorTipo?.retificador || 0}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-2">Competencias Importadas: {importPreview.dadosParsed.competencias?.length || 0}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-500">
                          {importPreview.dadosParsed.competencias?.join(', ') || 'Nenhuma competencia encontrada'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Preview Relacao de Empregados */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'empregados' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-teal-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Empregados</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.total || 0}</p>
                        </div>
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Ativos</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.ativos || 0}</p>
                        </div>
                        <div className="bg-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Demitidos</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.demitidos || 0}</p>
                        </div>
                        <div className="bg-amber-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Afastados</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.afastados || 0}</p>
                        </div>
                      </div>
                      {importPreview.dadosParsed.empregadosPorCargo && Object.keys(importPreview.dadosParsed.empregadosPorCargo).length > 0 && (
                        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl">
                          <p className="text-sm font-semibold text-teal-800 dark:text-teal-300 mb-3">Empregados por Cargo</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(importPreview.dadosParsed.empregadosPorCargo).slice(0, 8).map(([cargo, dados]) => (
                              <div key={cargo} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-100 dark:border-teal-800">
                                <p className="text-xs text-teal-600 dark:text-teal-400 truncate">{cargo}</p>
                                <p className="font-bold text-teal-800 dark:text-teal-200">{dados.total} funcionario(s)</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Salario Base */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'salarioBase' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Folha Total</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.estatisticas?.totalSalarios || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Salario Medio</p>
                          <p className="text-2xl font-bold">{formatCurrency(importPreview.dadosParsed.estatisticas?.salarioMedioGeral || 0)}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Empregados</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.totalEmpregados || 0}</p>
                        </div>
                        <div className="bg-teal-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Cargos Diferentes</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.quantidadeCargos || 0}</p>
                        </div>
                      </div>
                      {importPreview.dadosParsed.cargosOrdenados && importPreview.dadosParsed.cargosOrdenados.length > 0 && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">Top Cargos por Salario Medio</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {importPreview.dadosParsed.cargosOrdenados.slice(0, 4).map((item) => (
                              <div key={item.cargo} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                <p className="text-xs text-emerald-700 dark:text-emerald-700 truncate">{item.cargo}</p>
                                <p className="font-bold text-emerald-800 dark:text-emerald-200">{formatCurrency(item.salarioMedio)}</p>
                                <p className="text-xs text-slate-500">{item.quantidade} pessoa(s)</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Programacao de Ferias */}
                  {importPreview.isDominioFormat && importPreview.tipoRelatorio === 'ferias' && importPreview.dadosParsed && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Total Registros</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.totalRegistros || 0}</p>
                        </div>
                        <div className="bg-emerald-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Dias Programados</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.diasTotalProgramados || 0}</p>
                        </div>
                        <div className="bg-teal-700 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Dias Gozados</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.diasTotalGozados || 0}</p>
                        </div>
                        <div className="bg-amber-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80 mb-1">Dias Restantes</p>
                          <p className="text-2xl font-bold">{importPreview.dadosParsed.estatisticas?.diasRestantes || 0}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Status das Ferias</p>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-blue-600 dark:text-blue-400">Programadas</p>
                            <p className="font-bold text-blue-800 dark:text-blue-200">{importPreview.dadosParsed.feriasPorStatus?.programadas || 0}</p>
                          </div>
                          <div>
                            <p className="text-green-600 dark:text-green-400">Gozadas</p>
                            <p className="font-bold text-green-800 dark:text-green-200">{importPreview.dadosParsed.feriasPorStatus?.gozadas || 0}</p>
                          </div>
                          <div>
                            <p className="text-amber-600 dark:text-amber-400">Pendentes</p>
                            <p className="font-bold text-amber-800 dark:text-amber-200">{importPreview.dadosParsed.feriasPorStatus?.pendentes || 0}</p>
                          </div>
                          <div>
                            <p className="text-red-600 dark:text-red-400">Vencidas</p>
                            <p className="font-bold text-red-800 dark:text-red-200">{importPreview.dadosParsed.feriasPorStatus?.vencidas || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview padrão para CSV normal */}
                  {!importPreview.isDominioFormat && importPreview.headers && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Preview dos dados</h3>
                      </div>
                      <div className="overflow-x-auto max-h-80">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                            <tr>
                              {importPreview.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {importPreview.data?.slice(0, 10).map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                {importPreview.headers.map((h, j) => (
                                  <td key={j} className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">{row[h] || '-'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Alerta */}
                  <div className="mt-6 mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">Revise os dados antes de confirmar</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">Os dados serão importados para o sistema. Esta ação pode ser desfeita apenas manualmente.</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button onClick={() => { setImportPreview(null); setImportStep(2); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <ChevronLeft className="w-4 h-4" />Voltar
                    </button>
                    <button onClick={handleImportConfirm}
                      disabled={importPreview.parseError}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Upload className="w-4 h-4" />Confirmar Importação
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Sucesso */}
              {importStep === 4 && (
                <div className="max-w-lg mx-auto text-center py-12">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-700" />
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
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{modalGrupo.mode === 'add' ? 'Criar Novo Grupo' : 'Editar Grupo'}</h2>
                <button onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              {modalGrupo.mode === 'add' && (
                <p className="text-sm text-slate-500">Um grupo serve para organizar empresas relacionadas. Exemplo: "Holding ABC" agrupa a matriz e suas filiais.</p>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Grupo *</label>
                <input type="text" value={formGrupo.nome} onChange={(e) => setFormGrupo({ ...formGrupo, nome: e.target.value })} placeholder="Ex: Grupo Empresarial XYZ" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição (opcional)</label>
                <textarea value={formGrupo.descricao} onChange={(e) => setFormGrupo({ ...formGrupo, descricao: e.target.value })} placeholder="Uma breve descrição do grupo..." rows={3} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Após criar o grupo, você poderá adicionar CNPJs a ele.</p>
                <div className="flex gap-3">
                  <button onClick={() => setModalGrupo({ open: false, mode: 'add', data: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
                  <button onClick={handleSaveGrupo} disabled={!formGrupo.nome.trim()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"><Save className="w-4 h-4" />{modalGrupo.mode === 'add' ? 'Criar Grupo' : 'Salvar'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal CNPJ */}
      {modalCnpj.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{modalCnpj.mode === 'add' ? 'Cadastrar CNPJ' : 'Editar CNPJ'}</h2>
                <button onClick={() => setModalCnpj({ open: false, mode: 'add', data: null, grupoId: null })} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              {modalCnpj.mode === 'add' && (
                <p className="text-sm text-slate-500">Adicione os dados da empresa que será vinculada ao grupo <strong className="text-slate-700 dark:text-slate-300">{grupos.find(g => g.id === modalCnpj.grupoId)?.nome}</strong></p>
              )}
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
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
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
