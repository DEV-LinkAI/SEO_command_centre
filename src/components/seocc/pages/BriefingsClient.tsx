'use client'

import { useState } from 'react'
import { Button, Table } from "@/components/seocc/ui";

export default function BriefingsClient({ siteId }: { siteId: string }) {
  const [rows, setRows] = useState([
    {kw:'warmtepomp subsidie 2025', type:'Nieuwe Briefing', artikel:'—', date:'2025-08-01', status:'Gereed'},
    {kw:'hybride warmtepomp kosten', type:'Optimalisatie', artikel:'Hybride warmtepomp kosten', date:'2025-08-06', status:'Gereed'},
  ])
  const add = (type: 'new'|'opt') => {
    const newRow = { kw: '[focus zoekwoord]', type: type === 'opt' ? 'Optimalisatie' : 'Nieuwe Briefing', artikel: type === 'opt' ? 'Bestaand artikel' : '—', date: new Date().toISOString().slice(0,10), status:'Genereren...' };
    setRows([newRow, ...rows]);
    setTimeout(() => setRows((rs) => rs.map((r, i) => i===0 ? { ...r, status:'Gereed' } : r)), 800);
  }
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-4">
      <p className="text-sm text-gray-500">Website: <span className="font-medium text-gray-800">{siteId}</span></p>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mijn Briefings</h2>
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => add('new')}>Nieuwe Briefing</Button>
          <Button variant="outline" onClick={() => add('opt')}>Optimalisatie Briefing</Button>
        </div>
      </div>
      <Table
        columns={[{ key:'kw', label:'Focus Zoekwoord' }, { key:'type', label:'Type' }, { key:'artikel', label:'Gekoppeld Artikel' }, { key:'date', label:'Aanmaakdatum' }, { key:'status', label:'Status' }]}
        data={rows}
      />
    </div>
  )
}

