# 📋 New Product Checklist

Gebruik deze checklist bij het maken van een nieuw LinkAI product met deze template.

## 🚀 Setup (5-10 minuten)

### Repository Setup
- [ ] **Template gebruikt** via "Use this template" of git clone
- [ ] **Repository naam** aangepast naar product naam
- [ ] **Lokaal gecloned** en `cd product-naam`

### Dependencies & Environment  
- [ ] **Dependencies geïnstalleerd**: `npm install`
- [ ] **Environment file aangemaakt**: `cp env.example .env.local`
- [ ] **Supabase URL ingevuld** in `.env.local`
- [ ] **Supabase ANON KEY ingevuld** in `.env.local`
- [ ] **App URL ingesteld** (productie URL of localhost voor dev)
- [ ] **Product naam ingesteld** in `.env.local`

### Auth Configuratie
- [ ] **auth-config.ts geopend**: `src/lib/auth-config.ts`
- [ ] **productName aangepast** naar je product naam
- [ ] **appBaseUrl aangepast** naar je productie URL
- [ ] **Routes gecheckt** (standaard is meestal goed)

### Database Setup
- [ ] **Supabase dashboard geopend**
- [ ] **Profiles tabel bestaat** (anders SQL uit README.md uitvoeren)
- [ ] **Companies tabel toegankelijk** (voor company names)
- [ ] **RLS policies actief** op profiles tabel

### Test & Verify
- [ ] **Dev server gestart**: `npm run dev`
- [ ] **Login flow getest** (naar localhost:3000 → auto redirect naar login)
- [ ] **SSO callback werkt** (terug van app.linkai.nl)
- [ ] **User profile geladen** (check console logs)
- [ ] **Company naam zichtbaar** in user dropdown
- [ ] **Geen console errors** in browser

## 🎨 Customization (Optioneel)

### Branding
- [ ] **Kleuren aangepast** in `tailwind.config.js` en `globals.css`
- [ ] **Logo vervangen** in sidebar component
- [ ] **Favicon vervangen** in `public/`
- [ ] **Titel aangepast** in `layout.tsx` metadata

### Content
- [ ] **Homepage content** aangepast (huidige toont sidebar/nav)
- [ ] **Sidebar menu items** aangepast naar je product features
- [ ] **Banner tekst** aangepast of weggehaald
- [ ] **Search placeholder** aangepast naar je gebruik

## 🚀 Deployment

### Productie Environment
- [ ] **Hosting platform gekozen** (Vercel aanbevolen)
- [ ] **Repository connected** aan hosting platform
- [ ] **Environment variables ingesteld** in hosting dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_PRODUCT_NAME`

### DNS & SSL
- [ ] **Custom domain gekoppeld** (als niet subdomain)
- [ ] **SSL certificaat actief**
- [ ] **DNS A/CNAME records** correct ingesteld

### Final Testing
- [ ] **Productie URL werkt**
- [ ] **Login flow werkt** op productie
- [ ] **SSO callback URL correct** in LinkAI systeem
- [ ] **User kan inloggen** en data wordt geladen
- [ ] **Performance check** (PageSpeed/Lighthouse)

## ✅ Go Live

### Documentation
- [ ] **README.md aangepast** voor je specifieke product
- [ ] **API documentatie** toegevoegd (als van toepassing)
- [ ] **User handleiding** geschreven (als nodig)

### Monitoring & Analytics
- [ ] **Error tracking** ingesteld (Sentry/LogRocket)
- [ ] **Analytics** toegevoegd (Google Analytics/Mixpanel)
- [ ] **Performance monitoring** ingesteld

### Team Access
- [ ] **Repository access** gegeven aan team
- [ ] **Deployment access** geconfigureerd
- [ ] **Environment variables** gedocumenteerd voor team

---

## 🎯 Tijd Indicatie

- **Basis Setup**: 5-10 minuten
- **Customization**: 30-60 minuten  
- **Deployment**: 15-30 minuten
- **Total**: 1-2 uur (vs 3-4 uur zonder template)

## 🆘 Als je vastloopt

### Debug Checklist
- [ ] Browser console errors bekeken
- [ ] Network tab gecheckt voor failed requests
- [ ] Supabase logs bekeken  
- [ ] Environment variables dubbel gecheckt
- [ ] AUTH_SETUP.md doorgelezen

### Support
- **Email**: dev@linkai.nl
- **Slack**: #development-support
- **Template Issues**: GitHub Issues op template repo

---

**🎉 Succes met je nieuwe LinkAI product!** 