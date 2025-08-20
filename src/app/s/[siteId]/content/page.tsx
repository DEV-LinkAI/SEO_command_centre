import { use } from 'react'
import ContentClient from '@/components/seocc/pages/ContentClient'

export default function ContentPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  return <ContentClient siteId={siteId} />
}
