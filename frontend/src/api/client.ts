function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';

    // En producción (cualquier host que no sea local): usar SIEMPRE el mismo
    // dominio. Ignoramos un VITE_API_URL que haya quedado "horneado" apuntando
    // a localhost durante el build, que es la causa de ERR_CONNECTION_REFUSED.
    if (!isLocalHost) {
      const pointsToLocalhost =
        !envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
      return pointsToLocalhost ? `${window.location.origin}/api` : envUrl;
    }
  }

  // Desarrollo local
  return envUrl || 'http://localhost:3001/api';
}

const API_BASE_URL = resolveApiBaseUrl();


async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.error || body.mensaje || message;
    } catch {
      /* ignore */
    }
    throw new Error(message || `API Error: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return handle<T>(response);
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handle<T>(response);
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handle<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    return handle<T>(response);
  },
};
