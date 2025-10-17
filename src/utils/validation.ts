/**
 * ✅ Validações Reutilizáveis
 * 
 * Funções de validação padronizadas para toda a aplicação
 */

// ============================================
// VALIDAÇÕES DE EMAIL
// ============================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getEmailError = (email: string): string | null => {
  if (!email) return 'Email é obrigatório';
  if (!validateEmail(email)) return 'Email inválido';
  return null;
};

// ============================================
// VALIDAÇÕES DE CPF
// ============================================

export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cleanCPF(cpf);
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const validateCPF = (cpf: string): boolean => {
  const cleaned = cleanCPF(cpf);
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // CPFs com dígitos repetidos
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  return true;
};

export const getCPFError = (cpf: string): string | null => {
  if (!cpf) return 'CPF é obrigatório';
  const cleaned = cleanCPF(cpf);
  if (cleaned.length !== 11) return 'CPF deve ter 11 dígitos';
  if (!validateCPF(cpf)) return 'CPF inválido';
  return null;
};

// ============================================
// VALIDAÇÕES DE TELEFONE
// ============================================

export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const formatPhone = (phone: string): string => {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = cleanPhone(phone);
  return cleaned.length === 10 || cleaned.length === 11;
};

export const getPhoneError = (phone: string): string | null => {
  if (!phone) return 'Telefone é obrigatório';
  if (!validatePhone(phone)) return 'Telefone inválido';
  return null;
};

// ============================================
// VALIDAÇÕES DE CEP
// ============================================

export const cleanCEP = (cep: string): string => {
  return cep.replace(/\D/g, '');
};

export const formatCEP = (cep: string): string => {
  const cleaned = cleanCEP(cep);
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const validateCEP = (cep: string): boolean => {
  const cleaned = cleanCEP(cep);
  return cleaned.length === 8;
};

export const getCEPError = (cep: string): string | null => {
  if (!cep) return 'CEP é obrigatório';
  if (!validateCEP(cep)) return 'CEP deve ter 8 dígitos';
  return null;
};

// ============================================
// VALIDAÇÕES DE SENHA
// ============================================

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length < 6) {
    errors.push('Mínimo de 6 caracteres');
  }
  
  if (password.length < 8) {
    errors.push('Recomendado 8+ caracteres');
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriasMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (criteriasMet >= 3 && password.length >= 8) {
    strength = 'strong';
  } else if (criteriasMet >= 2 && password.length >= 6) {
    strength = 'medium';
  }
  
  if (!hasNumbers) {
    errors.push('Adicione números');
  }
  
  if (!hasUpperCase || !hasLowerCase) {
    errors.push('Use maiúsculas e minúsculas');
  }
  
  return {
    isValid: password.length >= 6,
    strength,
    errors,
  };
};

export const getPasswordError = (password: string): string | null => {
  if (!password) return 'Senha é obrigatória';
  if (password.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
  return null;
};

// ============================================
// VALIDAÇÕES DE NOME
// ============================================

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const getNameError = (name: string): string | null => {
  if (!name) return 'Nome é obrigatório';
  if (name.trim().length < 2) return 'Nome deve ter no mínimo 2 caracteres';
  return null;
};

// ============================================
// VALIDAÇÕES DE CARTÃO DE CRÉDITO
// ============================================

export const cleanCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\D/g, '');
};

export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cleanCardNumber(cardNumber);
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cleanCardNumber(cardNumber);
  
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const getCardNumberError = (cardNumber: string): string | null => {
  if (!cardNumber) return 'Número do cartão é obrigatório';
  if (!validateCardNumber(cardNumber)) return 'Número do cartão inválido';
  return null;
};

export const validateCVV = (cvv: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '');
  return cleaned.length === 3 || cleaned.length === 4;
};

export const getCVVError = (cvv: string): string | null => {
  if (!cvv) return 'CVV é obrigatório';
  if (!validateCVV(cvv)) return 'CVV inválido';
  return null;
};

export const validateExpiryDate = (expiry: string): boolean => {
  const cleaned = expiry.replace(/\D/g, '');
  if (cleaned.length !== 4) return false;
  
  const month = parseInt(cleaned.substring(0, 2));
  const year = parseInt(cleaned.substring(2, 4));
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

export const getExpiryDateError = (expiry: string): string | null => {
  if (!expiry) return 'Data de validade é obrigatória';
  if (!validateExpiryDate(expiry)) return 'Data de validade inválida';
  return null;
};

// ============================================
// VALIDAÇÕES GENÉRICAS
// ============================================

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

export const validatePattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

// ============================================
// EXPORT CONSOLIDADO
// ============================================

export const validators = {
  email: { validate: validateEmail, getError: getEmailError },
  cpf: { validate: validateCPF, getError: getCPFError, clean: cleanCPF, format: formatCPF },
  phone: { validate: validatePhone, getError: getPhoneError, clean: cleanPhone, format: formatPhone },
  cep: { validate: validateCEP, getError: getCEPError, clean: cleanCEP, format: formatCEP },
  password: { validate: validatePassword, getError: getPasswordError, checkStrength: validatePasswordStrength },
  name: { validate: validateName, getError: getNameError },
  card: {
    number: { validate: validateCardNumber, getError: getCardNumberError, clean: cleanCardNumber, format: formatCardNumber },
    cvv: { validate: validateCVV, getError: getCVVError },
    expiry: { validate: validateExpiryDate, getError: getExpiryDateError },
  },
  required: validateRequired,
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  pattern: validatePattern,
};

export default validators;
