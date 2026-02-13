import {
  AlertCircle,
  AlertTriangle,
  BarChartBig,
  Briefcase,
  CheckCircle,
  DollarSign,
  Download,
  FileCheck,
  FileDown,
  Home,
  Package,
  Percent,
  PieChart,
  ScrollText,
  Shield,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  DespesasMensaisChart,
  DespesasCategoriaChart,
} from '../../../components/charts/DespesasAdminChart';
import { formatCurrency } from '../../../utils/formatters';
import VisibleItem from '../../../components/common/VisibleItem';

const DashboardAdministrativoTab = ({
  administrativoData,
  cardAnimation,
  handleExportReport,
  isDarkMode,
  itemVisivel,
}) => {
  const isVisible = (itemId) => itemVisivel('administrativo', itemId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`flex items-start justify-between transition-all duration-500 ${cardAnimation}`}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Setor Administrativo
            </span>
          </div>
          <h1
            className={`text-4xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}
          >
            GestÃ£o Administrativa
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Contratos, despesas e documentos da empresa.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
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

      {/* Cards de mÃ©tricas principais */}
      <VisibleItem show={isVisible('cards_metricas')}>
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}
        >
          <div className="bg-amber-600 p-6 rounded-xl text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <ScrollText className="w-8 h-8 opacity-80" />
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Vigentes</span>
            </div>
            <p className="text-3xl font-bold">{administrativoData.contratos.vigentes}</p>
            <p className="text-white/70 text-sm mt-1">Contratos Ativos</p>
          </div>

          <div className="bg-slate-700 p-6 rounded-xl text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(administrativoData.indicadores.custoOperacional)}
            </p>
            <p className="text-white/70 text-sm mt-1">Custo Operacional/MÃªs</p>
          </div>

          <div className="bg-emerald-700 p-6 rounded-xl text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <FileCheck className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">
              {administrativoData.certidoes.filter((c) => c.status === 'VÃ¡lida').length}
            </p>
            <p className="text-white/70 text-sm mt-1">CertidÃµes VÃ¡lidas</p>
          </div>

          <div className="bg-red-600 p-6 rounded-xl text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{administrativoData.contratos.vencendo30dias}</p>
            <p className="text-white/70 text-sm mt-1">Vencendo em 30 dias</p>
          </div>
        </div>
      </VisibleItem>

      {/* GrÃ¡fico de Despesas Mensais */}
      <VisibleItem show={isVisible('despesas_mensais')}>
        <div
          className={`bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-500 delay-200 ${cardAnimation}`}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Despesas Administrativas
              </h3>
              <p className="text-sm text-slate-400">EvoluÃ§Ã£o mensal das despesas</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <BarChartBig className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <DespesasMensaisChart despesasMensais={administrativoData.despesasMensais} />
        </div>
      </VisibleItem>

      {/* Grid: Despesas por Categoria e Indicadores */}
      {(isVisible('despesas_categoria') || isVisible('indicadores_operacionais')) && (
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${cardAnimation}`}
        >
          {/* Despesas por Categoria */}
          <VisibleItem show={isVisible('despesas_categoria')}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    Despesas por Categoria
                  </h3>
                  <p className="text-sm text-slate-400">DistribuiÃ§Ã£o dos custos</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                  <PieChart className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <DespesasCategoriaChart
                despesasPorCategoria={administrativoData.despesasPorCategoria}
              />
            </div>
          </VisibleItem>

          {/* Indicadores */}
          <VisibleItem show={isVisible('indicadores_operacionais')}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3
                className={`text-lg font-bold mb-6 pb-4 border-b ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}
              >
                Indicadores Operacionais
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Ticket MÃ©dio de Venda
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(administrativoData.indicadores.ticketMedioVenda)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Percent className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Margem Operacional
                    </span>
                  </div>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {administrativoData.indicadores.margemOperacional}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Taxa de InadimplÃªncia
                    </span>
                  </div>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    {administrativoData.indicadores.inadimplencia}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Custo Operacional Mensal
                    </span>
                  </div>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(administrativoData.indicadores.custoOperacional)}
                  </span>
                </div>
              </div>
            </div>
          </VisibleItem>
        </div>
      )}

      {/* Tabela de CertidÃµes */}
      <VisibleItem show={isVisible('tabela_certidoes')}>
        <div
          className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-500 delay-400 ${cardAnimation}`}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                CertidÃµes e Documentos
              </h3>
              <p className="text-sm text-slate-400">Status das certidÃµes da empresa</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
              {administrativoData.certidoes.length} documentos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Documento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Validade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {administrativoData.certidoes.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${cert.status === 'VÃ¡lida' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}
                        >
                          <FileCheck
                            className={`w-4 h-4 ${cert.status === 'VÃ¡lida' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cert.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-sm">
                        {cert.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(cert.validade).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cert.status === 'VÃ¡lida' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}
                      >
                        {cert.status === 'VÃ¡lida' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {cert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </VisibleItem>

      {/* Tabela de Contratos */}
      <VisibleItem show={isVisible('tabela_contratos')}>
        <div
          className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-500 delay-500 ${cardAnimation}`}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Contratos Ativos
              </h3>
              <p className="text-sm text-slate-400">Contratos vigentes com fornecedores</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
              {administrativoData.listaContratos.length} contratos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Fornecedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">
                    Valor Mensal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {administrativoData.listaContratos.map((contrato) => {
                  const iconMap = {
                    Aluguel: Home,
                    Utilidades: Zap,
                    Seguro: Shield,
                    'ServiÃ§os': Wrench,
                  };
                  const Icon = iconMap[contrato.tipo] || Package;

                  return (
                    <tr
                      key={contrato.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {contrato.fornecedor}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-sm">
                          {contrato.tipo}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold ${isDarkMode ? 'text-teal-400' : 'text-[#0e4f6d]'}`}
                      >
                        {formatCurrency(contrato.valor)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {new Date(contrato.vencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${contrato.status === 'Ativo' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}
                        >
                          {contrato.status === 'Ativo' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
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
      </VisibleItem>

      {/* Card de informaÃ§Ã£o */}
      <div
        className={`bg-amber-600 p-8 rounded-xl text-white shadow-md transition-all duration-500 delay-600 ${cardAnimation}`}
      >
        <div className="flex items-start gap-6">
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">GestÃ£o Administrativa</h3>
            <p className="text-white/80 leading-relaxed">
              O setor administrativo gerencia{' '}
              <strong>{administrativoData.contratos.total} contratos</strong> com custo operacional
              mensal de{' '}
              <strong>{formatCurrency(administrativoData.indicadores.custoOperacional)}</strong>.
              Todas as certidÃµes estÃ£o em dia, garantindo a regularidade fiscal e trabalhista da
              empresa.
              {administrativoData.contratos.vencendo30dias > 0 && (
                <strong className="block mt-2">
                  AtenÃ§Ã£o: {administrativoData.contratos.vencendo30dias} contrato(s) vencendo nos
                  prÃ³ximos 30 dias.
                </strong>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdministrativoTab;
