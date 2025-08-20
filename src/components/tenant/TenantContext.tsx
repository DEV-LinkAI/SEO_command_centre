'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { seoccApi, type Website } from '@/lib/seocc'

type WebsiteOption = { id: string; name: string; domain?: string; status?: string };

interface TenantContextType {
  websiteId: string | null;
  setWebsiteId: (id: string) => void;
  websites: WebsiteOption[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const STORAGE_KEY = 'active_website_id';

function useWebsiteRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ siteId?: string }>();

  const activeSiteId = (params?.siteId as string) || null;

  const replaceSiteInPath = (newId: string) => {
    if (!pathname) return '/';
    const parts = pathname.split('/').filter(Boolean);
    const sIndex = parts.indexOf('s');
    // If current path is already /s/[siteId]/..., replace it
    if (sIndex !== -1 && parts[sIndex + 1]) {
      parts[sIndex + 1] = newId;
      return '/' + parts.join('/');
    }
    // Otherwise, navigate to dashboard for the selected site
    return `/s/${newId}/dashboard`;
  };

  const navigateToSite = (newId: string) => {
    const dest = replaceSiteInPath(newId);
    router.push(dest);
  };

  return { activeSiteId, navigateToSite };
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { activeSiteId, navigateToSite } = useWebsiteRouting();
  const [websiteId, setWebsiteIdState] = useState<string | null>(null);
  const [websites, setWebsites] = useState<WebsiteOption[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWebsites = async () => {
    try {
      const data = await seoccApi.listWebsites()
      const opts = (data || []).map((w: Website) => ({ id: w.id, name: w.name || w.primary_domain, domain: w.primary_domain, status: w.status }))
      setWebsites(opts)
      if (!activeSiteId && opts.length > 0 && !websiteId) {
        setWebsiteIdState(opts[0].id)
        try { sessionStorage.setItem(STORAGE_KEY, opts[0].id) } catch {}
      }
    } catch {
      // noop
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWebsites() }, [activeSiteId])

  // Sync from route -> state/storage
  useEffect(() => {
    const fromRoute = activeSiteId;
    const fromStorage = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    const candidate = fromRoute || fromStorage || null;
    if (candidate) {
      setWebsiteIdState(candidate);
      try { sessionStorage.setItem(STORAGE_KEY, candidate); } catch {}
    }
    setLoading(false);
  }, [activeSiteId]);

  const setWebsiteId = (id: string) => {
    setWebsiteIdState(id);
    try { sessionStorage.setItem(STORAGE_KEY, id); } catch {}
    navigateToSite(id);
  };

  const value = useMemo(() => ({ websiteId, setWebsiteId, websites, loading, refresh: loadWebsites }), [websiteId, websites, loading]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
