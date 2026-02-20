import { describe, expect, it } from 'vitest';
import { parseImpostoRenda, parseResumoPorAcumulador } from './dominioParser';

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
