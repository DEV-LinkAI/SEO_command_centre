'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { authApi } from '@/lib/api';
import { authConfig, authUrls } from '@/lib/auth-config';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard - Beschermt componenten/paginas tegen ongeautoriseerde toegang
 * 
 * @param children - De componenten die beschermd moeten worden
 * @param fallback - Optionele fallback component tijdens laden
 * @param redirectTo - Optionele redirect pad na login
 */
export function AuthGuard({ 
  children, 
  fallback,
  redirectTo 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasAuthHint, setHasAuthHint] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const { userId, authToken } = authApi.getAuthData();
      setHasAuthHint(!!(userId && authToken));
    } catch {
      setHasAuthHint(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      // Gebruiker is niet ingelogd, redirect naar login
      const currentPath = redirectTo || window.location.pathname;
      const loginUrl = authUrls.getLoginUrl(currentPath);
      
      console.log(`${authConfig.productName}: Unauthorized access, redirecting to login`);
      window.location.href = loginUrl;
    }
  }, [user, loading, router, redirectTo]);

  // Wacht tot na mount om sessiestatus uit storage te lezen i.v.m. SSR
  if (!mounted) {
    return fallback || <AuthGuardLoadingFallback />;
  }

  // Toon loading state alleen als we geen auth hint hebben
  if (loading && !hasAuthHint) {
    return fallback || <AuthGuardLoadingFallback />;
  }

  // Gebruiker is niet ingelogd
  if (!user && !hasAuthHint) {
    return fallback || <AuthGuardLoadingFallback />;
  }

  // Gebruiker is ingelogd, toon beschermde content
  return <>{children}</>;
}

/**
 * Default loading fallback voor AuthGuard
 */
function AuthGuardLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {authConfig.productName}
          </h2>
          <p className="text-muted-foreground">
            Bezig met laden...
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook variant van AuthGuard voor gebruik in componenten
 */
export function useAuthGuard(redirectTo?: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = redirectTo || window.location.pathname;
      const loginUrl = authUrls.getLoginUrl(currentPath);
      window.location.href = loginUrl;
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
} 
