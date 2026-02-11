/**
 * Mock Data para o Dashboard Fiscal
 * Estrutura Hierárquica: Grupo → Empresa → CNPJ
 * TODO: Integrar com Firebase Firestore para dados dinâmicos
 */

// Labels para os meses
export const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Labels para trimestres (usado em gráficos fiscais)
export const trimestres = ['1º Tri', '2º Tri', '3º Tri', '4º Tri'];

// ============================================
// SETORES DISPONÍVEIS
// ============================================

export const setoresDisponiveis = [
  { id: 'contabil', nome: 'Contábil', icon: 'calculator', cor: 'cyan' },
  { id: 'fiscal', nome: 'Fiscal', icon: 'file-spreadsheet', cor: 'blue' },
  { id: 'pessoal', nome: 'Pessoal', icon: 'users', cor: 'teal' },
  { id: 'administrativo', nome: 'Administrativo', icon: 'briefcase', cor: 'amber' }
];

// ============================================
// ESTRUTURA HIERÁRQUICA: GRUPOS
// ============================================

export const grupos = [
  {
    id: 'grupo_001',
    nome: 'Grupo EJP',
    descricao: 'Holding de empresas do setor alimentício',
    dataCriacao: '2020-01-15',
    status: 'Ativo'
  },
  {
    id: 'grupo_002',
    nome: 'Grupo ABC Logística',
    descricao: 'Empresas de transporte e logística',
    dataCriacao: '2021-06-01',
    status: 'Ativo'
  }
];

// ============================================
// ESTRUTURA HIERÁRQUICA: EMPRESAS
// ============================================

export const empresas = [
  {
    id: 'empresa_001',
    grupoId: 'grupo_001',
    razaoSocial: 'EJP COMERCIO DE ALIMENTOS LTDA',
    nomeFantasia: 'EJP Alimentos',
    cnpjPrincipal: '30.533.759/0001-09',
    regimeTributario: 'Lucro Real',
    email: 'contato@ejpalimentos.com.br',
    telefone: '(85) 3333-4444',
    endereco: {
      logradouro: 'Av. Santos Dumont',
      numero: '1500',
      complemento: 'Sala 1001',
      bairro: 'Aldeota',
      cidade: 'Fortaleza',
      estado: 'CE',
      cep: '60150-161'
    },
    status: 'Ativo'
  },
  {
    id: 'empresa_002',
    grupoId: 'grupo_001',
    razaoSocial: 'EJP DISTRIBUIDORA LTDA',
    nomeFantasia: 'EJP Distribuidora',
    cnpjPrincipal: '30.533.760/0001-90',
    regimeTributario: 'Lucro Presumido',
    email: 'contato@ejpdistribuidora.com.br',
    telefone: '(85) 3333-5555',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '250',
      bairro: 'Centro',
      cidade: 'Fortaleza',
      estado: 'CE',
      cep: '60060-100'
    },
    status: 'Ativo'
  },
  {
    id: 'empresa_003',
    grupoId: 'grupo_002',
    razaoSocial: 'ABC TRANSPORTES LTDA',
    nomeFantasia: 'ABC Transportes',
    cnpjPrincipal: '12.345.678/0001-90',
    regimeTributario: 'Simples Nacional',
    email: 'contato@abctransportes.com.br',
    telefone: '(85) 3444-5555',
    endereco: {
      logradouro: 'Av. Industrial',
      numero: '500',
      bairro: 'Distrito Industrial',
      cidade: 'Maracanaú',
      estado: 'CE',
      cep: '61939-000'
    },
    status: 'Ativo'
  }
];

// ============================================
// ESTRUTURA HIERÁRQUICA: CNPJs
// ============================================

export const cnpjsEmpresa = [
  {
    id: 'cnpj_001',
    empresaId: 'empresa_001',
    cnpj: '30.533.759/0001-09',
    razaoSocial: 'EJP COMERCIO DE ALIMENTOS LTDA',
    nomeFantasia: 'EJP MATRIZ',
    tipo: 'Matriz',
    codigoCliente: '260',
    regimeTributario: 'Lucro Real',
    exercicio: '2025',
    status: 'Ativo',
    responsavel: {
      nome: 'Sr. Emerson Clay Batista Montenegro Filho',
      cargo: 'Sócio-Administrador',
      whatsapp: '(85) 99999-0001'
    },
    endereco: {
      cidade: 'Fortaleza',
      estado: 'CE'
    }
  },
  {
    id: 'cnpj_002',
    empresaId: 'empresa_001',
    cnpj: '30.533.759/0002-80',
    razaoSocial: 'EJP COMERCIO DE ALIMENTOS LTDA',
    nomeFantasia: 'EJP FILIAL MARACANAÚ',
    tipo: 'Filial',
    codigoCliente: '261',
    regimeTributario: 'Lucro Real',
    exercicio: '2025',
    status: 'Ativo',
    responsavel: {
      nome: 'Sra. Maria Helena Santos',
      cargo: 'Gerente',
      whatsapp: '(85) 99999-0002'
    },
    endereco: {
      cidade: 'Maracanaú',
      estado: 'CE'
    }
  },
  {
    id: 'cnpj_003',
    empresaId: 'empresa_001',
    cnpj: '30.533.759/0003-61',
    razaoSocial: 'EJP COMERCIO DE ALIMENTOS LTDA',
    nomeFantasia: 'EJP FILIAL CAUCAIA',
    tipo: 'Filial',
    codigoCliente: '262',
    regimeTributario: 'Lucro Real',
    exercicio: '2025',
    status: 'Ativo',
    responsavel: {
      nome: 'Sr. João Pedro Lima',
      cargo: 'Gerente',
      whatsapp: '(85) 99999-0003'
    },
    endereco: {
      cidade: 'Caucaia',
      estado: 'CE'
    }
  },
  {
    id: 'cnpj_004',
    empresaId: 'empresa_002',
    cnpj: '30.533.760/0001-90',
    razaoSocial: 'EJP DISTRIBUIDORA LTDA',
    nomeFantasia: 'EJP DISTRIBUIDORA MATRIZ',
    tipo: 'Matriz',
    codigoCliente: '270',
    regimeTributario: 'Lucro Presumido',
    exercicio: '2025',
    status: 'Ativo',
    responsavel: {
      nome: 'Sr. Carlos Eduardo Santos',
      cargo: 'Diretor',
      whatsapp: '(85) 99999-0004'
    },
    endereco: {
      cidade: 'Fortaleza',
      estado: 'CE'
    }
  },
  {
    id: 'cnpj_005',
    empresaId: 'empresa_003',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'ABC TRANSPORTES LTDA',
    nomeFantasia: 'ABC TRANSPORTES',
    tipo: 'Matriz',
    codigoCliente: '300',
    regimeTributario: 'Simples Nacional',
    exercicio: '2025',
    status: 'Ativo',
    responsavel: {
      nome: 'Sr. Roberto Almeida',
      cargo: 'Proprietário',
      whatsapp: '(85) 99999-0005'
    },
    endereco: {
      cidade: 'Maracanaú',
      estado: 'CE'
    }
  }
];

// ============================================
// DADOS FINANCEIROS POR CNPJ
// ============================================

export const dadosPorCnpj = {
  'cnpj_001': {
    // Dados de faturamento mensal (2025)
    faturamentoData: [
      559817.75, 495000, 488000, 507000, 565000, 547000,
      628000, 580000, 544000, 638000, 617000, 699000
    ],
    // Dados de entradas (compras/custos)
    entradasData: [
      2100500, 1950000, 2400000, 2200000, 2423405.49, 3642289.06,
      4958289.94, 2222369.15, 10651793.34, 3800000, 4100000, 5200000
    ],
    // Dados de saídas (vendas/receita)
    saidasData: [
      450000, 420000, 480000, 460000, 521590.84, 574772.05,
      692399.50, 631988.75, 644739.69, 600000, 650000, 750000
    ],
    // Dados DRE 2025
    dreData2025: {
      receita: [
        577643.92, 500914.48, 529675.12, 542100.00, 560000.00, 547000.00,
        628000.00, 580000.00, 600000.00, 638000.00, 617000.00, 699000.00
      ],
      despesa: [
        404350.00, 350640.00, 370770.00, 379470.00, 392000.00, 382900.00,
        439600.00, 406000.00, 420000.00, 446600.00, 431900.00, 489300.00
      ],
      lucro: [
        173293.92, 150274.48, 158905.12, 162630.00, 168000.00, 164100.00,
        188400.00, 174000.00, 180000.00, 191400.00, 185100.00, 209700.00
      ]
    },
    // Dados DRE 2024
    dreData2024: {
      receita: [
        542610.55, 479780.80, 472836.00, 491346.32, 548089.67, 530370.20,
        609004.40, 562715.14, 527379.73, 619043.24, 598804.41, 678180.79
      ],
      despesa: [
        379827.38, 335846.56, 330985.20, 343942.42, 383662.77, 371259.14,
        426303.08, 393900.60, 369165.81, 433330.27, 419163.09, 474726.55
      ],
      lucro: [
        162783.17, 143934.24, 141850.80, 147403.90, 164426.90, 159111.06,
        182701.32, 168814.54, 158213.92, 185712.97, 179641.32, 203454.24
      ]
    },
    // Dados CSLL trimestral
    csllData: [14497.55, 14230.35, 14322.21, 14430.19],
    // Dados IRPJ trimestral (total)
    irpjTotalData: [34270.97, 33528.75, 33783.92, 34083.85],
    // Dados IRPJ adicional
    irpjAdicional: [10108.39, 9811.5, 9913.57, 10033.54],
    // Grupos de receitas
    receitaGrupos: {
      labels: ['Venda de Produtos', 'Venda de Sorvetes', 'Transferências'],
      data: [11959939.48, 1939015.97, 1783255.32]
    },
    // Grupos de custos
    custosGrupos: {
      labels: ['Compra p/ Industrialização', 'Compra p/ Ind. ST'],
      data: [44609086.27, 1101668.36]
    },
    // Totais acumulados
    totaisAcumulados: {
      entradas: 45710754.63,
      saidas: 15682210.77
    },
    // Totais fiscais
    totaisFiscais: {
      irpj: 135667.49,
      csll: 57480.30,
      cargaTributariaTotal: 193147.79
    },
    // Dados de Pessoal (RH)
    pessoalData: {
      funcionarios: 45,
      folhaMensal: 157500.00,
      encargos: 52462.50,
      beneficios: 22500.00,
      // Folha por mês
      folhaPorMes: [
        145000, 147500, 150000, 152000, 155000, 157500,
        157500, 158000, 160000, 162000, 165000, 170000
      ],
      // Encargos por mês
      encargosPorMes: [
        48300, 49125, 49950, 50616, 51615, 52462,
        52462, 52626, 53280, 53946, 54945, 56610
      ],
      // Funcionários por departamento
      porDepartamento: {
        labels: ['Produção', 'Administrativo', 'Vendas', 'Logística', 'RH'],
        data: [20, 8, 10, 5, 2]
      },
      // Tipo de contrato
      porContrato: {
        labels: ['CLT', 'PJ', 'Estagiário', 'Temporário'],
        data: [38, 3, 2, 2]
      },
      // Lista de funcionários
      listaFuncionarios: [
        { id: 1, nome: 'Carlos Silva', cargo: 'Gerente de Produção', departamento: 'Produção', salario: 8500, admissao: '2020-03-15' },
        { id: 2, nome: 'Ana Oliveira', cargo: 'Analista Financeiro', departamento: 'Administrativo', salario: 5200, admissao: '2021-07-01' },
        { id: 3, nome: 'Pedro Santos', cargo: 'Vendedor Externo', departamento: 'Vendas', salario: 3800, admissao: '2022-01-10' },
        { id: 4, nome: 'Maria Costa', cargo: 'Auxiliar de Produção', departamento: 'Produção', salario: 2100, admissao: '2023-05-20' },
        { id: 5, nome: 'João Lima', cargo: 'Motorista', departamento: 'Logística', salario: 2800, admissao: '2021-11-08' },
        { id: 6, nome: 'Fernanda Souza', cargo: 'Analista de RH', departamento: 'RH', salario: 4500, admissao: '2022-08-15' },
        { id: 7, nome: 'Ricardo Alves', cargo: 'Supervisor de Vendas', departamento: 'Vendas', salario: 6200, admissao: '2020-09-01' },
        { id: 8, nome: 'Juliana Martins', cargo: 'Assistente Administrativo', departamento: 'Administrativo', salario: 2400, admissao: '2023-02-14' }
      ]
    },
    // Dados Administrativos
    administrativoData: {
      contratos: {
        total: 12,
        vigentes: 10,
        vencendo30dias: 2,
        vencidos: 0
      },
      despesasPorCategoria: {
        labels: ['Aluguel', 'Utilidades', 'Seguros', 'Material Escritório', 'Serviços Terceiros', 'Outros'],
        data: [25000, 8500, 4200, 2800, 15000, 5500]
      },
      despesasMensais: [
        58000, 59500, 57800, 61000, 62500, 63000,
        61500, 64000, 65500, 63800, 66000, 68000
      ],
      certidoes: [
        { id: 1, nome: 'CND Federal', status: 'Válida', validade: '2025-06-15', tipo: 'Federal' },
        { id: 2, nome: 'CND Estadual', status: 'Válida', validade: '2025-05-20', tipo: 'Estadual' },
        { id: 3, nome: 'CND Municipal', status: 'Válida', validade: '2025-04-10', tipo: 'Municipal' },
        { id: 4, nome: 'FGTS - CRF', status: 'Válida', validade: '2025-02-28', tipo: 'Trabalhista' },
        { id: 5, nome: 'Certidão Trabalhista', status: 'Vencendo', validade: '2025-02-05', tipo: 'Trabalhista' }
      ],
      listaContratos: [
        { id: 1, fornecedor: 'Imobiliária Centro', tipo: 'Aluguel', valor: 25000, vencimento: '2026-12-31', status: 'Ativo' },
        { id: 2, fornecedor: 'Energisa', tipo: 'Utilidades', valor: 4500, vencimento: '2025-12-31', status: 'Ativo' },
        { id: 3, fornecedor: 'Seguradora ABC', tipo: 'Seguro', valor: 4200, vencimento: '2025-08-15', status: 'Ativo' },
        { id: 4, fornecedor: 'Contabilidade XYZ', tipo: 'Serviços', valor: 8500, vencimento: '2025-06-30', status: 'Ativo' },
        { id: 5, fornecedor: 'TI Solutions', tipo: 'Serviços', valor: 6500, vencimento: '2025-03-15', status: 'Vencendo' }
      ],
      indicadores: {
        ticketMedioVenda: 285.50,
        custoOperacional: 61000,
        margemOperacional: 28.5,
        inadimplencia: 2.3
      }
    }
  },
  'cnpj_002': {
    faturamentoData: [
      320000, 310000, 335000, 340000, 355000, 365000,
      380000, 375000, 390000, 410000, 425000, 450000
    ],
    entradasData: [
      1200000, 1150000, 1280000, 1320000, 1400000, 1450000,
      1520000, 1480000, 1550000, 1620000, 1700000, 1800000
    ],
    saidasData: [
      280000, 275000, 300000, 310000, 320000, 330000,
      345000, 340000, 355000, 375000, 390000, 415000
    ],
    dreData2025: {
      receita: [
        320000, 310000, 335000, 340000, 355000, 365000,
        380000, 375000, 390000, 410000, 425000, 450000
      ],
      despesa: [
        224000, 217000, 234500, 238000, 248500, 255500,
        266000, 262500, 273000, 287000, 297500, 315000
      ],
      lucro: [
        96000, 93000, 100500, 102000, 106500, 109500,
        114000, 112500, 117000, 123000, 127500, 135000
      ]
    },
    dreData2024: {
      receita: [
        295000, 285000, 305000, 315000, 320000, 330000,
        345000, 340000, 355000, 370000, 385000, 410000
      ],
      despesa: [
        206500, 199500, 213500, 220500, 224000, 231000,
        241500, 238000, 248500, 259000, 269500, 287000
      ],
      lucro: [
        88500, 85500, 91500, 94500, 96000, 99000,
        103500, 102000, 106500, 111000, 115500, 123000
      ]
    },
    csllData: [8100, 8400, 8700, 9100],
    irpjTotalData: [19200, 19800, 20500, 21400],
    irpjAdicional: [5600, 5900, 6200, 6600],
    receitaGrupos: {
      labels: ['Venda de Produtos', 'Venda de Sorvetes', 'Transferências'],
      data: [3200000, 850000, 405000]
    },
    custosGrupos: {
      labels: ['Compra p/ Industrialização', 'Compra p/ Ind. ST'],
      data: [15800000, 670000]
    },
    totaisAcumulados: {
      entradas: 16470000,
      saidas: 4455000
    },
    totaisFiscais: {
      irpj: 80900,
      csll: 34300,
      cargaTributariaTotal: 115200
    },
    pessoalData: {
      funcionarios: 28,
      folhaMensal: 89600.00,
      encargos: 29836.80,
      beneficios: 14000.00,
      folhaPorMes: [
        82000, 83500, 85000, 86000, 87500, 89600,
        89600, 90000, 91500, 93000, 95000, 98000
      ],
      encargosPorMes: [
        27306, 27805, 28305, 28638, 29137, 29836,
        29836, 29970, 30469, 30969, 31635, 32634
      ],
      porDepartamento: {
        labels: ['Produção', 'Administrativo', 'Vendas', 'Logística', 'RH'],
        data: [12, 5, 6, 4, 1]
      },
      porContrato: {
        labels: ['CLT', 'PJ', 'Estagiário', 'Temporário'],
        data: [24, 2, 1, 1]
      },
      listaFuncionarios: [
        { id: 1, nome: 'Roberto Ferreira', cargo: 'Gerente Filial', departamento: 'Administrativo', salario: 7200, admissao: '2021-02-01' },
        { id: 2, nome: 'Carla Mendes', cargo: 'Supervisora de Produção', departamento: 'Produção', salario: 5800, admissao: '2021-06-15' },
        { id: 3, nome: 'Lucas Rodrigues', cargo: 'Vendedor', departamento: 'Vendas', salario: 3200, admissao: '2022-03-10' },
        { id: 4, nome: 'Patrícia Gomes', cargo: 'Auxiliar Administrativo', departamento: 'Administrativo', salario: 2300, admissao: '2023-01-08' },
        { id: 5, nome: 'Marcos Vieira', cargo: 'Operador de Produção', departamento: 'Produção', salario: 2000, admissao: '2022-09-20' }
      ]
    },
    administrativoData: {
      contratos: {
        total: 8,
        vigentes: 7,
        vencendo30dias: 1,
        vencidos: 0
      },
      despesasPorCategoria: {
        labels: ['Aluguel', 'Utilidades', 'Seguros', 'Material Escritório', 'Serviços Terceiros', 'Outros'],
        data: [18000, 5500, 2800, 1500, 9000, 3200]
      },
      despesasMensais: [
        38000, 39200, 37500, 40000, 41200, 42000,
        40500, 42500, 43800, 42200, 44000, 45500
      ],
      certidoes: [
        { id: 1, nome: 'CND Federal', status: 'Válida', validade: '2025-06-15', tipo: 'Federal' },
        { id: 2, nome: 'CND Estadual', status: 'Válida', validade: '2025-05-20', tipo: 'Estadual' },
        { id: 3, nome: 'CND Municipal', status: 'Válida', validade: '2025-04-10', tipo: 'Municipal' },
        { id: 4, nome: 'FGTS - CRF', status: 'Válida', validade: '2025-03-15', tipo: 'Trabalhista' }
      ],
      listaContratos: [
        { id: 1, fornecedor: 'Imobiliária Local', tipo: 'Aluguel', valor: 18000, vencimento: '2026-06-30', status: 'Ativo' },
        { id: 2, fornecedor: 'Enel', tipo: 'Utilidades', valor: 3200, vencimento: '2025-12-31', status: 'Ativo' },
        { id: 3, fornecedor: 'Seguradora DEF', tipo: 'Seguro', valor: 2800, vencimento: '2025-09-20', status: 'Ativo' }
      ],
      indicadores: {
        ticketMedioVenda: 195.80,
        custoOperacional: 40000,
        margemOperacional: 25.2,
        inadimplencia: 3.1
      }
    }
  },
  'cnpj_003': {
    faturamentoData: [
      180000, 175000, 190000, 195000, 205000, 215000,
      225000, 220000, 230000, 245000, 255000, 275000
    ],
    entradasData: [
      720000, 700000, 760000, 780000, 820000, 860000,
      900000, 880000, 920000, 980000, 1020000, 1100000
    ],
    saidasData: [
      165000, 160000, 175000, 180000, 190000, 200000,
      210000, 205000, 215000, 230000, 240000, 260000
    ],
    dreData2025: {
      receita: [
        180000, 175000, 190000, 195000, 205000, 215000,
        225000, 220000, 230000, 245000, 255000, 275000
      ],
      despesa: [
        126000, 122500, 133000, 136500, 143500, 150500,
        157500, 154000, 161000, 171500, 178500, 192500
      ],
      lucro: [
        54000, 52500, 57000, 58500, 61500, 64500,
        67500, 66000, 69000, 73500, 76500, 82500
      ]
    },
    dreData2024: {
      receita: [
        165000, 160000, 175000, 180000, 190000, 200000,
        210000, 205000, 215000, 230000, 240000, 260000
      ],
      despesa: [
        115500, 112000, 122500, 126000, 133000, 140000,
        147000, 143500, 150500, 161000, 168000, 182000
      ],
      lucro: [
        49500, 48000, 52500, 54000, 57000, 60000,
        63000, 61500, 64500, 69000, 72000, 78000
      ]
    },
    csllData: [4800, 5100, 5400, 5800],
    irpjTotalData: [11400, 12000, 12700, 13600],
    irpjAdicional: [3300, 3500, 3800, 4100],
    receitaGrupos: {
      labels: ['Venda de Produtos', 'Venda de Sorvetes', 'Transferências'],
      data: [1850000, 520000, 240000]
    },
    custosGrupos: {
      labels: ['Compra p/ Industrialização', 'Compra p/ Ind. ST'],
      data: [9200000, 440000]
    },
    totaisAcumulados: {
      entradas: 9640000,
      saidas: 2610000
    },
    totaisFiscais: {
      irpj: 49700,
      csll: 21100,
      cargaTributariaTotal: 70800
    },
    pessoalData: {
      funcionarios: 18,
      folhaMensal: 54000.00,
      encargos: 17982.00,
      beneficios: 9000.00,
      folhaPorMes: [
        48000, 49000, 50000, 51000, 52000, 54000,
        54000, 55000, 56000, 57000, 58000, 60000
      ],
      encargosPorMes: [
        15984, 16317, 16650, 16983, 17316, 17982,
        17982, 18315, 18648, 18981, 19314, 19980
      ],
      porDepartamento: {
        labels: ['Produção', 'Administrativo', 'Vendas', 'Logística', 'RH'],
        data: [8, 3, 4, 2, 1]
      },
      porContrato: {
        labels: ['CLT', 'PJ', 'Estagiário', 'Temporário'],
        data: [15, 1, 1, 1]
      },
      listaFuncionarios: [
        { id: 1, nome: 'André Nascimento', cargo: 'Gerente Filial', departamento: 'Administrativo', salario: 6500, admissao: '2022-01-15' },
        { id: 2, nome: 'Beatriz Almeida', cargo: 'Vendedora', departamento: 'Vendas', salario: 3000, admissao: '2022-08-01' },
        { id: 3, nome: 'Diego Ramos', cargo: 'Operador de Produção', departamento: 'Produção', salario: 1900, admissao: '2023-03-10' }
      ]
    },
    administrativoData: {
      contratos: {
        total: 5,
        vigentes: 5,
        vencendo30dias: 0,
        vencidos: 0
      },
      despesasPorCategoria: {
        labels: ['Aluguel', 'Utilidades', 'Seguros', 'Material Escritório', 'Serviços Terceiros', 'Outros'],
        data: [12000, 3800, 1800, 900, 5500, 2000]
      },
      despesasMensais: [
        24000, 24800, 23500, 25200, 26000, 26500,
        25800, 27000, 27800, 26800, 28000, 29000
      ],
      certidoes: [
        { id: 1, nome: 'CND Federal', status: 'Válida', validade: '2025-07-10', tipo: 'Federal' },
        { id: 2, nome: 'CND Estadual', status: 'Válida', validade: '2025-06-15', tipo: 'Estadual' },
        { id: 3, nome: 'CND Municipal', status: 'Válida', validade: '2025-05-20', tipo: 'Municipal' },
        { id: 4, nome: 'FGTS - CRF', status: 'Válida', validade: '2025-04-10', tipo: 'Trabalhista' }
      ],
      listaContratos: [
        { id: 1, fornecedor: 'Imobiliária Regional', tipo: 'Aluguel', valor: 12000, vencimento: '2026-03-31', status: 'Ativo' },
        { id: 2, fornecedor: 'Coelce', tipo: 'Utilidades', valor: 2200, vencimento: '2025-12-31', status: 'Ativo' }
      ],
      indicadores: {
        ticketMedioVenda: 165.30,
        custoOperacional: 26000,
        margemOperacional: 22.8,
        inadimplencia: 1.8
      }
    }
  },
  'cnpj_004': {
    faturamentoData: [
      150000, 145000, 160000, 165000, 175000, 180000,
      190000, 185000, 195000, 210000, 220000, 240000
    ],
    entradasData: [
      600000, 580000, 640000, 660000, 700000, 720000,
      760000, 740000, 780000, 840000, 880000, 960000
    ],
    saidasData: [
      140000, 135000, 150000, 155000, 165000, 170000,
      180000, 175000, 185000, 200000, 210000, 230000
    ],
    dreData2025: {
      receita: [
        150000, 145000, 160000, 165000, 175000, 180000,
        190000, 185000, 195000, 210000, 220000, 240000
      ],
      despesa: [
        105000, 101500, 112000, 115500, 122500, 126000,
        133000, 129500, 136500, 147000, 154000, 168000
      ],
      lucro: [
        45000, 43500, 48000, 49500, 52500, 54000,
        57000, 55500, 58500, 63000, 66000, 72000
      ]
    },
    dreData2024: {
      receita: [
        140000, 135000, 150000, 155000, 165000, 170000,
        180000, 175000, 185000, 200000, 210000, 230000
      ],
      despesa: [
        98000, 94500, 105000, 108500, 115500, 119000,
        126000, 122500, 129500, 140000, 147000, 161000
      ],
      lucro: [
        42000, 40500, 45000, 46500, 49500, 51000,
        54000, 52500, 55500, 60000, 63000, 69000
      ]
    },
    csllData: [4000, 4200, 4500, 4800],
    irpjTotalData: [9500, 10000, 10600, 11300],
    irpjAdicional: [2800, 3000, 3200, 3400],
    receitaGrupos: {
      labels: ['Distribuição', 'Revenda', 'Serviços'],
      data: [1500000, 420000, 195000]
    },
    custosGrupos: {
      labels: ['Compra de Mercadorias', 'Frete'],
      data: [7500000, 360000]
    },
    totaisAcumulados: {
      entradas: 7860000,
      saidas: 2115000
    },
    totaisFiscais: {
      irpj: 41400,
      csll: 17500,
      cargaTributariaTotal: 58900
    },
    pessoalData: {
      funcionarios: 15,
      folhaMensal: 45000.00,
      encargos: 14985.00,
      beneficios: 7500.00,
      folhaPorMes: [
        40000, 41000, 42000, 43000, 44000, 45000,
        45000, 46000, 47000, 48000, 49000, 50000
      ],
      encargosPorMes: [
        13320, 13653, 13986, 14319, 14652, 14985,
        14985, 15318, 15651, 15984, 16317, 16650
      ],
      porDepartamento: {
        labels: ['Logística', 'Administrativo', 'Vendas', 'Operações'],
        data: [6, 3, 4, 2]
      },
      porContrato: {
        labels: ['CLT', 'PJ', 'Temporário'],
        data: [12, 2, 1]
      },
      listaFuncionarios: [
        { id: 1, nome: 'Eduardo Lima', cargo: 'Gerente', departamento: 'Administrativo', salario: 6000, admissao: '2022-04-01' },
        { id: 2, nome: 'Fernanda Costa', cargo: 'Vendedora', departamento: 'Vendas', salario: 2800, admissao: '2022-09-15' },
        { id: 3, nome: 'Gustavo Silva', cargo: 'Motorista', departamento: 'Logística', salario: 2500, admissao: '2023-01-20' }
      ]
    },
    administrativoData: {
      contratos: {
        total: 4,
        vigentes: 4,
        vencendo30dias: 0,
        vencidos: 0
      },
      despesasPorCategoria: {
        labels: ['Aluguel', 'Utilidades', 'Seguros', 'Material Escritório', 'Serviços Terceiros', 'Outros'],
        data: [10000, 3200, 1500, 800, 4500, 1800]
      },
      despesasMensais: [
        20000, 20800, 19500, 21200, 22000, 22500,
        21800, 23000, 23800, 22800, 24000, 25000
      ],
      certidoes: [
        { id: 1, nome: 'CND Federal', status: 'Válida', validade: '2025-08-10', tipo: 'Federal' },
        { id: 2, nome: 'CND Estadual', status: 'Válida', validade: '2025-07-15', tipo: 'Estadual' },
        { id: 3, nome: 'CND Municipal', status: 'Válida', validade: '2025-06-20', tipo: 'Municipal' }
      ],
      listaContratos: [
        { id: 1, fornecedor: 'Galpão Centro', tipo: 'Aluguel', valor: 10000, vencimento: '2026-06-30', status: 'Ativo' },
        { id: 2, fornecedor: 'Energisa', tipo: 'Utilidades', valor: 1800, vencimento: '2025-12-31', status: 'Ativo' }
      ],
      indicadores: {
        ticketMedioVenda: 145.20,
        custoOperacional: 21800,
        margemOperacional: 24.5,
        inadimplencia: 2.0
      }
    }
  },
  'cnpj_005': {
    faturamentoData: [
      85000, 82000, 90000, 95000, 100000, 105000,
      110000, 108000, 115000, 125000, 130000, 145000
    ],
    entradasData: [
      340000, 328000, 360000, 380000, 400000, 420000,
      440000, 432000, 460000, 500000, 520000, 580000
    ],
    saidasData: [
      80000, 77000, 85000, 90000, 95000, 100000,
      105000, 102000, 110000, 120000, 125000, 140000
    ],
    dreData2025: {
      receita: [
        85000, 82000, 90000, 95000, 100000, 105000,
        110000, 108000, 115000, 125000, 130000, 145000
      ],
      despesa: [
        59500, 57400, 63000, 66500, 70000, 73500,
        77000, 75600, 80500, 87500, 91000, 101500
      ],
      lucro: [
        25500, 24600, 27000, 28500, 30000, 31500,
        33000, 32400, 34500, 37500, 39000, 43500
      ]
    },
    dreData2024: {
      receita: [
        80000, 77000, 85000, 90000, 95000, 100000,
        105000, 102000, 110000, 120000, 125000, 140000
      ],
      despesa: [
        56000, 53900, 59500, 63000, 66500, 70000,
        73500, 71400, 77000, 84000, 87500, 98000
      ],
      lucro: [
        24000, 23100, 25500, 27000, 28500, 30000,
        31500, 30600, 33000, 36000, 37500, 42000
      ]
    },
    csllData: [2200, 2400, 2600, 2900],
    irpjTotalData: [5200, 5700, 6200, 6800],
    irpjAdicional: [1500, 1700, 1900, 2100],
    receitaGrupos: {
      labels: ['Frete', 'Armazenagem', 'Outros'],
      data: [950000, 280000, 160000]
    },
    custosGrupos: {
      labels: ['Combustível', 'Manutenção', 'Pedágios'],
      data: [380000, 85000, 45000]
    },
    totaisAcumulados: {
      entradas: 510000,
      saidas: 1390000
    },
    totaisFiscais: {
      irpj: 23900,
      csll: 10100,
      cargaTributariaTotal: 34000
    },
    pessoalData: {
      funcionarios: 12,
      folhaMensal: 32000.00,
      encargos: 10656.00,
      beneficios: 6000.00,
      folhaPorMes: [
        28000, 29000, 30000, 30500, 31000, 32000,
        32000, 32500, 33000, 34000, 35000, 36000
      ],
      encargosPorMes: [
        9324, 9657, 9990, 10156, 10323, 10656,
        10656, 10822, 10989, 11322, 11655, 11988
      ],
      porDepartamento: {
        labels: ['Operações', 'Administrativo', 'Logística'],
        data: [7, 2, 3]
      },
      porContrato: {
        labels: ['CLT', 'PJ'],
        data: [10, 2]
      },
      listaFuncionarios: [
        { id: 1, nome: 'Roberto Almeida', cargo: 'Diretor', departamento: 'Administrativo', salario: 8000, admissao: '2021-06-01' },
        { id: 2, nome: 'Helena Santos', cargo: 'Coordenadora', departamento: 'Operações', salario: 4500, admissao: '2022-02-15' },
        { id: 3, nome: 'Igor Pereira', cargo: 'Motorista', departamento: 'Logística', salario: 2200, admissao: '2022-08-20' }
      ]
    },
    administrativoData: {
      contratos: {
        total: 3,
        vigentes: 3,
        vencendo30dias: 0,
        vencidos: 0
      },
      despesasPorCategoria: {
        labels: ['Aluguel', 'Utilidades', 'Seguros', 'Manutenção Frota', 'Outros'],
        data: [8000, 2500, 3500, 4000, 1500]
      },
      despesasMensais: [
        18000, 18500, 17800, 19000, 19500, 20000,
        19500, 20500, 21000, 20200, 21500, 22000
      ],
      certidoes: [
        { id: 1, nome: 'CND Federal', status: 'Válida', validade: '2025-09-10', tipo: 'Federal' },
        { id: 2, nome: 'CND Estadual', status: 'Válida', validade: '2025-08-15', tipo: 'Estadual' },
        { id: 3, nome: 'CND Municipal', status: 'Válida', validade: '2025-07-20', tipo: 'Municipal' }
      ],
      listaContratos: [
        { id: 1, fornecedor: 'Pátio Central', tipo: 'Aluguel', valor: 8000, vencimento: '2026-12-31', status: 'Ativo' },
        { id: 2, fornecedor: 'Posto Líder', tipo: 'Combustível', valor: 15000, vencimento: '2025-12-31', status: 'Ativo' }
      ],
      indicadores: {
        ticketMedioVenda: 850.00,
        custoOperacional: 19500,
        margemOperacional: 30.0,
        inadimplencia: 1.5
      }
    }
  }
};

// ============================================
// HELPERS PARA ACESSAR DADOS
// ============================================

/**
 * Obtém os dados de um CNPJ específico
 */
export const getDadosCnpj = (cnpjId) => {
  return dadosPorCnpj[cnpjId] || dadosPorCnpj['cnpj_001'];
};

/**
 * Obtém informações de um CNPJ específico
 */
export const getInfoCnpj = (cnpjId) => {
  return cnpjsEmpresa.find(c => c.id === cnpjId) || cnpjsEmpresa[0];
};

/**
 * Obtém CNPJs de uma empresa
 */
export const getCnpjsByEmpresa = (empresaId) => {
  return cnpjsEmpresa.filter(c => c.empresaId === empresaId);
};

/**
 * Obtém empresas de um grupo
 */
export const getEmpresasByGrupo = (grupoId) => {
  return empresas.filter(e => e.grupoId === grupoId);
};

/**
 * Obtém grupo de uma empresa
 */
export const getGrupoByEmpresa = (empresaId) => {
  const empresa = empresas.find(e => e.id === empresaId);
  if (!empresa) return null;
  return grupos.find(g => g.id === empresa.grupoId);
};

/**
 * Obtém empresa de um CNPJ
 */
export const getEmpresaByCnpj = (cnpjId) => {
  const cnpj = cnpjsEmpresa.find(c => c.id === cnpjId);
  if (!cnpj) return null;
  return empresas.find(e => e.id === cnpj.empresaId);
};

/**
 * Calcula totais consolidados de todos os CNPJs
 */
export const getTotaisConsolidados = () => {
  const cnpjIds = Object.keys(dadosPorCnpj);

  let totalReceita = 0;
  let totalDespesa = 0;
  let totalLucro = 0;
  let totalFuncionarios = 0;
  let totalFolha = 0;
  let totalIRPJ = 0;
  let totalCSLL = 0;

  cnpjIds.forEach(id => {
    const dados = dadosPorCnpj[id];
    totalReceita += dados.dreData2025.receita.reduce((a, b) => a + b, 0);
    totalDespesa += dados.dreData2025.despesa.reduce((a, b) => a + b, 0);
    totalLucro += dados.dreData2025.lucro.reduce((a, b) => a + b, 0);
    totalFuncionarios += dados.pessoalData.funcionarios;
    totalFolha += dados.pessoalData.folhaMensal;
    totalIRPJ += dados.totaisFiscais.irpj;
    totalCSLL += dados.totaisFiscais.csll;
  });

  return {
    receita: totalReceita,
    despesa: totalDespesa,
    lucro: totalLucro,
    funcionarios: totalFuncionarios,
    folhaMensal: totalFolha,
    irpj: totalIRPJ,
    csll: totalCSLL,
    cargaTributaria: totalIRPJ + totalCSLL,
    qtdCnpjs: cnpjIds.length
  };
};

/**
 * Calcula totais consolidados por empresa
 */
export const getTotaisConsolidadosPorEmpresa = (empresaId) => {
  const cnpjsDaEmpresa = getCnpjsByEmpresa(empresaId);

  let totalReceita = 0;
  let totalDespesa = 0;
  let totalLucro = 0;
  let totalFuncionarios = 0;
  let totalFolha = 0;
  let totalIRPJ = 0;
  let totalCSLL = 0;

  cnpjsDaEmpresa.forEach(cnpj => {
    const dados = dadosPorCnpj[cnpj.id];
    if (dados) {
      totalReceita += dados.dreData2025.receita.reduce((a, b) => a + b, 0);
      totalDespesa += dados.dreData2025.despesa.reduce((a, b) => a + b, 0);
      totalLucro += dados.dreData2025.lucro.reduce((a, b) => a + b, 0);
      totalFuncionarios += dados.pessoalData.funcionarios;
      totalFolha += dados.pessoalData.folhaMensal;
      totalIRPJ += dados.totaisFiscais.irpj;
      totalCSLL += dados.totaisFiscais.csll;
    }
  });

  return {
    receita: totalReceita,
    despesa: totalDespesa,
    lucro: totalLucro,
    funcionarios: totalFuncionarios,
    folhaMensal: totalFolha,
    irpj: totalIRPJ,
    csll: totalCSLL,
    cargaTributaria: totalIRPJ + totalCSLL,
    qtdCnpjs: cnpjsDaEmpresa.length
  };
};

/**
 * Calcula totais consolidados por grupo
 */
export const getTotaisConsolidadosPorGrupo = (grupoId) => {
  const empresasDoGrupo = getEmpresasByGrupo(grupoId);

  let totalReceita = 0;
  let totalDespesa = 0;
  let totalLucro = 0;
  let totalFuncionarios = 0;
  let totalFolha = 0;
  let totalIRPJ = 0;
  let totalCSLL = 0;
  let totalCnpjs = 0;

  empresasDoGrupo.forEach(empresa => {
    const totais = getTotaisConsolidadosPorEmpresa(empresa.id);
    totalReceita += totais.receita;
    totalDespesa += totais.despesa;
    totalLucro += totais.lucro;
    totalFuncionarios += totais.funcionarios;
    totalFolha += totais.folhaMensal;
    totalIRPJ += totais.irpj;
    totalCSLL += totais.csll;
    totalCnpjs += totais.qtdCnpjs;
  });

  return {
    receita: totalReceita,
    despesa: totalDespesa,
    lucro: totalLucro,
    funcionarios: totalFuncionarios,
    folhaMensal: totalFolha,
    irpj: totalIRPJ,
    csll: totalCSLL,
    cargaTributaria: totalIRPJ + totalCSLL,
    qtdCnpjs: totalCnpjs,
    qtdEmpresas: empresasDoGrupo.length
  };
};

// ============================================
// COMPATIBILIDADE COM CÓDIGO EXISTENTE
// ============================================

// Exporta dados do CNPJ principal para manter compatibilidade
const cnpjPrincipal = dadosPorCnpj['cnpj_001'];

export const faturamentoData = cnpjPrincipal.faturamentoData;
export const entradasData = cnpjPrincipal.entradasData;
export const saidasData = cnpjPrincipal.saidasData;
export const dreData2025 = cnpjPrincipal.dreData2025;
export const dreData2024 = cnpjPrincipal.dreData2024;
export const csllData = cnpjPrincipal.csllData;
export const irpjTotalData = cnpjPrincipal.irpjTotalData;
export const irpjAdicional = cnpjPrincipal.irpjAdicional;
export const receitaGrupos = cnpjPrincipal.receitaGrupos;
export const custosGrupos = cnpjPrincipal.custosGrupos;
export const totaisAcumulados = cnpjPrincipal.totaisAcumulados;
export const totaisFiscais = cnpjPrincipal.totaisFiscais;

// Info da empresa (CNPJ principal) - mantém compatibilidade
export const empresaInfo = {
  ...cnpjsEmpresa[0],
  nome: cnpjsEmpresa[0].razaoSocial
};

// Empresa usuário - mantém compatibilidade
export const empresaUsuario = empresas[0];

// Equipe técnica responsável
export const equipeTecnica = [
  {
    id: 1,
    setor: 'Setor Contábil',
    nome: 'Kallyne Castro',
    icon: 'calculator',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-primary'
  },
  {
    id: 2,
    setor: 'Setor Fiscal',
    nome: 'Alan Severo',
    icon: 'file-spreadsheet',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    id: 3,
    setor: 'Setor Pessoal',
    nome: 'Sarane Ribeiro',
    icon: 'users',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600'
  },
  {
    id: 4,
    setor: 'Setor Administrativo',
    nome: 'Lucas Mendonça',
    icon: 'briefcase',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600'
  }
];

// ============================================
// SISTEMA DE PERMISSÕES SIMPLIFICADO
// ============================================

// Perfis disponíveis (simplificado)
export const perfisUsuario = [
  {
    value: 'Admin',
    label: 'Administrador',
    descricao: 'Acesso total ao sistema e gerenciamento de usuários'
  },
  {
    value: 'Visualizador',
    label: 'Visualizador',
    descricao: 'Apenas visualização dos setores permitidos'
  }
];

// Status disponíveis para usuários
export const statusUsuario = [
  { value: 'Ativo', label: 'Ativo', color: 'green' },
  { value: 'Inativo', label: 'Inativo', color: 'red' },
  { value: 'Pendente', label: 'Pendente', color: 'yellow' }
];

// Dados mockados para o painel admin (usuários)
export const usuariosMock = [
  {
    id: 1,
    nome: 'Admin Principal',
    email: 'admin@agilicomplex.com.br',
    perfil: 'Admin',
    status: 'Ativo',
    setoresAcesso: ['contabil', 'fiscal', 'pessoal', 'administrativo'],
    gruposAcesso: ['grupo_001', 'grupo_002'],
    empresasAcesso: ['empresa_001', 'empresa_002', 'empresa_003'],
    cnpjsAcesso: ['cnpj_001', 'cnpj_002', 'cnpj_003', 'cnpj_004', 'cnpj_005']
  },
  {
    id: 2,
    nome: 'Kallyne Castro',
    email: 'kallyne@agilicomplex.com.br',
    perfil: 'Visualizador',
    status: 'Ativo',
    setoresAcesso: ['contabil'],
    gruposAcesso: ['grupo_001'],
    empresasAcesso: ['empresa_001'],
    cnpjsAcesso: ['cnpj_001', 'cnpj_002', 'cnpj_003']
  },
  {
    id: 3,
    nome: 'Alan Severo',
    email: 'alan@agilicomplex.com.br',
    perfil: 'Visualizador',
    status: 'Ativo',
    setoresAcesso: ['fiscal'],
    gruposAcesso: ['grupo_001'],
    empresasAcesso: ['empresa_001'],
    cnpjsAcesso: ['cnpj_001', 'cnpj_002']
  },
  {
    id: 4,
    nome: 'Sarane Ribeiro',
    email: 'sarane@agilicomplex.com.br',
    perfil: 'Visualizador',
    status: 'Ativo',
    setoresAcesso: ['pessoal'],
    gruposAcesso: ['grupo_001'],
    empresasAcesso: ['empresa_001'],
    cnpjsAcesso: ['cnpj_001']
  },
  {
    id: 5,
    nome: 'Lucas Mendonça',
    email: 'lucas@agilicomplex.com.br',
    perfil: 'Visualizador',
    status: 'Ativo',
    setoresAcesso: ['administrativo'],
    gruposAcesso: ['grupo_001'],
    empresasAcesso: ['empresa_001', 'empresa_002'],
    cnpjsAcesso: ['cnpj_001', 'cnpj_004']
  },
  {
    id: 6,
    nome: 'Roberto Almeida',
    email: 'roberto@abctransportes.com.br',
    perfil: 'Visualizador',
    status: 'Ativo',
    setoresAcesso: ['contabil', 'fiscal', 'pessoal', 'administrativo'],
    gruposAcesso: ['grupo_002'],
    empresasAcesso: ['empresa_003'],
    cnpjsAcesso: ['cnpj_005']
  }
];

// Setores disponíveis para upload de CSV
export const setoresUpload = [
  { value: 'contabil', label: 'Contábil' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'administrativo', label: 'Administrativo' }
];

// Histórico de importações (mock)
export const historicoImportacoes = [
  {
    id: 1,
    cnpj: '30.533.759/0001-09',
    setor: 'Contábil',
    arquivo: 'balancete_jan_2025.csv',
    data: '2025-01-15T10:30:00',
    usuario: 'Kallyne Castro',
    status: 'Sucesso',
    registros: 156
  },
  {
    id: 2,
    cnpj: '30.533.759/0001-09',
    setor: 'Fiscal',
    arquivo: 'nfes_jan_2025.csv',
    data: '2025-01-15T11:45:00',
    usuario: 'Alan Severo',
    status: 'Sucesso',
    registros: 342
  },
  {
    id: 3,
    cnpj: '30.533.759/0002-80',
    setor: 'Contábil',
    arquivo: 'balancete_jan_2025.csv',
    data: '2025-01-16T09:15:00',
    usuario: 'Kallyne Castro',
    status: 'Sucesso',
    registros: 89
  },
  {
    id: 4,
    cnpj: '30.533.759/0001-09',
    setor: 'Pessoal',
    arquivo: 'folha_jan_2025.csv',
    data: '2025-01-20T14:00:00',
    usuario: 'Sarane Ribeiro',
    status: 'Erro',
    registros: 0,
    erro: 'Formato de data inválido na linha 23'
  }
];
