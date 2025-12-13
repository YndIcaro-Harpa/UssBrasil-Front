# 🔐 Referência de Variáveis de Ambiente - USS Brasil

Este documento lista todas as variáveis de ambiente necessárias para o deploy.

---

## 📊 Resumo Rápido

| Plataforma | Variáveis Obrigatórias | Variáveis Opcionais |
|------------|----------------------|---------------------|
| **Cloudflare** | 5 | 6 |
| **Render** | 6 | 3 |
| **Supabase** | 2 (connection strings) | - |

---

## ☁️ Cloudflare Pages (Frontend)

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `https://ussbrasil-api.onrender.com` |
| `NEXT_PUBLIC_BACKEND_URL` | URL do backend | `https://ussbrasil-api.onrender.com` |
| `NEXTAUTH_URL` | URL do frontend | `https://ussbrasil.pages.dev` |
| `NEXTAUTH_SECRET` | Secret do NextAuth (32+ chars) | `openssl rand -base64 32` |
| `NODE_ENV` | Ambiente | `production` |

### Opcionais

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name do Cloudinary | `dnmazlvs6` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset | `uss-brasil` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe | `pk_live_...` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | - |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | `G-XXXXXXXXXX` |

### Comando para adicionar secrets

```bash
# Via Wrangler CLI
wrangler pages secret put NEXTAUTH_SECRET --project-name ussbrasil
wrangler pages secret put STRIPE_SECRET_KEY --project-name ussbrasil
```

---

## 🚀 Render (Backend)

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Supabase pooler URL | `postgresql://postgres.[REF]:[PASS]@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct URL | `postgresql://postgres.[REF]:[PASS]@...pooler.supabase.com:5432/postgres` |
| `PORT` | Porta do servidor | `3001` |
| `NODE_ENV` | Ambiente | `production` |
| `JWT_SECRET` | Secret do JWT | `openssl rand -base64 32` |
| `FRONTEND_URL` | URL do frontend para CORS | `https://ussbrasil.pages.dev` |

### Opcionais

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `JWT_EXPIRATION` | Expiração do token | `7d` |
| `ENABLE_SWAGGER` | Habilitar Swagger em prod | `true` ou `false` |
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` |
| `SMTP_USER` | Usuário SMTP | `email@gmail.com` |
| `SMTP_PASS` | Senha SMTP | `app-password` |

---

## 🗄️ Supabase (Database)

### Connection Strings

Obtenha em: **Supabase Dashboard → Settings → Database**

#### 1. Connection Pooler (para aplicação)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Usar em: `DATABASE_URL` no Render

#### 2. Direct Connection (para migrações)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

Usar em: `DIRECT_URL` no Render

⚠️ **Importante**:
- Substitua `[PROJECT_REF]` pelo ID do seu projeto
- Substitua `[PASSWORD]` pela senha do banco
- A região pode variar (ex: `aws-0-us-east-1`)

---

## 🔑 Gerando Secrets Seguros

### NEXTAUTH_SECRET
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) )
```

### JWT_SECRET
```bash
# Usar o mesmo método acima
openssl rand -base64 32
```

---

## 📋 Checklist de Configuração

### Cloudflare Pages
- [ ] `NEXT_PUBLIC_API_URL` configurado
- [ ] `NEXT_PUBLIC_BACKEND_URL` configurado
- [ ] `NEXTAUTH_URL` configurado
- [ ] `NEXTAUTH_SECRET` adicionado como secret
- [ ] (Opcional) Cloudinary configurado
- [ ] (Opcional) Stripe configurado

### Render
- [ ] `DATABASE_URL` do Supabase configurado
- [ ] `DIRECT_URL` do Supabase configurado
- [ ] `JWT_SECRET` configurado
- [ ] `FRONTEND_URL` configurado
- [ ] `PORT` configurado como `3001`
- [ ] `NODE_ENV` configurado como `production`

### Supabase
- [ ] Projeto criado
- [ ] Região: South America (São Paulo)
- [ ] Senha do banco anotada
- [ ] Connection strings copiados

---

## 🚫 NUNCA Faça Isso

1. **Nunca** commite secrets no Git
2. **Nunca** use senhas fracas para JWT/NextAuth
3. **Nunca** exponha `DIRECT_URL` no frontend
4. **Nunca** deixe `ENABLE_SWAGGER=true` em produção sem proteção

---

## 📝 Template .env para Desenvolvimento Local

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-change-in-production
NODE_ENV=development
```

### Backend (.env)
```bash
DATABASE_URL=file:./prisma/dev.db
PORT=3001
NODE_ENV=development
JWT_SECRET=development-jwt-secret-change-in-production
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:3000
```

---

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Render Dashboard](https://dashboard.render.com)
- [Cloudflare Pages](https://dash.cloudflare.com)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler)
