'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authUrls, authConfig } from '@/lib/auth-config';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, ExternalLink } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check of gebruiker al is ingelogd
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      const redirectPath = searchParams?.get('redirect') || authConfig.routes.dashboard;
      router.replace(redirectPath);
    }
  }, [router, searchParams]);

  const handleLogin = () => {
    const currentPath = searchParams?.get('redirect') || window.location.pathname;
    const loginUrl = authUrls.getLoginUrl(currentPath);
    
    console.log(`${authConfig.productName}: Redirecting to login:`, loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welkom bij {authConfig.productName}</CardTitle>
            <CardDescription>
              Log in met je LinkAI account om verder te gaan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Inloggen met LinkAI
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Je wordt doorgestuurd naar het LinkAI platform om in te loggen.
                Na succesvolle authenticatie kom je automatisch terug.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Voor ontwikkelaars:</strong></p>
                <p>• SSO Base URL: {authConfig.ssoBaseUrl}</p>
                <p>• App Base URL: {authConfig.appBaseUrl}</p>
                <p>• Callback Route: {authConfig.routes.callback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden…</div>}>
      <LoginContent />
    </Suspense>
  );
}
