import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseSecureFormOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  sanitize?: boolean;
}

interface FormState<T> {
  data: Partial<T>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Função para sanitizar dados do frontend
const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return value
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, '') // Remove < e >
      .slice(0, 10000); // Limita tamanho
  }
  
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  
  if (value && typeof value === 'object') {
    const sanitized: any = {};
    for (const key in value) {
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }
  
  return value;
};

export function useSecureForm<T>({ 
  schema, 
  onSubmit, 
  sanitize = true 
}: UseSecureFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    data: {},
    errors: {},
    isSubmitting: false,
    isValid: false
  });

  const validateField = useCallback((name: string, value: any) => {
    try {
      // Validação simples sem usar schema.shape
      schema.parse({ [name]: value });
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' }
      }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Campo inválido';
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [name]: errorMessage }
        }));
        return false;
      }
    }
    return true;
  }, [schema]);

  const setValue = useCallback((name: string, value: any) => {
    const processedValue = sanitize ? sanitizeValue(value) : value;
    
    setState(prev => {
      const newData = { ...prev.data, [name]: processedValue };
      
      // Validar o campo específico
      validateField(name, processedValue);
      
      // Verificar se o formulário inteiro é válido
      try {
        schema.parse(newData);
        return {
          ...prev,
          data: newData,
          isValid: true
        };
      } catch {
        return {
          ...prev,
          data: newData,
          isValid: false
        };
      }
    });
  }, [sanitize, validateField, schema]);

  const setValues = useCallback((values: Partial<T>) => {
    const processedValues = sanitize ? sanitizeValue(values) : values;
    
    setState(prev => {
      const newData = { ...prev.data, ...processedValues };
      
      // Validar todos os campos
      const newErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(processedValues)) {
        try {
          // Validação simples sem usar schema.shape
          schema.parse({ [key]: value });
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors[key] = error.errors[0]?.message || 'Campo inválido';
          }
        }
      }
      
      // Verificar se o formulário inteiro é válido
      let isValid = false;
      try {
        schema.parse(newData);
        isValid = true;
      } catch {
        isValid = false;
      }
      
      return {
        ...prev,
        data: newData,
        errors: { ...prev.errors, ...newErrors },
        isValid
      };
    });
  }, [sanitize, schema]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Validação final
      const validatedData = schema.parse(state.data);
      
      // Executar callback de submit
      await onSubmit(validatedData);
      
      // Limpar formulário após sucesso
      setState(prev => ({
        ...prev,
        data: {},
        errors: {},
        isSubmitting: false,
        isValid: false
      }));
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        
        setState(prev => ({
          ...prev,
          errors: newErrors,
          isSubmitting: false
        }));
      } else {
        console.error('Form submission error:', error);
        setState(prev => ({
          ...prev,
          isSubmitting: false
        }));
        throw error;
      }
    }
  }, [schema, state.data, onSubmit]);

  const reset = useCallback(() => {
    setState({
      data: {},
      errors: {},
      isSubmitting: false,
      isValid: false
    });
  }, []);

  const getFieldProps = useCallback((name: string) => ({
    value: state.data[name as keyof T] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(name, e.target.value);
    },
    onBlur: () => {
      validateField(name, state.data[name as keyof T]);
    },
    error: state.errors[name],
    'aria-invalid': !!state.errors[name],
    'aria-describedby': state.errors[name] ? `${name}-error` : undefined
  }), [state.data, state.errors, setValue, validateField]);

  return {
    // Estado do formulário
    data: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    
    // Métodos para manipular dados
    setValue,
    setValues,
    reset,
    
    // Método para submit
    handleSubmit,
    
    // Helper para props de campos
    getFieldProps
  };
}

export default useSecureForm;
