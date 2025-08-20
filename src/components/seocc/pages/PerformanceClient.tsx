'use client'

import { Card, CardBody, CardHeader, Table } from "@/components/seocc/ui";

export default function PerformanceClient({ siteId }: { siteId: string }) {
  const kpis = [
    { k: 'Totaal Score', v: 76 },
    { k: 'Klikken', v: 12450 },
    { k: 'Verschil', v: '+6.1%' },
    { k: 'Positie', v: 14.2 },
  ]
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <p className="text-sm text-gray-500">Website: <span className="font-medium text-gray-800">{siteId}</span></p>

      <Card>
        <CardHeader title="Prestatiegrafiek" subtitle="Placeholder – grafiek volgt" />
        <CardBody>
          <div className="h-64 rounded-md bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center text-sm text-zinc-500">
            Grafiek placeholder
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {kpis.map(x => (
          <Card key={x.k}><CardBody><p className="text-xs text-zinc-500">{x.k}</p><p className="mt-1 text-xl font-semibold">{x.v}</p></CardBody></Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Gedetailleerde Analyse (per dimensie)" />
        <CardBody>
          <Table columns={[{key:'dim',label:'Dimensie'},{key:'score',label:'Score'},{key:'clk',label:'Klikken'},{key:'chg',label:'Δ%'}]} data={[{dim:'Pagina: Hybride warmtepomp kosten',score:72,clk:2200,chg:'+5%'},{dim:'Categorie: Isolatie',score:64,clk:3400,chg:'-3%'}]} />
        </CardBody>
      </Card>
    </div>
  )
}

