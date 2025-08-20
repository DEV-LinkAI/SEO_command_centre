/**
 * API Helper functies voor LinkAI producten
 * Handelt authenticatie en API calls af
 */

import { authConfig } from './auth-config';

export interface AuthData {
  userId: string;
  authToken: string;
  companyId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  company_id: string;
  role?: string;
  // Extra velden uit de database
  company_name?: string;
  phone_number?: string;
  profile_role_name?: string;
  [key: string]: unknown;
}

/**
 * Auth Data Management
 */
export const authApi = {
  /**
   * Haal auth data op uit sessionStorage
   */
  getAuthData(): AuthData {
    const keys = authConfig.session.keys;
    return {
      userId: sessionStorage.getItem(keys.userId) || '',
      authToken: sessionStorage.getItem(keys.authToken) || '',
      companyId: sessionStorage.getItem(keys.companyId) || ''
    };
  },

  /**
   * Sla auth data op in sessionStorage
   */
  setAuthData(data: Partial<AuthData>): void {
    const keys = authConfig.session.keys;
    if (data.userId) sessionStorage.setItem(keys.userId, data.userId);
    if (data.authToken) sessionStorage.setItem(keys.authToken, data.authToken);
    if (data.companyId) sessionStorage.setItem(keys.companyId, data.companyId);
  },

  /**
   * Verwijder alle auth data
   */
  clearAuthData(): void {
    const keys = authConfig.session.keys;
    Object.values(keys).forEach(key => sessionStorage.removeItem(key));
  },

  /**
   * Check of gebruiker is ingelogd
   */
  isAuthenticated(): boolean {
    const { userId, authToken } = this.getAuthData();
    return !!(userId && authToken);
  },

  /**
   * Sla user profile op
   */
  setUserProfile(profile: UserProfile): void {
    sessionStorage.setItem(authConfig.session.keys.userProfile, JSON.stringify(profile));
  },

  /**
   * Haal user profile op
   */
  getUserProfile(): UserProfile | null {
    const stored = sessionStorage.getItem(authConfig.session.keys.userProfile);
    return stored ? JSON.parse(stored) : null;
  }
};

/**
 * API Request Helper
 */
export const apiRequest = {
  /**
   * Maak authenticated API call
   */
  async call<T>(
    endpoint: string, 
    options: RequestInit = {},
    baseUrl?: string
  ): Promise<T> {
    const { authToken } = authApi.getAuthData();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Voeg auth header toe als we een token hebben
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Als 401, waarschijnlijk expired token
      if (response.status === 401) {
        authApi.clearAuthData();
        window.location.href = authConfig.routes.login;
        throw new Error('Session expired');
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * GET request
   */
  async get<T>(endpoint: string, baseUrl?: string): Promise<T> {
    return this.call<T>(endpoint, { method: 'GET' }, baseUrl);
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, baseUrl?: string): Promise<T> {
    return this.call<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, baseUrl);
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, baseUrl?: string): Promise<T> {
    return this.call<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, baseUrl);
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, baseUrl?: string): Promise<T> {
    return this.call<T>(endpoint, { method: 'DELETE' }, baseUrl);
  }
}; 
