import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Check,
  X,
  AlertTriangle,
  Save
} from 'lucide-react';
import Logo from '../components/layout/Logo';
import { useEmpresa } from '../context/EmpresaContext';
import { formatCurrency } from '../utils/formatters';

/**
 * Página de Configurações
 * Gerenciamento de CNPJs e informações da empresa
 */
const Configuracoes = () => {
  const { empresa, listaCnpjs, totaisConsolidados } = useEmpresa();

  // Estado para modais
  const [modalCnpj, setModalCnpj] = useState({ open: false, mode: 'add', data: null });
  const [modalDelete, setModalDelete] = useState({ open: false, cnpj: null });

  // Estado do formulário de CNPJ
  const [formCnpj, setFormCnpj] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    tipo: 'Filial',
    regimeTributario: 'Lucro Real',
    cidade: '',
    estado: '',
    responsavelNome: '',
    responsavelCargo: ''
  });

  // Abre modal para adicionar CNPJ
  const handleAddCnpj = () => {
    setFormCnpj({
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      tipo: 'Filial',
      regimeTributario: 'Lucro Real',
      cidade: '',
      estado: '',
      responsavelNome: '',
      responsavelCargo: ''
    });
    setModalCnpj({ open: true, mode: 'add', data: null });
  };

  // Abre modal para editar CNPJ
  const handleEditCnpj = (cnpj) => {
    setFormCnpj({
      cnpj: cnpj.cnpj,
      razaoSocial: cnpj.razaoSocial,
      nomeFantasia: cnpj.nomeFantasia,
      tipo: cnpj.tipo,
      regimeTributario: cnpj.regimeTributario,
      cidade: cnpj.endereco.cidade,
      estado: cnpj.endereco.estado,
      responsavelNome: cnpj.responsavel.nome,
      responsavelCargo: cnpj.responsavel.cargo
    });
    setModalCnpj({ open: true, mode: 'edit', data: cnpj });
  };

  // Confirma exclusão de CNPJ
  const handleDeleteCnpj = (cnpj) => {
    setModalDelete({ open: true, cnpj });
  };

  // Salva CNPJ (mock)
  const handleSaveCnpj = () => {
    // TODO: Integrar com Firebase
    alert(modalCnpj.mode === 'add' ? 'CNPJ adicionado com sucesso!' : 'CNPJ atualizado com sucesso!');
    setModalCnpj({ open: false, mode: 'add', data: null });
  };

  // Confirma exclusão (mock)
  const handleConfirmDelete = () => {
    // TODO: Integrar com Firebase
    alert('CNPJ removido com sucesso!');
    setModalDelete({ open: false, cnpj: null });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header simples */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <Logo width={160} height={60} />
          </div>
          <h1 className="text-lg font-bold text-[#0e4f6d]">Configurações</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Informações da Empresa */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Informações da Empresa</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dados básicos */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Razão Social
                </label>
                <p className="text-slate-800 font-medium mt-1">{empresa.razaoSocial}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Nome Fantasia
                </label>
                <p className="text-slate-800 font-medium mt-1">{empresa.nomeFantasia}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  CNPJ Principal
                </label>
                <p className="text-slate-800 font-medium mt-1">{empresa.cnpjPrincipal}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  E-mail
                </label>
                <p className="text-slate-800 font-medium mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {empresa.email}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Telefone
                </label>
                <p className="text-slate-800 font-medium mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {empresa.telefone}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Endereço
                </label>
                <p className="text-slate-800 font-medium mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {empresa.endereco.cidade}/{empresa.endereco.estado}
                </p>
              </div>
            </div>

            {/* Plano */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Plano Atual
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#0e4f6d] to-[#58a3a4] text-white font-bold rounded-full text-sm">
                      {empresa.plano}
                    </span>
                    <span className="text-sm text-slate-500">
                      Desde {new Date(empresa.dataAssinatura).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Limite: {empresa.limiteCnpjs} CNPJs / {empresa.limiteUsuarios} Usuários
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Usando: {listaCnpjs.length} CNPJs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resumo Consolidado */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Resumo Consolidado</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase">Receita Total (2025)</p>
              <p className="text-xl font-bold text-[#0e4f6d] mt-1">
                {formatCurrency(totaisConsolidados.receita)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase">Lucro Total</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(totaisConsolidados.lucro)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Funcionários</p>
              <p className="text-xl font-bold text-[#58a3a4] mt-1">
                {totaisConsolidados.funcionarios}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase">Carga Tributária</p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {formatCurrency(totaisConsolidados.cargaTributaria)}
              </p>
            </div>
          </div>
        </section>

        {/* Lista de CNPJs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">CNPJs Cadastrados</h2>
            <button
              onClick={handleAddCnpj}
              className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar CNPJ
            </button>
          </div>

          <div className="space-y-4">
            {listaCnpjs.map((cnpj) => (
              <div
                key={cnpj.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cnpj.tipo === 'Matriz' ? 'bg-gradient-to-br from-[#0e4f6d] to-[#58a3a4]' : 'bg-slate-100'}`}>
                      <Building2 className={`w-6 h-6 ${cnpj.tipo === 'Matriz' ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{cnpj.nomeFantasia}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cnpj.tipo === 'Matriz' ? 'bg-[#0e4f6d]/10 text-[#0e4f6d]' : 'bg-slate-100 text-slate-600'}`}>
                          {cnpj.tipo}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cnpj.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cnpj.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{cnpj.razaoSocial}</p>
                      <p className="text-sm font-mono text-slate-600 mt-1">{cnpj.cnpj}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCnpj(cnpj)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-slate-500" />
                    </button>
                    {cnpj.tipo !== 'Matriz' && (
                      <button
                        onClick={() => handleDeleteCnpj(cnpj)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Regime Tributário</p>
                    <p className="text-sm font-medium text-slate-700">{cnpj.regimeTributario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Exercício</p>
                    <p className="text-sm font-medium text-slate-700">{cnpj.exercicio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Localização</p>
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cnpj.endereco.cidade}/{cnpj.endereco.estado}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Responsável</p>
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {cnpj.responsavel.nome.split(' ').slice(0, 2).join(' ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal Adicionar/Editar CNPJ */}
      {modalCnpj.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {modalCnpj.mode === 'add' ? 'Adicionar CNPJ' : 'Editar CNPJ'}
                </h2>
                <button
                  onClick={() => setModalCnpj({ open: false, mode: 'add', data: null })}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formCnpj.cnpj}
                    onChange={(e) => setFormCnpj({ ...formCnpj, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={formCnpj.razaoSocial}
                    onChange={(e) => setFormCnpj({ ...formCnpj, razaoSocial: e.target.value })}
                    placeholder="Nome completo da empresa"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formCnpj.nomeFantasia}
                    onChange={(e) => setFormCnpj({ ...formCnpj, nomeFantasia: e.target.value })}
                    placeholder="Nome comercial"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formCnpj.tipo}
                    onChange={(e) => setFormCnpj({ ...formCnpj, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="Matriz">Matriz</option>
                    <option value="Filial">Filial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Regime Tributário</label>
                  <select
                    value={formCnpj.regimeTributario}
                    onChange={(e) => setFormCnpj({ ...formCnpj, regimeTributario: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="MEI">MEI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formCnpj.cidade}
                    onChange={(e) => setFormCnpj({ ...formCnpj, cidade: e.target.value })}
                    placeholder="Cidade"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formCnpj.estado}
                    onChange={(e) => setFormCnpj({ ...formCnpj, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável</label>
                  <input
                    type="text"
                    value={formCnpj.responsavelNome}
                    onChange={(e) => setFormCnpj({ ...formCnpj, responsavelNome: e.target.value })}
                    placeholder="Nome completo"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo do Responsável</label>
                  <input
                    type="text"
                    value={formCnpj.responsavelCargo}
                    onChange={(e) => setFormCnpj({ ...formCnpj, responsavelCargo: e.target.value })}
                    placeholder="Ex: Sócio-Administrador"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalCnpj({ open: false, mode: 'add', data: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCnpj}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
              >
                <Save className="w-4 h-4" />
                {modalCnpj.mode === 'add' ? 'Adicionar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {modalDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Confirmar Exclusão</h2>
                  <p className="text-sm text-slate-500">Esta ação não pode ser desfeita.</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Você está prestes a excluir o CNPJ:
                </p>
                <p className="font-bold text-slate-800 mt-1">
                  {modalDelete.cnpj?.nomeFantasia}
                </p>
                <p className="text-sm text-slate-500 font-mono">
                  {modalDelete.cnpj?.cnpj}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalDelete({ open: false, cnpj: null })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
