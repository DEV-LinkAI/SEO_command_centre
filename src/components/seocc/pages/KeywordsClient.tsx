'use client'

import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Table } from "@/components/seocc/ui"

const kwRows = Array.from({ length: 15 }).map((_, i) => ({
  keyword: `zoekwoord ${i + 1}`,
  vol: 200 + i * 20,
  kd: 10 + i,
  article: i % 3 === 0 ? "Artikel X" : "—",
  briefing: i % 4 === 0 ? "Gereed" : "—",
}));

function ZoekwoordDatabase({ onOpenDetail }: { onOpenDetail: (row: any) => void }) {
  return (
    <Table
      columns={[
        { key: 'keyword', label: 'Zoekwoord', render: (r) => <span className="text-primary hover:underline" onClick={() => onOpenDetail(r)}>{r.keyword}</span> },
        { key: 'vol', label: 'Zoekvolume' },
        { key: 'kd', label: 'Moeilijkheid' },
        { key: 'article', label: 'Artikel' },
        { key: 'briefing', label: 'Briefing' },
      ]}
      data={kwRows}
    />
  )
}

function ZoekwoordDetail({ item, onBack }: { item: any, onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>← Terug</Button>
        <h1 className="text-xl font-semibold tracking-tight">{item.keyword}</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[{k:"Zoekvolume", v:item.vol},{k:"Keyword Difficulty", v:item.kd},{k:"CPC", v:"€0,45"},{k:"Trend", v:"↑"}].map((k) => (
          <Card key={k.k}><CardBody><p className="text-xs text-zinc-500">{k.k}</p><p className="mt-1 text-xl font-semibold">{k.v}</p></CardBody></Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Gekoppelde Artikelen" />
        <CardBody>
          <Table
            columns={[{key:'title',label:'Artikel'},{key:'clk',label:'Klikken'},{key:'impr',label:'Impressies'},{key:'pos',label:'Positie'}]}
            data={[{title:'Hybride warmtepomp kosten', clk:220, impr:3200, pos:8.2}]}
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Gerelateerde Zoekwoord Kansen" />
        <CardBody>
          <Table
            columns={[{key:'kw',label:'Zoekwoord'},{key:'vol',label:'Volume'},{key:'kd',label:'Moeilijkheid'},{ key:'act', label:'Actie', render: () => <Button variant="primary">Toevoegen</Button>} ]}
            data={[{kw:'hybride warmtepomp subsidie', vol:1300, kd:18},{kw:'hybride warmtepomp geluid', vol:900, kd:14}]}
          />
        </CardBody>
      </Card>
    </div>
  )
}

function ZoekwoordKansen() {
  return (
    <Card>
      <CardHeader title="Artikelen op positie 11–30" />
      <CardBody>
        <Table
          columns={[{key:'title',label:'Artikel'},{key:'pos',label:'Positie'},{key:'actie',label:'Actie',render:()=> <Button variant="success">Maak optimalisatie</Button>}]}
          data={[{title:'Hybride warmtepomp kosten',pos:14.2},{title:'Dakisolatie kosten',pos:19.5}]}
        />
      </CardBody>
    </Card>
  )
}

function ZoekwoordVerkenner() {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <div className="mb-1 text-xs text-zinc-600">Zoekwoord</div>
              <input className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" defaultValue="warmtepomp" />
            </div>
            <div>
              <div className="mb-1 text-xs text-zinc-600">Aantal resultaten</div>
              <input type="number" className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" defaultValue={25} />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="12-maanden trend" />
        <CardBody>
          <div className="h-64 rounded-md bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center text-sm text-zinc-500">
            Grafiek placeholder
          </div>
        </CardBody>
      </Card>
      <Table
        columns={[{key:'kw',label:'Zoekwoord'},{key:'vol',label:'Zoekvolume'},{key:'conc',label:'Concurrentie'},{key:'kd',label:'Moeilijkheid'},{key:'act',label:'Actie', render: () => <Button variant="primary">Toevoegen</Button>} ]}
        data={[{kw:'hybride warmtepomp kosten',vol:1900,conc:'Laag',kd:22},{kw:'warmtepomp subsidie 2025',vol:2400,conc:'Midden',kd:28}]}
      />
    </div>
  )
}

export default function KeywordsClient({ siteId }: { siteId: string }) {
  const [view, setView] = useState<'database' | 'detail' | 'kansen' | 'verkenner'>('database')
  const [kwDetail, setKwDetail] = useState<any | null>(null)
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-4">
      <p className="text-sm text-gray-500">Website: <span className="font-medium text-gray-800">{siteId}</span></p>
      <div className="flex items-center gap-2">
        {[
          {k:'database',label:'Database'},
          {k:'kansen',label:'Kansen'},
          {k:'verkenner',label:'Verkenner'},
        ].map(t => (
          <button key={t.k} className={`rounded-xl px-3 py-2 text-sm ${view===t.k?'bg-zinc-900 text-white':'bg-zinc-100'}`} onClick={() => setView(t.k as any)}>{t.label}</button>
        ))}
      </div>
      {view === 'database' && !kwDetail && (
        <ZoekwoordDatabase onOpenDetail={(row) => { setKwDetail(row); setView('detail') }} />
      )}
      {view === 'detail' && kwDetail && (
        <ZoekwoordDetail item={kwDetail} onBack={() => { setKwDetail(null); setView('database') }} />
      )}
      {view === 'kansen' && (
        <ZoekwoordKansen />
      )}
      {view === 'verkenner' && (
        <ZoekwoordVerkenner />
      )}
    </div>
  )
}
