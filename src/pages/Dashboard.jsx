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
  Percent
} from 'lucide-react';
import Header from '../components/layout/Header';
import Card, { PrimaryCard, AlertCard, InfoCard, MetricCard, TeamCard } from '../components/common/Card';
import { ButtonGroup } from '../components/common/Button';
import DREChart from '../components/charts/DREChart';
import MovimentacaoChart from '../components/charts/MovimentacaoChart';
import LucroComparativoChart from '../components/charts/LucroComparativoChart';
import ReceitaPizzaChart from '../components/charts/ReceitaPizzaChart';
import CustosPizzaChart from '../components/charts/CustosPizzaChart';
import FaturamentoChart from '../components/charts/FaturamentoChart';
import IRPJChart from '../components/charts/IRPJChart';
import CSLLChart from '../components/charts/CSLLChart';
import FluxoFiscalChart from '../components/charts/FluxoFiscalChart';
import DistribuicaoChart from '../components/charts/DistribuicaoChart';
import { formatCurrency, sumArray } from '../utils/formatters';
import {
  empresaInfo,
  equipeTecnica,
  dreData2024,
  dreData2025,
  meses,
  entradasData,
  saidasData,
  totaisFiscais
} from '../data/mockData';

/**
 * Dashboard Principal - Design Aprimorado
 * Contém as 4 tabs: Info. Gerais, Contábil, Fiscal, Pessoal
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('gerais');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [dreData, setDreData] = useState(dreData2025);
  const [fiscalData, setFiscalData] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  // Atualiza dados do DRE quando o ano muda
  useEffect(() => {
    setDreData(selectedYear === 2025 ? dreData2025 : dreData2024);
  }, [selectedYear]);

  // Animação ao trocar de tab
  useEffect(() => {
    setAnimateCards(false);
    const timer = setTimeout(() => setAnimateCards(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Calcular totais do DRE
  const totalReceita = sumArray(dreData.receita);
  const totalDespesa = sumArray(dreData.despesa);
  const totalLucro = totalReceita - totalDespesa;
  const margemLucro = ((totalLucro / totalReceita) * 100).toFixed(1);

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
    users: Users
  };

  // Classe de animação
  const cardAnimation = animateCards
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-cyan-50/30 text-slate-800">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
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

            {/* Cards de estatísticas rápidas */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{variacaoReceita}%
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-800">{formatCurrency(totalReceita)}</p>
                <p className="text-xs text-slate-400 mt-1">Receita {selectedYear}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800">{formatCurrency(totalLucro)}</p>
                <p className="text-xs text-slate-400 mt-1">Lucro Líquido</p>
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
                        Cliente Ativo
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      {empresaInfo.nome}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-white/80">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        CNPJ: {empresaInfo.cnpj}
                      </span>
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Cód: {empresaInfo.codigoCliente}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                      <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                        Regime Tributário
                      </p>
                      <p className="text-xl font-bold">{empresaInfo.regimeTributario}</p>
                    </div>
                    <span className="text-xs text-white/60">
                      Exercício {empresaInfo.exercicio}
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
                      {empresaInfo.responsavel.nome}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {empresaInfo.responsavel.cargo}
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
            <section className={`transition-all duration-500 ${cardAnimation}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                  Departamento Contábil
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                Análise Financeira
              </h1>
              <p className="text-lg text-slate-400 font-medium">
                Demonstrativo mensal de fluxos financeiros e resultados.
              </p>
            </section>

            {/* Cards de métricas principais */}
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
                <p className="text-white/70 text-sm mt-1">Lucro Líquido</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-black">{margemLucro}%</p>
                <p className="text-white/70 text-sm mt-1">Margem de Lucro</p>
              </div>
            </div>

            {/* Grid: Comparativo DRE e Card Lateral */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 delay-200 ${cardAnimation}`}>
              {/* Gráfico Comparativo */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Receita vs Despesa
                    </h3>
                    <p className="text-sm text-slate-400">
                      Evolução mensal comparativa
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
                <DREChart data={dreData} />
              </div>

              {/* Card Lateral com métricas detalhadas */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                  Resumo do Exercício
                </h3>

                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">Receita Anual</p>
                    </div>
                    <p className="text-2xl font-black text-green-700">
                      {formatCurrency(totalReceita)}
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">Despesa Anual</p>
                    </div>
                    <p className="text-2xl font-black text-red-600">
                      {formatCurrency(totalDespesa)}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0e4f6d]/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-5 h-5 text-[#0e4f6d]" />
                      <p className="text-sm text-[#0e4f6d] font-medium">Lucro Líquido</p>
                    </div>
                    <p className="text-3xl font-black text-[#0e4f6d]">
                      {formatCurrency(totalLucro)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Margem: {margemLucro}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos de Pizza */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${cardAnimation}`}>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Grupos de Receitas</h3>
                    <p className="text-sm text-slate-400">Por natureza de venda</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <ReceitaPizzaChart />
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Grupos de Custos</h3>
                    <p className="text-sm text-slate-400">Por tipo de aquisição</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl">
                    <PieChart className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <CustosPizzaChart />
              </div>
            </div>

            {/* Gráfico de Lucro Comparativo */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-400 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Variação do Lucro Líquido</h3>
                  <p className="text-sm text-slate-400">Comparativo 2024 vs 2025</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <LucroComparativoChart />
            </div>

            {/* Gráfico de Movimentação */}
            <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 delay-500 ${cardAnimation}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Movimentação Financeira</h3>
                  <p className="text-sm text-slate-400">Fluxo anual de entradas e saídas</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-[#0e4f6d]" /> Entradas
                  </span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-[#58a3a4]" /> Saídas
                  </span>
                </div>
              </div>
              <MovimentacaoChart />
            </div>

            {/* Tabela de Dados */}
            <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 delay-600 ${cardAnimation}`}>
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Detalhamento Mensal</h3>
                <p className="text-sm text-slate-400">Movimentação mês a mês</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Mês</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Entradas</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Saídas</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meses.map((mes, i) => (
                      <tr key={mes} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{mes}/2025</td>
                        <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(entradasData[i])}</td>
                        <td className="px-6 py-4 text-right text-red-500">{formatCurrency(saidasData[i])}</td>
                        <td className="px-6 py-4 text-right font-bold text-[#0e4f6d]">
                          {formatCurrency(entradasData[i] - saidasData[i])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card de análise */}
            <div className={`bg-gradient-to-r from-[#0e4f6d] to-[#1a6b8a] p-8 rounded-3xl text-white shadow-xl transition-all duration-500 delay-700 ${cardAnimation}`}>
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Análise de Performance 2025</h3>
                  <p className="text-white/80 leading-relaxed">
                    O exercício de 2025 demonstra crescimento exponencial de receita com estabilidade
                    nos primeiros trimestres e salto significativo a partir de Julho. Destaque para
                    <strong> Setembro</strong> com entradas superiores a <strong>R$ 10,6 milhões</strong>.
                    O controle de saídas permanece estável, ampliando a margem líquida no segundo semestre.
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
            <section className={`transition-all duration-500 ${cardAnimation}`}>
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
            <section className={`transition-all duration-500 ${cardAnimation}`}>
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
            </section>

            {/* Cards placeholder */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 delay-100 ${cardAnimation}`}>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Colaboradores</p>
                    <p className="text-2xl font-black text-slate-300">--</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Folha Mensal</p>
                    <p className="text-2xl font-black text-slate-300">--</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <Percent className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Encargos</p>
                    <p className="text-2xl font-black text-slate-300">--</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card em desenvolvimento */}
            <div className={`bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center transition-all duration-500 delay-200 ${cardAnimation}`}>
              <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Users className="w-12 h-12 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Em Desenvolvimento
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Esta seção apresentará o resumo da folha de pagamento,
                encargos sociais, métricas de turnover e indicadores de RH.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-teal-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>Previsão: Em breve</span>
              </div>
            </div>

            {/* Info card */}
            <div className={`bg-teal-50 border border-teal-200 p-8 rounded-3xl transition-all duration-500 delay-300 ${cardAnimation}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <UserCheck className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teal-800 mb-2">Perspectiva de Gestão</h3>
                  <p className="text-teal-700/80 leading-relaxed">
                    Aguardando processamento da folha de pagamento para identificar
                    correlações entre o crescimento de receita verificado no setor
                    contábil e o aumento da força de trabalho.
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
