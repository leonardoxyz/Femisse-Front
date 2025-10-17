import { logger } from '@/utils/logger';
import { secureSessionStorage } from '@/utils/secureStorage';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutos
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias (alinhado ao backend)

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

const isBrowser = typeof window !== 'undefined';

function syncFromStorage() {
  if (!isBrowser) {
    return;
  }

  try {
    const storedAccessToken = secureSessionStorage.getItem<string>(ACCESS_TOKEN_KEY);
    const storedRefreshToken = secureSessionStorage.getItem<string>(REFRESH_TOKEN_KEY);

    if (storedAccessToken) {
      memoryAccessToken = storedAccessToken;
    }

    if (storedRefreshToken) {
      memoryRefreshToken = storedRefreshToken;
    }
  } catch (error) {
    logger.error('Erro ao sincronizar tokens do armazenamento seguro', error);
    memoryAccessToken = null;
    memoryRefreshToken = null;
  }
}

if (isBrowser) {
  syncFromStorage();
}

function persistAccessToken(token: string | null) {
  if (!isBrowser) {
    return;
  }

  if (token) {
    secureSessionStorage.setItem<string>(ACCESS_TOKEN_KEY, token, ACCESS_TOKEN_TTL);
  } else {
    secureSessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

function persistRefreshToken(token: string | null) {
  if (!isBrowser) {
    return;
  }

  if (token) {
    secureSessionStorage.setItem<string>(REFRESH_TOKEN_KEY, token, REFRESH_TOKEN_TTL);
  } else {
    secureSessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export const tokenStorage = {
  setTokens(tokens: { accessToken?: string | null; refreshToken?: string | null }) {
    if (tokens.accessToken !== undefined) {
      memoryAccessToken = tokens.accessToken ?? null;
      persistAccessToken(memoryAccessToken);
    }

    if (tokens.refreshToken !== undefined) {
      memoryRefreshToken = tokens.refreshToken ?? null;
      persistRefreshToken(memoryRefreshToken);
    }
  },

  setAccessToken(token: string | null) {
    this.setTokens({ accessToken: token });
  },

  setRefreshToken(token: string | null) {
    this.setTokens({ refreshToken: token });
  },

  getAccessToken(): string | null {
    if (memoryAccessToken) {
      return memoryAccessToken;
    }

    if (!isBrowser) {
      return null;
    }

    const storedAccessToken = secureSessionStorage.getItem<string>(ACCESS_TOKEN_KEY);
    if (storedAccessToken) {
      memoryAccessToken = storedAccessToken;
      persistAccessToken(memoryAccessToken);
      return memoryAccessToken;
    }

    return null;
  },

  getRefreshToken(): string | null {
    if (memoryRefreshToken) {
      return memoryRefreshToken;
    }

    if (!isBrowser) {
      return null;
    }

    const storedRefreshToken = secureSessionStorage.getItem<string>(REFRESH_TOKEN_KEY);
    if (storedRefreshToken) {
      memoryRefreshToken = storedRefreshToken;
      persistRefreshToken(memoryRefreshToken);
      return memoryRefreshToken;
    }

    return null;
  },

  clearTokens() {
    memoryAccessToken = null;
    memoryRefreshToken = null;

    if (!isBrowser) {
      return;
    }

    secureSessionStorage.removeItem(ACCESS_TOKEN_KEY);
    secureSessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
