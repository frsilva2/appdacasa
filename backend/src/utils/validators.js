// Validação de CNPJ
export const isValidCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validação do primeiro dígito
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  // Validação do segundo dígito
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;

  return true;
};

// Validação de formato de Inscrição Estadual de MG
export const isValidIEMG = (ie) => {
  ie = ie.replace(/[^\d]+/g, '');

  // IE de MG tem 13 dígitos
  if (ie.length !== 13) return false;

  // Validação básica de formato
  if (!/^\d{13}$/.test(ie)) return false;

  return true; // Validação simplificada, apenas formato
};

// Validação de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de telefone
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
};

// Validação de CEP
export const isValidCEP = (cep) => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};

// Formatar CNPJ
export const formatCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

// Formatar CEP
export const formatCEP = (cep) => {
  cep = cep.replace(/[^\d]+/g, '');
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

// Formatar telefone
export const formatPhone = (phone) => {
  phone = phone.replace(/[^\d]+/g, '');
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
};
