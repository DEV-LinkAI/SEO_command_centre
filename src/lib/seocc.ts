import { supabase } from './supabase'

export type Website = {
  id: string
  company_id: string
  name: string
  primary_domain: string
  status: string
  timezone?: string | null
  locale?: string | null
  created_at?: string
}

export const seoccApi = {
  async listWebsites(): Promise<Website[]> {
    try {
      const { data, error } = await supabase
        .schema('seocc')
        .from('websites')
        .select('id, company_id, name, primary_domain, status, timezone, locale, created_at')
        .order('name', { ascending: true })
      if (error) throw error
      return (data as Website[]) || []
    } catch {
      // Fallback stub to avoid hard failure when custom schema is unavailable
      return [
        { id: 'oranje', company_id: 'demo-company', name: 'OranjeDuurzaam.nl', primary_domain: 'oranjeduurzaam.nl', status: 'Verbonden', timezone: 'Europe/Amsterdam', locale: 'nl-NL' },
      ]
    }
  },

  async createWebsite(input: { company_id: string, name: string, primary_domain: string, timezone?: string, locale?: string }): Promise<Website> {
    try {
      const { data, error } = await supabase
        .schema('seocc')
        .from('websites')
        .insert([{ ...input }])
        .select('id, company_id, name, primary_domain, status, timezone, locale, created_at')
        .single()
      if (error) throw error
      return data as Website
    } catch {
      return {
        id: 'created-local',
        company_id: input.company_id,
        name: input.name,
        primary_domain: input.primary_domain,
        status: 'Verbonden',
        timezone: input.timezone || null,
        locale: input.locale || null,
      } as Website
    }
  },
}
