'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Field, Input, Table } from "@/components/seocc/ui";
import { seoccApi, type Website } from '@/lib/seocc'
import { useAuth } from '@/components/auth/AuthContext'

function Koppelingen() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="WordPress Koppeling" subtitle="Log in met gebruikersnaam en App-wachtwoord" />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Site URL"><Input placeholder="https://voorbeeld.nl" defaultValue="https://oranjeduurzaam.nl" /></Field>
          <div />
          <Field label="Gebruikersnaam"><Input placeholder="admin" /></Field>
          <Field label="App‑wachtwoord"><Input placeholder="xxxx xxxx xxxx xxxx" /></Field>
          <div className="sm:col-span-2 flex items-center gap-2">
            <Button variant="primary">Verbind met WordPress</Button>
            <span className="text-xs text-zinc-500">Gebruik een WordPress App‑wachtwoord (Profiel → App‑wachtwoorden).</span>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Google Analytics 4" />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Property ID"><Input defaultValue="GA4-123456" /></Field>
          <div className="sm:col-span-2"><Button variant="primary">Verbind</Button></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Google Search Console" />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Field label="Property (site)"><Input placeholder="sc-domain:voorbeeld.nl of https://voorbeeld.nl/" /></Field>
          <div className="sm:col-span-2"><Button variant="primary">Opslaan</Button></div>
        </CardBody>
      </Card>
    </div>
  )
}

function PerformanceScore() {
  const sliders = [
    { label: 'CTR', defaultValue: 25 },
    { label: 'Positie', defaultValue: 35 },
    { label: 'Klikken', defaultValue: 25 },
    { label: 'Impressies', defaultValue: 15 },
  ]
  return (
    <Card>
      <CardHeader title="Performance Score" />
      <CardBody className="space-y-4">
        {sliders.map(s => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">{s.label}</span>
              <span className="font-medium">{s.defaultValue}%</span>
            </div>
            <input type="range" defaultValue={s.defaultValue} className="w-full" />
          </div>
        ))}
        <Button variant="primary">Opslaan</Button>
      </CardBody>
    </Card>
  )
}

function WebsitesBeheer() {
  const { userProfile } = useAuth()
  const [rows, setRows] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const canCreate = !!userProfile?.company_id && !!name && !!domain && !saving
  const load = async () => {
    setLoading(true)
    try { setRows(await seoccApi.listWebsites()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!userProfile?.company_id) {
      alert('Er is geen company_id gevonden voor je profiel. Log opnieuw in of laat je account koppelen aan een company.');
      return;
    }
    if (!name || !domain) {
      alert('Vul zowel naam als hoofddomein in.');
      return;
    }
    setSaving(true)
    try {
      await seoccApi.createWebsite({ company_id: userProfile.company_id, name, primary_domain: domain })
      setName(''); setDomain('');
      await load()
    } catch (e) {
      alert((e as any)?.message || 'Kon website niet aanmaken')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Website Beheer</h3>
      </div>
      <Card>
        <CardHeader title="Nieuwe website" subtitle="Koppel een nieuwe site aan jouw company" />
        <CardBody className="grid gap-3 sm:grid-cols-3">
          <Field label="Naam">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Bijv. OranjeDuurzaam.nl" />
          </Field>
          <Field label="Hoofddomein">
            <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="bijv. oranjeduurzaam.nl" />
          </Field>
          <div className="flex items-end">
            <Button variant="primary" onClick={create} disabled={!canCreate}>Toevoegen</Button>
          </div>
        </CardBody>
      </Card>

      {!userProfile?.company_id && (
        <div className="text-sm text-red-600">Je profiel heeft geen company_id. Zonder company kan je geen websites aanmaken. Neem contact op of controleer je login.</div>
      )}

      <Card>
        <CardHeader title="Mijn websites" subtitle={loading ? 'Laden…' : undefined} />
        <CardBody>
          <Table columns={[{key:'name',label:'Website Naam'},{key:'primary_domain',label:'Domein'},{key:'status',label:'Status'}]} data={rows as any} />
        </CardBody>
      </Card>
    </div>
  )
}

function GebruikersBeheer() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Gebruikers & Toegang</h3>
        <Button variant="primary">Gebruiker Uitnodigen</Button>
      </div>
      <Table columns={[{key:'nm',label:'Naam'},{key:'rol',label:'Rol'},{key:'status',label:'Status'},{key:'act',label:'Acties', render: () => <Button variant="outline">Beheer</Button>}]} data={[{nm:'Maatje',rol:'Beheerder',status:'Actief'},{nm:'David',rol:'Specialist',status:'Actief'}]} />
    </div>
  )
}

export default function SettingsClient({ siteId }: { siteId: string }) {
  const [tab, setTab] = useState<'koppelingen'|'score'|'websites'|'gebruikers'>('koppelingen')
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-4">
      <p className="text-sm text-gray-500">Website: <span className="font-medium text-gray-800">{siteId}</span></p>
      <div className="flex items-center gap-2">
        {[{k:'koppelingen',label:'Koppelingen'},{k:'score',label:'Performance Score'},{k:'websites',label:'Website Beheer'},{k:'gebruikers',label:'Gebruikers'}].map(t => (
          <button key={t.k} className={`rounded-xl px-3 py-2 text-sm ${tab===t.k?'bg-zinc-900 text-white':'bg-zinc-100'}`} onClick={() => setTab(t.k as any)}>{t.label}</button>
        ))}
      </div>
      {tab === 'koppelingen' && <Koppelingen />}
      {tab === 'score' && <PerformanceScore />}
      {tab === 'websites' && <WebsitesBeheer />}
      {tab === 'gebruikers' && <GebruikersBeheer />}
    </div>
  )
}
