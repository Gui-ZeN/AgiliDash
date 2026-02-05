import { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Calculator,
  FileSpreadsheet,
  Users,
  Scale,
  Coins,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart2,
  BarChartBig,
  Wallet,
  BarChartHorizontal,
  AlertCircle,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  Activity,
  Briefcase,
  Award,
  FileText,
  CircleDollarSign,
  Receipt,
  Percent,
  Download,
  FileDown,
  Layers,
  UserPlus,
  BadgeCheck,
  Banknote,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ScrollText,
  Home,
  Zap,
  Shield,
  Package,
  Wrench,
  MoreHorizontal
} from 'lucide-react';
import Header from '../components/layout/Header';
import Card, { PrimaryCard, AlertCard, InfoCard, MetricCard, TeamCard } from '../components/common/Card';
import { ButtonGroup } from '../components/common/Button';
import DREChart from '../components/charts/DREChart';
import MovimentacaoChart from '../components/charts/MovimentacaoChart';
import LucroComparativoChart from '../components/charts/LucroComparativoChart';
import ReceitaPizzaChart from '../components/charts/ReceitaPizzaChart';
import CustosPizzaChart from '../components/charts/CustosPizzaChart';
import {
  ComparativoReceitaDespesaChart,
  VariacaoLucroChart,
  ReceitaCustoEstoqueChart,
  MovimentacaoBancariaChart,
  AplicacoesFinanceirasChart,
  TabelaComparativoMensal,
  CardsMetricasContabil
} from '../components/charts/ContabilCharts';
import { useData } from '../context/DataContext';
import FaturamentoChart from '../components/charts/FaturamentoChart';
import IRPJChart from '../components/charts/IRPJChart';
import CSLLChart from '../components/charts/CSLLChart';
import FluxoFiscalChart from '../components/charts/FluxoFiscalChart';
import DistribuicaoChart from '../components/charts/DistribuicaoChart';
import FolhaPagamentoChart from '../components/charts/FolhaPagamentoChart';
import { DepartamentoPizzaChart, ContratoPizzaChart } from '../components/charts/FuncionariosPizzaChart';
import { DespesasMensaisChart, DespesasCategoriaChart } from '../components/charts/DespesasAdminChart';
import { formatCurrency, sumArray } from '../utils/formatters';
import { useEmpresa } from '../context/EmpresaContext';
import { useTheme } from '../context/ThemeContext';
import Breadcrumb from '../components/ui/Breadcrumb';
import PeriodFilter from '../components/ui/PeriodFilter';
import ExportButton from '../components/ui/ExportButton';
import Sparkline from '../components/ui/Sparkline';
import CnpjFilter from '../components/ui/CnpjFilter';
import {
  equipeTecnica,
  meses
} from '../data/mockData';

/**
 * Dashboard Principal - Design Aprimorado
 * Contém as 5 tabs: Info. Gerais, Contábil, Fiscal, Pessoal, Administrativo
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('gerais');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [fiscalData, setFiscalData] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [periodFilter, setPeriodFilter] = useState({ type: 'year', year: 2025 });

  // Usar contexto da empresa e tema
  const { cnpjInfo, cnpjDados, isConsolidado, totaisConsolidados } = useEmpresa();
  const { isDarkMode } = useTheme();
  const { getDadosContabeis } = useData();

  // Obter dados contábeis importados para o CNPJ selecionado
  const dadosContabeisImportados = getDadosContabeis(cnpjInfo?.id);
  const temDadosContabeis = dadosContabeisImportados?.analiseHorizontal || dadosContabeisImportados?.balancetesConsolidados;

  // Dados do CNPJ selecionado
  const dreData = selectedYear === 2025 ? cnpjDados.dreData2025 : cnpjDados.dreData2024;
  const dreData2024 = cnpjDados.dreData2024;
  const entradasData = cnpjDados.entradasData;
  const saidasData = cnpjDados.saidasData;
  const totaisFiscais = cnpjDados.totaisFiscais;
  const pessoalData = cnpjDados.pessoalData;
  const administrativoData = cnpjDados.administrativoData;

  // Animação ao trocar de tab ou CNPJ
  useEffect(() => {
    setAnimateCards(false);
    const timer = setTimeout(() => setAnimateCards(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab, cnpjInfo.id]);

  // Calcular totais do DRE
  // Prioriza dados importados (Análise Horizontal) se disponíveis
  const analiseHorizontal = dadosContabeisImportados?.analiseHorizontal;
  const totalReceita = analiseHorizontal?.totais?.totalReceitas
    || (analiseHorizontal?.receitasMensais ? analiseHorizontal.receitasMensais.reduce((a, b) => a + b, 0) : sumArray(dreData.receita));
  const totalDespesa = analiseHorizontal?.totais?.totalDespesas
    || (analiseHorizontal?.despesasMensais ? analiseHorizontal.despesasMensais.reduce((a, b) => a + b, 0) : sumArray(dreData.despesa));
  const totalLucro = totalReceita - totalDespesa;
  const margemLucro = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : '0.0';

  // Comparação com ano anterior
  const totalReceita2024 = sumArray(dreData2024.receita);
  const variacaoReceita = (((totalReceita - totalReceita2024) / totalReceita2024) * 100).toFixed(1);

  // Callback para receber dados do gráfico de distribuição
  const handleFiscalDataCalculated = (data) => {
    setFiscalData(data);
  };

  // Ícones para a equipe técnica
  const iconMap = {
    calculator: Calculator,
    'file-spreadsheet': FileSpreadsheet,
    users: Users,
    briefcase: Briefcase
  };

  // Classe de animação
  const cardAnimation = animateCards
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4';

  // Função para exportar relatório (mock)
  const handleExportReport = (type) => {
    alert(`Exportação de relatório ${type.toUpperCase()} será implementada com integração Firebase.`);
  };

  // Dados para sparklines (mock - últimos 12 meses)
  const receitaSparkline = cnpjDados?.dreData2025?.receita || [0];
  const lucroSparkline = cnpjDados?.dreData2025?.receita?.map((r, i) => r - (cnpjDados?.dreData2025?.despesa?.[i] || 0)) || [0];

  // Dados para exportação
  const exportColumns = [
    { key: 'mes', label: 'Mes' },
    { key: 'receita', label: 'Receita' },
    { key: 'despesa', label: 'Despesa' },
    { key: 'lucro', label: 'Lucro' }
  ];
  const exportData = meses.map((mes, i) => ({
    mes,
    receita: dreData?.receita?.[i] || 0,
    despesa: dreData?.despesa?.[i] || 0,
    lucro: (dreData?.receita?.[i] || 0) - (dreData?.despesa?.[i] || 0)
  }));

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-slate-50 to-cyan-50/30'} text-slate-800 dark:text-slate-200`}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="w-full px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
        {/* Toolbar com Breadcrumb, Filtros e Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Breadcrumb />
          <div className="flex flex-wrap items-center gap-3">
            <CnpjFilter />
            <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
            <ExportButton
              data={exportData}
              columns={exportColumns}
              filename={`relatorio-${cnpjInfo?.nomeFantasia || 'empresa'}`}
              title={`Relatorio ${cnpjInfo?.nomeFantasia || 'Empresa'}`}
            />
          </div>
        </div>

        {/* Badge de modo consolidado */}
        {isConsolidado && (
          <div className="mb-6 bg-gradient-to-r from-[#0e4f6d] to-[#1a6b8a] p-4 rounded-2xl text-white flex items-center gap-3">
            <Layers className="w-5 h-5" />
            <span className="font-medium">Visualizando dados consolidados de todos os CNPJs</span>
          </div>
        )}

        {/* ===== TAB: INFORMAÇÕES GERAIS ===== */}
        {activeTab === 'gerais' && (
          <div className="space-y-8">
            {/* Header da seção com badge */}
            <section className={`transition-all duration-500 ${cardAnimation}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0e4f6d] rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-[#0e4f6d] uppercase tracking-widest">
                  Visão Geral
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                Informações Gerais
              </h1>
              <p className="text-lg text-slate-400 font-medium">
                Dados cadastrais e equipe técnica responsável pela conta.
              </p>
            </section>

            {/* Cards de estatísticas rápidas com Sparklines */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    +{variacaoReceita}%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(totalReceita)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Receita {selectedYear}</p>
                  </div>
                  <Sparkline data={receitaSparkline} color="#10b981" height={32} width={60} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(totalLucro)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Lucro Liquido</p>
                  </div>
                  <Sparkline data={lucroSparkline} color="#3b82f6" height={32} width={60} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Percent className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800">{margemLucro}%</p>
                <p className="text-xs text-slate-400 mt-1">Margem de Lucro</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800">12</p>
                <p className="text-xs text-slate-400 mt-1">Meses Analisados</p>
              </div>
            </div>

            {/* Card Principal de Dados Cadastrais - Redesenhado */}
            <div className={`bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden transition-all duration-500 delay-200 ${cardAnimation}`}>
              <div className="bg-gradient-to-r from-[#0e4f6d] to-[#1a6b8a] p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                        Cliente Ativo • {cnpjInfo.tipo}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      {cnpjInfo.razaoSocial}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-white/80">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        CNPJ: {cnpjInfo.cnpj}
                      </span>
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Cód: {cnpjInfo.codigoCliente}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {cnpjInfo.endereco.cidade}/{cnpjInfo.endereco.estado}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                      <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                        Regime Tributário
                      </p>
                      <p className="text-xl font-bold">{cnpjInfo.regimeTributario}</p>
                    </div>
                    <span className="text-xs text-white/60">
                      Exercício {cnpjInfo.exercicio}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4] flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Responsável Legal
                    </p>
                    <h3 className="text-2xl font-bold text-[#0e4f6d] mb-1">
                      {cnpjInfo.responsavel.nome}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {cnpjInfo.responsavel.cargo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipe Técnica Responsável - Redesenhada */}
            <section className={`pt-4 transition-all duration-500 delay-300 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0e4f6d]/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-[#0e4f6d]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1e293b] uppercase tracking-wide">
                    Equipe Técnica
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {equipeTecnica.length} profissionais
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {equipeTecnica.map((membro, index) => {
                  const Icon = iconMap[membro.icon];
                  const colors = [
                    { bg: 'from-cyan-500 to-blue-600', light: 'bg-cyan-50' },
                    { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50' },
                    { bg: 'from-teal-500 to-cyan-600', light: 'bg-teal-50' }
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={membro.id}
                      className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color.bg} shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {membro.setor}
                      </p>
                      <h4 className="text-xl font-bold text-slate-800 mb-3">{membro.nome}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{membro.nome.toLowerCase().split(' ')[0]}@agili.com.br</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Card de contato */}
            <div className={`bg-gradient-to-r from-[#0e4f6d] to-[#1a6b8a] p-8 rounded-3xl text-white transition-all duration-500 delay-400 ${cardAnimation}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Precisa de suporte?</h3>
                    <p className="text-white/70">Nossa equipe está disponível para ajudá-lo.</p>
                  </div>
                </div>
                <button className="bg-white text-[#0e4f6d] px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg">
                  Entrar em Contato
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: CONTÁBIL ===== */}
        {activeTab === 'contabil' && (
          <div className="space-y-8">
            {/* Header da seção */}
            <section className={`flex flex-col lg:flex-row items-start justify-between gap-4 transition-all duration-500 ${cardAnimation}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Departamento Contabil
                  </span>
                </div>
                <h1 className={`text-4xl font-extrabold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
                  Analise Financeira
                </h1>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Demonstrativo mensal de receitas, despesas e resultados.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </section>

            {/* Banner de status de dados importados */}
            {!temDadosContabeis && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 ${isDarkMode ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}>
                <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={isDarkMode ? 'text-amber-300' : 'text-amber-800'}>
                  Nenhum relatorio importado. Acesse <strong>Configuracoes</strong> para importar dados do Dominio.
                </span>
              </div>
            )}

            {/* Cards de métricas - usando dados importados ou mock */}
            {temDadosContabeis ? (
              <div className={`transition-all duration-500 delay-100 ${cardAnimation}`}>
                <CardsMetricasContabil dados={dadosContabeisImportados?.analiseHorizontal} />
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 opacity-80" />
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                      +{variacaoReceita}%
                    </span>
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(totalReceita)}</p>
                  <p className="text-white/70 text-sm mt-1">Receita Total {selectedYear}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingDown className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(totalDespesa)}</p>
                  <p className="text-white/70 text-sm mt-1">Despesas Total {selectedYear}</p>
                </div>

                <div className="bg-gradient-to-br from-[#0e4f6d] to-[#1a6b8a] p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Coins className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(totalLucro)}</p>
                  <p className="text-white/70 text-sm mt-1">Lucro Liquido</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-black">{margemLucro}%</p>
                  <p className="text-white/70 text-sm mt-1">Margem de Lucro</p>
                </div>
              </div>
            )}

            {/* Seção 1: Comparativo de Lucro */}
            <section className={`transition-all duration-500 delay-200 ${cardAnimation}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                  <BarChart2 className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Comparativo de Lucro
                </h2>
              </div>

              {/* Grid: Gráfico de Barras + Cards Resumo */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Barras - Receita x Despesa */}
                <div className={`lg:col-span-2 p-6 rounded-3xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Receita vs Despesa
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Evolucao mensal comparativa
                      </p>
                    </div>
                    <ButtonGroup
                      options={[
                        { value: 2024, label: '2024' },
                        { value: 2025, label: '2025' }
                      ]}
                      activeValue={selectedYear}
                      onChange={setSelectedYear}
                    />
                  </div>
                  {temDadosContabeis ? (
                    <ComparativoReceitaDespesaChart dados={dadosContabeisImportados?.analiseHorizontal} />
                  ) : (
                    <DREChart data={dreData} />
                  )}
                </div>

                {/* Card Lateral de Resumo */}
                <div className={`p-6 rounded-3xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                  <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}>
                    Resumo do Exercicio
                  </h3>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Receita Anual</p>
                      </div>
                      <p className={`text-2xl font-black ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {formatCurrency(totalReceita)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownRight className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Despesa Anual</p>
                      </div>
                      <p className={`text-2xl font-black ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                        {formatCurrency(totalDespesa)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#0e4f6d]/40' : 'bg-[#0e4f6d]/10'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-[#0e4f6d]'}`} />
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400' : 'text-[#0e4f6d]'}`}>Lucro Liquido</p>
                      </div>
                      <p className={`text-2xl font-black ${isDarkMode ? 'text-cyan-300' : 'text-[#0e4f6d]'}`}>
                        {formatCurrency(totalLucro)}
                      </p>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Margem: {margemLucro}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tabela Comparativo Mensal */}
            <div className={`rounded-3xl shadow-sm overflow-hidden transition-all duration-500 delay-300 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Detalhamento Mensal</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mes Referencia | Entradas | Saidas | Lucro Liquido</p>
              </div>
              {temDadosContabeis ? (
                <TabelaComparativoMensal dados={dadosContabeisImportados?.analiseHorizontal} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mes</th>
                        <th className={`px-6 py-4 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Entradas</th>
                        <th className={`px-6 py-4 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Saidas</th>
                        <th className={`px-6 py-4 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Saldo</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                      {meses.map((mes, i) => (
                        <tr key={mes} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                          <td className={`px-6 py-4 font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{mes}/2025</td>
                          <td className={`px-6 py-4 text-right ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(entradasData[i])}</td>
                          <td className={`px-6 py-4 text-right ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{formatCurrency(saidasData[i])}</td>
                          <td className={`px-6 py-4 text-right font-bold ${isDarkMode ? 'text-cyan-400' : 'text-[#0e4f6d]'}`}>
                            {formatCurrency(entradasData[i] - saidasData[i])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Gráfico de Variação Anual do Lucro */}
            <div className={`p-6 rounded-3xl shadow-sm transition-all duration-500 delay-400 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Variacao Anual do Lucro</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Comparativo 2024 vs 2025</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="w-3 h-3 rounded-full bg-[#0e4f6d]" /> 2025
                  </span>
                  <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="w-3 h-3 rounded-full bg-[#58a3a4] border-2 border-dashed border-[#58a3a4]" /> 2024
                  </span>
                </div>
              </div>
              {temDadosContabeis ? (
                <VariacaoLucroChart
                  dadosAtual={dadosContabeisImportados?.analiseHorizontal}
                  dadosAnterior={null}
                />
              ) : (
                <LucroComparativoChart />
              )}
            </div>

            {/* Seção 2: Movimentações e Aplicações */}
            <section className={`transition-all duration-500 delay-500 ${cardAnimation}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  <Wallet className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Movimentacoes e Aplicacoes
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Receita x Custo x Estoque */}
                <div className={`p-6 rounded-3xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Receita x Custo x Estoque</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ultimos 12 meses</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Receita
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="w-2 h-2 rounded-full bg-red-500" /> Custo
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Estoque
                      </span>
                    </div>
                  </div>
                  {temDadosContabeis ? (
                    <ReceitaCustoEstoqueChart dados={dadosContabeisImportados?.balancetesConsolidados} />
                  ) : (
                    <MovimentacaoChart />
                  )}
                </div>

                {/* Gráfico de Movimentação Bancária */}
                <div className={`p-6 rounded-3xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Movimentacao Bancaria</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Saldo em Bancos Conta Movimento</p>
                    </div>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#0e4f6d]/30' : 'bg-[#0e4f6d]/10'}`}>
                      <Banknote className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-[#0e4f6d]'}`} />
                    </div>
                  </div>
                  {temDadosContabeis ? (
                    <MovimentacaoBancariaChart dados={dadosContabeisImportados?.balancetesConsolidados} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Importe Balancetes para visualizar</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Gráfico de Aplicações Financeiras */}
            <div className={`p-6 rounded-3xl shadow-sm transition-all duration-500 delay-600 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Aplicacoes Financeiras</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Aplicacoes Financeiras de Liquidez Imediata</p>
                </div>
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#58a3a4]/30' : 'bg-[#58a3a4]/10'}`}>
                  <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-[#58a3a4]'}`} />
                </div>
              </div>
              {temDadosContabeis ? (
                <AplicacoesFinanceirasChart dados={dadosContabeisImportados?.balancetesConsolidados} />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Importe Balancetes para visualizar</p>
                </div>
              )}
            </div>

            {/* Card de análise */}
            <div className={`bg-gradient-to-r from-[#0e4f6d] to-[#1a6b8a] p-8 rounded-3xl text-white shadow-xl transition-all duration-500 delay-700 ${cardAnimation}`}>
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Analise de Performance 2025</h3>
                  <p className="text-white/80 leading-relaxed">
                    {temDadosContabeis ? (
                      <>
                        Dados importados do Sistema Dominio. Os relatorios mostram a evolucao financeira
                        da empresa ao longo do exercicio, permitindo acompanhar receitas, despesas,
                        movimentacao bancaria e aplicacoes financeiras mes a mes.
                      </>
                    ) : (
                      <>
                        O exercicio de 2025 demonstra crescimento de receita com estabilidade
                        nos primeiros trimestres. Para visualizar dados reais, importe os relatorios
                        do Sistema Dominio (Balancete, Analise Horizontal, DRE) na area de Configuracoes.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: FISCAL ===== */}
        {activeTab === 'fiscal' && (
          <div className="space-y-8">
            {/* Header */}
            <section className={`flex items-start justify-between transition-all duration-500 ${cardAnimation}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    Departamento Fiscal
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                  Análise Tributária
                </h1>
                <p className="text-lg text-slate-400 font-medium">
                  Apuração trimestral sobre Lucro Real.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </section>

            {/* Cards de impostos */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 delay-100 ${cardAnimation}`}>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <Receipt className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Total IRPJ</p>
                    <p className="text-2xl font-black text-slate-800">{formatCurrency(totaisFiscais.irpj)}</p>
                  </div>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-cyan-50 rounded-xl">
                    <CircleDollarSign className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Total CSLL</p>
                    <p className="text-2xl font-black text-slate-800">{formatCurrency(totaisFiscais.csll)}</p>
                  </div>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0e4f6d] to-[#1a6b8a] p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase">Carga Total</p>
                    <p className="text-2xl font-black">{formatCurrency(totaisFiscais.cargaTributariaTotal)}</p>
                  </div>
                </div>
                <p className="text-sm text-white/70">Carga tributária do exercício</p>
              </div>
            </div>

            {/* Distribuição e resumo */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-200 ${cardAnimation}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Distribuição do Fluxo</h3>
                  <p className="text-sm text-slate-400 mb-6">Comparativo entrada e saída</p>
                  <DistribuicaoChart onDataCalculated={handleFiscalDataCalculated} />
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 pb-3 border-b border-slate-200">
                    Resumo Operacional 2025
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="font-medium text-slate-600">Entradas</span>
                      </div>
                      <span className="font-bold text-red-600">
                        {fiscalData ? formatCurrency(fiscalData.totalEntradas) : 'R$ 0,00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="font-medium text-slate-600">Saídas</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {fiscalData ? formatCurrency(fiscalData.totalSaidas) : 'R$ 0,00'}
                      </span>
                    </div>
                    <div className="pt-4 mt-4 border-t-2 border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="text-xl font-black text-[#0e4f6d]">
                          {fiscalData ? formatCurrency(fiscalData.totalGeral) : 'R$ 0,00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Faturamento */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-300 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Faturamento Bruto</h3>
                  <p className="text-sm text-slate-400">Histórico mensal de notas emitidas</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <BarChartBig className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <FaturamentoChart />
            </div>

            {/* IRPJ e CSLL */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 delay-400 ${cardAnimation}`}>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800">IRPJ Trimestral</h3>
                  <p className="text-sm text-slate-400">Base (15%) + Adicional (10%)</p>
                </div>
                <div className="h-[320px]">
                  <IRPJChart />
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800">CSLL Trimestral</h3>
                  <p className="text-sm text-slate-400">Alíquota de 9%</p>
                </div>
                <div className="h-[320px]">
                  <CSLLChart />
                </div>
              </div>
            </div>

            {/* Fluxo Fiscal */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-500 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Operações Mensais</h3>
                  <p className="text-sm text-slate-400">Entradas vs Saídas por mês</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl">
                  <BarChartHorizontal className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <FluxoFiscalChart />
            </div>

            {/* Alerta */}
            <div className={`bg-amber-50 border border-amber-200 p-8 rounded-3xl transition-all duration-500 delay-600 ${cardAnimation}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800 mb-2">Análise Tributária</h3>
                  <p className="text-amber-900/80 leading-relaxed">
                    Volume de entradas superior a <strong>R$ 45 milhões</strong> contra saídas de
                    <strong> R$ 15,6 milhões</strong> sugere formação de estoque ou aquisição de
                    insumos para produção futura. Recomenda-se acompanhamento do fluxo de caixa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: PESSOAL ===== */}
        {activeTab === 'pessoal' && (
          <div className="space-y-8">
            {/* Header */}
            <section className={`flex items-start justify-between transition-all duration-500 ${cardAnimation}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                    Departamento Pessoal
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                  Gestão de Pessoas
                </h1>
                <p className="text-lg text-slate-400 font-medium">
                  Recursos humanos e obrigações sociais.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </section>

            {/* Cards de métricas principais */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}>
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    Ativos
                  </span>
                </div>
                <p className="text-3xl font-black">{pessoalData.funcionarios}</p>
                <p className="text-white/70 text-sm mt-1">Colaboradores</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Banknote className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{formatCurrency(pessoalData.folhaMensal)}</p>
                <p className="text-white/70 text-sm mt-1">Folha Mensal</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Receipt className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{formatCurrency(pessoalData.encargos)}</p>
                <p className="text-white/70 text-sm mt-1">Encargos (33,3%)</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{formatCurrency(pessoalData.beneficios)}</p>
                <p className="text-white/70 text-sm mt-1">Benefícios</p>
              </div>
            </div>

            {/* Gráfico de Folha de Pagamento */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-200 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Evolução da Folha de Pagamento</h3>
                  <p className="text-sm text-slate-400">Salários + Encargos por mês</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-[#0e4f6d]" /> Salários
                  </span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-[#58a3a4]" /> Encargos
                  </span>
                </div>
              </div>
              <FolhaPagamentoChart
                folhaPorMes={pessoalData.folhaPorMes}
                encargosPorMes={pessoalData.encargosPorMes}
              />
            </div>

            {/* Gráficos de Pizza */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${cardAnimation}`}>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Por Departamento</h3>
                    <p className="text-sm text-slate-400">Distribuição de funcionários</p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-xl">
                    <PieChart className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <DepartamentoPizzaChart porDepartamento={pessoalData.porDepartamento} />
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Por Tipo de Contrato</h3>
                    <p className="text-sm text-slate-400">Regime de contratação</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <BadgeCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <ContratoPizzaChart porContrato={pessoalData.porContrato} />
              </div>
            </div>

            {/* Tabela de Funcionários */}
            <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 delay-400 ${cardAnimation}`}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Lista de Colaboradores</h3>
                  <p className="text-sm text-slate-400">Principais funcionários do CNPJ</p>
                </div>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                  {pessoalData.listaFuncionarios.length} registros
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Nome</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Cargo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Departamento</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Salário</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Admissão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pessoalData.listaFuncionarios.map((func) => (
                      <tr key={func.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                              {func.nome.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700">{func.nome}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{func.cargo}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                            {func.departamento}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#0e4f6d]">
                          {formatCurrency(func.salario)}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(func.admissao).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card de resumo */}
            <div className={`bg-gradient-to-r from-teal-600 to-cyan-600 p-8 rounded-3xl text-white shadow-xl transition-all duration-500 delay-500 ${cardAnimation}`}>
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Resumo de Gestão de Pessoas</h3>
                  <p className="text-white/80 leading-relaxed">
                    O quadro atual conta com <strong>{pessoalData.funcionarios} colaboradores</strong>,
                    com custo total mensal de <strong>{formatCurrency(pessoalData.folhaMensal + pessoalData.encargos + pessoalData.beneficios)}</strong>
                    (folha + encargos + benefícios). A área de <strong>Produção</strong> representa
                    a maior concentração de funcionários, alinhada com a operação industrial da empresa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: ADMINISTRATIVO ===== */}
        {activeTab === 'administrativo' && (
          <div className="space-y-8">
            {/* Header */}
            <section className={`flex items-start justify-between transition-all duration-500 ${cardAnimation}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    Setor Administrativo
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                  Gestão Administrativa
                </h1>
                <p className="text-lg text-slate-400 font-medium">
                  Contratos, despesas e documentos da empresa.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </section>

            {/* Cards de métricas principais */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}>
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <ScrollText className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    Vigentes
                  </span>
                </div>
                <p className="text-3xl font-black">{administrativoData.contratos.vigentes}</p>
                <p className="text-white/70 text-sm mt-1">Contratos Ativos</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Wallet className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{formatCurrency(administrativoData.indicadores.custoOperacional)}</p>
                <p className="text-white/70 text-sm mt-1">Custo Operacional/Mês</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <FileCheck className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{administrativoData.certidoes.filter(c => c.status === 'Válida').length}</p>
                <p className="text-white/70 text-sm mt-1">Certidões Válidas</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{administrativoData.contratos.vencendo30dias}</p>
                <p className="text-white/70 text-sm mt-1">Vencendo em 30 dias</p>
              </div>
            </div>

            {/* Gráfico de Despesas Mensais */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-200 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Despesas Administrativas</h3>
                  <p className="text-sm text-slate-400">Evolução mensal das despesas</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <BarChartBig className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <DespesasMensaisChart despesasMensais={administrativoData.despesasMensais} />
            </div>

            {/* Grid: Despesas por Categoria e Indicadores */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${cardAnimation}`}>
              {/* Despesas por Categoria */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Despesas por Categoria</h3>
                    <p className="text-sm text-slate-400">Distribuição dos custos</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <PieChart className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <DespesasCategoriaChart despesasPorCategoria={administrativoData.despesasPorCategoria} />
              </div>

              {/* Indicadores */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                  Indicadores Operacionais
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-700">Ticket Médio de Venda</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(administrativoData.indicadores.ticketMedioVenda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Percent className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-slate-700">Margem Operacional</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {administrativoData.indicadores.margemOperacional}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-medium text-slate-700">Taxa de Inadimplência</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      {administrativoData.indicadores.inadimplencia}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Wallet className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-slate-700">Custo Operacional Mensal</span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">
                      {formatCurrency(administrativoData.indicadores.custoOperacional)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Certidões */}
            <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 delay-400 ${cardAnimation}`}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Certidões e Documentos</h3>
                  <p className="text-sm text-slate-400">Status das certidões da empresa</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                  {administrativoData.certidoes.length} documentos
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Documento</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Tipo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Validade</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {administrativoData.certidoes.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cert.status === 'Válida' ? 'bg-green-100' : 'bg-amber-100'}`}>
                              <FileCheck className={`w-4 h-4 ${cert.status === 'Válida' ? 'text-green-600' : 'text-amber-600'}`} />
                            </div>
                            <span className="font-semibold text-slate-700">{cert.nome}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                            {cert.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(cert.validade).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cert.status === 'Válida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {cert.status === 'Válida' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {cert.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela de Contratos */}
            <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 delay-500 ${cardAnimation}`}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Contratos Ativos</h3>
                  <p className="text-sm text-slate-400">Contratos vigentes com fornecedores</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {administrativoData.listaContratos.length} contratos
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Fornecedor</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Tipo</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Valor Mensal</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Vencimento</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {administrativoData.listaContratos.map((contrato) => {
                      const iconMap = {
                        'Aluguel': Home,
                        'Utilidades': Zap,
                        'Seguro': Shield,
                        'Serviços': Wrench
                      };
                      const Icon = iconMap[contrato.tipo] || Package;

                      return (
                        <tr key={contrato.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-slate-100">
                                <Icon className="w-4 h-4 text-slate-600" />
                              </div>
                              <span className="font-semibold text-slate-700">{contrato.fornecedor}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                              {contrato.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#0e4f6d]">
                            {formatCurrency(contrato.valor)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Date(contrato.vencimento).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${contrato.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {contrato.status === 'Ativo' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {contrato.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card de informação */}
            <div className={`bg-gradient-to-r from-amber-500 to-orange-500 p-8 rounded-3xl text-white shadow-xl transition-all duration-500 delay-600 ${cardAnimation}`}>
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Gestão Administrativa</h3>
                  <p className="text-white/80 leading-relaxed">
                    O setor administrativo gerencia <strong>{administrativoData.contratos.total} contratos</strong> com
                    custo operacional mensal de <strong>{formatCurrency(administrativoData.indicadores.custoOperacional)}</strong>.
                    Todas as certidões estão em dia, garantindo a regularidade fiscal e trabalhista da empresa.
                    {administrativoData.contratos.vencendo30dias > 0 && (
                      <strong className="block mt-2">
                        Atenção: {administrativoData.contratos.vencendo30dias} contrato(s) vencendo nos próximos 30 dias.
                      </strong>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
