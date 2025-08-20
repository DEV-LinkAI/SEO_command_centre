import { redirect } from 'next/navigation'
import { use } from 'react'

export default function SiteIndex({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  redirect(`/s/${siteId}/dashboard`)
}
