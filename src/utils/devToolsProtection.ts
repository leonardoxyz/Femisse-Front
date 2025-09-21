// Proteção contra DevTools em produção

const isProduction = import.meta.env.PROD;

// Função para detectar se DevTools está aberto
const detectDevTools = () => {
  const threshold = 160;
  
  if (
    window.outerHeight - window.innerHeight > threshold ||
    window.outerWidth - window.innerWidth > threshold
  ) {
    return true;
  }
  
  return false;
};

// Função para dificultar o uso do DevTools
export const initDevToolsProtection = () => {
  if (!isProduction) return;

  // 1. Detectar abertura do DevTools
  setInterval(() => {
    if (detectDevTools()) {
      // Redirecionar ou mostrar aviso
      document.body.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          z-index: 999999;
        ">
          <div style="text-align: center;">
            <h1>🔒 Acesso Restrito</h1>
            <p>Por favor, feche as ferramentas de desenvolvedor.</p>
            <button onclick="window.location.reload()" style="
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 20px;
            ">Recarregar Página</button>
          </div>
        </div>
      `;
    }
  }, 1000);

  // 2. Desabilitar teclas de atalho do DevTools
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
  });

  // 3. Desabilitar menu de contexto (botão direito)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 4. Ofuscar console
  if (window.console) {
    window.console.log = () => {};
    window.console.warn = () => {};
    window.console.error = () => {};
    window.console.info = () => {};
    window.console.debug = () => {};
  }

  // 5. Detectar debugger
  setInterval(() => {
    const start = performance.now();
    debugger; // Esta linha será pausada se DevTools estiver aberto
    const end = performance.now();
    
    if (end - start > 100) {
      // DevTools provavelmente está aberto
      window.location.href = 'about:blank';
    }
  }, 3000);
};

// Função para limpar dados sensíveis do localStorage em produção
export const clearSensitiveData = () => {
  if (!isProduction) return;
  
  // Limpar dados sensíveis após um tempo
  setTimeout(() => {
    const sensitiveKeys = ['token', 'user', 'auth'];
    sensitiveKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  }, 30 * 60 * 1000); // 30 minutos
};
