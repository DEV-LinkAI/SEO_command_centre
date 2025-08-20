import { use } from 'react'
import SettingsClient from '@/components/seocc/pages/SettingsClient'

export default function InstellingenSitePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  return <SettingsClient siteId={siteId} />
}

