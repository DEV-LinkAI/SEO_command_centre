import { use } from 'react'
import PerformanceClient from '@/components/seocc/pages/PerformanceClient'

export default function PrestatiePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  return <PerformanceClient siteId={siteId} />
}
