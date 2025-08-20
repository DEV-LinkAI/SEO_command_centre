import { use } from 'react'
import BriefingsClient from '@/components/seocc/pages/BriefingsClient'

export default function BriefingsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  return <BriefingsClient siteId={siteId} />
}
