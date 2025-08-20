'use client'

import { Button } from "@/components/ui/button"
import { SideBarIconLink } from "./sidebar-icon-link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  FileText,
  Search,
  LineChart,
  PenSquare,
  Settings, 
  Headphones,
  Globe
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useTenant } from "@/components/tenant/TenantContext"

interface SidebarProps {
  companyId?: string
}

export function Sidebar({ companyId }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { websiteId, setWebsiteId, websites } = useTenant()

  const handleBackToPlatform = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://tools.linkai.nl'
    } else {
      router.push('https://tools.linkai.nl')
    }
  }

  // Navigation helper: ensure a siteId exists, then navigate
  const defaultId = websiteId || websites[0]?.id || 'oranje'
  const go = (path: string) => {
    const id = websiteId || defaultId
    if (!websiteId) setWebsiteId(id)
    router.push(`/s/${id}${path}`)
  }

  return (
    <div className="w-80 h-screen bg-white flex flex-col border-r border-gray-200 font-sans">
      {/* Header (Logo) + Website selector */}
      <div className="px-6 py-6 space-y-4">
        <div className="w-32 h-auto">
          <Image
            src="/linkai.svg"
            alt="LinkAI logo"
            width={125}
            height={40}
            className="w-auto h-auto"
            priority
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Globe className="h-4 w-4" /> Website
          </div>
          <select
            className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
            value={websiteId ?? ''}
            onChange={(e) => setWebsiteId(e.target.value)}
          >
            {!websiteId && <option value="" disabled>Kies website…</option>}
            {websites.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500">Actieve website bepaalt de data in alle pagina's.</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mx-6"></div>

      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto py-6">
        {/* Menu sectie (SEO Command Center) */}
        <div className="mb-6 px-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Menu
          </h3>
          <div className="space-y-1">
            <SideBarIconLink icon={LayoutDashboard} tekst="Dashboard" onClick={() => go('/dashboard')} />
            <SideBarIconLink icon={FileText} tekst="Content" onClick={() => go('/content')} />
            <SideBarIconLink icon={Search} tekst="Zoekwoorden" onClick={() => go('/zoekwoorden')} />
            <SideBarIconLink icon={LineChart} tekst="Prestatie" onClick={() => go('/prestatie')} />
            <SideBarIconLink icon={PenSquare} tekst="Briefings" onClick={() => go('/briefings')} />
          </div>
        </div>

      </div>

      {/* Footer (Hulp & CTA) */}
      <div className="px-6 py-6 mt-auto border-t border-gray-200">
        <div className="space-y-1 mb-6">
          <SideBarIconLink icon={Settings} tekst="Instellingen" onClick={() => go('/instellingen')} />
          <SideBarIconLink 
            icon={Headphones} 
            tekst="Support" 
            href="/support" 
          />
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleBackToPlatform}
          className="w-full h-12 rounded-full text-sm font-medium border border-gray-400 text-black hover:bg-gray-900 hover:text-white transition-colors"
          style={{ backgroundColor: '#a8ef54' }}
          variant="outline"
        >
          Terug naar Platform
        </Button>
      </div>
    </div>
  )
}
