# 📋 TASKS DE MELHORIAS - USS Brasil E-commerce

> Documento gerado em: 13/12/2024
> Baseado na análise completa do sistema

---

## 📊 RESUMO EXECUTIVO

| Categoria | Total Tasks | Alta | Média | Baixa |
|-----------|-------------|------|-------|-------|
| Infraestrutura | 8 | 4 | 3 | 1 |
| Backend | 10 | 3 | 5 | 2 |
| Frontend | 12 | 3 | 6 | 3 |
| Testes | 6 | 2 | 3 | 1 |
| DevOps/CI | 5 | 2 | 2 | 1 |
| **TOTAL** | **41** | **14** | **19** | **8** |

---

## 🔴 PRIORIDADE ALTA (Sprint 1 - Urgente)

### INFRA-001: Migrar banco de dados SQLite para PostgreSQL
- **Categoria**: Infraestrutura
- **Esforço**: 8h
- **Impacto**: Performance, Escalabilidade, Concorrência
- **Descrição**: O SQLite não é adequado para e-commerce em produção. Não suporta concorrência adequada e tem limitações de performance.
- **Solução**: 
  1. Criar conta no Supabase/Neon/Render PostgreSQL
  2. Atualizar schema.prisma (provider = "postgresql")
  3. Configurar DATABASE_URL no ambiente
  4. Executar migração de dados
  5. Testar todas as queries
- **Arquivos**: `backend/prisma/schema.prisma`, `.env`, `backend/.env`

### INFRA-002: Remover secrets hardcoded do código
- **Categoria**: Segurança (CRÍTICO)
- **Esforço**: 2h
- **Impacto**: Segurança total do sistema
- **Descrição**: Stripe keys e NEXTAUTH_SECRET expostos em arquivos de configuração
- **Solução**:
  1. Auditar todos arquivos de config
  2. Mover secrets para variáveis de ambiente
  3. Atualizar documentação de deploy
  4. Adicionar arquivos sensíveis ao .gitignore
- **Arquivos**: `vercel.json`, `netlify.toml`, `.env.example`

### INFRA-003: Habilitar otimização de imagens Next.js
- **Categoria**: Performance
- **Esforço**: 4h
- **Impacto**: Core Web Vitals, SEO, UX
- **Descrição**: `unoptimized: true` desabilita toda otimização de imagens do Next.js
- **Solução**:
  1. Remover `unoptimized: true` do next.config
  2. Configurar domínios de imagem permitidos
  3. Usar componente `<Image>` em vez de `<img>`
  4. Configurar loader para Cloudinary
- **Arquivos**: `next.config.ts`, componentes com imagens

### INFRA-004: Corrigir erros de TypeScript ignorados
- **Categoria**: Qualidade de Código
- **Esforço**: 16h
- **Impacto**: Manutenibilidade, Bugs em produção
- **Descrição**: `ignoreBuildErrors: true` esconde erros que podem causar bugs
- **Solução**:
  1. Remover `ignoreBuildErrors: true`
  2. Executar `npm run build` para listar erros
  3. Corrigir cada erro TypeScript
  4. Manter build sem erros
- **Arquivos**: `next.config.ts`, diversos componentes

### BACK-001: Persistir tokens de reset de senha
- **Categoria**: Backend/Segurança
- **Esforço**: 4h
- **Impacto**: Funcionalidade de recuperação de senha
- **Descrição**: Tokens armazenados em Map() são perdidos ao reiniciar servidor
- **Solução**:
  1. Criar tabela PasswordResetToken no Prisma
  2. Salvar tokens com expiração no banco
  3. Limpar tokens expirados via cron
- **Arquivos**: `backend/src/auth/auth.service.ts`, `backend/prisma/schema.prisma`

### BACK-002: Implementar cache com Redis
- **Categoria**: Backend/Performance
- **Esforço**: 8h
- **Impacto**: Performance, Escalabilidade
- **Descrição**: Cache em memória não persiste entre deploys
- **Solução**:
  1. Provisionar Redis (Upstash/Railway)
  2. Configurar cache-manager-redis-yet
  3. Implementar cache em queries frequentes
  4. Cache de sessões e rate limiting
- **Arquivos**: `backend/src/app.module.ts`, services diversos

### BACK-003: Implementar validação de estoque no checkout
- **Categoria**: Backend/Negócio
- **Esforço**: 4h
- **Impacto**: Integridade de dados, UX
- **Descrição**: Garantir que estoque é verificado e reservado atomicamente
- **Solução**:
  1. Usar transações Prisma no checkout
  2. Verificar estoque antes de criar pedido
  3. Implementar lock otimista
- **Arquivos**: `backend/src/orders/orders.service.ts`

### FRONT-001: Implementar Error Boundaries
- **Categoria**: Frontend/UX
- **Esforço**: 4h
- **Impacto**: UX, Debugging
- **Descrição**: Erros de componentes crasham toda a aplicação
- **Solução**:
  1. Criar componente ErrorBoundary
  2. Envolver páginas críticas
  3. Implementar fallback UI
  4. Logging de erros para Sentry
- **Arquivos**: `app/layout.tsx`, novo `components/ErrorBoundary.tsx`

### FRONT-002: Otimizar bundle size
- **Categoria**: Frontend/Performance
- **Esforço**: 6h
- **Impacto**: Tempo de carregamento, Core Web Vitals
- **Descrição**: Bundle grande com libs pesadas (GSAP, Framer Motion)
- **Solução**:
  1. Analisar com `@next/bundle-analyzer`
  2. Code splitting de libs pesadas
  3. Dynamic imports para componentes pesados
  4. Remover dependências não usadas
- **Arquivos**: `package.json`, componentes diversos

### FRONT-003: Implementar ISR para páginas de produto
- **Categoria**: Frontend/Performance
- **Esforço**: 4h
- **Impacto**: SEO, Performance, Custo de servidor
- **Descrição**: Páginas de produto são geradas a cada request
- **Solução**:
  1. Configurar `revalidate` nas páginas de produto
  2. Implementar generateStaticParams
  3. On-demand revalidation quando produto atualiza
- **Arquivos**: `app/produto/[slug]/page.tsx`, `app/produtos/page.tsx`

### TEST-001: Aumentar cobertura de testes unitários
- **Categoria**: Testes
- **Esforço**: 16h
- **Impacto**: Qualidade, Manutenibilidade
- **Descrição**: Apenas 5 arquivos de teste, cobertura baixa
- **Solução**:
  1. Testes para todos hooks customizados
  2. Testes para services/api.ts
  3. Testes para funções de utilidade
  4. Meta: 80% de cobertura
- **Arquivos**: `__tests__/**`

### TEST-002: Adicionar testes de integração no backend
- **Categoria**: Testes/Backend
- **Esforço**: 12h
- **Impacto**: Confiabilidade
- **Descrição**: Backend sem testes automatizados
- **Solução**:
  1. Configurar Jest no backend
  2. Criar banco de teste (SQLite in-memory)
  3. Testes para cada endpoint crítico
  4. Testes de autenticação
- **Arquivos**: `backend/test/**`

### DEVOPS-001: Configurar CI/CD com GitHub Actions
- **Categoria**: DevOps
- **Esforço**: 6h
- **Impacto**: Qualidade, Velocidade de deploy
- **Descrição**: Sem pipeline de CI/CD automatizado
- **Solução**:
  1. Criar workflow para lint/type-check
  2. Rodar testes automaticamente
  3. Deploy automático em branches específicas
  4. Notificações de falha
- **Arquivos**: `.github/workflows/ci.yml`

### DEVOPS-002: Criar Dockerfile para desenvolvimento
- **Categoria**: DevOps
- **Esforço**: 4h
- **Impacto**: Consistência de ambiente
- **Descrição**: Sem containerização do projeto
- **Solução**:
  1. Dockerfile para frontend
  2. Dockerfile para backend
  3. docker-compose.yml para dev local
  4. Documentação de uso
- **Arquivos**: `Dockerfile`, `docker-compose.yml`

---

## 🟡 PRIORIDADE MÉDIA (Sprint 2-3)

### INFRA-005: Padronizar plataforma de deploy
- **Categoria**: Infraestrutura
- **Esforço**: 4h
- **Impacto**: Complexidade operacional
- **Descrição**: Configurações para 4 plataformas diferentes
- **Solução**: Escolher e manter apenas Vercel + Railway
- **Arquivos**: Remover configs desnecessárias

### INFRA-006: Implementar CDN para assets estáticos
- **Categoria**: Infraestrutura/Performance
- **Esforço**: 4h
- **Impacto**: Performance global
- **Descrição**: Assets servidos direto do servidor
- **Solução**: Configurar Cloudinary/CloudFront para imagens e vídeos
- **Arquivos**: `next.config.ts`, componentes de mídia

### INFRA-007: Configurar monitoramento (APM)
- **Categoria**: Infraestrutura/Observabilidade
- **Esforço**: 4h
- **Impacto**: Debugging, Performance
- **Descrição**: Sem monitoramento de performance
- **Solução**: Implementar Sentry + Vercel Analytics
- **Arquivos**: `app/layout.tsx`, `next.config.ts`

### BACK-004: Implementar 2FA (Two-Factor Authentication)
- **Categoria**: Backend/Segurança
- **Esforço**: 8h
- **Impacto**: Segurança de contas
- **Descrição**: Sem autenticação de dois fatores
- **Solução**:
  1. Adicionar speakeasy para TOTP
  2. Gerar QR code para setup
  3. Validar código no login
  4. Backup codes
- **Arquivos**: `backend/src/auth/**`

### BACK-005: Implementar logs estruturados
- **Categoria**: Backend/Observabilidade
- **Esforço**: 6h
- **Impacto**: Debugging, Auditoria
- **Descrição**: Console.logs espalhados pelo código
- **Solução**:
  1. Usar Winston em todos services
  2. Formato JSON para logs
  3. Níveis de log apropriados
  4. Rotação de arquivos de log
- **Arquivos**: `backend/src/**/*.service.ts`

### BACK-006: Criar DTOs completos com validação
- **Categoria**: Backend/Qualidade
- **Esforço**: 8h
- **Impacto**: Segurança, Consistência
- **Descrição**: Alguns endpoints sem validação de entrada
- **Solução**:
  1. Criar DTOs para todos endpoints
  2. Usar class-validator decorators
  3. Documentar com Swagger decorators
- **Arquivos**: `backend/src/**/dto/**`

### BACK-007: Implementar soft delete
- **Categoria**: Backend/Negócio
- **Esforço**: 4h
- **Impacto**: Recuperação de dados, Auditoria
- **Descrição**: Deletes são permanentes
- **Solução**:
  1. Adicionar campo deletedAt nos models
  2. Filtrar registros deletados nas queries
  3. Implementar restore functionality
- **Arquivos**: `backend/prisma/schema.prisma`, services

### BACK-008: Rate limiting por rota
- **Categoria**: Backend/Segurança
- **Esforço**: 4h
- **Impacto**: Proteção contra abuso
- **Descrição**: Rate limit global, não por rota
- **Solução**:
  1. Limites específicos para login (5/min)
  2. Limites para checkout (10/min)
  3. Limites para busca (30/min)
- **Arquivos**: `backend/src/app.module.ts`, controllers

### FRONT-004: Implementar Service Worker para offline
- **Categoria**: Frontend/UX
- **Esforço**: 8h
- **Impacto**: UX offline, PWA
- **Descrição**: App não funciona offline
- **Solução**:
  1. Configurar next-pwa
  2. Cachear assets estáticos
  3. Mostrar página offline
  4. Sincronizar carrinho quando online
- **Arquivos**: `next.config.ts`, novo `public/sw.js`

### FRONT-005: Implementar skeleton loading
- **Categoria**: Frontend/UX
- **Esforço**: 6h
- **Impacto**: Perceived performance
- **Descrição**: Loading states inconsistentes
- **Solução**:
  1. Criar componentes Skeleton
  2. Usar em todas as listas
  3. Animação consistente
- **Arquivos**: `components/ui/Skeleton.tsx`

### FRONT-006: Consolidar componentes de navbar
- **Categoria**: Frontend/Manutenibilidade
- **Esforço**: 8h
- **Impacto**: Manutenibilidade, Bundle size
- **Descrição**: Múltiplos arquivos de navbar redundantes
- **Solução**:
  1. Analisar navbars existentes
  2. Criar navbar unificada
  3. Remover arquivos obsoletos
- **Arquivos**: `components/navbar*.tsx`

### FRONT-007: Implementar busca com debounce
- **Categoria**: Frontend/UX
- **Esforço**: 2h
- **Impacto**: Performance, UX
- **Descrição**: Busca faz request a cada tecla
- **Solução**: Implementar debounce de 300ms
- **Arquivos**: `components/search/**`

### FRONT-008: Adicionar meta tags dinâmicas
- **Categoria**: Frontend/SEO
- **Esforço**: 4h
- **Impacto**: SEO, Compartilhamento social
- **Descrição**: Meta tags estáticas ou ausentes
- **Solução**:
  1. generateMetadata em todas as páginas
  2. Open Graph tags
  3. Twitter cards
  4. JSON-LD structured data
- **Arquivos**: `app/**/page.tsx`

### FRONT-009: Implementar infinite scroll em listas
- **Categoria**: Frontend/UX
- **Esforço**: 4h
- **Impacto**: UX, Performance
- **Descrição**: Paginação tradicional pode ser melhorada
- **Solução**:
  1. Usar Intersection Observer
  2. Carregar mais ao scrollar
  3. Manter estado de scroll
- **Arquivos**: `app/produtos/page.tsx`

### TEST-003: Implementar testes E2E do fluxo de compra
- **Categoria**: Testes
- **Esforço**: 8h
- **Impacto**: Confiabilidade do checkout
- **Descrição**: Fluxo de compra não testado E2E
- **Solução**:
  1. Teste de adicionar ao carrinho
  2. Teste de checkout completo
  3. Teste de pagamento (mock Stripe)
  4. Teste de confirmação
- **Arquivos**: `e2e/checkout.spec.ts`

### TEST-004: Configurar testes de acessibilidade
- **Categoria**: Testes/Acessibilidade
- **Esforço**: 4h
- **Impacto**: Acessibilidade, Compliance
- **Descrição**: Sem testes de a11y
- **Solução**:
  1. Instalar @axe-core/playwright
  2. Verificar WCAG em páginas principais
  3. Corrigir violações encontradas
- **Arquivos**: `e2e/**`

### TEST-005: Adicionar testes de snapshot
- **Categoria**: Testes
- **Esforço**: 4h
- **Impacto**: Prevenir regressões visuais
- **Descrição**: Sem testes de snapshot
- **Solução**:
  1. Snapshots de componentes UI
  2. Atualizar em mudanças intencionais
- **Arquivos**: `__tests__/components/**`

### DEVOPS-003: Configurar preview deployments
- **Categoria**: DevOps
- **Esforço**: 2h
- **Impacto**: Velocidade de review
- **Descrição**: Sem preview de PRs
- **Solução**: Configurar Vercel preview deployments
- **Arquivos**: `vercel.json`

### DEVOPS-004: Implementar health checks
- **Categoria**: DevOps
- **Esforço**: 2h
- **Impacto**: Monitoramento, Auto-recovery
- **Descrição**: Health checks básicos
- **Solução**:
  1. Endpoint /health detalhado
  2. Verificar DB connection
  3. Verificar Redis connection
  4. Verificar serviços externos
- **Arquivos**: `backend/src/app.controller.ts`

---

## 🟢 PRIORIDADE BAIXA (Backlog)

### INFRA-008: Implementar multi-tenant
- **Categoria**: Infraestrutura
- **Esforço**: 40h
- **Descrição**: Permitir múltiplas lojas na mesma instância
- **Arquivos**: Schema, middleware, toda aplicação

### BACK-009: Implementar webhooks
- **Categoria**: Backend
- **Esforço**: 8h
- **Descrição**: Notificar sistemas externos de eventos
- **Arquivos**: `backend/src/webhooks/**`

### BACK-010: Adicionar suporte a múltiplas moedas
- **Categoria**: Backend/Negócio
- **Esforço**: 12h
- **Descrição**: Apenas BRL suportado
- **Arquivos**: Products, Orders, Stripe config

### FRONT-010: Implementar tema escuro
- **Categoria**: Frontend/UX
- **Esforço**: 8h
- **Descrição**: Dark mode já configurado mas não implementado completamente
- **Arquivos**: Todos componentes

### FRONT-011: Adicionar suporte a múltiplos idiomas (i18n)
- **Categoria**: Frontend
- **Esforço**: 16h
- **Descrição**: Apenas português suportado
- **Arquivos**: Todos arquivos com texto

### FRONT-012: Implementar comparador de produtos
- **Categoria**: Frontend/Feature
- **Esforço**: 8h
- **Descrição**: Página existe mas funcionalidade limitada
- **Arquivos**: `app/comparacao/page.tsx`

### TEST-006: Testes de carga com k6
- **Categoria**: Testes
- **Esforço**: 8h
- **Descrição**: Sem testes de performance
- **Arquivos**: `k6/**`

### DEVOPS-005: Configurar backup automático do banco
- **Categoria**: DevOps
- **Esforço**: 4h
- **Descrição**: Sem estratégia de backup
- **Arquivos**: Scripts de backup

---

## 📈 MÉTRICAS DE SUCESSO

### Após Sprint 1 (Tasks Alta Prioridade)
- [ ] Zero secrets expostos em código
- [ ] Build TypeScript sem erros
- [ ] Banco PostgreSQL em produção
- [ ] Core Web Vitals > 90
- [ ] Cobertura de testes > 60%

### Após Sprint 2-3 (Tasks Média Prioridade)
- [ ] Tempo de resposta API < 200ms
- [ ] Lighthouse Performance > 85
- [ ] Cobertura de testes > 80%
- [ ] Zero erros não tratados (Sentry)
- [ ] 2FA disponível para admins

### Longo Prazo
- [ ] PWA instalável
- [ ] Multi-idioma
- [ ] Multi-moeda
- [ ] 99.9% uptime

---

## 🚀 PRÓXIMOS PASSOS

1. **Hoje**: Revisar e priorizar tasks com a equipe
2. **Semana 1**: Iniciar INFRA-001, INFRA-002, INFRA-003
3. **Semana 2**: BACK-001, BACK-002, FRONT-001
4. **Semana 3**: TEST-001, TEST-002, DEVOPS-001
5. **Semana 4**: Review e ajustes

---

## 📝 NOTAS

- Tasks podem ser divididas em sub-tasks menores
- Prioridades podem mudar baseado em feedback de produção
- Estimativas de esforço são aproximadas
- Considerar feature flags para deploys graduais

---

*Documento mantido por: Equipe de Desenvolvimento USS Brasil*
*Última atualização: 13/12/2024*
