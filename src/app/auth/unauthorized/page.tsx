'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authUrls, authConfig } from '@/lib/auth-config';
import { ShieldX, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const handleLogin = () => {
    const loginUrl = authUrls.getLoginUrl();
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Geen toegang</CardTitle>
            <CardDescription>
              Je hebt geen toegang tot {authConfig.productName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Je bent niet geautoriseerd om deze applicatie te gebruiken.
                Dit kan zijn omdat:
              </p>
              <ul className="mt-2 text-left space-y-1">
                <li>• Je account heeft geen toegang tot dit product</li>
                <li>• Je bedrijf heeft geen actief abonnement</li>
                <li>• Je sessie is verlopen</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleLogin}
                className="w-full"
                variant="default"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Opnieuw inloggen
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Terug naar home
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Heb je vragen over toegang? Neem contact op met{' '}
                <a 
                  href="mailto:support@linkai.nl" 
                  className="text-primary hover:underline"
                >
                  support@linkai.nl
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 