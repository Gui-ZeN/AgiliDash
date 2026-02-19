import {
  AlertCircle,
  Award,
  Banknote,
  BarChart2,
  Calculator,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { ButtonGroup } from '../../../components/common/Button';
import DashboardSectionTitle from '../../../components/ui/DashboardSectionTitle';
import {
  AplicacoesFinanceirasChart,
  CardsMetricasContabil,
  ComparativoReceitaDespesaChart,
  MovimentacaoBancariaChart,
  ReceitaCustoEstoqueChart,
  TabelaComparativoMensal,
  VariacaoLucroChart,
} from '../../../components/charts/ContabilCharts';
import { formatCurrency } from '../../../utils/formatters';
import VisibleItem from '../../../components/common/VisibleItem';

const DashboardContabilTab = ({
  cardAnimation,
  dadosComparativoLucro,
  dadosContabeisImportados,
  dadosReceitaCustoEstoque,
  isDarkMode,
  itemVisivel,
  margemLucro,
  selectedYear,
  setSelectedYear,
  temDadosContabeis,
  totalDespesa,
  totalLucro,
  totalReceita,
}) => {
  const isVisible = (itemId) => itemVisivel('contabil', itemId);
  const importHint =
    'Dados ainda não disponíveis. Importe os relatórios contábeis do Sistema Domínio em Configurações > Importar Dados para liberar este painel.';

  return (
    <div className="space-y-7 pb-8">
      <DashboardSectionTitle
        icon={Calculator}
        badge="Departamento Contábil"
        title="Análise Financeira"
        subtitle="Demonstrativo de receitas, despesas, estoque e saldos."
        tone="emerald"
        className={`transition-all duration-500 ${cardAnimation}`}
      />

      {!temDadosContabeis && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}
        >
          <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <span className={isDarkMode ? 'text-amber-300' : 'text-amber-800'}>{importHint}</span>
        </div>
      )}

      <VisibleItem show={isVisible('cards_metricas')}>
        {temDadosContabeis ? (
          <div className={`transition-all duration-500 delay-100 ${cardAnimation}`}>
            <CardsMetricasContabil dados={dadosContabeisImportados?.analiseHorizontal} />
          </div>
        ) : (
          <div
            className={`rounded-xl border p-5 transition-all duration-500 delay-100 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <p className="text-sm">{importHint}</p>
          </div>
        )}
      </VisibleItem>

      {(isVisible('grafico_receita_despesa') || isVisible('card_resumo_exercicio')) && (
        <section className={`transition-all duration-500 delay-200 ${cardAnimation}`}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}
            >
              <BarChart2
                className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}
              />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Resultado Líquido
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <VisibleItem show={isVisible('grafico_receita_despesa')}>
              <div
                className={`h-full lg:col-span-2 p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Receita x Despesas/Custo
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Variação comparativa
                    </p>
                  </div>
                  <ButtonGroup
                    options={[
                      { value: 2024, label: '2024' },
                      { value: 2025, label: '2025' },
                    ]}
                    activeValue={selectedYear}
                    onChange={setSelectedYear}
                  />
                </div>

                {temDadosContabeis ? (
                  <ComparativoReceitaDespesaChart
                    dados={dadosContabeisImportados?.analiseHorizontal}
                  />
                ) : (
                  <div className="h-[320px] flex items-center justify-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {importHint}
                    </p>
                  </div>
                )}
              </div>
            </VisibleItem>

            <VisibleItem show={isVisible('card_resumo_exercicio')}>
              <div
                className={`h-full p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <h3
                  className={`text-lg font-bold mb-6 pb-4 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}
                >
                  Resumo do Exercício
                </h3>

                {temDadosContabeis ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}
                    >
                      <p
                        className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}
                      >
                        Receita Anual
                      </p>
                      <p
                        className={`text-2xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}
                      >
                        {formatCurrency(totalReceita)}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                      <p
                        className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}
                      >
                        Despesa Anual
                      </p>
                      <p
                        className={`text-2xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}
                      >
                        {formatCurrency(totalDespesa)}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-xl ${isDarkMode ? 'bg-[#0e4f6d]/40' : 'bg-[#0e4f6d]/10'}`}
                    >
                      <p
                        className={`text-sm font-medium ${isDarkMode ? 'text-teal-500' : 'text-[#0e4f6d]'}`}
                      >
                        Lucro Líquido
                      </p>
                      <p
                        className={`text-2xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#0e4f6d]'}`}
                      >
                        {formatCurrency(totalLucro)}
                      </p>
                      <p
                        className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Margem: {margemLucro}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {importHint}
                    </p>
                  </div>
                )}
              </div>
            </VisibleItem>
          </div>
        </section>
      )}

      <VisibleItem show={isVisible('tabela_comparativo_mensal')}>
        <div
          className={`rounded-xl shadow-sm overflow-hidden transition-all duration-500 delay-300 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
        >
          <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Detalhamento Mensal
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mês Referência | Entradas | Saídas/Custos | Lucro Líquido
            </p>
          </div>
          {temDadosContabeis ? (
            <TabelaComparativoMensal dados={dadosContabeisImportados?.analiseHorizontal} />
          ) : (
            <div className="h-[260px] flex items-center justify-center p-6 text-center">
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {importHint}
              </p>
            </div>
          )}
        </div>
      </VisibleItem>

      <VisibleItem show={isVisible('grafico_variacao_lucro')}>
        <div
          className={`p-6 rounded-xl shadow-sm transition-all duration-500 delay-400 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Variação do Lucro
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Lucro antes do IRPJ e CSLL
              </p>
            </div>
            {temDadosContabeis && (
              <div className="flex items-center gap-4">
                <span
                  className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  <div className="w-3 h-3 rounded-full bg-[#0e4f6d]" />
                  {dadosComparativoLucro.anoAtual}
                </span>
                {dadosComparativoLucro.dadosAnterior && (
                  <span
                    className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-[#58a3a4] border-2 border-dashed border-[#58a3a4]" />
                    {dadosComparativoLucro.anoAnterior}
                  </span>
                )}
              </div>
            )}
          </div>

          {temDadosContabeis ? (
            <VariacaoLucroChart
              dadosAtual={dadosComparativoLucro.dadosAtual}
              dadosAnterior={dadosComparativoLucro.dadosAnterior}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-center">
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {importHint}
              </p>
            </div>
          )}
        </div>
      </VisibleItem>

      {(isVisible('grafico_receita_custo_estoque') ||
        isVisible('grafico_movimentacao_bancaria')) && (
        <section className={`transition-all duration-500 delay-500 ${cardAnimation}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <Wallet className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Variação de Estoque e Saldos Bancários
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisibleItem show={isVisible('grafico_receita_custo_estoque')}>
              <div
                className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Receita x Custo x Estoque
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Últimos 12 meses
                    </p>
                  </div>
                </div>
                {temDadosContabeis ? (
                  <ReceitaCustoEstoqueChart dados={dadosReceitaCustoEstoque} />
                ) : (
                  <div className="h-[280px] md:h-[320px] flex items-center justify-center text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {importHint}
                    </p>
                  </div>
                )}
              </div>
            </VisibleItem>

            <VisibleItem show={isVisible('grafico_movimentacao_bancaria')}>
              <div
                className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Movimentação Bancária
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Saldo em Bancos Conta Movimento
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#0e4f6d]/30' : 'bg-[#0e4f6d]/10'}`}
                  >
                    <Banknote
                      className={`w-5 h-5 ${isDarkMode ? 'text-teal-500' : 'text-[#0e4f6d]'}`}
                    />
                  </div>
                </div>
                {temDadosContabeis ? (
                  <MovimentacaoBancariaChart
                    dados={dadosContabeisImportados?.balancetesConsolidados}
                  />
                ) : (
                  <div className="h-[280px] md:h-[320px] flex items-center justify-center text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {importHint}
                    </p>
                  </div>
                )}
              </div>
            </VisibleItem>
          </div>
        </section>
      )}

      <VisibleItem show={isVisible('grafico_aplicacoes_financeiras')}>
        <div
          className={`p-6 rounded-xl shadow-sm transition-all duration-500 delay-600 ${cardAnimation} ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Aplicações Financeiras
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Aplicações Financeiras de Liquidez Imediata
              </p>
            </div>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#58a3a4]/30' : 'bg-[#58a3a4]/10'}`}>
              <TrendingUp
                className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-[#58a3a4]'}`}
              />
            </div>
          </div>
          {temDadosContabeis ? (
            <AplicacoesFinanceirasChart dados={dadosContabeisImportados?.balancetesConsolidados} />
          ) : (
            <div className="h-[280px] md:h-[320px] flex items-center justify-center text-center">
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {importHint}
              </p>
            </div>
          )}
        </div>
      </VisibleItem>

      <VisibleItem show={isVisible('analise_contabil')}>
        <div
          className={`bg-[#0e4f6d] p-8 rounded-xl text-white shadow-md transition-all duration-500 delay-700 ${cardAnimation}`}
        >
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Análise de Performance 2025</h3>
              <p className="text-white/80 leading-relaxed">
                {temDadosContabeis ? (
                  <>
                    Dados importados do Sistema Domínio. Os relatórios mostram a evolução financeira
                    da empresa ao longo do exercício, permitindo acompanhar receitas, despesas,
                    movimentação bancária e aplicações financeiras mês a mês.
                  </>
                ) : (
                  <>
                    Importe os relatórios contábeis do Sistema Domínio para gerar a análise deste
                    setor.
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

export default DashboardContabilTab;
