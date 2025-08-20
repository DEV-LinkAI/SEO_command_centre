'use client'

import { Badge, Button, Card, CardBody, CardHeader, Table } from "@/components/seocc/ui";

const sampleKpis = [
  { title: "Organische Sessies", value: 18342, delta: +12.3 },
  { title: "CTR", value: "3.8%", delta: +0.4 },
  { title: "Gem. Positie", value: 14.2, delta: -0.8 },
  { title: "Performance Score", value: 76, delta: +6.1 },
];

const stijgers = [
  { rank: 1, title: "Zonnepanelen onderhoud", change: "+8 posities" },
  { rank: 2, title: "Warmtepomp subsidie 2025", change: "+6 posities" },
  { rank: 3, title: "Isolatieglas soorten", change: "+5 posities" },
  { rank: 4, title: "Laadpaal thuis kosten", change: "+4 posities" },
  { rank: 5, title: "HR++ vs Triple glas", change: "+3 posities" },
];

const dalers = [
  { rank: 1, title: "Zonneboiler werking", change: "-7 posities" },
  { rank: 2, title: "Sedumdak aanleggen", change: "-5 posities" },
  { rank: 3, title: "Hybride warmtepomp", change: "-4 posities" },
  { rank: 4, title: "Thuisbatterij prijs", change: "-3 posities" },
  { rank: 5, title: "Dakisolatie kosten", change: "-2 posities" },
];

const updateArtikelen = [
  { title: "Warmtepomp geluidseisen", score: 54, reason: "Dalende CTR, hoog volume" },
  { title: "Spouwmuurisolatie soorten", score: 62, reason: "Positie 12 → kansen" },
  { title: "Laadpaal subsidie", score: 49, reason: "Verouderde data" },
];

const kansen = [
  { kw: "zonnepanelen reinigen", vol: 2900, kd: 18 },
  { kw: "hybride warmtepomp kosten", vol: 1900, kd: 22 },
  { kw: "waterontharder verbruik", vol: 1300, kd: 15 },
];

export default function DashboardClient({ siteId }: { siteId: string }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="text-sm text-gray-500">Website: <span className="font-medium text-gray-800">{siteId}</span></div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sampleKpis.map((k) => (
          <Card key={k.title}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{k.title}</p>
                  <p className="mt-1 text-xl font-semibold text-zinc-900">{k.value}</p>
                </div>
                <Badge color={k.delta >= 0 ? 'primary' : 'red'}>{k.delta >= 0 ? `+${k.delta}%` : `${k.delta}%`}</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Snelste Stijgers" />
          <CardBody>
            <Table
              columns={[{ key: 'rank', label: '#', width: 'w-12' }, { key: 'title', label: 'Artikel Titel' }, { key: 'change', label: 'Verandering', width: 'w-40' }]}
              data={stijgers}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Snelste Dalers" />
          <CardBody>
            <Table
              columns={[{ key: 'rank', label: '#', width: 'w-12' }, { key: 'title', label: 'Artikel Titel' }, { key: 'change', label: 'Verandering', width: 'w-40' }]}
              data={dalers}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Artikelen voor Update" />
        <CardBody>
          <Table
            columns={[{ key: 'title', label: 'Artikel Titel' }, { key: 'score', label: 'Performance Score', width: 'w-44' }, { key: 'reason', label: 'Reden' }]}
            data={updateArtikelen}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Kansen – Ongebruikte Zoekwoorden" />
        <CardBody>
          <Table
            columns={[
              { key: 'kw', label: 'Zoekwoord' },
              { key: 'vol', label: 'Maandelijks Volume', width: 'w-56' },
              { key: 'kd', label: 'Keyword Difficulty', width: 'w-56' },
              { key: 'action', label: 'Actie', width: 'w-48', render: () => <Button variant="primary">Maak Briefing</Button> },
            ]}
            data={kansen}
          />
        </CardBody>
      </Card>
    </div>
  )
}
