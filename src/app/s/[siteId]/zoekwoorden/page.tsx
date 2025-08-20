import { use } from 'react'
import KeywordsClient from '@/components/seocc/pages/KeywordsClient'

export default function ZoekwoordenPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  return <KeywordsClient siteId={siteId} />
}

