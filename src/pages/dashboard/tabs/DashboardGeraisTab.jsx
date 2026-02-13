import {
  User,
  ShieldCheck,
  Calculator,
  FileSpreadsheet,
  Users,
  TrendingUp,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  Briefcase,
  FileText,
  Percent,
} from 'lucide-react';
import Sparkline from '../../../components/ui/Sparkline';
import VisibleItem from '../../../components/common/VisibleItem';
import { formatCurrency } from '../../../utils/formatters';

const iconMap = {
  calculator: Calculator,
  'file-spreadsheet': FileSpreadsheet,
  users: Users,
  briefcase: Briefcase,
};

const DashboardGeraisTab = ({
  cardAnimation,
  cnpjInfo,
  equipeTecnica,
  isDarkMode,
  itemVisivel,
  margemLucro,
  lucroSparkline,
  receitaSparkline,
  responsavelInfo,
  responsavelWhatsappLink,
  selectedYear,
  totalLucro,
  totalReceita,
  variacaoReceita,
}) => {
  const isVisible = (itemId) => itemVisivel('gerais', itemId);
  const showHeader = isVisible('header_empresa');
  const showResponsavel = isVisible('responsavel');

  return (
    <div className="space-y-8">
      <VisibleItem show={showHeader}>
        <section className={`transition-all duration-500 ${cardAnimation}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0e4f6d] rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-[#0e4f6d]'}`}
            >
              Visão Geral
            </span>
          </div>
          <h1
            className={`text-4xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}
          >
            Informações Gerais
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Dados cadastrais e equipe técnica responsável pela conta.
          </p>
        </section>
      </VisibleItem>

      <VisibleItem show={isVisible('cards_resumo')}>
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 delay-100 ${cardAnimation}`}
        >
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
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
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {formatCurrency(totalReceita)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Receita {selectedYear}
                </p>
              </div>
              <Sparkline data={receitaSparkline} color="#10b981" height={32} width={60} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {formatCurrency(totalLucro)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Lucro Líquido</p>
              </div>
              <Sparkline data={lucroSparkline} color="#3b82f6" height={32} width={60} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Percent className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{margemLucro}%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Margem de Lucro</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">12</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Meses Analisados</p>
          </div>
        </div>
      </VisibleItem>

      <VisibleItem show={showHeader || showResponsavel}>
        <div
          className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-md overflow-hidden transition-all duration-500 delay-200 ${cardAnimation}`}
        >
          <VisibleItem show={showHeader}>
            <div className="bg-[#0e4f6d] p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                      Cliente Ativo • {cnpjInfo?.tipo}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{cnpjInfo?.razaoSocial}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CNPJ: {cnpjInfo?.cnpj}
                    </span>
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Cód: {cnpjInfo?.codigoCliente}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {cnpjInfo?.endereco?.cidade}/{cnpjInfo?.endereco?.estado}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                    <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                      Regime Tributário
                    </p>
                    <p className="text-xl font-bold">{cnpjInfo?.regimeTributario}</p>
                  </div>
                  <span className="text-xs text-white/60">Exercício {cnpjInfo?.exercicio}</span>
                </div>
              </div>
            </div>
          </VisibleItem>

          <VisibleItem show={showResponsavel}>
            <div className="p-8 dark:bg-slate-800">
              <div className="flex items-center gap-6">
                <a
                  href={responsavelWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-20 rounded-xl bg-[#0e4f6d] hover:bg-[#0c4058] flex items-center justify-center shadow-md transition-colors cursor-pointer group"
                  title={responsavelInfo?.whatsapp ? 'Abrir WhatsApp' : 'WhatsApp Não cadastrado'}
                >
                  <User className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                </a>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Responsável Legal
                  </p>
                  <h3
                    className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-teal-400' : 'text-[#0e4f6d]'}`}
                  >
                    {responsavelInfo?.nome}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {responsavelInfo?.cargo}
                    </span>
                    {responsavelInfo?.whatsapp && (
                      <a
                        href={responsavelWhatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {responsavelInfo.whatsapp}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </VisibleItem>
        </div>
      </VisibleItem>

      <VisibleItem show={isVisible('equipe_tecnica')}>
        <section className={`pt-4 transition-all duration-500 delay-300 ${cardAnimation}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-[#0e4f6d]/10'}`}
              >
                <ShieldCheck
                  className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-[#0e4f6d]'}`}
                />
              </div>
              <h2
                className={`text-xl font-bold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}
              >
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
                { bg: 'bg-teal-700', light: 'bg-slate-50' },
                { bg: 'bg-slate-700', light: 'bg-blue-50' },
                { bg: 'bg-teal-600', light: 'bg-teal-50' },
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={membro.id}
                  className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-xl ${color.bg} shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {membro.setor}
                  </p>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                    {membro.nome}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">
                      {membro.nome.toLowerCase().split(' ')[0]}@agili.com.br
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </VisibleItem>

      <VisibleItem show={isVisible('analise_geral')}>
        <div
          className={`bg-[#0e4f6d] p-8 rounded-xl text-white transition-all duration-500 delay-400 ${cardAnimation}`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Precisa de suporte?</h3>
                <p className="text-white/70">Nossa equipe está disponível para ajudá-lo.</p>
              </div>
            </div>
            <button className="bg-white text-[#0e4f6d] px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-md">
              Entrar em Contato
            </button>
          </div>
        </div>
      </VisibleItem>
    </div>
  );
};

export default DashboardGeraisTab;
