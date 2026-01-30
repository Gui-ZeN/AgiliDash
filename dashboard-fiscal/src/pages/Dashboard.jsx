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
  PieChart,
  BarChart2,
  BarChartBig,
  Wallet,
  BarChartHorizontal,
  AlertCircle,
  UserCheck
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
import { formatCurrency, sumArray, calculatePercentage } from '../utils/formatters';
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
 * Dashboard Principal
 * Contém as 4 tabs: Info. Gerais, Contábil, Fiscal, Pessoal
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('gerais');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [dreData, setDreData] = useState(dreData2025);
  const [fiscalData, setFiscalData] = useState(null);

  // Atualiza dados do DRE quando o ano muda
  useEffect(() => {
    setDreData(selectedYear === 2025 ? dreData2025 : dreData2024);
  }, [selectedYear]);

  // Calcular totais do DRE
  const totalReceita = sumArray(dreData.receita);
  const totalDespesa = sumArray(dreData.despesa);
  const totalLucro = totalReceita - totalDespesa;

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* ===== TAB: INFORMAÇÕES GERAIS ===== */}
        {activeTab === 'gerais' && (
          <div className="space-y-8">
            {/* Header da seção */}
            <section>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                Informações Gerais
              </h1>
              <p className="text-lg text-slate-400 font-medium">
                Dados cadastrais e equipe técnica responsável pela conta.
              </p>
            </section>

            {/* Card Principal de Dados Cadastrais */}
            <Card accent>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-[#1e293b] mb-2">
                      {empresaInfo.nome}
                    </h2>
                    <p className="text-slate-500 font-semibold text-lg flex items-center gap-2">
                      CNPJ: {empresaInfo.cnpj}
                    </p>
                    <p className="text-slate-400 font-medium">
                      Cód. Cliente: {empresaInfo.codigoCliente}
                    </p>
                  </div>

                  {/* Responsável Legal em Destaque */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#0e4f6d]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                          Responsável Legal
                        </p>
                        <h3 className="text-xl font-bold text-[#0e4f6d]">
                          {empresaInfo.responsavel.nome}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {empresaInfo.responsavel.cargo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <div className="bg-cyan-50 text-cyan-800 px-6 py-2 rounded-xl font-bold text-sm uppercase mb-2 inline-block">
                    {empresaInfo.regimeTributario}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    Regime Tributário
                  </p>
                </div>
              </div>
            </Card>

            {/* Equipe Técnica Responsável */}
            <section className="pt-4">
              <h2 className="text-xl font-bold text-[#1e293b] uppercase tracking-wide mb-6 pb-2 border-b border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0e4f6d]" />
                Equipe Técnica Responsável
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {equipeTecnica.map((membro) => {
                  const Icon = iconMap[membro.icon];
                  return (
                    <TeamCard
                      key={membro.id}
                      icon={Icon}
                      iconBgColor={membro.bgColor}
                      iconColor={membro.iconColor}
                      setor={membro.setor}
                      nome={membro.nome}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ===== TAB: CONTÁBIL ===== */}
        {activeTab === 'contabil' && (
          <div className="space-y-8">
            {/* Header da seção */}
            <section>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                Departamento Contábil
              </h1>
              <p className="text-lg text-slate-400 font-medium">
                Demonstrativo mensal de fluxos financeiros.
              </p>
            </section>

            {/* Grid: Comparativo DRE e Card Lateral */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico Comparativo */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                        Comparativo entre Receita e Despesa
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Evolução Mensal das Contas
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
                </Card>
              </div>

              {/* Card Lateral: RECEITA E DESPESA */}
              <Card className="flex flex-col justify-center relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-5">
                  <Scale className="w-32 h-32 text-[#0e4f6d]" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-8 border-b border-slate-100 pb-4">
                  Receita e Despesa
                </h3>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Receita Anual
                      </p>
                    </div>
                    <p className="text-3xl font-black text-green-600 tracking-tight">
                      {formatCurrency(totalReceita)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Despesa Anual
                      </p>
                    </div>
                    <p className="text-3xl font-black text-red-500 tracking-tight">
                      {formatCurrency(totalDespesa)}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-4 h-4 text-[#0e4f6d]" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Lucro Líquido
                      </p>
                    </div>
                    <p className="text-4xl font-black text-[#0e4f6d] tracking-tight">
                      {formatCurrency(totalLucro)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      Diferença apurada no exercício
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Gráficos de Pizza (Grupos de Receita e Custos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grupos de Receitas */}
              <Card>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                      Grupos de Receitas
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Distribuição por Natureza de Venda
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <PieChart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <ReceitaPizzaChart />
              </Card>

              {/* Grupos de Custos */}
              <Card>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                      Grupos de Custos
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Distribuição por Tipo de Aquisição
                    </p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <PieChart className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <CustosPizzaChart />
              </Card>
            </div>

            {/* Gráfico: Comparativo de Lucro Líquido */}
            <Card>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                    Variação do Lucro Líquido
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Comparativo Anual (2024 vs 2025)
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <LucroComparativoChart />
            </Card>

            {/* Gráfico de Fluxo (Movimentação) */}
            <Card>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800 uppercase">
                  Movimentação Financeira Anual
                </h3>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0e4f6d]" /> ENTRADAS
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#58a3a4]" /> SAÍDAS
                  </span>
                </div>
              </div>
              <MovimentacaoChart />
            </Card>

            {/* Tabela de Dados */}
            <Card padding="p-0" className="overflow-hidden">
              <div className="table-container overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase tracking-widest">
                        Mês Referência
                      </th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase tracking-widest text-right">
                        Entradas (R$)
                      </th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase tracking-widest text-right">
                        Saídas (R$)
                      </th>
                      <th className="px-8 py-4 font-bold text-slate-400 uppercase tracking-widest text-right">
                        Saldo Líquido
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meses.map((mes, i) => (
                      <tr key={mes} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4 font-bold text-slate-700">{mes}/2025</td>
                        <td className="px-8 py-4 text-slate-600 text-right">
                          {formatCurrency(entradasData[i])}
                        </td>
                        <td className="px-8 py-4 text-red-400 text-right">
                          {formatCurrency(saidasData[i])}
                        </td>
                        <td className="px-8 py-4 font-black text-[#0e4f6d] text-right">
                          {formatCurrency(entradasData[i] - saidasData[i])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Resumo Analítico Contábil */}
            <PrimaryCard>
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Análise de Performance Financeira 2025
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    O exercício de 2025 demonstra um crescimento exponencial de receita.
                    Observa-se uma estabilidade nos primeiros dois trimestres, seguida de um
                    salto significativo a partir de Julho. O destaque absoluto ocorre em{' '}
                    <strong>Setembro</strong>, com entradas superiores a{' '}
                    <strong>R$ 10,6 milhões</strong>, indicando possivelmente uma sazonalidade
                    forte ou expansão comercial. O controle de saídas permanece estável, o que
                    amplia significativamente a margem líquida da operação no segundo semestre.
                  </p>
                </div>
              </div>
            </PrimaryCard>
          </div>
        )}

        {/* ===== TAB: FISCAL ===== */}
        {activeTab === 'fiscal' && (
          <div className="space-y-8">
            {/* Header da seção */}
            <section>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                Departamento Fiscal
              </h1>
              <p className="text-lg text-slate-400 font-medium">
                Análise tributária trimestral s/ Lucro Real.
              </p>
            </section>

            {/* Card de Distribuição do Fluxo (Pizza) */}
            <Card className="mb-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Área do Gráfico */}
                <div className="w-full md:w-1/2 relative">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-4 text-center md:text-left">
                    Comparativo entrada e saída
                  </h3>
                  <DistribuicaoChart onDataCalculated={handleFiscalDataCalculated} />
                </div>

                {/* Área da Tabela de Resumo */}
                <div className="w-full md:w-1/2">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                      Resumo Operacional 2025
                    </h4>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-200/50">
                        <tr>
                          <td className="py-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="font-medium text-slate-600">Entradas (Custos)</span>
                          </td>
                          <td className="py-3 text-right font-bold text-red-500">
                            {fiscalData ? formatCurrency(fiscalData.totalEntradas) : 'R$ 0,00'}
                          </td>
                          <td className="py-3 text-right text-xs text-slate-400">
                            {fiscalData ? fiscalData.percEntradas : '0%'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="font-medium text-slate-600">Saídas (Receita)</span>
                          </td>
                          <td className="py-3 text-right font-bold text-green-600">
                            {fiscalData ? formatCurrency(fiscalData.totalSaidas) : 'R$ 0,00'}
                          </td>
                          <td className="py-3 text-right text-xs text-slate-400">
                            {fiscalData ? fiscalData.percSaidas : '0%'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="font-medium text-slate-600">Serviços</span>
                          </td>
                          <td className="py-3 text-right font-bold text-blue-600">
                            {fiscalData ? formatCurrency(fiscalData.totalServicos) : 'R$ 0,00'}
                          </td>
                          <td className="py-3 text-right text-xs text-slate-400">
                            {fiscalData ? fiscalData.percServicos : '0%'}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="border-t-2 border-slate-200">
                        <tr>
                          <td className="py-4 font-bold text-slate-800 uppercase text-xs">
                            Total Movimentado
                          </td>
                          <td className="py-4 text-right font-black text-[#0e4f6d]" colSpan={2}>
                            {fiscalData ? formatCurrency(fiscalData.totalGeral) : 'R$ 0,00'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </Card>

            {/* GRÁFICO: Faturamento */}
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                    Evolução do Faturamento Bruto
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Histórico Mensal de Emissão de Notas (2025)
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <BarChartBig className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <FaturamentoChart />
            </Card>

            {/* Gráficos Fiscais (IRPJ/CSLL) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico IRPJ */}
              <Card className="h-[450px]">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                    Imposto de Renda (IRPJ)
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Composição: Base (15%) vs Adicional (10%)
                  </p>
                </div>
                <IRPJChart />
              </Card>

              {/* Gráfico CSLL */}
              <Card className="h-[450px]">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                    Contribuição Social (CSLL)
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Evolução Trimestral (Alíquota 9%)
                  </p>
                </div>
                <CSLLChart />
              </Card>
            </div>

            {/* Cards Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                icon={TrendingUp}
                iconBgColor="bg-red-50"
                iconColor="text-red-600"
                label="Total IRPJ 2025"
                value={formatCurrency(totaisFiscais.irpj)}
              />
              <MetricCard
                icon={BarChart2}
                iconBgColor="bg-cyan-50"
                iconColor="text-cyan-600"
                label="Total CSLL 2025"
                value={formatCurrency(totaisFiscais.csll)}
              />
              <div className="bg-[#0e4f6d] p-6 rounded-[1.5rem] text-white flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Carga Tributária Total
                  </p>
                  <p className="text-xl font-black">
                    {formatCurrency(totaisFiscais.cargaTributariaTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfico: Fluxo Mensal Fiscal (Barras Horizontais) */}
            <Card className="mt-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                    Detalhamento Mensal de Operações
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Comparativo Mês a Mês: Entradas vs Saídas
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <BarChartHorizontal className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <FluxoFiscalChart />
            </Card>

            {/* Resumo Analítico Fiscal */}
            <AlertCard className="mt-8">
              <h3 className="flex items-center gap-2 font-bold text-amber-800 mb-4">
                <AlertCircle className="w-5 h-5" />
                Análise da Carga Tributária e Operações
              </h3>
              <p className="text-amber-900/80 leading-relaxed">
                A apuração de 2025 mostra um faturamento robusto, sustentando a base do Lucro Real.
                Na análise consolidada dos acumuladores, observa-se um volume total de entradas
                (compras para industrialização e comercialização) superior a{' '}
                <strong>R$ 45 milhões</strong>, enquanto as saídas (vendas) totalizam cerca de{' '}
                <strong>R$ 15,6 milhões</strong> no período analisado. Esse descompasso contábil
                sugere um forte movimento de formação de estoque ou aquisição de insumos para
                produção futura, devendo ser acompanhado para otimização do fluxo de caixa.
              </p>
            </AlertCard>
          </div>
        )}

        {/* ===== TAB: PESSOAL ===== */}
        {activeTab === 'pessoal' && (
          <div className="space-y-8">
            {/* Header da seção */}
            <section>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-1">
                Departamento Pessoal
              </h1>
              <p className="text-lg text-slate-400 font-medium">
                Gestão de recursos humanos e obrigações sociais.
              </p>
            </section>

            {/* Placeholder - Em desenvolvimento */}
            <Card padding="p-12" className="text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Processamento de Dados
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Esta aba apresentará o resumo da folha de pagamento, encargos sociais
                e métricas de turnover em breve.
              </p>
            </Card>

            {/* Resumo Analítico Pessoal */}
            <InfoCard>
              <h3 className="flex items-center gap-2 font-bold text-teal-800 mb-4">
                <UserCheck className="w-5 h-5" />
                Perspectiva de Gestão de Pessoal
              </h3>
              <p className="text-teal-900/70 leading-relaxed italic text-sm">
                Análise pendente: aguardando processamento da folha de pagamento para
                identificar correlações entre o crescimento de receita verificado no
                setor contábil e o aumento da força de trabalho.
              </p>
            </InfoCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
