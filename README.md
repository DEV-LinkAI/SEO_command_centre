# 🚀 LinkAI Product Template

Een complete Next.js template voor LinkAI producten met ingebouwde authenticatie, FlutterFlow compatibiliteit, en moderne UI componenten.

## ✨ Features

- 🔐 **Complete SSO Authenticatie** - Geïntegreerd met LinkAI hoofdplatform
- 📱 **FlutterFlow Compatible** - URL-based token transfer (geen cookies)
- 🎨 **Modern UI** - Tailwind CSS met LinkAI branding
- 🏢 **Multi-tenant** - Company-aware met automatische profile sync
- 🔒 **Protected Routes** - AuthGuard voor beveiligde paginas
- 🌙 **Dark Mode Ready** - Volledige theming ondersteuning
- 📊 **TypeScript** - Volledig getypeerd voor betere DX

## 🏗️ Template Structuur

```
src/
├── app/
│   ├── auth/                 # Auth paginas (login, callback, unauthorized)
│   ├── layout.tsx           # Root layout met AuthProvider
│   └── layout-content.tsx   # Auth-aware layout logic
├── components/
│   ├── auth/                # Auth componenten (Context, Guard, UserProfile)
│   ├── layout/              # Layout componenten (Sidebar, NavSearch, Banner)
│   └── ui/                  # Herbruikbare UI componenten
├── lib/
│   ├── auth-config.ts       # 🎯 Centrale auth configuratie
│   ├── api.ts               # API helpers met auth
│   └── supabase.ts          # Supabase client
└── hooks/                   # Custom React hooks
```

## 🚀 Quick Start

### 1. Template Gebruiken

**Optie A: GitHub Template (Aanbevolen)**
1. Klik "Use this template" → "Create a new repository"
2. Clone je nieuwe repository
3. Volg setup stappen hieronder

**Optie B: Direct Clonen**
```bash
git clone https://github.com/linkai/product-template mijn-product
cd mijn-product
```

### 2. Dependencies Installeren

```bash
npm install
```

### 3. Environment Configureren

```bash
cp env.example .env.local
```

Vul de volgende variabelen in je `.env.local`:

```env
# Supabase (krijg je van het Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Product Configuratie
NEXT_PUBLIC_APP_URL=https://jouw-product.linkai.nl
NEXT_PUBLIC_PRODUCT_NAME=Jouw Product Naam
```

### 4. Auth Configuratie Aanpassen

Bewerk `src/lib/auth-config.ts`:

```typescript
export const authConfig = {
  // Deze blijven hetzelfde
  ssoBaseUrl: 'https://app.linkai.nl/login',
  
  // PAS DEZE AAN voor jouw product:
  appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Jouw Product',
  
  // Routes (optioneel aan te passen)
  routes: {
    callback: '/auth/sso-callback',
    login: '/auth/login', 
    dashboard: '/',
    unauthorized: '/auth/unauthorized'
  }
};
```

### 5. Supabase Database Setup

Voer deze SQL uit in je Supabase dashboard als de `profiles` tabel nog niet bestaat:

```sql
CREATE TABLE profiles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_id UUID,
  profile_role TEXT DEFAULT 'user',
  company_name TEXT,
  phone_number TEXT,
  profile_role_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
```

### 6. Starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - je wordt automatisch doorgestuurd naar login!

## 🔐 Hoe Authenticatie Werkt

### Login Flow
```
Gebruiker → /auth/login → app.linkai.nl → /auth/sso-callback → Dashboard
```

### Voor FlutterFlow Apps
Dit systeem is speciaal ontworpen voor FlutterFlow compatibiliteit:

- ✅ **URL-based tokens** (geen HTTP cookies)
- ✅ **sessionStorage** voor token opslag
- ✅ **Automatische Authorization headers**

FlutterFlow implementatie:
1. Parse tokens uit callback URL
2. Sla op in local storage  
3. Gebruik in API Authorization headers

## 🛡️ Auth Features

### Protected Routes
```typescript
// Automatische bescherming
<AuthGuard>
  <DashboardContent />
</AuthGuard>

// Of via hook
function MyComponent() {
  const { user } = useRequireAuth();
  return <div>Alleen voor ingelogde gebruikers</div>;
}
```

### API Calls met Auth
```typescript
// Automatische auth headers
const data = await apiRequest.get('/api/users');

// Custom calls
const result = await apiRequest.post('/api/create', { 
  name: 'Test' 
});
```

### User Data Toegang
```typescript
function MyComponent() {
  const { user, userProfile, loading } = useAuth();
  
  return (
    <div>
      <h1>Welkom {userProfile?.name}</h1>
      <p>Company: {userProfile?.company_name}</p>
    </div>
  );
}
```

## 🎨 Customization

### Kleuren & Branding
De template gebruikt LinkAI branding als standaard. Aanpassen in:

```typescript
// tailwind.config.js
primary: {
  DEFAULT: "#jouw-kleur",
  // ... meer tinten
}

// src/app/globals.css  
:root {
  --primary: #jouw-kleur;
  --accent: #jouw-accent;
}
```

### Logo's & Afbeeldingen
- Logo's in `src/components/layout/`
- Favicon in `public/`

### Layout Aanpassingen
- Sidebar: `src/components/layout/sidebar.tsx`
- Topbar: `src/components/layout/nav-search.tsx`
- Banner: `src/components/layout/banner.tsx`

## 🚀 Deployment

### Vercel (Aanbevolen)
```bash
npm install -g vercel
vercel
```

### Environment Variables in Productie
Zorg dat je deze instelt in je deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PRODUCT_NAME`

## 📋 New Product Checklist

Kopieer deze checklist voor elke nieuwe app:

- [ ] Repository aangemaakt via template
- [ ] `.env.local` geconfigureerd met Supabase credentials
- [ ] `NEXT_PUBLIC_APP_URL` ingesteld op productie URL
- [ ] `NEXT_PUBLIC_PRODUCT_NAME` aangepast
- [ ] `auth-config.ts` productName en appBaseUrl aangepast
- [ ] Logo/kleuren aangepast (optioneel)
- [ ] Supabase database `profiles` tabel bestaat
- [ ] Login flow getest
- [ ] Deployment naar Vercel/hosting
- [ ] Productie environment variables ingesteld

## 🐛 Troubleshooting

### "Tokens niet gevonden"
- Check of callback URL correct is: `https://jouw-app.nl/auth/sso-callback`
- Verify `NEXT_PUBLIC_APP_URL` in environment

### "Profile niet geladen"
- Check Supabase connectie en credentials
- Verify `profiles` tabel bestaat met juiste structure
- Check browser console voor database errors

### "Session expired" errors
- Check of Supabase URL/keys correct zijn
- Verify RLS policies op `profiles` tabel

## 📚 Documentatie

- **Volledige Auth Setup**: Zie `AUTH_SETUP.md`
- **Component Docs**: Inline documentatie in components
- **API Reference**: Zie `src/lib/api.ts`

## 🤝 Support

Voor vragen over deze template:
- **Email**: dev@linkai.nl
- **Slack**: #development-support

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Supabase + Custom SSO
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel Ready

---

**Happy Building! 🚀**

*Deze template bespaart je 2-3 uur setup tijd per nieuw LinkAI product.*
