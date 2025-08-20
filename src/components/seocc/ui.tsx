'use client'

import React from 'react'

export const Button = ({ className = '', children, onClick, variant = 'default', disabled }: {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'success'
  disabled?: boolean
}) => {
  const variants: Record<string, string> = {
    default: 'bg-zinc-900 text-white hover:bg-zinc-800',
    outline: 'border border-zinc-300 hover:bg-zinc-50',
    ghost: 'hover:bg-zinc-100',
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    success: 'bg-primary text-primary-foreground hover:opacity-90',
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${variants[variant]} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export const Badge = ({ children, color = 'zinc' }: { children: React.ReactNode, color?: 'zinc' | 'primary' | 'red' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color === 'primary' ? 'bg-primary text-primary-foreground' : color === 'red' ? 'bg-red-100 text-red-800' : 'bg-zinc-100 text-zinc-800'}`}>{children}</span>
)

export const Card = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}>{children}</div>
)

export const CardHeader = ({ title, actions, subtitle }: { title: string, actions?: React.ReactNode, subtitle?: string }) => (
  <div className="flex items-start justify-between p-4 border-b border-zinc-100">
    <div>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-zinc-500">{subtitle}</p> : null}
    </div>
    <div className="flex items-center gap-2">{actions}</div>
  </div>
)

export const CardBody = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-4 ${className}`}>{children}</div>
)

export const Table = ({ columns, data, onRowClick }: {
  columns: Array<{ key: string, label: string, width?: string, render?: (row: any) => React.ReactNode }>
  data: any[]
  onRowClick?: (row: any) => void
}) => (
  <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
    <table className="w-full text-sm">
      <thead className="bg-zinc-50 text-left text-zinc-600">
        <tr>
          {columns.map((c, idx) => (
            <th key={idx} className={`px-3 py-2 font-medium ${c.width || ''}`}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, ridx) => (
          <tr
            key={ridx}
            className={`border-t border-zinc-100 ${onRowClick ? 'cursor-pointer hover:bg-zinc-50' : ''}`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((c, cidx) => (
              <td key={cidx} className="px-3 py-2 text-zinc-800">{typeof c.render === 'function' ? c.render(row) : (row as any)[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const Field = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-zinc-600">{label}</span>
    {children}
  </label>
)

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 ${props.className || ''}`} />
)

export const Select = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: Array<{ label: string, value: string }> }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm">
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
)

export const Spark = ({ points = [2,4,3,5,6,5] }: { points?: number[] }) => (
  <svg viewBox="0 0 100 30" className="h-6 w-24">
    <polyline
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      points={points.map((p, i) => `${(i / (points.length - 1)) * 100},${30 - p}`).join(' ')}
      className="text-zinc-500"
    />
  </svg>
)
