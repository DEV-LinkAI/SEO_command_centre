'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api';
import { authConfig } from '@/lib/auth-config';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<div className="text-center space-y-4">Bezig met inloggen…</div>}>
        <SSOCallbackContent />
      </Suspense>
    </div>
  );
}

function SSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Bezig met inloggen...');

  useEffect(() => {
    const handleSSOCallback = async () => {
      try {
        console.log(`${authConfig.productName}: Starting SSO callback...`);
        console.log('URL:', window.location.href);
        console.log('Search params:', searchParams?.toString());
        
        // Stap 1: Probeer tokens uit URL parameters te halen
        let accessToken = searchParams?.get('access_token');
        let refreshToken = searchParams?.get('refresh_token');
        
        console.log('Tokens from search params:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        
        // Stap 2: Fallback - probeer ook hash parameters (voor compatibiliteit)
        if (!accessToken && typeof window !== 'undefined' && window.location.hash) {
          console.log('Trying hash params:', window.location.hash);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          console.log('Tokens from hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        }

        // Stap 3: Check of we tokens hebben
        if (!accessToken || !refreshToken) {
          console.error('No tokens found in URL parameters or hash');
          console.log('Available search params:', Array.from(searchParams?.entries() || []));
          console.log('Available hash params:', window.location.hash ? Array.from(new URLSearchParams(window.location.hash.substring(1)).entries()) : []);
          setStatus('error');
          setMessage('Geen authenticatie tokens gevonden. Probeer opnieuw in te loggen.');
          
          // Redirect naar login na 3 seconden
          setTimeout(() => {
            router.replace(authConfig.routes.login);
          }, 3000);
          return;
        }

        console.log(`${authConfig.productName}: Tokens ontvangen, bezig met sessie instellen...`);
        console.log('Token lengths:', { 
          accessTokenLength: accessToken.length, 
          refreshTokenLength: refreshToken.length 
        });
        setMessage('Tokens ontvangen, bezig met sessie instellen...');

        // Stap 4: Luister naar auth state changes om te weten wanneer login succesvol is
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state change in callback:', event, !!session);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('Session created successfully:', {
                userId: session.user.id,
                email: session.user.email,
                tokenLength: session.access_token.length
              });

              // Sla tokens op in sessionStorage voor API calls
              // Probeer company_id alvast te zetten uit user_metadata
              let companyId: string | undefined;
              const meta = session.user?.user_metadata as Record<string, unknown> | null | undefined;
              if (meta && typeof meta === 'object' && 'company_id' in meta) {
                const cid = (meta as { company_id?: unknown }).company_id;
                if (typeof cid === 'string') companyId = cid;
              }
              authApi.setAuthData({
                userId: session.user.id,
                authToken: session.access_token,
                companyId,
              });

              console.log(`${authConfig.productName}: Sessie succesvol ingesteld voor gebruiker ${session.user.email}`);
              setStatus('success');
              setMessage('Succesvol ingelogd! Je wordt doorgestuurd...');

              // Navigeer naar oorspronkelijke bestemming of dashboard
              const finalRedirectPath = searchParams?.get('redirect_path') || authConfig.routes.dashboard;
              console.log('Redirecting to:', finalRedirectPath);
              
              // Kleine delay voor betere UX en cleanup subscription
              setTimeout(() => {
                console.log('Executing redirect...');
                subscription.unsubscribe(); // Cleanup
                router.replace(finalRedirectPath);
              }, 1500);
            }
          }
        );

        // Stap 5: Stel Supabase sessie in (fire and forget - we luisteren naar events)
        console.log('Calling supabase.auth.setSession...');
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).catch((error) => {
          console.error('Supabase setSession error:', error);
          setStatus('error');
          setMessage(`Fout bij instellen sessie: ${error.message}`);
          subscription.unsubscribe();
          
          // Redirect naar login na 3 seconden
          setTimeout(() => {
            router.replace(authConfig.routes.login);
          }, 3000);
        });

      } catch (error) {
        console.error('SSO Callback error:', error);
        setStatus('error');
        setMessage(`Onverwachte fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
        
        // Redirect naar login na 3 seconden
        setTimeout(() => {
          router.replace(authConfig.routes.login);
        }, 3000);
      }
    };

    handleSSOCallback();
  }, [router, searchParams]);

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto">
        {status === 'loading' && (
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
        )}
        {status === 'success' && (
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      
      <h1 className="text-2xl font-semibold text-foreground">
        {status === 'loading' && 'Bezig met inloggen'}
        {status === 'success' && 'Succesvol ingelogd'}
        {status === 'error' && 'Inloggen mislukt'}
      </h1>
      
      <p className="text-muted-foreground max-w-md mx-auto">
        {message}
      </p>
      
      {status === 'error' && (
        <p className="text-sm text-muted-foreground">
          Je wordt automatisch doorgestuurd naar de login pagina...
        </p>
      )}
    </div>
  );
} 
