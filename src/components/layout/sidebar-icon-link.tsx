'use client'

import { LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SideBarIconLinkProps {
  icon: LucideIcon
  tekst: string
  href?: string
  onClick?: () => void
}

export function SideBarIconLink({ icon: Icon, tekst, href, onClick }: SideBarIconLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const isActive = href ? pathname === href : false

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-gray-700 hover:bg-gray-100"
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="mr-3 h-4 w-4" />
      {tekst}
    </button>
  )
}
