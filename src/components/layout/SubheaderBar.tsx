'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface SubheaderBarProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
  className?: string
  sticky?: boolean
}

// Full-width subheader that visually sits directly under the topbar.
// Adjusted to this template's theme: uses Tailwind "primary" color.
const SubheaderBar: React.FC<SubheaderBarProps> = ({
  title,
  subtitle,
  icon,
  showBack = true,
  onBack,
  right,
  className = '',
  sticky = true,
}) => {
  return (
    <div
      className={[
        'bg-white flex items-center justify-between',
        'px-8 py-2 sm:py-3 mb-6',
        // In het hoofdplatform wordt met negatieve margins layout-padding gecompenseerd.
        // Pas dit aan indien nodig voor pagina-specifieke lay‑out.
        // '-mt-[56px] -mx-[56px]',
        'border-t border-primary',
        sticky ? 'sticky top-0 z-30' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="mr-3 p-2 rounded-full border border-gray-300 text-slate-700 hover:bg-primary/10 hover:text-slate-900 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label="Ga terug"
            title="Ga terug"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="flex items-center space-x-3">
          {icon && <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </div>

      {right}
    </div>
  )
}

export default SubheaderBar
