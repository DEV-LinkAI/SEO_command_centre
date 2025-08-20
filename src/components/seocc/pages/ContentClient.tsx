'use client'

import { useMemo, useState } from 'react'
import { Button, Card, CardBody, Field, Input, Table } from "@/components/seocc/ui"

const contentRows = Array.from({ length: 12 }).map((_, i) => ({
  title: `Artikel ${i + 1}`,
  url: `/artikel-${i + 1}`,
  date: `2025-0${(i % 9) + 1}-0${(i % 8) + 1}`,
  sessions: 500 + i * 50,
  ctr: `${(2.4 + i * 0.1).toFixed(1)}%`,
  pos: (20 - i).toFixed(1),
  score: 50 + i,
}));

function ContentOverzicht({ onOpenDetail }: { onOpenDetail: (row: any) => void }) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('')
  const [author, setAuthor] = useState('')
  const [date, setDate] = useState('')
  const rows = useMemo(() => contentRows.filter(r => r.title.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Field label="Zoeken op Post Titel"><Input placeholder="Zoek…" value={query} onChange={(e) => setQuery(e.target.value)} /></Field>
            <Field label="Categorie"><Input placeholder="Alle categorieën" value={cat} onChange={(e) => setCat(e.target.value)} /></Field>
            <Field label="Auteur"><Input placeholder="Alle auteurs" value={author} onChange={(e) => setAuthor(e.target.value)} /></Field>
            <Field label="Publicatiedatum"><Input placeholder="Alle datums" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          </div>
        </CardBody>
      </Card>
      <Table
        columns={[
          { key: 'title', label: 'Post Titel', render: (r) => (
            <span className="text-primary hover:underline" onClick={() => onOpenDetail(r)}>{r.title}</span>
          ) },
          { key: 'url', label: 'URL' },
          { key: 'date', label: 'Publicatiedatum' },
          { key: 'sessions', label: 'Organische Sessies' },
          { key: 'ctr', label: 'CTR' },
          { key: 'pos', label: 'Gem. Positie' },
          { key: 'score', label: 'Performance Score' },
        ]}
        data={rows}
      />
    </div>
  )
}

function ContentDetail({ item, onBack }: { item: any, onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{item.title}</h1>
          <p className="text-sm text-zinc-500">Publicatiedatum {item.date} • Auteur: Redactie</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Bekijk Live</Button>
          <Button variant="outline">Bewerk in WordPress</Button>
          <Button variant="primary">Genereer Optimalisatie Briefing</Button>
        </div>
      </div>
      <Card>
        <CardBody>
          <Table
            columns={[{ key: 'kw', label: 'Rankend Zoekwoord' }, { key: 'impr', label: 'Vertoningen' }, { key: 'clk', label: 'Klikken' }, { key: 'pos', label: 'Positie' }]}
            data={[{ kw: 'warmtepomp subsidie', impr: 3200, clk: 220, pos: 8.2 }, { kw: 'hybride warmtepomp', impr: 2100, clk: 140, pos: 11.4 }]}
          />
        </CardBody>
      </Card>
      <div>
        <Button variant="ghost" onClick={onBack}>← Terug</Button>
      </div>
    </div>
  )
}

function ContentKalender() {
  const rows = [
    { title: 'Warmtepomp subsidie 2025', kw: 'warmtepomp subsidie', peak: 'Mei', vol: 2400 },
    { title: 'Dakisolatie kosten', kw: 'dakisolatie kosten', peak: 'Oktober', vol: 1700 },
  ];
  return (
    <Card>
      <CardBody>
        <Table
          columns={[{key:'title',label:'Artikel Titel'},{key:'kw',label:'Zoekwoord'},{key:'peak',label:'Piekmaand'},{key:'vol',label:'Piek Zoekvolume'}]}
          data={rows}
        />
      </CardBody>
    </Card>
  )
}

function ContentDetailTabs({ item }: { item: any }) {
  const [tab, setTab] = useState<'prestaties'|'analyse'|'briefings'>('prestaties')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[
          {k:'prestaties',label:'Prestaties'},
          {k:'analyse',label:'Content & SEO-Analyse'},
          {k:'briefings',label:'Gekoppelde Briefings'},
        ].map(t => (
          <button key={t.k} className={`rounded-xl px-3 py-2 text-sm ${tab===t.k?'bg-zinc-900 text-white':'bg-zinc-100'}`} onClick={() => setTab(t.k as any)}>{t.label}</button>
        ))}
      </div>
      {tab === 'prestaties' && (
        <Card>
          <CardBody>
            <Table columns={[{key:'kw',label:'Rankend Zoekwoord'},{key:'impr',label:'Vertoningen'},{key:'clk',label:'Klikken'},{key:'pos',label:'Positie'}]} data={[{ kw: 'warmtepomp subsidie', impr: 3200, clk: 220, pos: 8.2 }, { kw: 'hybride warmtepomp', impr: 2100, clk: 140, pos: 11.4 }]} />
          </CardBody>
        </Card>
      )}
      {tab === 'analyse' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-3">
              <Field label="Focus Zoekwoord"><Input defaultValue="hybride warmtepomp kosten" /></Field>
              <Field label="Meta Title"><Input defaultValue="Hybride warmtepomp kosten in 2025 – alle factoren" /></Field>
              <Field label="Meta Description"><Input defaultValue="Ontdek alle kosten, subsidies en terugverdientijd voor je hybride warmtepomp in 2025." /></Field>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <ul className="list-disc pl-5 text-sm text-zinc-700">
                <li>Koppel naar "Warmtepomp geluidseisen"</li>
                <li>Koppel naar "Thuisbatterij prijs"</li>
                <li>Plaats linkblok naar "Subsidie 2025" overzicht</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      )}
      {tab === 'briefings' && (
        <Card>
          <CardBody className="text-sm text-zinc-700">
            <p>1 gekoppelde briefing gevonden. <Button variant="ghost">Bekijk volledige briefing →</Button></p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default function ContentClient({ siteId }: { siteId: string }) {
  const [detailItem, setDetailItem] = useState<any | null>(null)
  const [view, setView] = useState<'overzicht'|'kalender'>('overzicht')
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-4">
      <p className="text-sm text-gray-500">Website: <span className="font-medium text-gray-800">{siteId}</span></p>
      {!detailItem && (
        <div className="flex items-center gap-2">
          {[
            {k:'overzicht',label:'Overzicht'},
            {k:'kalender',label:'Kalender'},
          ].map(t => (
            <button key={t.k} className={`rounded-xl px-3 py-2 text-sm ${view===t.k?'bg-zinc-900 text-white':'bg-zinc-100'}`} onClick={() => setView(t.k as any)}>{t.label}</button>
          ))}
        </div>
      )}
      {!detailItem ? (
        view === 'overzicht' ? <ContentOverzicht onOpenDetail={setDetailItem} /> : <ContentKalender />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{detailItem.title}</h1>
              <p className="text-sm text-zinc-500">Publicatiedatum {detailItem.date} • Auteur: Redactie</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">Bekijk Live</Button>
              <Button variant="outline">Bewerk in WordPress</Button>
              <Button variant="primary">Genereer Optimalisatie Briefing</Button>
            </div>
          </div>
          <ContentDetailTabs item={detailItem} />
          <div>
            <Button variant="ghost" onClick={() => setDetailItem(null)}>← Terug</Button>
          </div>
        </div>
      )}
    </div>
  )
}
