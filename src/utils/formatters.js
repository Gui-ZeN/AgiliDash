/**
 * Utilitários de formatação para o Dashboard Fiscal
 */

/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado em R$
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

/**
 * Formata um valor para notação compacta (ex: R$ 1.5M)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado de forma compacta
 */
export const formatCompactCurrency = (value) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
};

/**
 * Formata um valor para porcentagem
 * @param {number} value - Valor a ser formatado (0-100)
 * @param {number} decimals - Casas decimais (padrão: 1)
 * @returns {string} Valor formatado como porcentagem
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calcula e formata a porcentagem de um valor em RELAÇÃO ao total
 * @param {number} value - Valor parcial
 * @param {number} total - Valor total
 * @param {number} decimals - Casas decimais (padrão: 1)
 * @returns {string} Porcentagem formatada
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return formatPercentage(percentage, decimals);
};

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} CNPJ formatado
 */
export const formatCNPJ = (cnpj) => {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  return cleanCnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

/**
 * Soma todos os valores de um array
 * @param {number[]} arr - Array de números
 * @returns {number} Soma dos valores
 */
export const sumArray = (arr) => {
  return arr.reduce((acc, val) => acc + val, 0);
};

/**
 * Calcula a diferença entre dois arrays (elemento a elemento)
 * @param {number[]} arr1 - Primeiro array
 * @param {number[]} arr2 - Segundo array
 * @returns {number[]} Array com as diferenças
 */
export const subtractArrays = (arr1, arr2) => {
  return arr1.map((val, index) => val - (arr2[index] || 0));
};
