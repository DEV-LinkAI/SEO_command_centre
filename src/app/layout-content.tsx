'use client';

import { useAuth } from "@/components/auth/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { NavSearch } from "@/components/layout/nav-search";
import SubheaderBar from "@/components/layout/SubheaderBar";
import { Sidebar } from "@/components/layout/sidebar";
import { TenantProvider } from "@/components/tenant/TenantContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { user, userProfile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const pageTitle = (() => {
    const p = pathname || '/';
    // Multi-tenant routes: /s/[siteId]/...
    if (p.startsWith('/s/')) {
      if (p.includes('/dashboard')) return 'Dashboard';
      if (p.includes('/content')) return 'Content';
      if (p.includes('/zoekwoorden')) return 'Zoekwoorden';
      if (p.includes('/prestatie')) return 'Prestatie';
      if (p.includes('/briefings')) return 'Briefings';
      if (p.includes('/instellingen')) return 'Instellingen';
      return 'SEO Command Center';
    }
    // Legacy/template routes
    switch (p) {
      case '/':
        return 'Dashboard';
      case '/producten':
        return 'Producten';
      case '/favorieten':
        return 'Favorieten';
      case '/uitkomsten':
        return 'Uitkomsten';
      case '/in-ontwikkeling':
        return 'In ontwikkeling';
      case '/instellingen':
        return 'Instellingen';
      case '/support':
        return 'Support';
      default: {
        const clean = p.replace(/^\//, '');
        return clean ? clean.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ') : 'Pagina';
      }
    }
  })();
  
  // Auth paginas hebben geen sidebar/nav en geen auth guard
  const isAuthPage = pathname?.startsWith('/auth/');
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Alle andere paginas zijn beschermd met AuthGuard
  return (
    <TenantProvider>
      <div className="flex min-h-screen h-full w-full min-w-0">
      {/* Sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <Sidebar 
            companyId={userProfile?.company_id || "unknown"} 
          />
        </div>
        {/* Main content area */}
        <div className="flex-1 flex flex-col font-sans min-h-0">
          <NavSearch userName={userProfile?.name || userProfile?.email || user?.email || "Gebruiker"} />
          <main className="flex-1 min-h-0 overflow-auto bg-gray-50 font-sans">
            <SubheaderBar 
              title={pageTitle}
              showBack={pathname !== '/'}
              onBack={() => router.back()}
              sticky
            />
            <AuthGuard fallback={<div className="p-6 text-sm text-gray-500">Laden...</div>}>
              {children}
            </AuthGuard>
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
