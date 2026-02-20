import { describe, expect, it } from 'vitest';
import {
  parseDREComparativa,
  parseDREMensal,
  parseImpostoRenda,
  parseResumoPorAcumulador,
} from './dominioParser';

describe('parseResumoPorAcumulador', () => {
  it('mantem suporte ao formato com delimitador ponto e virgula', () => {
    const csv = [
      'RESUMO POR ACUMULADOR;;;;;;;;;;;;;;;;',
      'ENTRADAS;;;;;;;;;;;;;;;;',
      'Codigo;;Descricao;;;;;;Vlr Contabil;;;;;;;Base ICMS;;Vlr ICMS;;Isentas ICMS;;Outras ICMS;;Vlr IPI;;;BC ICMS ST;;;;;Vlr ICMS ST;;',
      '1;;;COMPRA P/ INDUSTRIALIZACAO;;;;;;27.264.393,95;;;;;;23.367.168,02;;2.554.548,35;;15.181,30;;3.959.406,98;;5.749,24;;;;0,00;;;;;0,00;',
      'SAIDAS;;;;;;;;;;;;;;;;',
      'Codigo;;Descricao;;;;;;Vlr Contabil;;;;;;;Base ICMS;;Vlr ICMS;;Isentas ICMS;;Outras ICMS;;Vlr IPI;;;BC ICMS ST;;;;;Vlr ICMS ST;;',
      '98;;;VENDA DE SORVETES;;;;;;1.939.015,97;;;;;;153,80;;30,76;;0,00;;1.938.862,17;;0,00;;;;1.781.359,26;;;;;149.435,28;',
    ].join('\n');

    const dados = parseResumoPorAcumulador(csv);

    expect(dados.entradas.length).toBe(1);
    expect(dados.saidas.length).toBe(1);
    expect(dados.entradas[0].vlrContabil).toBeCloseTo(27264393.95, 2);
    expect(dados.saidas[0].vlrContabil).toBeCloseTo(1939015.97, 2);
  });

  it('suporta formato com delimitador virgula e valores entre aspas', () => {
    const csv = [
      'ATACADAO DO ACAI INDUSTRIA E COMERCIO LTDA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,Pagina:,,,,1/1',
      'CNPJ:,,,,,,35018014000117,,,,,,,,,,,,,,,,,,,,,,,Emissao:,,,,03/02/2026',
      'Periodo:,,,,,,01/01/2025,ate,,,31/12/2025,,,,,,,,,,,,,,,,,,,,,,,',
      'RESUMO POR ACUMULADOR,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'ENTRADAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'Codigo,,Descricao,,,,,,Vlr Contabil,,,,,,,Base ICMS,,Vlr ICMS,,Isentas ICMS,,Outras ICMS,,Vlr IPI,,,BC ICMS ST,,,,,Vlr ICMS ST,,',
      '1,,,COMPRA P/ INDUSTRIALIZACAO,,,,,,"45.135.338,56",,,,,,"40.990.430,90",,"4.607.423,17",,"7.724,23",,"4.136.982,77",,"10.890,87",,,,"0,00",,,,,"0,00",',
      'SAIDAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'Codigo,,Descricao,,,,,,Vlr Contabil,,,,,,,Base ICMS,,Vlr ICMS,,Isentas ICMS,,Outras ICMS,,Vlr IPI,,,BC ICMS ST,,,,,Vlr ICMS ST,,',
      '98,,,VENDA DE SORVETES,,,,,,"2.076.331,53",,,,,,"1.722.534,74",,"309.770,04",,"297.777,78",,"56.043,01",,"62.178,71",,,,"270.150,10",,,,,"22.663,50",',
    ].join('\n');

    const dados = parseResumoPorAcumulador(csv);

    expect(dados.empresaInfo.cnpj).toBe('35018014000117');
    expect(dados.entradas.length).toBe(1);
    expect(dados.saidas.length).toBe(1);
    expect(dados.entradas[0].vlrContabil).toBeCloseTo(45135338.56, 2);
    expect(dados.saidas[0].vlrContabil).toBeCloseTo(2076331.53, 2);
  });
});

describe('parseImpostoRenda', () => {
  it('mantem suporte ao formato com delimitador ponto e virgula', () => {
    const csv = [
      'EJP COMERCIO DE ALIMENTOS LTDA;;;;;;;;;;;;;;;Pagina:;;01/jan',
      'C.N.P.J.:;;;30.533.759/0001-09;;;;;;;;;;;;;;',
      'Trimestre:;;;jan/25;;;;;;;;;;;;;;',
      'IMPOSTO DE RENDA;;;;;;;;;;;;;;;;',
      'Lucro liquido antes do IRPJ;;;;;;;;;;;;;215.622,23;;;;',
      '(+) Adicoes;;;;;;;;;;;;;14.497,55;;;;',
      '(=) Lucro Real antes da compensacao;;;;;;;;;;;;;230.119,78;;;;',
      '(=) Lucro Real;;;;;;;;;;;;;161.083,85;;;;',
      'IRPJ devido (Aliquota 15,00%);;;;;;;;;;;;;24.162,58;;;;',
      '(+) Adicional de IRPJ;;;;;;;;;;;;;10.108,39;;;;',
      '(=) IRPJ a recolher;;;;;;;;;;;;;34.270,97;;;;',
    ].join('\n');

    const dados = parseImpostoRenda(csv);

    expect(dados.empresaInfo.cnpj).toBe('30.533.759/0001-09');
    expect(dados.trimestre).toBe('jan/25');
    expect(dados.dados.lucroLiquido).toBeCloseTo(215622.23, 2);
    expect(dados.dados.irpjDevido).toBeCloseTo(24162.58, 2);
    expect(dados.dados.adicionalIR).toBeCloseTo(10108.39, 2);
    expect(dados.dados.irpjRecolher).toBeCloseTo(34270.97, 2);
  });

  it('suporta formato com delimitador virgula e valores entre aspas', () => {
    const csv = [
      'ATACADAO DO ACAI INDUSTRIA E COMERCIO LTDA,,,,,,,,,,,,,,,Folha:,,1/1',
      'C.N.P.J.:,,,35.018.014/0001-17,,,,,,,,,,,,,,',
      'Trimestre:,,,1/2025,,,,,,,,,,,,,,',
      'IMPOSTO DE RENDA,,,,,,,,,,,,,,,,,',
      'Lucro liquido antes do IRPJ,,,,,,,,,,,,,"231.239,64",,,,',
      '(+) Adicoes,,,,,,,,,,,,,"22.869,85",,,,',
      '(=) Lucro Real antes da compensacao,,,,,,,,,,,,,"254.109,49",,,,',
      '(=) Lucro Real,,,,,,,,,,,,,"254.109,49",,,,',
      '"IRPJ devido (Aliquota 15,00%)",,,,,,,,,,,,, "38.116,42",,,,',
      '(+) Adicional de IRPJ,,,,,,,,,,,,,"19.410,95",,,,',
      '(=) IRPJ a recolher,,,,,,,,,,,,,"57.527,37",,,,',
    ].join('\n');

    const dados = parseImpostoRenda(csv);

    expect(dados.empresaInfo.cnpj).toBe('35.018.014/0001-17');
    expect(dados.trimestre).toBe('1/2025');
    expect(dados.dados.lucroLiquido).toBeCloseTo(231239.64, 2);
    expect(dados.dados.irpjDevido).toBeCloseTo(38116.42, 2);
    expect(dados.dados.adicionalIR).toBeCloseTo(19410.95, 2);
    expect(dados.dados.irpjRecolher).toBeCloseTo(57527.37, 2);
  });
});

describe('parseDREComparativa', () => {
  it('mantem suporte ao layout antigo da DRE comparativa anual', () => {
    const csv = [
      'Empresa:;;;EJP COMERCIO DE ALIMENTOS LTDA',
      'Periodo:;;;2025 x 2024',
      'RECEITA BRUTA;;;;;;1.000.000,00;;;900.000,00',
      '(-) DESPESAS OPERACIONAIS DAS ATIVIDADES EM GERAL;;;;;;400.000,00;;;350.000,00',
      '= LUCRO BRUTO;;;;;;600.000,00;;;550.000,00',
      '= RESULTADO LIQUIDO DO PERIODO;;;;;;200.000,00;;;180.000,00',
    ].join('\n');

    const dados = parseDREComparativa(csv);

    expect(dados.dados.anoAtual.receitaBruta).toBeCloseTo(1000000, 2);
    expect(dados.dados.anoAnterior.receitaBruta).toBeCloseTo(900000, 2);
    expect(dados.dados.anoAtual.resultadoLiquido).toBeCloseTo(200000, 2);
    expect(dados.dados.anoAnterior.resultadoLiquido).toBeCloseTo(180000, 2);
  });

  it('suporta o layout novo COMPARATIVO DE CALCULO trimestral', () => {
    const csv = [
      'ATACADAO DO ACAI INDUSTRIA E COMERCIO LTDA;;;;;;;;;;;;;;;;;;;Pagina:;;1/1',
      'C.N.P.J.:;;;;35.018.014/0001-17;;;;;;;;;;;;;;;;;',
      'Trimestre:;;;;1/2025 a 4/2025;;;;;;;;;;;;;;;;;',
      'COMPARATIVO DE CALCULO;;;;;;;;;;;;;;;;;;;;;',
      'Trimestre;;;CSLL real;;;IRPJ real;;Total real;;CSLL estimado;;IRPJ estimado;;Total estimado;;Diferenca real x estimado;;;;;',
      ';1/2025;;7.623,29;;;19.175,79;;26.799,08;;0,00;;0,00;;0,00;;26.799,08;;;;;',
      ';2/2025;;20.399,61;;;50.665,60;;71.065,21;;0,00;;0,00;;0,00;;71.065,21;;;;;',
      ';3/2025;;20.242,03;;;50.227,87;;70.469,90;;0,00;;0,00;;0,00;;70.469,90;;;;;',
      ';4/2025;;20.722,10;;;51.561,38;;72.283,48;;0,00;;0,00;;0,00;;72.283,48;;;;;',
    ].join('\n');

    const dados = parseDREComparativa(csv);

    expect(dados.empresaInfo.cnpj).toBe('35.018.014/0001-17');
    expect(dados.comparativoCalculo.trimestres).toHaveLength(4);
    expect(dados.comparativoCalculo.trimestres[0].trimestre).toBe('1/2025');
    expect(dados.comparativoCalculo.trimestres[0].totalReal).toBeCloseTo(26799.08, 2);
    expect(dados.dados.anoAtual.lucroAntesIR).toEqual([26799.08, 71065.21, 70469.9, 72283.48]);
  });

  it('suporta DRE comparativa completa com colunas 2025 e 2024', () => {
    const csv = [
      'Empresa:;;;ATACADAO DO ACAI INDUSTRIA E COMERCIO LTDA;;;;;Pagina:;;;;0001;;',
      'C.N.P.J.:;;;35.018.014/0001-17;;;;;Numero livro:;;;;0001;;',
      'Periodo:;;;01/01/2025 - 31/12/2025;;;;;;;;;;;',
      'DEMONSTRACAO DO RESULTADO DO EXERCICIO EM 31/12/2025;;;;;;;;;;;;;;',
      'Descricao;;;;;;2025;;;2024;;;;;',
      'RECEITA BRUTA;;;;;;17.569.023,21;;;15.838.334,86;;;;;',
      '(-) DEDUCOES DA RECEITA BRUTA;;;;;;(503.973,68);;;(411.260,81);;;;;;',
      '= RECEITA LIQUIDA;;;;;;17.065.049,53;;;15.427.074,05;;;;;',
      '(-) CPV/ CMV;;;;;;(22.994.344,04);;;(16.731.716,18);;;;;;',
      '= LUCRO BRUTO;;;;;;(5.929.294,51);;;(1.304.642,13);;;;;',
      'RESULTADO FINANCEIRO;;;;;;(77.826,35);;;(14.731,64);;;;;',
      '= RESULTADO ANTES DO IRPJ E DA CSLL;;;;;;(8.126.440,67);;;(2.297.643,30);;;;;',
      '(-) PROVISAO PARA A CONTRIBUICAO SOCIAL;;;;;;(84.233,59);;;(68.737,46);;;;;',
      '(-) PROVISAO PARA O IMPOSTO DE RENDA;;;;;;(209.982,22);;;(166.937,39);;;;;',
      '= RESULTADO LIQUIDO DO EXERCICIO;;;;;;(8.420.656,48);;;(2.533.318,15);;;;;',
    ].join('\n');

    const dados = parseDREComparativa(csv);

    expect(dados.empresaInfo.cnpj).toBe('35.018.014/0001-17');
    expect(dados.dados.anoAtual.receitaBruta).toBeCloseTo(17569023.21, 2);
    expect(dados.dados.anoAnterior.receitaBruta).toBeCloseTo(15838334.86, 2);
    expect(dados.dados.anoAtual.cmv).toBeCloseTo(-22994344.04, 2);
    expect(dados.dados.anoAnterior.cmv).toBeCloseTo(-16731716.18, 2);
    expect(dados.dados.anoAtual.lucroAntesIR).toBeCloseTo(-8126440.67, 2);
    expect(dados.dados.anoAnterior.lucroAntesIR).toBeCloseTo(-2297643.3, 2);
    expect(dados.dados.anoAtual.resultadoLiquido).toBeCloseTo(-8420656.48, 2);
    expect(dados.dados.anoAnterior.resultadoLiquido).toBeCloseTo(-2533318.15, 2);
  });
});

describe('parseDREMensal', () => {
  it('mantem suporte ao layout antigo com saldo atual na coluna 10', () => {
    const csv = [
      'Empresa:;;;EJP COMERCIO DE ALIMENTOS LTDA',
      'Periodo:;;;01/01/2025 - 31/01/2025',
      'RECEITA BRUTA;;;;;;;;;;1.000.000,00',
      '(-) DESPESAS OPERACIONAIS DAS ATIVIDADES EM GERAL;;;;;;;;;;(400.000,00)',
      '= RESULTADO LIQUIDO DO PERIODO;;;;;;;;;;200.000,00',
    ].join('\n');

    const dados = parseDREMensal(csv);

    expect(dados.periodo).toBe('01/01/2025 - 31/01/2025');
    expect(dados.dados.receitaBruta).toBeCloseTo(1000000, 2);
    expect(dados.dados.despesasOperacionais).toBeCloseTo(-400000, 2);
    expect(dados.dados.resultadoLiquido).toBeCloseTo(200000, 2);
  });

  it('suporta layout completo com colunas 2025 e 2024 na DRE Mensal', () => {
    const csv = [
      'Empresa:;;;ATACADAO DO ACAI INDUSTRIA E COMERCIO LTDA;;;;;Pagina:;;;;0001;;',
      'C.N.P.J.:;;;35.018.014/0001-17;;;;;Numero livro:;;;;0001;;',
      'Periodo:;;;01/01/2025 - 31/12/2025;;;;;;;;;;;',
      'DEMONSTRACAO DO RESULTADO DO EXERCICIO EM 31/12/2025;;;;;;;;;;;;;;',
      'Descricao;;;;;;2025;;;2024;;;;;',
      'RECEITA BRUTA;;;;;;17.569.023,21;;;15.838.334,86;;;;;',
      '(-) CPV/ CMV;;;;;;(22.994.344,04);;;(16.731.716,18);;;;;;',
      'RESULTADO FINANCEIRO;;;;;;(77.826,35);;;(14.731,64);;;;;',
      '= RESULTADO ANTES DO IRPJ E DA CSLL;;;;;;(8.126.440,67);;;(2.297.643,30);;;;;',
      '= RESULTADO LIQUIDO DO EXERCICIO;;;;;;(8.420.656,48);;;(2.533.318,15);;;;;',
    ].join('\n');

    const dados = parseDREMensal(csv);

    expect(dados.empresaInfo.cnpj).toBe('35.018.014/0001-17');
    expect(dados.dados.receitaBruta).toBeCloseTo(17569023.21, 2);
    expect(dados.dados.cmv).toBeCloseTo(-22994344.04, 2);
    expect(dados.dados.resultadoFinanceiro).toBeCloseTo(-77826.35, 2);
    expect(dados.dados.lucroAntesIR).toBeCloseTo(-8126440.67, 2);
    expect(dados.dados.resultadoLiquido).toBeCloseTo(-8420656.48, 2);
    expect(dados.comparativo.anoAtual).toBe(2025);
    expect(dados.comparativo.anoAnterior).toBe(2024);
    expect(dados.comparativo.dadosAnoAnterior.receitaBruta).toBeCloseTo(15838334.86, 2);
  });
});
