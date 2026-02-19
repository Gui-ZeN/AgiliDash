import {
  Award,
  BarChart2,
  BarChartHorizontal,
  PieChart,
  Receipt,
  Upload,
  Users,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import DashboardSectionTitle from '../../../components/ui/DashboardSectionTitle';
import {
  AdmissoesDemissoesChart,
  CardsMetricasPessoal,
  EmpregadosPorSituacaoChart,
  FGTSPorPeriodoChart,
  FGTSPorTipoChart,
  INSSPorPeriodoChart,
  INSSPorEmpresaChart,
  TabelaFerias,
} from '../../../components/charts/PessoalCharts';
import VisibleItem from '../../../components/common/VisibleItem';

const DashboardPessoalTab = ({
  cardAnimation,
  dadosPessoalImportados,
  isDarkMode,
  itemVisivel,
  periodFilter,
  temDadosPessoal,
}) => {
  const isVisible = (itemId) => itemVisivel('pessoal', itemId);
  const periodoLabel = (() => {
    if (!periodFilter) return 'Ano atual';
    if (periodFilter.type === 'month') {
      return `Mes ${String(periodFilter.month || '').padStart(2, '0')}/${periodFilter.year}`;
    }
    if (periodFilter.type === 'quarter') {
      return `${periodFilter.quarter || 1}o trimestre/${periodFilter.year}`;
    }
    return `Ano ${periodFilter.year}`;
  })();

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <DashboardSectionTitle
        icon={Users}
        badge="Departamento Pessoal"
        title="Análise de Folha de Pagamento"
        subtitle="Recursos humanos e obrigações sociais."
        tone="teal"
        className={`transition-all duration-500 ${cardAnimation}`}
      />

      {/* ===== DADOS IMPORTADOS (PRINCIPAL) ===== */}
      {temDadosPessoal ? (
        <>
          {/* Cards de metricas importadas */}
          <VisibleItem show={isVisible('cards_metricas')}>
            <div className={`transition-all duration-500 delay-100 ${cardAnimation}`}>
              <CardsMetricasPessoal
                dadosFGTS={dadosPessoalImportados?.fgts}
                dadosINSS={dadosPessoalImportados?.inss}
                dadosEmpregados={dadosPessoalImportados?.empregados}
              />
            </div>
          </VisibleItem>

          {/* Graficos FGTS */}
          {dadosPessoalImportados?.fgts &&
            (isVisible('fgts_tipo') || isVisible('fgts_periodo')) && (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all duration-500 delay-200 ${cardAnimation}`}
              >
                <VisibleItem show={isVisible('fgts_tipo')}>
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          FGTS por Tipo
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Consignado, Rescisao, Mensal e 13o
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}
                      >
                        <PieChart
                          className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                        />
                      </div>
                    </div>
                    <FGTSPorTipoChart
                      dados={dadosPessoalImportados.fgts}
                      periodFilter={periodFilter}
                    />
                  </div>
                </VisibleItem>

                <VisibleItem show={isVisible('fgts_periodo')}>
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          FGTS por Periodo
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Filtro aplicado: {periodoLabel}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}
                      >
                        <BarChart2
                          className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}
                        />
                      </div>
                    </div>
                    <FGTSPorPeriodoChart
                      dados={dadosPessoalImportados.fgts}
                      periodFilter={periodFilter}
                    />
                  </div>
                </VisibleItem>
              </div>
            )}

          {/* Graficos INSS */}
          {dadosPessoalImportados?.inss &&
            (isVisible('inss_empresa') || isVisible('inss_periodo')) && (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all duration-500 delay-300 ${cardAnimation}`}
              >
                <VisibleItem show={isVisible('inss_empresa')}>
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          Relacao do INSS
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Distribuicao por categoria
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50'}`}
                      >
                        <BarChartHorizontal
                          className={`w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}
                        />
                      </div>
                    </div>
                    <INSSPorEmpresaChart
                      dados={dadosPessoalImportados.inss}
                      periodFilter={periodFilter}
                    />
                  </div>
                </VisibleItem>

                <VisibleItem show={isVisible('inss_periodo')}>
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          INSS por Periodo
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Filtro aplicado: {periodoLabel}
                        </p>
                      </div>
                    </div>
                    <INSSPorPeriodoChart
                      dados={dadosPessoalImportados.inss}
                      periodFilter={periodFilter}
                    />
                  </div>
                </VisibleItem>
              </div>
            )}

          {/* Graficos de Empregados */}
          {dadosPessoalImportados?.empregados &&
            (isVisible('admissoes_demissoes') || isVisible('empregados_situacao')) && (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all duration-500 delay-400 ${cardAnimation}`}
              >
                {dadosPessoalImportados?.empregados && isVisible('admissoes_demissoes') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          Admissoes e Demissoes
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Movimentacao por periodo
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}
                      >
                        <UserPlus
                          className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                        />
                      </div>
                    </div>
                    <AdmissoesDemissoesChart
                      dados={dadosPessoalImportados.empregados}
                      periodFilter={periodFilter}
                    />
                  </div>
                )}

                {dadosPessoalImportados?.empregados && isVisible('empregados_situacao') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          Por Situacao
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Situacao no periodo filtrado
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}
                      >
                        <PieChart
                          className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}
                        />
                      </div>
                    </div>
                    <EmpregadosPorSituacaoChart
                      dados={dadosPessoalImportados.empregados}
                      periodFilter={periodFilter}
                    />
                  </div>
                )}
              </div>
            )}

          {/* Tabela de Ferias */}
          {dadosPessoalImportados?.ferias && isVisible('tabela_ferias') && (
            <div
              className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-xl border shadow-sm overflow-hidden transition-all duration-500 delay-800 ${cardAnimation}`}
            >
              <div
                className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}
              >
                <div>
                  <h3
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    Programacao de Ferias
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    Proximas ferias programadas
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'}`}
                >
                  {dadosPessoalImportados.ferias?.ferias?.length || 0} registros
                </span>
              </div>
              <TabelaFerias dados={dadosPessoalImportados.ferias} />
            </div>
          )}
        </>
      ) : (
        /* ===== SEM DADOS IMPORTADOS - Mostra aviso ===== */
        <>
          {/* Cards de metricas vazias */}
          <VisibleItem show={isVisible('cards_metricas')}>
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}
            >
              <div className="bg-teal-700 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    Ativos
                  </span>
                </div>
                <p className="text-3xl font-bold">-</p>
                <p className="text-white/70 text-sm mt-1">Colaboradores</p>
              </div>

              <div className="bg-slate-700 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Receipt className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">-</p>
                <p className="text-white/70 text-sm mt-1">Total FGTS</p>
              </div>

              <div className="bg-slate-700 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">-</p>
                <p className="text-white/70 text-sm mt-1">Total INSS</p>
              </div>
            </div>
          </VisibleItem>

          {/* Aviso para importar dados */}
          <div
            className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-12 rounded-xl border shadow-sm text-center transition-all duration-500 delay-200 ${cardAnimation}`}
          >
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}
            >
              <Upload className={`w-10 h-10 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <h3
              className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
            >
              Importe os Dados do Setor Pessoal
            </h3>
            <p
              className={`text-lg mb-6 max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Para visualizar os graficos de FGTS, INSS, Empregados e Ferias, importe os arquivos
              CSV do Sistema Dominio.
            </p>
            <div className={`flex flex-wrap justify-center gap-3 mb-8`}>
              {[
                'Demonstrativo FGTS',
                'Folha de INSS',
                'Relacao de Empregados',
                'Programacao de Ferias',
              ].map((item) => (
                <span
                  key={item}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                >
                  {item}
                </span>
              ))}
            </div>
            <a
              href="/configuracoes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold"
            >
              <Upload className="w-5 h-5" />
              Ir para Importacao
            </a>
          </div>

          {/* Graficos placeholder */}
          {(isVisible('fgts_tipo') ||
            isVisible('fgts_periodo') ||
            isVisible('inss_empresa') ||
            isVisible('inss_periodo')) && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all duration-500 delay-300 ${cardAnimation}`}
            >
              {isVisible('fgts_tipo') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        FGTS por Tipo
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Consignado, Rescisao, Mensal e 13o
                      </p>
                    </div>
                  </div>
                  <FGTSPorTipoChart dados={null} periodFilter={periodFilter} />
                </div>
              )}

              {isVisible('fgts_periodo') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        FGTS por Periodo
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Filtro aplicado: {periodoLabel}
                      </p>
                    </div>
                  </div>
                  <FGTSPorPeriodoChart dados={null} periodFilter={periodFilter} />
                </div>
              )}

              {isVisible('inss_empresa') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        Relacao do INSS
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Distribuicao por categoria
                      </p>
                    </div>
                  </div>
                  <INSSPorEmpresaChart dados={null} periodFilter={periodFilter} />
                </div>
              )}

              {isVisible('inss_periodo') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        INSS por Periodo
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Filtro aplicado: {periodoLabel}
                      </p>
                    </div>
                  </div>
                  <INSSPorPeriodoChart dados={null} periodFilter={periodFilter} />
                </div>
              )}
            </div>
          )}

          {(isVisible('admissoes_demissoes') || isVisible('empregados_situacao')) && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch transition-all duration-500 delay-400 ${cardAnimation}`}
            >
              {isVisible('admissoes_demissoes') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        Admissoes e Demissoes
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Movimentacao por periodo
                      </p>
                    </div>
                  </div>
                  <AdmissoesDemissoesChart dados={null} periodFilter={periodFilter} />
                </div>
              )}

              {isVisible('empregados_situacao') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} h-full p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        Por Situacao
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Situacao no periodo filtrado
                      </p>
                    </div>
                  </div>
                  <EmpregadosPorSituacaoChart dados={null} periodFilter={periodFilter} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Card de resumo */}
      <VisibleItem show={isVisible('resumo_pessoal')}>
        <div
          className={`bg-teal-700 p-8 rounded-xl text-white shadow-md transition-all duration-500 delay-500 ${cardAnimation}`}
        >
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Setor Pessoal</h3>
              <p className="text-white/80 leading-relaxed">
                {temDadosPessoal ? (
                  <>
                    Dados importados do Sistema Dominio. Visualize FGTS, INSS, relacao de empregados
                    e programacao de ferias. Para atualizar os dados, importe novos arquivos CSV na
                    pagina de Configuracoes.
                  </>
                ) : (
                  <>
                    Importe os relatorios do Sistema Dominio para visualizar dados de FGTS, INSS,
                    empregados e ferias. Acesse Configuracoes &gt; Importacao &gt; Setor Pessoal.
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

export default DashboardPessoalTab;
