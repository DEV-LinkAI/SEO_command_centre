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
export function AuthGuard({ children }: AuthGuardProps) {
  // Auth temporarily disabled: always render children
  return <>{children}</>
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
export function useAuthGuard(_redirectTo?: string) {
  // Auth temporarily disabled
  return { user: null as any, loading: false, isAuthenticated: true }
} 
