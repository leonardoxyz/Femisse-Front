import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, logPerformance, logApiCall } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('em desenvolvimento', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
    });

    it('deve logar mensagens em desenvolvimento', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      logger.log('teste');
      expect(consoleSpy).toHaveBeenCalledWith('[INFO]', 'teste');
    });

    it('deve logar erros em desenvolvimento', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      logger.error('erro');
      expect(consoleSpy).toHaveBeenCalledWith('[ERROR]', 'erro');
    });
  });

  describe('logPerformance', () => {
    it('deve calcular duração corretamente', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const startTime = performance.now();
      
      logPerformance('teste', startTime);
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('logApiCall', () => {
    it('deve logar chamadas de API com sucesso', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      logApiCall('GET', '/api/products', 200);
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
