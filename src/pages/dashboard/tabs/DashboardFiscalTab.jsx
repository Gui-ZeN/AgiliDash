import {
  AlertCircle,
  Award,
  BarChartBig,
  BarChartHorizontal,
  CircleDollarSign,
  FileSpreadsheet,
  Receipt,
  Scale,
  Wallet,
} from 'lucide-react';
import DashboardSectionTitle from '../../../components/ui/DashboardSectionTitle';
import {
  CardsMetricasFiscais,
  CompraVendaChart,
  CSLLPorPeriodoChart,
  Detalhamento380Chart,
  FaturamentoPorCategoriaChart,
  FaturamentoPorTrimestreChart,
  IRPJPorPeriodoChart,
  ResumoImpostosRoscaChart,
  Situacao380Chart,
  Tabela380,
  TabelaAcumuladores,
  TabelaFaturamentoPeriodo,
} from '../../../components/charts/FiscalCharts';
import FaturamentoChart from '../../../components/charts/FaturamentoChart';
import FluxoFiscalChart from '../../../components/charts/FluxoFiscalChart';
import DistribuicaoChart from '../../../components/charts/DistribuicaoChart';
import { formatCurrency } from '../../../utils/formatters';
import VisibleItem from '../../../components/common/VisibleItem';

const DashboardFiscalTab = ({
  cardAnimation,
  dadosFiscaisImportados,
  fiscalTrimestre,
  handleFiscalDataCalculated,
  isDarkMode,
  itemVisivel,
  periodFilter,
  resumoAcumuladorFiltrado,
  resumoImpostosFiltrado,
  selectedYear,
  setFiscalTrimestre,
  temDadosFiscais,
  totalFaturamentoFiltrado,
  totaisFiscais,
}) => {
  const isVisible = (itemId) => itemVisivel('fiscal', itemId);

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <DashboardSectionTitle
        icon={FileSpreadsheet}
        badge="Departamento Fiscal"
        title="Analise Tributaria"
        subtitle="Apuracao trimestral sobre Lucro Real com dados importados do Sistema Dominio."
        tone="slate"
        className={`transition-all duration-500 ${cardAnimation}`}
      />

      {/* Banner de status de dados importados */}
      {!temDadosFiscais && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}
        >
          <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <span className={isDarkMode ? 'text-amber-300' : 'text-amber-800'}>
            Nenhum relatório fiscal importado. Acesse <strong>Configurações</strong> para
            importar dados do Domínio (Resumo por Acumulador, Demonstrativo Mensal, Resumo dos
            Impostos).
          </span>
        </div>
      )}

      {/* Cards de métricas - usando dados importados ou mock */}
      <VisibleItem show={isVisible('cards_metricas')}>
        {temDadosFiscais ? (
          <div className={`transition-all duration-500 delay-100 ${cardAnimation}`}>
            <CardsMetricasFiscais
              dados={resumoAcumuladorFiltrado || dadosFiscaisImportados?.resumoAcumulador}
              totalFaturamento={totalFaturamentoFiltrado}
            />
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 delay-100 ${cardAnimation}`}
          >
            <div
              className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                  <Receipt className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    Total IRPJ
                  </p>
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    {formatCurrency(totaisFiscais.irpj)}
                  </p>
                </div>
              </div>
              <div
                className={`h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
              >
                <div className="h-full bg-red-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div
              className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
                  <CircleDollarSign
                    className={`w-6 h-6 ${isDarkMode ? 'text-teal-500' : 'text-teal-700'}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    Total CSLL
                  </p>
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    {formatCurrency(totaisFiscais.csll)}
                  </p>
                </div>
              </div>
              <div
                className={`h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
              >
                <div className="h-full bg-slate-500 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            <div className="bg-[#0e4f6d] p-6 rounded-xl text-white shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase">Carga Total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totaisFiscais.cargaTributariaTotal)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/70">Carga tributária do exercício</p>
            </div>
          </div>
        )}
      </VisibleItem>

      {/* ===== SEÇÃO FATURAMENTO ===== */}
      <section className={`transition-all duration-500 delay-200 ${cardAnimation}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <BarChartBig
              className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
            />
          </div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Faturamento
          </h2>
        </div>

        {(isVisible('faturamento_categoria') || isVisible('faturamento_evolucao')) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Gráfico de Rosca - Faturamento por Categoria */}
            <VisibleItem show={isVisible('faturamento_categoria')}>
              <div
                className={`h-full p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  Por Categoria
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Entradas, Serviços e Saídas
                </p>
                {temDadosFiscais ? (
                  <FaturamentoPorCategoriaChart
                    dados={
                      resumoAcumuladorFiltrado ||
                      dadosFiscaisImportados?.demonstrativoMensal ||
                      dadosFiscaisImportados?.resumoAcumulador
                    }
                    year={periodFilter?.year}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Importe Demonstrativo Mensal
                    </p>
                  </div>
                )}
              </div>
            </VisibleItem>

            {/* Gráfico de Barras - Faturamento por Trimestre */}
            <VisibleItem show={isVisible('faturamento_evolucao')}>
              <div
                className={`h-full p-6 rounded-xl shadow-sm ${isVisible('faturamento_categoria') ? 'lg:col-span-2' : 'lg:col-span-3'} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Evolução Mensal
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Entradas vs Saídas por mês
                    </p>
                  </div>
                  {/* Seletor de Período */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFiscalTrimestre(null)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        fiscalTrimestre === null
                          ? 'bg-[#0e4f6d] text-white'
                          : isDarkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Ano
                    </button>
                    {[1, 2, 3, 4].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFiscalTrimestre(t)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          fiscalTrimestre === t
                            ? 'bg-[#0e4f6d] text-white'
                            : isDarkMode
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t}T
                      </button>
                    ))}
                  </div>
                </div>
                {temDadosFiscais && dadosFiscaisImportados?.demonstrativoMensal ? (
                  <FaturamentoPorTrimestreChart
                    dados={dadosFiscaisImportados.demonstrativoMensal}
                    trimestre={fiscalTrimestre}
                    year={periodFilter?.year}
                  />
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <FaturamentoChart />
                  </div>
                )}
              </div>
            </VisibleItem>
          </div>
        )}

        {/* Tabelas de Acumuladores */}
        {temDadosFiscais &&
          resumoAcumuladorFiltrado &&
          (isVisible('acumuladores_entradas') || isVisible('acumuladores_saidas')) && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <VisibleItem show={isVisible('acumuladores_entradas')}>
                <div
                  className={`h-full rounded-xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
                >
                  <div
                    className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}
                  >
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Principais Acumuladores - Entradas
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Categorias com maior valor contábil
                    </p>
                  </div>
                  <TabelaAcumuladores dados={resumoAcumuladorFiltrado} tipo="entradas" />
                </div>
              </VisibleItem>

              <VisibleItem show={isVisible('acumuladores_saidas')}>
                <div
                  className={`h-full rounded-xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
                >
                  <div
                    className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}
                  >
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Principais Acumuladores - Saídas
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Categorias com maior valor contábil
                    </p>
                  </div>
                  <TabelaAcumuladores dados={resumoAcumuladorFiltrado} tipo="saidas" />
                </div>
              </VisibleItem>
            </div>
          )}

        {/* Tabela de Faturamento por Periodo */}
        <VisibleItem
          show={
            temDadosFiscais &&
            dadosFiscaisImportados?.faturamento &&
            isVisible('faturamento_periodo')
          }
        >
          <div
            className={`mt-6 h-full rounded-xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
          >
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {'Faturamento por Per\u00edodo'}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {'Total do faturamento no recorte de m\u00eas, trimestre ou ano'}
              </p>
            </div>
            <TabelaFaturamentoPeriodo
              dadosFaturamento={dadosFiscaisImportados.faturamento}
              periodFilter={periodFilter}
            />
          </div>
        </VisibleItem>

        {(isVisible('compra_vs_venda') || isVisible('categoria_380')) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisibleItem show={isVisible('compra_vs_venda')}>
              <div
                className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  Compra vs Venda
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {'Compra p/ comercialização, Vendas e Serviços'}
                </p>
                {temDadosFiscais && dadosFiscaisImportados?.resumoAcumulador ? (
                  <CompraVendaChart dados={dadosFiscaisImportados.resumoAcumulador} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <DistribuicaoChart onDataCalculated={handleFiscalDataCalculated} />
                  </div>
                )}
              </div>
            </VisibleItem>

            <VisibleItem show={isVisible('categoria_380')}>
              <div
                className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  Por Categoria
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {'Vendas, Compra p/ comercialização e Serviços'}
                </p>
                {temDadosFiscais && dadosFiscaisImportados?.resumoAcumulador ? (
                  <Detalhamento380Chart dados={dadosFiscaisImportados.resumoAcumulador} />
                ) : (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Importe Resumo por Acumulador
                    </p>
                  </div>
                )}
              </div>
            </VisibleItem>
          </div>
        )}
      </section>

      {/* ===== SEÇÃO SITUAÇÃO FISCAL ===== */}
      {(isVisible('irpj_periodo') || isVisible('resumo_impostos') || isVisible('csll_periodo')) && (
        <section className={`transition-all duration-500 delay-300 ${cardAnimation}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
              <Receipt className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`} />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {'Situa\u00e7\u00e3o Fiscal'}
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Grafico - IRPJ por Periodo */}
            <VisibleItem show={isVisible('irpj_periodo')}>
              <div
                className={`xl:col-span-2 p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      {'IRPJ por Per\u00edodo'}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {'Composi\u00e7\u00e3o do IRPJ apurado'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFiscalTrimestre(null)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        fiscalTrimestre === null
                          ? 'bg-[#0e4f6d] text-white'
                          : isDarkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Ano
                    </button>
                    {[1, 2, 3, 4].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFiscalTrimestre(t)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          fiscalTrimestre === t
                            ? 'bg-[#0e4f6d] text-white'
                            : isDarkMode
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t}T
                      </button>
                    ))}
                  </div>
                </div>
                <IRPJPorPeriodoChart
                  dados={dadosFiscaisImportados?.irpj || []}
                  trimestre={fiscalTrimestre}
                  year={periodFilter?.year}
                />
              </div>
            </VisibleItem>

            {/* Gráfico de Rosca - Resumo dos Impostos */}
            <VisibleItem
              show={
                isVisible('resumo_impostos') &&
                Object.keys(resumoImpostosFiltrado?.totaisPorImposto || {}).length > 0
              }
            >
              <div
                className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  Resumo dos Impostos
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {'Distribui\u00e7\u00e3o dos impostos no per\u00edodo'}
                </p>
                <ResumoImpostosRoscaChart dados={resumoImpostosFiltrado} />
              </div>
            </VisibleItem>

            {/* Grafico - CSLL por Periodo */}
            <VisibleItem show={isVisible('csll_periodo')}>
              <div
                className={`xl:col-span-3 p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  {'CSLL por Per\u00edodo'}
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {'Composi\u00e7\u00e3o do CSLL'}
                </p>
                <CSLLPorPeriodoChart
                  dados={dadosFiscaisImportados?.csll || []}
                  trimestre={fiscalTrimestre}
                  year={periodFilter?.year}
                />
              </div>
            </VisibleItem>
          </div>
        </section>
      )}

      {/* ===== SEÇÃO COMPARATIVO 380 ===== */}
      {(isVisible('tabela_380') || isVisible('situacao_380')) && (
        <section className={`transition-all duration-500 delay-400 ${cardAnimation}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
              <Scale className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`} />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Comparativo 380
            </h2>
          </div>
          {/* Tabela 380 */}
          <VisibleItem
            show={
              isVisible('tabela_380') && temDadosFiscais && dadosFiscaisImportados?.resumoAcumulador
            }
          >
            <div
              className={`mt-6 h-full rounded-xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
            >
              <div
                className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}
              >
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Cálculo 380
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Período | Compra | Venda | Esperado | Receita Complementar | Situação
                </p>
              </div>
              <Tabela380
                dados={dadosFiscaisImportados.resumoAcumulador}
                dadosMensais={dadosFiscaisImportados.demonstrativoMensal}
              />
            </div>
          </VisibleItem>

          {/* Gráfico de Rosca - Situação 380 */}
          <VisibleItem show={isVisible('situacao_380')}>
            <div
              className={`mt-6 p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
            >
              <h3
                className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
              >
                Situação 380
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Vendido vs Falta Vender (Esperado = Compra x 1.25)
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="flex justify-center">
                  {temDadosFiscais && dadosFiscaisImportados?.resumoAcumulador ? (
                    <Situacao380Chart dados={dadosFiscaisImportados.resumoAcumulador} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Importe Resumo por Acumulador
                      </p>
                    </div>
                  )}
                </div>
                {temDadosFiscais && dadosFiscaisImportados?.resumoAcumulador && (
                  <div
                    className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}
                  >
                    <h4
                      className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      Resumo da Situação
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                          Compra p/ Comercialização
                        </span>
                        <span
                          className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                        >
                          {formatCurrency(
                            dadosFiscaisImportados.resumoAcumulador?.categorias
                              ?.compraComercializacao || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                          Esperado (Compra + 25%)
                        </span>
                        <span
                          className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}
                        >
                          {formatCurrency(
                            dadosFiscaisImportados.resumoAcumulador?.categorias?.esperado380 || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                          Total Vendido
                        </span>
                        <span
                          className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                        >
                          {formatCurrency(
                            dadosFiscaisImportados.resumoAcumulador?.categorias?.totalVendas380 || 0
                          )}
                        </span>
                      </div>
                      <div
                        className={`pt-3 mt-3 border-t ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                          >
                            Situação
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              (dadosFiscaisImportados.resumoAcumulador?.categorias
                                ?.totalVendas380 || 0) >=
                              (dadosFiscaisImportados.resumoAcumulador?.categorias?.esperado380 ||
                                0)
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {(dadosFiscaisImportados.resumoAcumulador?.categorias?.totalVendas380 ||
                              0) >=
                            (dadosFiscaisImportados.resumoAcumulador?.categorias?.esperado380 || 0)
                              ? 'OK'
                              : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </VisibleItem>
        </section>
      )}

      {/* Fluxo Fiscal - mantido para compatibilidade */}
      {!temDadosFiscais && isVisible('faturamento_evolucao') && (
        <div
          className={`p-8 rounded-xl shadow-sm transition-all duration-500 delay-500 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Operações Mensais
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Entradas vs Saídas por mês
              </p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <BarChartHorizontal
                className={`w-6 h-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
              />
            </div>
          </div>
          <FluxoFiscalChart />
        </div>
      )}

      {/* Card de análise */}
      <VisibleItem show={isVisible('analise_fiscal')}>
        <div
          className={`bg-slate-700 p-8 rounded-xl text-white shadow-md transition-all duration-500 delay-600 ${cardAnimation}`}
        >
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Análise Fiscal {selectedYear}</h3>
              <p className="text-white/80 leading-relaxed">
                {temDadosFiscais ? (
                  <>
                    Dados importados do Sistema Domínio. Os relatórios fiscais mostram a
                    movimentação de entradas e saídas, impostos a recolher e situação do 380
                    (comercialização de mercadorias). Acompanhe mensalmente para garantir
                    conformidade tributária.
                  </>
                ) : (
                  <>
                    Para visualizar dados reais, importe os relatórios do Sistema Domínio (Resumo
                    por Acumulador, Demonstrativo Mensal, Resumo dos Impostos) na área de
                    Configurações. Volume de entradas superior a <strong>R$ 45 milhões</strong>{' '}
                    contra saídas de
                    <strong> R$ 15,6 milhões</strong> sugere formação de estoque ou aquisição
                    de insumos.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </VisibleItem>
    </div>
  );
};

export default DashboardFiscalTab;
