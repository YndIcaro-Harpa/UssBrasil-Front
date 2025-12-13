# Deploy USS Brasil E-commerce

Este documento contém instruções completas para deploy do projeto em produção.

## 🏗️ Arquitetura de Produção

| Componente | Plataforma | Tier | URL |
|------------|-----------|------|-----|
| **Frontend** | Cloudflare Pages | Grátis | https://ussbrasil.pages.dev |
| **Backend** | Render | Grátis | https://ussbrasil-api.onrender.com |
| **Database** | Supabase PostgreSQL | Grátis | *.supabase.com |

---

## 📋 Pré-requisitos

- Conta no [Cloudflare](https://dash.cloudflare.com)
- Conta no [Render](https://render.com)
- Conta no [Supabase](https://supabase.com)
- Git instalado
- Node.js 20+

---

## 1. 🗄️ Configurar Supabase (Banco de Dados)

### 1.1 Criar Projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em "New Project"
3. Configure:
   - **Name**: `ussbrasil`
   - **Database Password**: (guarde essa senha!)
   - **Region**: `South America (São Paulo)` ou mais próximo
4. Aguarde a criação (~2 min)

### 1.2 Obter Connection Strings

1. Vá em **Settings** → **Database**
2. Role até "Connection string"
3. Copie duas URLs:

**Connection Pooler (para aplicação):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection (para migrações):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

⚠️ **Importante**: Substitua `[PASSWORD]` pela senha do projeto!

---

## 2. 🚀 Deploy Backend no Render

### 2.1 Criar Web Service

1. Acesse [render.com/dashboard](https://render.com/dashboard)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | ussbrasil-api |
| **Region** | South America (São Paulo) ou mais próximo |
| **Branch** | main |
| **Root Directory** | backend |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | Free |

### 2.2 Variáveis de Ambiente (Render)

No painel do Render, adicione em **Environment**:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui
JWT_EXPIRATION=7d

# CORS
FRONTEND_URL=https://ussbrasil.pages.dev
```

### 2.3 Deploy

- Clique em "Create Web Service"
- Aguarde o build (~5 min no tier gratuito)
- Teste: `https://ussbrasil-api.onrender.com/health`

⚠️ **Nota**: No tier gratuito, o serviço "adormece" após 15 min de inatividade. O primeiro request após dormir leva ~30s.

---

## 3. ☁️ Deploy Frontend no Cloudflare Pages

### 3.1 Preparar Projeto

O projeto já está configurado com OpenNext para Cloudflare. Arquivos importantes:
- `wrangler.toml` - Configuração do Cloudflare
- `open-next.config.ts` - Configuração do OpenNext

### 3.2 Criar Pages Project

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Workers & Pages** → **Create**
3. Selecione **Pages** → **Connect to Git**
4. Conecte seu repositório GitHub
5. Configure:

| Campo | Valor |
|-------|-------|
| **Project name** | ussbrasil |
| **Production branch** | main |
| **Build command** | `npx @opennextjs/cloudflare build` |
| **Build output directory** | `.open-next` |
| **Root directory** | `/` (raiz) |

### 3.3 Variáveis de Ambiente (Cloudflare)

No painel Pages, vá em **Settings** → **Environment variables**:

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://ussbrasil-api.onrender.com
NEXT_PUBLIC_API_URL=https://ussbrasil-api.onrender.com

# NextAuth
NEXTAUTH_URL=https://ussbrasil.pages.dev
NEXTAUTH_SECRET=seu-nextauth-secret-muito-seguro

# Cloudinary (se usar)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnmazlvs6
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=uss-brasil

# Stripe (se usar)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 3.4 Secrets via Wrangler CLI (Alternativo)

```bash
# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login

# Adicionar secrets
wrangler pages secret put NEXTAUTH_SECRET --project-name ussbrasil
wrangler pages secret put STRIPE_SECRET_KEY --project-name ussbrasil
```

### 3.5 Deploy

- Clique em "Save and Deploy"
- Aguarde o build (~3 min)
- Acesse: `https://ussbrasil.pages.dev`

---

## 4. 📊 Migração do Banco de Dados

### 4.1 Local (antes do deploy)

```bash
cd backend

# Criar arquivo .env com DATABASE_URL e DIRECT_URL do Supabase
# Depois executar:

# Gerar client do Prisma
npx prisma generate

# Aplicar schema no banco
npx prisma db push

# (Opcional) Seed inicial
npm run seed
```

### 4.2 Verificar no Supabase

1. Vá em **Table Editor** no dashboard do Supabase
2. Verifique se as tabelas foram criadas
3. Confira a estrutura: User, Product, Order, etc.

---

## 5. ✅ Checklist de Verificação

### Backend (Render)
- [ ] `https://ussbrasil-api.onrender.com/health` retorna status "ok"
- [ ] `https://ussbrasil-api.onrender.com/api/products` retorna produtos
- [ ] Logs no Render não mostram erros de conexão

### Database (Supabase)
- [ ] Tabelas criadas no Table Editor
- [ ] Conexão funcionando (testar via Render logs)

### Frontend (Cloudflare)
- [ ] `https://ussbrasil.pages.dev` carrega corretamente
- [ ] Produtos aparecem na página inicial
- [ ] Login/Cadastro funcionam
- [ ] Carrinho funciona

---

## 6. 🔧 Troubleshooting

### Erro: "Database connection failed"

**Causa**: URL do banco incorreta ou senha errada

**Solução**:
1. Verifique a senha no Supabase
2. Confirme que está usando a URL com `?pgbouncer=true` para conexão pooler
3. Verifique se a região do Supabase permite conexões externas

### Erro: "CORS policy blocked"

**Causa**: Frontend URL não está na lista de origens permitidas

**Solução**:
1. Verifique `FRONTEND_URL` no Render
2. Confirme que `https://ussbrasil.pages.dev` está no arquivo `main.ts`

### Erro: "Build failed" no Cloudflare

**Causa**: Geralmente dependências ou configuração

**Solução**:
```bash
# Limpar cache local
rm -rf node_modules .next .open-next
npm install
npx @opennextjs/cloudflare build
```

### Serviço lento no Render

**Causa**: Tier gratuito adormece após 15 min

**Soluções**:
1. Usar serviço de ping como [UptimeRobot](https://uptimerobot.com) para manter acordado
2. Ou aceitar o delay inicial (~30s no primeiro request)

---

## 7. 📝 Scripts Úteis

### package.json (Frontend)

```json
{
  "scripts": {
    "build:cloudflare": "npx @opennextjs/cloudflare build",
    "preview:cloudflare": "wrangler pages dev",
    "deploy:cloudflare": "wrangler pages deploy"
  }
}
```

### Comandos de Deploy

```bash
# Frontend - Cloudflare Pages
npm run build:cloudflare
wrangler pages deploy .open-next --project-name ussbrasil

# Backend - Render (automático via Git push)
git push origin main
```

---

## 8. 🔐 Segurança

### Variáveis Sensíveis

**NUNCA** commite no Git:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `DATABASE_URL` com senha
- Chaves do Stripe

### Gerar Secrets Seguros

```bash
# Gerar secret aleatório
openssl rand -base64 32

# Ou usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 9. 🌐 Domínio Customizado (Opcional)

### Cloudflare Pages

1. Vá em **Custom domains** no projeto Pages
2. Adicione seu domínio (ex: `ussbrasil.com.br`)
3. Configure DNS:
   - **Type**: CNAME
   - **Name**: @ ou www
   - **Target**: ussbrasil.pages.dev

### Render

1. Vá em **Settings** → **Custom Domain**
2. Adicione `api.ussbrasil.com.br`
3. Configure DNS conforme instruções

---

## 10. 📈 Próximos Passos

Após o deploy bem-sucedido:

1. **Monitoramento**
   - Configure alertas no Render
   - Use Sentry para error tracking

2. **Performance**
   - Configure Cloudflare CDN/Cache
   - Otimize imagens

3. **Backup**
   - Configure backup automático no Supabase
   - Mantenha migrações versionadas

---

## Referências

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

## 3. Deploy Frontend no Netlify

### Passo a Passo

1. **Conectar Repositório**
   - Acesse [app.netlify.com](https://app.netlify.com)
   - New site from Git

2. **Configurar Build**
   - Build Command: `npm run build:netlify`
   - Publish Directory: `.next`

3. **Plugins**
   - Instale `@netlify/plugin-nextjs`

4. **Variáveis de Ambiente**
   - Site settings → Build & deploy → Environment

### Comandos Netlify CLI

```bash
# Instalar CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy preview
netlify deploy

# Deploy produção
netlify deploy --prod
```

---

## 4. Deploy Backend no Railway

### Passo a Passo

1. **Criar Projeto**
   - Acesse [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Selecione a pasta `backend/`

2. **Adicionar PostgreSQL**
   - Add Plugin → PostgreSQL
   - Copie a DATABASE_URL gerada

3. **Variáveis de Ambiente**
   - Variables → Add:
     ```
     PORT=3001
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=...
     CORS_ORIGIN=https://seu-dominio.com
     ```

4. **Configurar Start Command**
   - Settings → Start Command: `npm run start:prod`

### railway.toml (já configurado)

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
```

---

## 5. Deploy Backend no Render

### Passo a Passo

1. **Criar Web Service**
   - New → Web Service
   - Conecte repositório
   - Root Directory: `backend`

2. **Configurar Build**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

3. **Adicionar PostgreSQL**
   - New → PostgreSQL
   - Copie Internal Database URL

4. **Variáveis de Ambiente**
   - Environment → Add Environment Variable

---

## 6. Checklist Pré-Deploy

### Frontend
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build local funciona: `npm run build`
- [ ] Testes passam: `npm test`
- [ ] TypeScript sem erros: `npm run type-check`
- [ ] ESLint sem erros críticos: `npm run lint`

### Backend
- [ ] Migrations criadas: `npx prisma migrate dev`
- [ ] Seed executado (se necessário)
- [ ] Build funciona: `npm run build`
- [ ] API responde: `GET /health`

### Infraestrutura
- [ ] Domínio configurado
- [ ] SSL/TLS ativo
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo (produção)

---

## 7. Monitoramento

### Logs

```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Railway
railway logs
```

### Métricas Recomendadas

- Tempo de resposta da API
- Taxa de erros 4xx/5xx
- Uso de memória
- Tempo de build

---

## 8. Rollback

### Vercel
```bash
# Listar deployments
vercel ls

# Promover deployment anterior
vercel promote [deployment-id]
```

### Netlify
- Site deploys → Selecionar deploy anterior → Publish deploy

### Railway
- Deployments → Rollback to this deploy

---

## 9. Troubleshooting

### Erro: "Build failed"
- Verifique logs de build
- Confirme NODE_VERSION >= 18
- Verifique se todas as deps estão no package.json

### Erro: "Database connection failed"
- Verifique DATABASE_URL
- Confirme que IP do servidor está no allowlist
- Teste conexão local: `npx prisma db pull`

### Erro: "CORS blocked"
- Verifique CORS_ORIGIN no backend
- Confirme protocolo (http vs https)
- Verifique se domínio está correto

### Erro: "NextAuth callback failed"
- Verifique NEXTAUTH_URL
- Confirme callback URLs nos providers OAuth
- Verifique NEXTAUTH_SECRET

---

## 10. Scripts Úteis

### Verificar Build

```bash
# Frontend
npm run build && npm start

# Backend
cd backend && npm run build && npm run start:prod
```

### Verificar Database

```bash
# Testar conexão
npx prisma db pull

# Ver dados
npx prisma studio
```

### Health Check

```bash
# Frontend
curl https://seu-dominio.com/api/health

# Backend
curl https://api.seu-dominio.com/health
```

---

## Contato

Para dúvidas sobre deploy, entre em contato com a equipe de DevOps.
