# LinkAI Auth Template Setup Guide

Dit template biedt een complete authenticatie oplossing voor LinkAI producten met FlutterFlow compatibiliteit.

## 🚀 Quick Start

### 1. Environment Variabelen

Kopieer `env.example` naar `.env.local` en vul in:

```bash
cp env.example .env.local
```

Vul de volgende variabelen in:
- `NEXT_PUBLIC_SUPABASE_URL` - Je Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Je Supabase anonymous key  
- `NEXT_PUBLIC_APP_URL` - De URL waar je product draait
- `NEXT_PUBLIC_PRODUCT_NAME` - De naam van je product

### 2. Supabase Database Setup

Zorg dat je Supabase database een `profiles` tabel heeft:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  company_id UUID,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
```

### 3. Auth Configuratie Aanpassen

Pas `src/lib/auth-config.ts` aan voor jouw product:

```typescript
export const authConfig = {
  ssoBaseUrl: 'https://app.linkai.nl/login',
  appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Jouw Product',
  // ... rest blijft hetzelfde
};
```

## 📁 Bestanden Overzicht

### Core Auth Files
- `src/lib/auth-config.ts` - Centrale configuratie
- `src/lib/api.ts` - API helpers met auth
- `src/components/auth/AuthContext.tsx` - React context voor auth state
- `src/components/auth/AuthGuard.tsx` - Component om paginas te beschermen
- `src/components/auth/UserProfile.tsx` - User dropdown component

### Auth Pages
- `src/app/auth/login/page.tsx` - Login pagina
- `src/app/auth/sso-callback/page.tsx` - SSO callback handler
- `src/app/auth/unauthorized/page.tsx` - Unauthorized pagina

### Layout Integration
- `src/app/layout.tsx` - Root layout met AuthProvider
- `src/app/layout-content.tsx` - Auth-aware layout logic

## 🔒 Hoe het Auth Systeem Werkt

### 1. Login Flow
```
Gebruiker → Login Pagina → LinkAI Platform → SSO Callback → App Dashboard
```

### 2. Token Management
- Tokens worden doorgegeven via URL parameters
- Opgeslagen in sessionStorage (FlutterFlow compatible)
- Automatisch gebruikt in API calls

### 3. Sessie Management
- AuthContext beheert user state
- Automatische profile sync met Supabase
- Logout cleared alle local data

## 🛡️ Beveiliging Features

### Protected Routes
```typescript
// Automatische bescherming via AuthGuard
<AuthGuard>
  <DashboardContent />
</AuthGuard>

// Of via hook
function ProtectedComponent() {
  const { user } = useRequireAuth();
  // Component wordt alleen getoond als user is ingelogd
}
```

### API Calls
```typescript
// Automatische auth headers
const data = await apiRequest.get('/api/endpoint');

// Custom API call
const result = await apiRequest.post('/api/create', { data });
```

## 🎯 Implementatie per Product

### Voor een nieuw product:

1. **Clone template**: Kopieer deze template
2. **Update configuratie**: Pas `auth-config.ts` aan
3. **Set environment vars**: Configureer `.env.local`
4. **Customize branding**: Update logo's en kleuren
5. **Add product features**: Bouw je product specifieke features

### Voorbeeld voor "PDF to WP":
```typescript
// In auth-config.ts
export const authConfig = {
  ssoBaseUrl: 'https://app.linkai.nl/login',
  appBaseUrl: 'https://pdf-to-wp.linkai.nl',
  productName: 'PDF to WordPress',
  // ...
};
```

## 🔄 FlutterFlow Compatibiliteit

Dit systeem is speciaal ontworpen voor FlutterFlow apps:

### Waarom URL-based tokens?
- FlutterFlow heeft geen HTTP cookies support
- sessionStorage werkt wel in WebView/Flutter
- URL parameters zijn universeel ondersteund

### Voor FlutterFlow development:
1. Gebruik dezelfde callback URL structuur
2. Parse tokens uit URL parameters
3. Sla op in local storage
4. Gebruik in API Authorization headers

## 🐛 Troubleshooting

### Tokens niet gevonden
- Check of callback URL correct is geconfigureerd
- Kijk in browser console voor errors
- Verify SSO base URL klopt

### Profile niet geladen  
- Check Supabase connectie
- Verify `profiles` tabel bestaat
- Check RLS policies

### Unauthorized errors
- Check of user bestaat in database
- Verify company_id is correct
- Check API endpoints zijn bereikbaar

## 📞 Support

Voor vragen over dit template:
- Email: dev@linkai.nl
- Slack: #development-support

## 🔧 Development Tips

### Lokale development
```bash
# Start dev server
npm run dev

# Test login flow op localhost:3000
# Tokens komen terug naar localhost:3000/auth/sso-callback
```

### Debug mode
```typescript
// In auth-config.ts - enable extra logging
console.log(`${authConfig.productName}: Auth event:`, event);
```

### Testing auth flow
1. Ga naar `/auth/login`
2. Klik "Inloggen met LinkAI"
3. Log in op app.linkai.nl
4. Wordt teruggestuurd naar je app
5. Check console voor debug info 