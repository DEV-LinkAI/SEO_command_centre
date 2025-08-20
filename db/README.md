# SEOCommandCentre Database (schema `seocc`)

Dit document beschrijft het volledige datamodel, RLS‑strategie en voorbeeldqueries voor SEOCommandCentre. Alle productdata staat in het schema `seocc` (auth/profiles blijven in `public`).

## Overzicht
- Schema: `seocc`
- RLS helper: `seocc.current_company_id()` haalt `company_id` op via `public.profiles.user_id = auth.uid()`
- Multi‑tenant: elke tabel bevat `company_id` of is via `website_id → seocc.websites.company_id` te herleiden
- Migrations: zie `app/db/migrations/0001_seocc_init.sql`

## RLS‑patroon
- Directe `company_id` tabellen: policy `using (company_id = seocc.current_company_id())`
- Via `website_id`: policy `using (exists (select 1 from seocc.websites w where w.id = <table>.website_id and w.company_id = seocc.current_company_id()))`
- Insert/Update policies spiegelen het `using`‑statement met `with check`

## Tabellen per domein

### Websites & Integraties
- `seocc.websites` (PK `id`)
  - company_id, name, primary_domain, status, timezone, locale
  - Uniek: (company_id, primary_domain)
- `seocc.website_domains` (FK website_id)
  - Extra domeinen/subdomeinen; Uniek: (website_id, domain)
- `seocc.integrations` (FK website_id)
  - type (`wordpress|ga4|gsc|…`), status, meta; Uniek: (website_id, type)
- `seocc.analytics_settings` (FK website_id)
  - ga4_property_id, ga4_property_name, gsc_site_url; Uniek: (website_id)
- `seocc.wordpress_settings` (FK website_id)
  - wp_url, username, app_password_enc, status, last_checked_at, meta; Uniek: (website_id)
- `seocc.oauth_connections` (FK website_id)
  - provider='google', account_email, scopes, access_token_enc, refresh_token_enc, expires_at

### Content & CMS
- `seocc.articles` (FK website_id)
  - wp_post_id, slug, title, status, published_at, meta_title/description
  - Uniek: (website_id, slug)
- `seocc.article_categories`, `seocc.article_category_map`
- `seocc.article_tags`, `seocc.article_tag_map`
- `seocc.article_versions` (geschiedenis per artikel)

### Keywords & SERP
- `seocc.keywords` (FK website_id) — Uniek: (website_id, keyword)
- `seocc.keyword_metrics_monthly` (FK keyword_id, Uniek per maand)
- `seocc.keyword_article_map` (FK keyword_id, article_id)
- `seocc.competitors` (FK website_id, Uniek: (website_id, domain))
- `seocc.serp_snapshots` (FK website_id, keyword_id) — rauwe SERP data
- `seocc.serp_positions` (FK keyword_id) — genormaliseerde posities (tijdserie)

### Metrics & Score
- `seocc.page_metrics_daily` (FK website_id, Uniek: (website_id, date, url))
- `seocc.article_metrics_daily` (FK article_id, Uniek: (article_id, date))
- `seocc.performance_score_config` (FK website_id, Uniek: (website_id))
- `seocc.performance_score_daily` (FK website_id, Uniek: (website_id, date))

### Briefings & Workflow
- `seocc.briefings` (FK website_id, optioneel article_id)
- `seocc.briefing_sections` (FK briefing_id)
- `seocc.tasks` (FK website_id, optioneel briefing_id/article_id)
- `seocc.content_calendar` (FK website_id, Uniek: (website_id, article_id, month))

### Internal Linking
- `seocc.internal_link_opportunities` (FK website_id, src/target article)
- `seocc.internal_links_applied` (FK website_id, src/target article)

### UI, Opslag, Logging
- `seocc.saved_views` (FK website_id, user_id) — opgeslagen filter/kolom presets
- `seocc.files` (FK website_id) — verwijzingen naar Supabase Storage
- `seocc.feature_flags` (company scope) — Uniek: (company_id, feature_key)
- `seocc.import_jobs`, `seocc.import_runs` — ETL/import status
- `seocc.audit_log` (company scope), `seocc.webhooks` (company scope)

### Kosten, Usage, Quotas
- `seocc.cost_providers` — bijv. dataforseo/openai
- `seocc.pricing_catalog` (FK provider_id) — sku, unit, cost, price
- `seocc.usage_events` (company scope, optioneel website_id)
  - idempotency_key → voorkomt dubbele billing
- `seocc.usage_aggregate_daily` — geaggregeerde usage voor rapportage
- `seocc.wallets`, `seocc.wallet_transactions` — saldi en mutaties
- `seocc.quotas` — limieten per periode/sku
- `seocc.vendor_credentials` — klant‑specifieke vendor secrets (server‑side only)

### AI Tool → Modelbeheer
- `seocc.tool_models`
  - scope: `global|company|website`
  - keys: tool_key (bijv. `briefing_optimize`, `kw_research`), model_name (bijv. `gpt-5`, `gemini-2.0-flash`)
  - Partial unique indexes zorgen voor uniekheid per scope
  - RLS: select laat global + eigen company/website regels toe; mutaties alleen op eigen scope

## Relaties (schets)
- companies (public) 1—N websites (seocc)
- websites 1—N articles/keywords/… (alle kern tabellen)
- keywords N—N articles (keyword_article_map)
- articles N—N categories/tags (map tabellen)
- websites 1—1 analytics_settings, wordpress_settings
- websites 1—N integrations, oauth_connections
- company 1—N wallets, feature_flags, webhooks

## Voorbeeld: actief AI‑model per tool resolven
Prioriteit: website > company > global.

```sql
-- :website_id, :company_id en :tool_key zijn parameters
with candidates as (
  select 'website' as lvl, tm.model_name
  from seocc.tool_models tm
  where tm.scope = 'website' and tm.website_id = :website_id and tm.tool_key = :tool_key and tm.active
  union all
  select 'company' as lvl, tm.model_name
  from seocc.tool_models tm
  where tm.scope = 'company' and tm.company_id = :company_id and tm.tool_key = :tool_key and tm.active
  union all
  select 'global' as lvl, tm.model_name
  from seocc.tool_models tm
  where tm.scope = 'global' and tm.tool_key = :tool_key and tm.active
)
select model_name
from candidates
order by case lvl when 'website' then 1 when 'company' then 2 else 3 end
limit 1;
```

## Voorbeeld: websites ophalen voor ingelogde gebruiker
RLS filtert automatisch op company.

```sql
select id, name, primary_domain, status
from seocc.websites
order by name;
```

## Voorbeeld: GA4/GSC instellingen schrijven/lezen

```sql
-- Upsert analytics settings
insert into seocc.analytics_settings (website_id, ga4_property_id, ga4_property_name, gsc_site_url)
values (:website_id, :ga4_id, :ga4_name, :gsc_url)
on conflict (website_id)
  do update set ga4_property_id = excluded.ga4_property_id,
                ga4_property_name = excluded.ga4_property_name,
                gsc_site_url = excluded.gsc_site_url,
                updated_at = now();

-- Ophalen
select * from seocc.analytics_settings where website_id = :website_id;
```

## Voorbeeld: WordPress settings updaten

```sql
update seocc.wordpress_settings
set wp_url = :url,
    username = :user,
    app_password_enc = :ciphertext, -- versleuteld in app/server
    status = 'verbonden',
    last_checked_at = now()
where website_id = :website_id;
```

## Voorbeeld: usage event loggen (idempotent) + wallet debit
Voer dit server‑side uit binnen een transactie.

```sql
-- 1) Maak usage_event (idempotent)
insert into seocc.usage_events (
  company_id, website_id, provider_id, sku,
  units, currency, unit_cost, unit_price,
  total_cost, total_price, idempotency_key
) values (
  :company_id, :website_id, :provider_id, 'keyword_volume_lookup',
  1, 'EUR', 0.02, 0.03, 0.02, 0.03, :idempotency_key
)
on conflict (idempotency_key) do nothing
returning id;

-- 2) Debiteer wallet (alleen als nieuw event is gemaakt)
with w as (
  select id from seocc.wallets
  where company_id = :company_id
    and (website_id is null or website_id = :website_id)
    and currency = 'EUR'
  limit 1
)
insert into seocc.wallet_transactions (wallet_id, usage_event_id, amount_minor_units, type, reason)
select w.id, (select id from seocc.usage_events where idempotency_key = :idempotency_key),
       cast(-0.03 * 100 as bigint), 'debit', 'DataForSEO lookup'
from w
where exists (select 1 from seocc.usage_events where idempotency_key = :idempotency_key);
```

## Voorbeeld: SERP snapshot opslaan

```sql
insert into seocc.serp_snapshots (website_id, keyword_id, results)
values (:website_id, :keyword_id, :results_jsonb);
```

## Seeds (optioneel)

```sql
-- Providers
insert into seocc.cost_providers (key, name) values
  ('dataforseo','DataForSEO'),
  ('openai','OpenAI')
  on conflict (key) do nothing;

-- Pricing
insert into seocc.pricing_catalog (provider_id, sku, unit, unit_cost, unit_price, active)
select id, 'keyword_volume_lookup', 'request', 0.02, 0.03, true from seocc.cost_providers where key='dataforseo'
union all
select id, 'briefing_generate', 'item', 3.00, 4.00, true from seocc.cost_providers where key='openai'
  on conflict do nothing;

-- Tool‑models (global defaults)
insert into seocc.tool_models (scope, tool_key, model_name, active)
values
  ('global','briefing_optimize','gemini-2.0-flash', true),
  ('global','kw_research','gpt-5', true)
  on conflict do nothing;
```

## Beveiliging & best practices
- Tokens (OAuth, WP app‑wachtwoord) versleutelen op app/server‑laag; nooit in logs
- Gebruik service key alleen in server/edge‑code voor imports of vendor‑proxies
- Idempotency keys voor betaalde acties (usage)
- Quotas/budget check vóór dure calls (briefing, SERP/keyword lookups)

## Migraties uitvoeren
- Supabase SQL Editor: plak de inhoud van `app/db/migrations/0001_seocc_init.sql` en voer uit
- Of gebruik Supabase CLI/DB migratie pipeline en deploy als migration

---
Vragen of uitbreidingen (bijv. invoices/facturatie, extra indices, meertalige artikeltabellen)? Laat het weten, dan werk ik dit README en de migratie verder bij.

