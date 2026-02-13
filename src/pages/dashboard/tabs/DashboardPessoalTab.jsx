import {
  Award,
  Banknote,
  BarChart2,
  BarChartHorizontal,
  Download,
  FileDown,
  PieChart,
  Receipt,
  Upload,
  Users,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  AdmissoesDemissoesChart,
  CardsMetricasPessoal,
  EmpregadosPorSituacaoChart,
  FGTSPorAnoChart,
  FGTSPorTipoChart,
  FGTSMensalChart,
  FGTSUltimos3MesesChart,
  INSSMensalChart,
  INSSPorEmpresaChart,
  INSSPorTipoGuiaChart,
  SalarioPorCargoChart,
  TabelaFerias,
} from '../../../components/charts/PessoalCharts';
import VisibleItem from '../../../components/common/VisibleItem';

const DashboardPessoalTab = ({
  cardAnimation,
  dadosPessoalImportados,
  handleExportReport,
  isDarkMode,
  itemVisivel,
  temDadosPessoal,
}) => {
  const isVisible = (itemId) => itemVisivel('pessoal', itemId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`flex items-start justify-between transition-all duration-500 ${cardAnimation}`}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${isDarkMode ? 'bg-teal-600' : 'bg-teal-600'} rounded-lg`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}
            >
              Departamento Pessoal
            </span>
          </div>
          <h1
            className={`text-4xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}
          >
            Gestão de Pessoas
          </h1>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
            Recursos humanos e obrigações sociais
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportReport('pdf')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
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
                dadosSalario={dadosPessoalImportados?.salarioBase}
              />
            </div>
          </VisibleItem>

          {/* Graficos FGTS */}
          {dadosPessoalImportados?.fgts &&
            (isVisible('fgts_tipo') || isVisible('fgts_3_meses')) && (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-200 ${cardAnimation}`}
              >
                {isVisible('fgts_tipo') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
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
                          Mensal, 13o, Rescisao
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
                    <FGTSPorTipoChart dados={dadosPessoalImportados.fgts} />
                  </div>
                )}

                {isVisible('fgts_3_meses') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          FGTS Últimos 3 Meses
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Comparativo recente
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
                    <FGTSUltimos3MesesChart dados={dadosPessoalImportados.fgts} />
                  </div>
                )}
              </div>
            )}

          {/* FGTS Mensal + Por Ano */}
          {dadosPessoalImportados?.fgts && (isVisible('fgts_mensal') || isVisible('fgts_ano')) && (
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 delay-300 ${cardAnimation}`}
            >
              {isVisible('fgts_mensal') && (
                <div
                  className={`${isVisible('fgts_ano') ? 'md:col-span-2 ' : 'md:col-span-3 '}${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        FGTS Mês a Mês
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Evolucao mensal do FGTS
                      </p>
                    </div>
                  </div>
                  <FGTSMensalChart dados={dadosPessoalImportados.fgts} />
                </div>
              )}

              {isVisible('fgts_ano') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        FGTS por Ano
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Acumulado anual
                      </p>
                    </div>
                  </div>
                  <FGTSPorAnoChart dados={dadosPessoalImportados.fgts} />
                </div>
              )}
            </div>
          )}

          {/* Graficos INSS */}
          {dadosPessoalImportados?.inss &&
            (isVisible('inss_empresa') || isVisible('inss_tipo_guia')) && (
              <div
                className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 delay-400 ${cardAnimation}`}
              >
                {isVisible('inss_empresa') && (
                  <div
                    className={`${isVisible('inss_tipo_guia') ? 'md:col-span-2 ' : 'md:col-span-3 '}${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          INSS por Empresa
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Distribuicao por empresa
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
                    <INSSPorEmpresaChart dados={dadosPessoalImportados.inss} />
                  </div>
                )}

                {isVisible('inss_tipo_guia') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          Tipo de Guia
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Original vs Retificador
                        </p>
                      </div>
                    </div>
                    <INSSPorTipoGuiaChart dados={dadosPessoalImportados.inss} />
                  </div>
                )}
              </div>
            )}

          {/* INSS Mensal */}
          {dadosPessoalImportados?.inss && isVisible('inss_mensal') && (
            <div
              className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm transition-all duration-500 delay-500 ${cardAnimation}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    INSS Mês a Mês
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    Evolução mensal do INSS
                  </p>
                </div>
              </div>
              <INSSMensalChart dados={dadosPessoalImportados.inss} />
            </div>
          )}

          {/* Graficos de Empregados */}
          {(dadosPessoalImportados?.empregados || dadosPessoalImportados?.salarioBase) &&
            (isVisible('admissoes_demissoes') || isVisible('empregados_situacao')) && (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-600 ${cardAnimation}`}
              >
                {dadosPessoalImportados?.empregados && isVisible('admissoes_demissoes') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          Admissões e Demissões
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Movimentação de pessoal
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
                    <AdmissoesDemissoesChart dados={dadosPessoalImportados.empregados} />
                  </div>
                )}

                {dadosPessoalImportados?.empregados && isVisible('empregados_situacao') && (
                  <div
                    className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                        >
                          Por Situação
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                          Ativos, Demitidos, Afastados
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
                    <EmpregadosPorSituacaoChart dados={dadosPessoalImportados.empregados} />
                  </div>
                )}
              </div>
            )}

          {/* Salario por Cargo */}
          {dadosPessoalImportados?.salarioBase && isVisible('salario_cargo') && (
            <div
              className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm transition-all duration-500 delay-700 ${cardAnimation}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    Salário Médio por Cargo
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    Top 10 cargos por salário
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}
                >
                  <Banknote
                    className={`w-6 h-6 ${isDarkMode ? 'text-emerald-700' : 'text-emerald-700'}`}
                  />
                </div>
              </div>
              <SalarioPorCargoChart dados={dadosPessoalImportados.salarioBase} />
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
                    Programação de Férias
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    Próximas férias programadas
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
              className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}
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

              <div className="bg-emerald-700 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Banknote className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">-</p>
                <p className="text-white/70 text-sm mt-1">Folha Salarial</p>
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
              Para visualizar os gráficos de FGTS, INSS, Empregados, Salários e Férias, importe
              os arquivos CSV do Sistema Domínio.
            </p>
            <div className={`flex flex-wrap justify-center gap-3 mb-8`}>
              {[
                'Demonstrativo FGTS',
                'Folha de INSS',
                'Relação de Empregados',
                'Salário Base',
                'Programação de Férias',
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
              Ir para Importação
            </a>
          </div>

          {/* Graficos placeholder */}
          {(isVisible('fgts_tipo') || isVisible('inss_empresa')) && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${cardAnimation}`}
            >
              {isVisible('fgts_tipo') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        FGTS por Tipo
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Mensal, 13º, Rescisão
                      </p>
                    </div>
                  </div>
                  <FGTSPorTipoChart dados={null} />
                </div>
              )}

              {isVisible('inss_empresa') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        INSS por Empresa
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Distribuição por empresa
                      </p>
                    </div>
                  </div>
                  <INSSPorEmpresaChart dados={null} />
                </div>
              )}
            </div>
          )}

          {(isVisible('admissoes_demissoes') || isVisible('salario_cargo')) && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-400 ${cardAnimation}`}
            >
              {isVisible('admissoes_demissoes') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        Admissões e Demissões
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Movimentação de pessoal
                      </p>
                    </div>
                  </div>
                  <AdmissoesDemissoesChart dados={null} />
                </div>
              )}

              {isVisible('salario_cargo') && (
                <div
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-xl border shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                      >
                        Salário por Cargo
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        Top cargos por salário
                      </p>
                    </div>
                  </div>
                  <SalarioPorCargoChart dados={null} />
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
                    Dados importados do Sistema Domínio. Visualize FGTS, INSS, relação de
                    empregados, salários por cargo e programação de férias. Para atualizar os
                    dados, importe novos arquivos CSV na página de Configurações.
                  </>
                ) : (
                  <>
                    Importe os relatórios do Sistema Domínio para visualizar dados de FGTS, INSS,
                    empregados, salários e férias. Acesse Configurações &gt; Importação &gt;
                    Setor Pessoal.
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
