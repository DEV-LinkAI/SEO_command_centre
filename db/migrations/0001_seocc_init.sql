-- SEOCommandCentre initial schema setup (zonder RAG)
-- Schema: seocc (product data)
-- Vereist: extension pgcrypto (voor gen_random_uuid)

-- 0) Extensions
create extension if not exists pgcrypto;

-- 1) Schema en privileges
create schema if not exists seocc;

grant usage on schema seocc to anon, authenticated;

-- Default privileges voor toekomstige tabellen in seocc
alter default privileges in schema seocc grant select, insert, update, delete on tables to authenticated;

-- 2) Helper functie om company_id van de ingelogde gebruiker te bepalen
create or replace function seocc.current_company_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select company_id
  from public.profiles
  where user_id = auth.uid();
$$;

-- =========================================================
-- seocc: Kern tabellen
-- =========================================================

-- Websites (meerdere websites per company)
create table if not exists seocc.websites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  primary_domain text not null,
  status text not null default 'verbonden', -- verbonden|niet_verbonden|in_setup
  timezone text default 'Europe/Amsterdam',
  locale text default 'nl-NL',
  created_at timestamptz not null default now()
);
create unique index if not exists seocc_websites_unique_company_domain on seocc.websites(company_id, primary_domain);
create index if not exists seocc_websites_company_id_idx on seocc.websites(company_id);
alter table seocc.websites enable row level security;
create policy seocc_websites_tenant_select on seocc.websites for select using (company_id = seocc.current_company_id());
create policy seocc_websites_tenant_insert on seocc.websites for insert with check (company_id = seocc.current_company_id());
create policy seocc_websites_tenant_update on seocc.websites for update using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());
create policy seocc_websites_tenant_delete on seocc.websites for delete using (company_id = seocc.current_company_id());

-- Extra domeinen per website
create table if not exists seocc.website_domains (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  domain text not null,
  type text not null default 'alias', -- primary|alias|sub
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (website_id, domain)
);
alter table seocc.website_domains enable row level security;
create policy seocc_website_domains_tenant_all on seocc.website_domains
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

-- Integratie status per type (wordpress|ga4|gsc|...)
create table if not exists seocc.integrations (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  type text not null,
  status text not null default 'niet_verbonden',
  meta jsonb default '{}',
  created_at timestamptz not null default now(),
  unique (website_id, type)
);
alter table seocc.integrations enable row level security;
create policy seocc_integrations_tenant_all on seocc.integrations
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

-- OAuth tokens (Google)
create table if not exists seocc.oauth_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  website_id uuid not null references seocc.websites(id) on delete cascade,
  provider text not null check (provider in ('google')),
  account_email text,
  scopes text[],
  access_token_enc bytea,
  refresh_token_enc bytea,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists seocc_oauth_company_idx on seocc.oauth_connections(company_id);
create index if not exists seocc_oauth_website_idx on seocc.oauth_connections(website_id);
alter table seocc.oauth_connections enable row level security;
create policy seocc_oauth_tenant_all on seocc.oauth_connections using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

-- Analytics mapping (GA4/GSC)
create table if not exists seocc.analytics_settings (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  ga4_property_id text,
  ga4_property_name text,
  gsc_site_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id)
);
alter table seocc.analytics_settings enable row level security;
create policy seocc_analytics_tenant_all on seocc.analytics_settings
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

-- WordPress settings (App-wachtwoord)
create table if not exists seocc.wordpress_settings (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  wp_url text not null,
  username text,
  app_password_enc bytea,
  status text default 'niet_verbonden',
  last_checked_at timestamptz,
  meta jsonb default '{}',
  created_at timestamptz not null default now(),
  unique (website_id)
);
alter table seocc.wordpress_settings enable row level security;
create policy seocc_wp_tenant_all on seocc.wordpress_settings
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

-- Content
create table if not exists seocc.articles (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  wp_post_id bigint,
  slug text not null,
  title text not null,
  author text,
  status text not null default 'draft',
  published_at timestamptz,
  language text default 'nl',
  canonical_url text,
  meta_title text,
  meta_description text,
  word_count int,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, slug)
);
create index if not exists seocc_articles_website_idx on seocc.articles(website_id);
alter table seocc.articles enable row level security;
create policy seocc_articles_tenant_all on seocc.articles
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.article_categories (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (website_id, slug)
);
alter table seocc.article_categories enable row level security;
create policy seocc_article_categories_tenant_all on seocc.article_categories
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.article_category_map (
  article_id uuid not null references seocc.articles(id) on delete cascade,
  category_id uuid not null references seocc.article_categories(id) on delete cascade,
  primary key (article_id, category_id)
);
alter table seocc.article_category_map enable row level security;
create policy seocc_article_category_map_tenant on seocc.article_category_map
  using (
    exists (
      select 1 from seocc.articles a
      join seocc.article_categories c on c.id = category_id
      join seocc.websites w on w.id = a.website_id and w.company_id = seocc.current_company_id()
      where a.id = article_id and c.website_id = a.website_id
    )
  ) with check (
    exists (
      select 1 from seocc.articles a
      join seocc.article_categories c on c.id = category_id
      join seocc.websites w on w.id = a.website_id and w.company_id = seocc.current_company_id()
      where a.id = article_id and c.website_id = a.website_id
    )
  );

create table if not exists seocc.article_tags (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (website_id, slug)
);
alter table seocc.article_tags enable row level security;
create policy seocc_article_tags_tenant_all on seocc.article_tags
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.article_tag_map (
  article_id uuid not null references seocc.articles(id) on delete cascade,
  tag_id uuid not null references seocc.article_tags(id) on delete cascade,
  primary key (article_id, tag_id)
);
alter table seocc.article_tag_map enable row level security;
create policy seocc_article_tag_map_tenant on seocc.article_tag_map
  using (
    exists (
      select 1 from seocc.articles a
      join seocc.article_tags t on t.id = tag_id
      join seocc.websites w on w.id = a.website_id and w.company_id = seocc.current_company_id()
      where a.id = article_id and t.website_id = a.website_id
    )
  ) with check (
    exists (
      select 1 from seocc.articles a
      join seocc.article_tags t on t.id = tag_id
      join seocc.websites w on w.id = a.website_id and w.company_id = seocc.current_company_id()
      where a.id = article_id and t.website_id = a.website_id
    )
  );

create table if not exists seocc.article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references seocc.articles(id) on delete cascade,
  version int not null,
  title text,
  content jsonb,
  meta jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (article_id, version)
);
alter table seocc.article_versions enable row level security;
create policy seocc_article_versions_tenant on seocc.article_versions
  using (exists (select 1 from seocc.articles a join seocc.websites w on w.id = a.website_id where a.id = article_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.articles a join seocc.websites w on w.id = a.website_id where a.id = article_id and w.company_id = seocc.current_company_id()));

-- Keywords & mapping
create table if not exists seocc.keywords (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  keyword text not null,
  language text default 'nl',
  intent text,
  cluster_id uuid,
  created_at timestamptz not null default now(),
  unique (website_id, keyword)
);
alter table seocc.keywords enable row level security;
create policy seocc_keywords_tenant on seocc.keywords
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.keyword_metrics_monthly (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references seocc.keywords(id) on delete cascade,
  year_month date not null,
  search_volume int,
  cpc numeric,
  competition numeric,
  source text default 'gkp',
  created_at timestamptz not null default now(),
  unique (keyword_id, year_month)
);
alter table seocc.keyword_metrics_monthly enable row level security;
create policy seocc_kwm_tenant on seocc.keyword_metrics_monthly
  using (exists (select 1 from seocc.keywords k join seocc.websites w on w.id = k.website_id where k.id = keyword_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.keywords k join seocc.websites w on w.id = k.website_id where k.id = keyword_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.keyword_article_map (
  keyword_id uuid not null references seocc.keywords(id) on delete cascade,
  article_id uuid not null references seocc.articles(id) on delete cascade,
  relation text default 'related',
  primary key (keyword_id, article_id)
);
alter table seocc.keyword_article_map enable row level security;
create policy seocc_kam_tenant on seocc.keyword_article_map
  using (
    exists (
      select 1 from seocc.keywords k
      join seocc.articles a on a.id = article_id
      join seocc.websites w on w.id = k.website_id and w.company_id = seocc.current_company_id()
      where k.id = keyword_id and a.website_id = k.website_id
    )
  ) with check (
    exists (
      select 1 from seocc.keywords k
      join seocc.articles a on a.id = article_id
      join seocc.websites w on w.id = k.website_id and w.company_id = seocc.current_company_id()
      where k.id = keyword_id and a.website_id = k.website_id
    )
  );

-- Concurrenten en SERP
create table if not exists seocc.competitors (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  domain text not null,
  name text,
  active boolean default true,
  unique (website_id, domain)
);
alter table seocc.competitors enable row level security;
create policy seocc_competitors_tenant on seocc.competitors
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.serp_snapshots (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  keyword_id uuid not null references seocc.keywords(id) on delete cascade,
  captured_at timestamptz not null default now(),
  country text default 'NL',
  device text default 'desktop',
  engine text default 'google',
  results jsonb not null,
  unique (website_id, keyword_id, captured_at)
);
alter table seocc.serp_snapshots enable row level security;
create policy seocc_serp_snapshots_tenant on seocc.serp_snapshots
  using (exists (select 1 from seocc.websites w join seocc.keywords k on k.website_id = w.id where w.company_id = seocc.current_company_id() and seocc.serp_snapshots.website_id = w.id and seocc.serp_snapshots.keyword_id = k.id))
  with check (exists (select 1 from seocc.websites w join seocc.keywords k on k.website_id = w.id where w.company_id = seocc.current_company_id() and seocc.serp_snapshots.website_id = w.id and seocc.serp_snapshots.keyword_id = k.id));

create table if not exists seocc.serp_positions (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references seocc.keywords(id) on delete cascade,
  article_id uuid,
  url text not null,
  position int not null,
  captured_at timestamptz not null,
  unique (keyword_id, url, captured_at)
);
alter table seocc.serp_positions enable row level security;
create policy seocc_serp_positions_tenant on seocc.serp_positions
  using (exists (select 1 from seocc.keywords k join seocc.websites w on w.id = k.website_id where k.id = keyword_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.keywords k join seocc.websites w on w.id = k.website_id where k.id = keyword_id and w.company_id = seocc.current_company_id()));

-- Metrics
create table if not exists seocc.page_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  date date not null,
  url text not null,
  clicks int,
  impressions int,
  ctr numeric,
  avg_position numeric,
  sessions int,
  users int,
  bounce_rate numeric,
  conversions numeric,
  source text default 'merge',
  unique (website_id, date, url)
);
alter table seocc.page_metrics_daily enable row level security;
create policy seocc_page_metrics_tenant on seocc.page_metrics_daily
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.article_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references seocc.articles(id) on delete cascade,
  date date not null,
  clicks int,
  impressions int,
  ctr numeric,
  avg_position numeric,
  sessions int,
  users int,
  conversions numeric,
  unique (article_id, date)
);
alter table seocc.article_metrics_daily enable row level security;
create policy seocc_article_metrics_tenant on seocc.article_metrics_daily
  using (exists (select 1 from seocc.articles a join seocc.websites w on w.id = a.website_id where a.id = article_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.articles a join seocc.websites w on w.id = a.website_id where a.id = article_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.performance_score_config (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  weights jsonb not null default '{"ctr":0.25,"position":0.35,"clicks":0.25,"impressions":0.15}',
  updated_at timestamptz not null default now(),
  unique (website_id)
);
alter table seocc.performance_score_config enable row level security;
create policy seocc_perf_cfg_tenant on seocc.performance_score_config
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.performance_score_daily (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  date date not null,
  score numeric,
  components jsonb,
  notes text,
  unique (website_id, date)
);
alter table seocc.performance_score_daily enable row level security;
create policy seocc_perf_daily_tenant on seocc.performance_score_daily
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

-- Briefings & workflow
create table if not exists seocc.briefings (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  type text not null default 'new', -- new|opt
  keyword text,
  article_id uuid references seocc.articles(id) on delete set null,
  status text not null default 'draft',
  priority int default 0,
  assignee_user_id uuid,
  due_date date,
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table seocc.briefings enable row level security;
create policy seocc_briefings_tenant on seocc.briefings
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.briefing_sections (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references seocc.briefings(id) on delete cascade,
  kind text not null,
  content jsonb,
  "order" int default 0
);
alter table seocc.briefing_sections enable row level security;
create policy seocc_briefing_sections_tenant on seocc.briefing_sections
  using (exists (select 1 from seocc.briefings b join seocc.websites w on w.id = b.website_id where b.id = briefing_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.briefings b join seocc.websites w on w.id = b.website_id where b.id = briefing_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.tasks (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  briefing_id uuid references seocc.briefings(id) on delete set null,
  article_id uuid references seocc.articles(id) on delete set null,
  type text not null,
  status text not null default 'todo',
  assignee_user_id uuid,
  due_date date,
  meta jsonb default '{}',
  created_at timestamptz not null default now()
);
alter table seocc.tasks enable row level security;
create policy seocc_tasks_tenant on seocc.tasks
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.content_calendar (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  article_id uuid references seocc.articles(id) on delete set null,
  month date not null,
  target_publish_date date,
  seasonality_note text,
  status text default 'idea',
  unique (website_id, article_id, month)
);
alter table seocc.content_calendar enable row level security;
create policy seocc_calendar_tenant on seocc.content_calendar
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

-- Internal linking
create table if not exists seocc.internal_link_opportunities (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  source_article_id uuid not null references seocc.articles(id) on delete cascade,
  target_article_id uuid not null references seocc.articles(id) on delete cascade,
  anchor_text text,
  reason text,
  score numeric,
  created_at timestamptz not null default now(),
  unique (source_article_id, target_article_id, anchor_text)
);
alter table seocc.internal_link_opportunities enable row level security;
create policy seocc_link_opps_tenant on seocc.internal_link_opportunities
  using (exists (select 1 from seocc.websites w join seocc.articles s on s.id = source_article_id join seocc.articles t on t.id = target_article_id where w.id = s.website_id and w.company_id = seocc.current_company_id() and t.website_id = s.website_id))
  with check (exists (select 1 from seocc.websites w join seocc.articles s on s.id = source_article_id join seocc.articles t on t.id = target_article_id where w.id = s.website_id and w.company_id = seocc.current_company_id() and t.website_id = s.website_id));

create table if not exists seocc.internal_links_applied (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  source_article_id uuid not null references seocc.articles(id) on delete cascade,
  target_article_id uuid not null references seocc.articles(id) on delete cascade,
  anchor_text text,
  applied_at timestamptz default now(),
  applied_by uuid,
  cms_result jsonb
);
alter table seocc.internal_links_applied enable row level security;
create policy seocc_links_applied_tenant on seocc.internal_links_applied
  using (exists (select 1 from seocc.websites w join seocc.articles s on s.id = source_article_id where w.id = s.website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w join seocc.articles s on s.id = source_article_id where w.id = s.website_id and w.company_id = seocc.current_company_id()));

-- UI & opslag
create table if not exists seocc.saved_views (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  user_id uuid not null,
  context text not null,
  name text not null,
  config jsonb not null
);
alter table seocc.saved_views enable row level security;
create policy seocc_saved_views_tenant on seocc.saved_views
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.files (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  kind text not null,
  path text not null,
  meta jsonb default '{}',
  uploaded_by uuid,
  created_at timestamptz not null default now()
);
alter table seocc.files enable row level security;
create policy seocc_files_tenant on seocc.files
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.feature_flags (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  feature_key text not null,
  enabled boolean not null default false,
  meta jsonb default '{}',
  unique (company_id, feature_key)
);
alter table seocc.feature_flags enable row level security;
create policy seocc_flags_tenant on seocc.feature_flags using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

-- Imports & logging
create table if not exists seocc.import_jobs (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references seocc.websites(id) on delete cascade,
  type text not null,
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  params jsonb default '{}'
);
alter table seocc.import_jobs enable row level security;
create policy seocc_import_jobs_tenant on seocc.import_jobs
  using (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.import_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references seocc.import_jobs(id) on delete cascade,
  chunk_key text,
  status text,
  meta jsonb,
  created_at timestamptz not null default now()
);
alter table seocc.import_runs enable row level security;
create policy seocc_import_runs_tenant on seocc.import_runs
  using (exists (select 1 from seocc.import_jobs j join seocc.websites w on w.id = j.website_id where j.id = job_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.import_jobs j join seocc.websites w on w.id = j.website_id where j.id = job_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  website_id uuid,
  user_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
alter table seocc.audit_log enable row level security;
create policy seocc_audit_tenant on seocc.audit_log using (company_id = seocc.current_company_id());

create table if not exists seocc.webhooks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  target_url text not null,
  secret_enc bytea,
  events text[],
  active boolean default true,
  created_at timestamptz not null default now()
);
alter table seocc.webhooks enable row level security;
create policy seocc_webhooks_tenant on seocc.webhooks using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

-- Kosten & usage
create table if not exists seocc.cost_providers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  currency text not null default 'EUR'
);
alter table seocc.cost_providers enable row level security;
create policy seocc_cost_providers_read on seocc.cost_providers for select using (true);

create table if not exists seocc.pricing_catalog (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references seocc.cost_providers(id) on delete cascade,
  sku text not null,
  unit text not null,
  unit_cost numeric not null,
  unit_price numeric not null,
  meta jsonb default '{}',
  active boolean not null default true,
  unique (provider_id, sku)
);
alter table seocc.pricing_catalog enable row level security;
create policy seocc_pricing_read on seocc.pricing_catalog for select using (true);

create table if not exists seocc.usage_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  website_id uuid references seocc.websites(id) on delete set null,
  provider_id uuid not null references seocc.cost_providers(id),
  sku text not null,
  units numeric not null default 1,
  currency text not null default 'EUR',
  unit_cost numeric not null,
  unit_price numeric not null,
  total_cost numeric not null,
  total_price numeric not null,
  status text not null default 'recorded',
  idempotency_key text,
  meta jsonb,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);
create index if not exists seocc_usage_company_idx on seocc.usage_events(company_id);
create index if not exists seocc_usage_website_idx on seocc.usage_events(website_id);
alter table seocc.usage_events enable row level security;
create policy seocc_usage_tenant on seocc.usage_events using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

create table if not exists seocc.usage_aggregate_daily (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  website_id uuid,
  date date not null,
  provider_id uuid not null references seocc.cost_providers(id),
  sku text not null,
  units numeric not null,
  total_cost numeric not null,
  total_price numeric not null,
  unique (company_id, website_id, date, provider_id, sku)
);
alter table seocc.usage_aggregate_daily enable row level security;
create policy seocc_usage_aggr_tenant on seocc.usage_aggregate_daily using (company_id = seocc.current_company_id());

create table if not exists seocc.wallets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  website_id uuid,
  currency text not null default 'EUR',
  balance_minor_units bigint not null default 0,
  type text not null default 'postpaid',
  status text not null default 'active',
  updated_at timestamptz not null default now(),
  unique (company_id, website_id, currency)
);
alter table seocc.wallets enable row level security;
create policy seocc_wallets_tenant on seocc.wallets using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

create table if not exists seocc.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references seocc.wallets(id) on delete cascade,
  usage_event_id uuid references seocc.usage_events(id) on delete set null,
  amount_minor_units bigint not null,
  type text not null, -- debit|credit|refund|adjustment
  reason text,
  created_at timestamptz not null default now()
);
alter table seocc.wallet_transactions enable row level security;
create policy seocc_wallet_tx_tenant on seocc.wallet_transactions
  using (exists (select 1 from seocc.wallets w where w.id = wallet_id and w.company_id = seocc.current_company_id()))
  with check (exists (select 1 from seocc.wallets w where w.id = wallet_id and w.company_id = seocc.current_company_id()));

create table if not exists seocc.quotas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  website_id uuid,
  period text not null default 'monthly',
  sku text not null,
  unit_limit numeric not null,
  resets_at timestamptz,
  unique (company_id, website_id, period, sku)
);
alter table seocc.quotas enable row level security;
create policy seocc_quotas_tenant on seocc.quotas using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

-- Vendor credentials (optioneel, klant specifieke API keys)
create table if not exists seocc.vendor_credentials (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  provider text not null,
  secret_enc bytea,
  meta jsonb,
  unique (company_id, provider)
);
alter table seocc.vendor_credentials enable row level security;
create policy seocc_vendor_creds_tenant on seocc.vendor_credentials using (company_id = seocc.current_company_id()) with check (company_id = seocc.current_company_id());

-- AI modelbeheer per tool (global/company/website scope)
create table if not exists seocc.tool_models (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'global', -- global|company|website
  company_id uuid,
  website_id uuid references seocc.websites(id) on delete cascade,
  tool_key text not null, -- bijv. briefing_optimize, kw_research, etc.
  model_name text not null, -- bijv. gpt-5, gemini-2.0-flash, claude-3.7
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
-- Unieke regels per scope via partial unique indexes
create unique index if not exists seocc_tool_models_global_uq on seocc.tool_models(tool_key) where scope = 'global';
create unique index if not exists seocc_tool_models_company_uq on seocc.tool_models(company_id, tool_key) where scope = 'company';
create unique index if not exists seocc_tool_models_website_uq on seocc.tool_models(website_id, tool_key) where scope = 'website';
alter table seocc.tool_models enable row level security;
-- RLS: select toegestaan voor globale regels én bedrijfseigen regels; mutaties alleen voor company- en website-scope van eigen company
create policy seocc_tool_models_select on seocc.tool_models for select using (
  scope = 'global' or
  (scope = 'company' and company_id = seocc.current_company_id()) or
  (scope = 'website' and exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
);
create policy seocc_tool_models_insert on seocc.tool_models for insert with check (
  (scope = 'company' and company_id = seocc.current_company_id()) or
  (scope = 'website' and exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
);
create policy seocc_tool_models_update on seocc.tool_models for update using (
  (scope = 'company' and company_id = seocc.current_company_id()) or
  (scope = 'website' and exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
) with check (
  (scope = 'company' and company_id = seocc.current_company_id()) or
  (scope = 'website' and exists (select 1 from seocc.websites w where w.id = website_id and w.company_id = seocc.current_company_id()))
);

-- Einde

