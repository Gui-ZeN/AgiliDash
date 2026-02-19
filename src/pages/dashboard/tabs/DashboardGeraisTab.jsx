import { Briefcase, Building2, FileText, MapPin, Phone, Scale, ShieldCheck } from 'lucide-react';
import VisibleItem from '../../../components/common/VisibleItem';
import DashboardSectionTitle from '../../../components/ui/DashboardSectionTitle';

const Field = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
      {value || 'Não informado'}
    </p>
  </div>
);

const DashboardGeraisTab = ({
  cardAnimation,
  cnpjInfo,
  isDarkMode,
  itemVisivel,
  responsavelInfo,
  responsavelWhatsappLink,
}) => {
  const isVisible = (itemId) => itemVisivel('gerais', itemId);

  // Compatibilidade com configs antigas: qualquer um desses itens mostra o bloco de empresa.
  const showCompanyInfo =
    isVisible('header_empresa') ||
    isVisible('cards_resumo') ||
    isVisible('equipe_tecnica') ||
    isVisible('analise_geral');
  const showResponsavel = isVisible('responsavel');

  const enderecoCompleto = [
    cnpjInfo?.endereco?.logradouro,
    cnpjInfo?.endereco?.numero,
    cnpjInfo?.endereco?.bairro,
  ]
    .filter(Boolean)
    .join(', ');
  const cidadeEstado = [cnpjInfo?.endereco?.cidade, cnpjInfo?.endereco?.estado]
    .filter(Boolean)
    .join('/');

  return (
    <div className="space-y-7 pb-8">
      <VisibleItem show={showCompanyInfo || showResponsavel}>
        <DashboardSectionTitle
          icon={Building2}
          badge="Visão Geral"
          title="Informações da Empresa"
          subtitle="Dados cadastrais e responsável legal."
          tone="blue"
          className={`transition-all duration-500 ${cardAnimation}`}
        />
      </VisibleItem>

      <VisibleItem show={showCompanyInfo}>
        <section
          className={`rounded-xl border p-6 shadow-sm transition-all duration-500 delay-100 ${cardAnimation} ${
            isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="mb-5 flex items-center gap-2">
            <FileText className={`h-5 w-5 ${isDarkMode ? 'text-teal-400' : 'text-[#0e4f6d]'}`} />
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Dados Cadastrais
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Razão Social" value={cnpjInfo?.razaoSocial} />
            <Field label="Nome Fantasia" value={cnpjInfo?.nomeFantasia} />
            <Field label="CNPJ" value={cnpjInfo?.cnpj} />
            <Field label="Código Cliente" value={cnpjInfo?.codigoCliente} />
            <Field label="Tipo" value={cnpjInfo?.tipo} />
            <Field label="Regime Tributário" value={cnpjInfo?.regimeTributario} />
            <Field label="Exercício" value={cnpjInfo?.exercicio} />
            <Field label="Cidade / UF" value={cidadeEstado} />
            <Field label="Endereço" value={enderecoCompleto} />
          </div>
        </section>
      </VisibleItem>

      <VisibleItem show={showResponsavel}>
        <section
          className={`rounded-xl border p-6 shadow-sm transition-all duration-500 delay-200 ${cardAnimation} ${
            isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className={`h-5 w-5 ${isDarkMode ? 'text-teal-400' : 'text-[#0e4f6d]'}`} />
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Responsável Legal
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Nome" value={responsavelInfo?.nome} />
            <Field label="Cargo" value={responsavelInfo?.cargo} />
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                WhatsApp
              </p>
              {responsavelInfo?.whatsapp ? (
                <a
                  href={responsavelWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <Phone className="h-4 w-4" />
                  {responsavelInfo.whatsapp}
                </a>
              ) : (
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                  Não informado
                </p>
              )}
            </div>
          </div>
        </section>
      </VisibleItem>

      <VisibleItem show={showCompanyInfo}>
        <section
          className={`rounded-xl border p-6 shadow-sm transition-all duration-500 delay-300 ${cardAnimation} ${
            isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Scale className={`h-4 w-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Regime: <strong>{cnpjInfo?.regimeTributario || 'Não informado'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className={`h-4 w-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Localização: <strong>{cidadeEstado || 'Não informado'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase
                className={`h-4 w-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Tipo: <strong>{cnpjInfo?.tipo || 'Não informado'}</strong>
              </span>
            </div>
          </div>
        </section>
      </VisibleItem>
    </div>
  );
};

export default DashboardGeraisTab;
