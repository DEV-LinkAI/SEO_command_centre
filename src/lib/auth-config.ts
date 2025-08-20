/**
 * Auth Configuration Template
 * Pas deze instellingen aan voor elk LinkAI product
 */

export const authConfig = {
  // Hoofdplatform URL waar gebruikers inloggen
  ssoBaseUrl: 'https://tools.linkai.nl/login',
  
  // Je product URL - PAS DIT AAN per product
  appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Product naam voor debugging en logging
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'SEO Command Centre',
  
  // Routes
  routes: {
    callback: '/auth/sso-callback',
    login: '/auth/login',
    dashboard: '/',
    unauthorized: '/auth/unauthorized'
  },
  
  // Sessie instellingen
  session: {
    // Keys voor sessionStorage
    keys: {
      userId: 'user_id',
      authToken: 'auth_token',
      companyId: 'company_id',
      userProfile: 'user_profile'
    },
    // Hoe lang moet een sessie geldig blijven (in ms)
    maxAge: 24 * 60 * 60 * 1000 // 24 uur
  }
};

/**
 * Helper functies voor auth URLs
 */
export const authUrls = {
  /**
   * Genereer login URL met optional redirect path
   */
  getLoginUrl(redirectPath?: string): string {
    let callbackUrl = `${authConfig.appBaseUrl}${authConfig.routes.callback}`;
    if (redirectPath) {
      callbackUrl += `?redirect_path=${encodeURIComponent(redirectPath)}`;
    }
    
    return `${authConfig.ssoBaseUrl}?redirect_url=${encodeURIComponent(callbackUrl)}`;
  },

  /**
   * Genereer logout URL
   */
  getLogoutUrl(): string {
    return `${authConfig.ssoBaseUrl}/logout?redirect_url=${encodeURIComponent(authConfig.appBaseUrl)}`;
  }
}; 
