import { useEffect, useState } from 'react';

const initialGrupos = [
  {
    id: 'grupo_001',
    nome: 'Grupo EJP',
    descricao: 'Holding principal',
    status: 'Ativo',
    criadoEm: '2024-01-15',
    responsavelPadrao: {
      nome: 'Responsavel Grupo',
      cargo: 'Socio-Administrador',
      whatsapp: '(85) 99999-0000',
    },
  },
];

const initialCnpjs = [
  {
    id: 'cnpj_001',
    grupoId: 'grupo_001',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'EJP Comercio e Servicos Ltda',
    nomeFantasia: 'EJP Matriz',
    tipo: 'Matriz',
    regimeTributario: 'Lucro Real',
    cidade: 'Sao Paulo',
    estado: 'SP',
    responsavel: {
      nome: 'Responsavel CNPJ',
      cargo: 'Diretor',
      whatsapp: '(85) 99999-0001',
    },
    status: 'Ativo',
  },
];

const initialUsuarios = [
  {
    id: 'user_001',
    nome: 'Administrador',
    email: 'admin@agili.com.br',
    perfil: 'Admin',
    grupoId: 'grupo_001',
    setoresAcesso: ['contabil', 'fiscal', 'pessoal', 'administrativo'],
    status: 'Ativo',
    criadoEm: '2024-01-15',
  },
];

const setoresDisponiveis = [
  { id: 'contabil', nome: 'Contabil', descricao: 'Acesso ao setor contabil' },
  { id: 'fiscal', nome: 'Fiscal', descricao: 'Acesso ao setor fiscal' },
  { id: 'pessoal', nome: 'Pessoal', descricao: 'Acesso ao setor de pessoal/RH' },
  { id: 'administrativo', nome: 'Administrativo', descricao: 'Acesso ao setor administrativo' },
];

export const useCadastrosDomain = () => {
  const [grupos, setGrupos] = useState(() => {
    const saved = localStorage.getItem('agili_grupos');
    return saved ? JSON.parse(saved) : initialGrupos;
  });

  const [cnpjs, setCnpjs] = useState(() => {
    const saved = localStorage.getItem('agili_cnpjs');
    return saved ? JSON.parse(saved) : initialCnpjs;
  });

  const [usuarios, setUsuarios] = useState(() => {
    const saved = localStorage.getItem('agili_usuarios');
    return saved ? JSON.parse(saved) : initialUsuarios;
  });

  useEffect(() => {
    localStorage.setItem('agili_grupos', JSON.stringify(grupos));
  }, [grupos]);

  useEffect(() => {
    localStorage.setItem('agili_cnpjs', JSON.stringify(cnpjs));
  }, [cnpjs]);

  useEffect(() => {
    localStorage.setItem('agili_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  const addGrupo = (grupo) => {
    const newGrupo = {
      ...grupo,
      id: `grupo_${Date.now()}`,
      status: 'Ativo',
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setGrupos((prev) => [...prev, newGrupo]);
    return newGrupo;
  };

  const updateGrupo = (id, data) => {
    setGrupos((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  };

  const deleteGrupo = (id) => {
    setCnpjs((prev) => prev.filter((c) => c.grupoId !== id));
    setUsuarios((prev) => prev.filter((u) => u.grupoId !== id));
    setGrupos((prev) => prev.filter((g) => g.id !== id));
  };

  const addCnpj = (cnpj) => {
    const newCnpj = {
      ...cnpj,
      id: `cnpj_${Date.now()}`,
      status: 'Ativo',
    };
    setCnpjs((prev) => [...prev, newCnpj]);
    return newCnpj;
  };

  const updateCnpj = (id, data) => {
    setCnpjs((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCnpj = (id) => {
    setCnpjs((prev) => prev.filter((c) => c.id !== id));
  };

  const getCnpjsByGrupo = (grupoId) => cnpjs.filter((c) => c.grupoId === grupoId);

  const addUsuario = (usuario) => {
    const newUsuario = {
      ...usuario,
      id: `user_${Date.now()}`,
      status: 'Ativo',
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setUsuarios((prev) => [...prev, newUsuario]);
    return newUsuario;
  };

  const updateUsuario = (id, data) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const deleteUsuario = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const getUsuariosByGrupo = (grupoId) => usuarios.filter((u) => u.grupoId === grupoId);

  const getStats = () => ({
    totalGrupos: grupos.length,
    totalCnpjs: cnpjs.length,
    totalUsuarios: usuarios.length,
    gruposAtivos: grupos.filter((g) => g.status === 'Ativo').length,
    cnpjsAtivos: cnpjs.filter((c) => c.status === 'Ativo').length,
    usuariosAtivos: usuarios.filter((u) => u.status === 'Ativo').length,
  });

  return {
    grupos,
    cnpjs,
    usuarios,
    addGrupo,
    updateGrupo,
    deleteGrupo,
    addCnpj,
    updateCnpj,
    deleteCnpj,
    getCnpjsByGrupo,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuariosByGrupo,
    getStats,
    setoresDisponiveis,
  };
};
