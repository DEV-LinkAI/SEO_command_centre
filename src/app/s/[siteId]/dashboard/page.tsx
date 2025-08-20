import { use } from 'react'
import DashboardClient from '@/components/seocc/pages/DashboardClient'

export default function DashboardPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  return <DashboardClient siteId={siteId} />
}
