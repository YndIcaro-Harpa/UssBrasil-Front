# Deploy USS Brasil E-commerce

Este documento contém instruções para deploy do projeto em produção.

## Arquitetura

- **Frontend**: Next.js 15 (Vercel/Netlify)
- **Backend**: NestJS + Prisma (Railway/Render)
- **Banco de Dados**: SQLite (dev) / PostgreSQL (prod)

---

## 1. Variáveis de Ambiente

### Frontend (.env.local)

```bash
# Autenticação
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui
NEXTAUTH_URL=https://seu-dominio.com

# Backend API
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.seu-dominio.com

# Banco de Dados (se usar Prisma no frontend)
DATABASE_URL=file:./prisma/dev.db

# Opcional - Cloudinary para imagens
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu-cloud-name

# Opcional - Google Auth
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret

# Opcional - Apple Auth
APPLE_ID=seu-apple-id
APPLE_SECRET=seu-apple-secret
```

### Backend (.env)

```bash
# Porta do servidor
PORT=3001

# Banco de Dados
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

---

## 2. Deploy Frontend no Vercel

### Passo a Passo

1. **Conectar Repositório**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o projeto do GitHub

2. **Configurar Build**
   - Framework Preset: Next.js
   - Build Command: `npm run build:vercel`
   - Output Directory: `.next`

3. **Variáveis de Ambiente**
   - Adicione todas as variáveis do `.env.local`
   - Use secrets para valores sensíveis

4. **Domínio**
   - Configure seu domínio customizado
   - SSL é automático

### Comandos Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy produção
vercel --prod
```

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
