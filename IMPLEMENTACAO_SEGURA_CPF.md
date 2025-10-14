# 🚀 Guia de Implementação: Sistema de CPF Seguro

## ⚡ Quick Start

### Arquivos Criados (Prontos para Uso)

1. **`src/hooks/useSecureCPFVerification.ts`** - Hook seguro para verificação de CPF
2. **`src/utils/checkoutStateManager.ts`** - Gerenciador seguro de estado do checkout

### Arquivos que Precisam de Ajustes

1. **`src/pages/Checkout.tsx`** - Remover verificação manual de CPF
2. **`src/pages/Profile.tsx`** - Usar checkoutStateManager
3. **`src/components/checkout/PaymentForm.tsx`** - Já funcional

---

## 🔧 Correções Necessárias

### 1. Finalizar Checkout.tsx

**Remover código antigo de verificação:**

```typescript
// ❌ REMOVER ESTE BLOCO (linhas 232-293)
useEffect(() => {
  const checkUserCPF = async () => {
    // ... verificação manual de CPF
    setUserCPF(cpf);
    setIsCheckingCPF(false);
  };
  checkUserCPF();
}, []);
```

**O hook já faz isso automaticamente:**
```typescript
// ✅ JÁ IMPLEMENTADO
const { cpf: userCPF, isChecking: isCheckingCPF } = useSecureCPFVerification(user?.id, isAuthenticated);
```

### 2. Usar checkoutStateManager

**ANTES (location.state com dados sensíveis):**
```typescript
// ❌ INSEGURO
navigate('/perfil', { 
  state: { 
    checkoutData: {
      appliedCouponCode: 'DESCONTO10',
      selectedAddressId: 'abc123'
    }
  }
});
```

**DEPOIS (apenas ID):**
```typescript
// ✅ SEGURO
const restoreId = checkoutStateManager.saveRestoreData({
  selectedAddressId: checkoutState.selectedAddress?.id,
  appliedCouponCode: checkoutState.appliedCoupon?.coupon?.code,
  returnStep: 'payment'
});

navigate('/perfil', { 
  state: { 
    message: '...',
    restoreId, // Apenas o ID
    highlightCPF: true
  }
});
```

### 3. Restaurar dados ao voltar

**No useEffect do Checkout.tsx:**
```typescript
useEffect(() => {
  const restoreId = location.state?.restoreId;
  if (!restoreId) return;

  // Recuperar dados do storage seguro
  const data = checkoutStateManager.getRestoreData(restoreId);
  
  if (data) {
    // Restaurar step
    if (data.returnStep) {
      goToStep(data.returnStep);
    }
    
    // Restaurar cupom
    if (data.appliedCouponCode) {
      applyCoupon(data.appliedCouponCode);
    }
    
    // Restaurar endereço
    if (data.selectedAddressId && addresses.length > 0) {
      const addr = addresses.find(a => a.id === data.selectedAddressId);
      if (addr) selectAddress(addr);
    }
    
    // Limpar
    checkoutStateManager.clearRestoreData(restoreId);
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state]);
```

---

## 📋 Checklist de Implementação

### Frontend (Prioridade ALTA)
- [x] Criar `useSecureCPFVerification.ts`
- [x] Criar `checkoutStateManager.ts`
- [ ] Ajustar `Checkout.tsx` para remover verificação manual
- [ ] Ajustar `Checkout.tsx` para usar `checkoutStateManager`
- [ ] Ajustar `Profile.tsx` para usar `checkoutStateManager`
- [ ] Substituir `logger.info` por `logger.log` nos arquivos criados
- [ ] Testar fluxo completo

### Backend (Prioridade CRÍTICA)
- [ ] Adicionar validação de CPF no endpoint `/api/users/profile`
- [ ] Implementar rate limiting em rotas de CPF
- [ ] Adicionar sanitização de CPF antes de salvar
- [ ] Validar dígitos verificadores do CPF
- [ ] Adicionar logs de auditoria (sem expor CPF completo)

### Infraestrutura (Prioridade CRÍTICA)
- [ ] Forçar HTTPS (redirect HTTP → HTTPS)
- [ ] Configurar headers de segurança (CSP, HSTS, X-Frame-Options)
- [ ] Configurar rate limiting no Nginx/Cloudflare
- [ ] Adicionar monitoring (Sentry/LogRocket)

---

## 🧪 Como Testar

### Teste 1: Verificação de CPF
```bash
# Cenário: Usuário sem CPF
1. Limpar sessionStorage
2. Fazer login
3. Adicionar produtos ao carrinho
4. Clicar em "Finalizar Compra"
5. Selecionar endereço
6. Clicar em "Continuar para pagamento"
✅ Deve redirecionar para /perfil com alerta
```

### Teste 2: Cache de CPF
```bash
# Cenário: Evitar múltiplas requisições
1. Abrir Network tab do DevTools
2. Fazer login
3. Navegar para checkout
4. Voltar e entrar no checkout novamente
✅ Deve fazer apenas 1 requisição de CPF (usar cache)
```

### Teste 3: Persistência de Cupom
```bash
# Cenário: Cupom não deve ser perdido
1. Aplicar cupom "DESCONTO10"
2. Clicar em "Continuar para pagamento" (sem CPF)
3. Redireciona para perfil
4. Preencher CPF e salvar
5. Voltar automaticamente para checkout
✅ Cupom "DESCONTO10" deve estar aplicado
```

### Teste 4: Segurança de State
```bash
# Cenário: Manipulação de location.state
1. Abrir console do navegador
2. Executar:
   history.pushState({ restoreId: 'fake-id' }, '', '/checkout');
3. Recarregar página
✅ Deve falhar graciosamente (dados não encontrados)
```

### Teste 5: Expiração de Cache
```bash
# Cenário: Dados expiram após 10min
1. Salvar dados com checkoutStateManager
2. Aguardar 11 minutos
3. Tentar recuperar dados
✅ Deve retornar null (expirado)
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find name 'setUserCPF'"
**Causa:** Código antigo ainda referencia states removidos  
**Solução:** Remover bloco de verificação manual de CPF (linhas 232-293 do Checkout.tsx)

### Problema: "Property 'info' does not exist on type logger"
**Causa:** Logger não tem método `info`  
**Solução:** Substituir todos `logger.info()` por `logger.log()`

### Problema: Cupom não persiste após redirecionamento
**Causa:** Usando location.state em vez de checkoutStateManager  
**Solução:** Implementar checkoutStateManager conforme documentação

### Problema: Multiple CPF requests
**Causa:** Cache não está funcionando  
**Solução:** Verificar se `useSecureCPFVerification` está sendo usado corretamente

---

## 🔍 Validação de CPF no Backend (Node.js)

```javascript
// backend/utils/cpfValidator.js
function validateCPF(cpf) {
  // Remove formatação
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica tamanho
  if (cleaned.length !== 11) return false;
  
  // Verifica sequências repetidas
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Valida dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return (
    parseInt(cleaned.charAt(9)) === digit1 &&
    parseInt(cleaned.charAt(10)) === digit2
  );
}

// Middleware de validação
function validateCPFMiddleware(req, res, next) {
  const { cpf } = req.body;
  
  if (!cpf) {
    return res.status(400).json({ 
      error: 'CPF é obrigatório' 
    });
  }
  
  if (!validateCPF(cpf)) {
    return res.status(400).json({ 
      error: 'CPF inválido' 
    });
  }
  
  // Sanitiza antes de continuar
  req.body.cpf = cpf.replace(/\D/g, '');
  next();
}

module.exports = { validateCPF, validateCPFMiddleware };
```

---

## 🚀 Deploy Checklist

### Pré-Deploy
- [ ] Todos os testes passando
- [ ] Código revisado
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente configuradas

### Deploy
- [ ] Deploy do frontend
- [ ] Deploy do backend
- [ ] Verificar HTTPS funcionando
- [ ] Verificar rate limiting ativo
- [ ] Smoke test em produção

### Pós-Deploy
- [ ] Monitoring ativo
- [ ] Alertas configurados
- [ ] Logs sendo coletados
- [ ] Performance metrics OK

---

## 📞 Suporte

**Dúvidas sobre implementação:**  
Consultar `SECURITY_AUDIT_CPF_SYSTEM.md`

**Problemas em produção:**  
1. Verificar logs do Sentry
2. Checar métricas de performance
3. Revisar rate limiting

---

**Última atualização:** 13/01/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para implementação
