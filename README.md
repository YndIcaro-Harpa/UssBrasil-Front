# USS Brasil E-commerce

<div align="center">

![USS Brasil](https://via.placeholder.com/200x80/001941/FFFFFF?text=USS+BRASIL)

**Plataforma E-commerce de Produtos Importados Premium**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)

</div>

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Features](#-features)
- [API Documentation](#-api-documentation)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)

---

## 🎯 Visão Geral

USS Brasil é uma plataforma e-commerce completa para venda de produtos importados premium, incluindo smartphones, acessórios, drones e equipamentos eletrônicos.

### Principais Características

- 🛒 **Carrinho Inteligente** - Suporte a variações de produtos (cor, tamanho, armazenamento)
- 💳 **Multi-Pagamentos** - PIX, Cartão de Crédito, Boleto
- 📦 **Gestão de Estoque** - Alertas automáticos de estoque baixo
- 📧 **E-mails Transacionais** - Templates branded para confirmações e notificações
- 📊 **Dashboard Admin** - Interface compacta e responsiva para gestão
- 🔐 **Autenticação** - JWT com suporte a 2FA

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Pages  │  │Components│  │ Contexts │  │  Hooks  │            │
│  │ (App    │  │ (React) │  │ (State) │  │(Custom) │            │
│  │ Router) │  │         │  │         │  │         │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       └────────────┴────────────┴────────────┘                  │
│                           │                                      │
│                    ┌──────┴──────┐                              │
│                    │  Services   │                              │
│                    │   (API)     │                              │
│                    └──────┬──────┘                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┼─────────────────────────────────────┐
│                        BACKEND (NestJS)                          │
│                            │                                     │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │                     API Gateway                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Products │  │  Orders  │  │   Auth   │  │  Email   │  │  │
│  │  │ Module   │  │  Module  │  │  Module  │  │  Module  │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │  │
│  │       │             │             │             │         │  │
│  │       └─────────────┴─────────────┴─────────────┘         │  │
│  │                           │                               │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │   Prisma ORM     │                        │
│                    └─────────┬─────────┘                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    SQLite/Postgres  │
                    │     (Database)      │
                    └─────────────────────┘
```

### Fluxo de Dados

```
Cliente → Next.js (SSR/CSR) → API Service → NestJS → Prisma → Database
                                   ↓
                            Email Service (Nodemailer)
                                   ↓
                              SMTP Server
```

---

## 🛠 Tecnologias

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 15.4.3 | Framework React com App Router |
| React | 19.x | Biblioteca UI |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.x | Framework CSS utility-first |
| Framer Motion | 12.x | Animações |
| Zustand | 5.x | Gerenciamento de estado |
| React Hook Form | 7.x | Formulários |
| Zod | 3.x | Validação de schemas |

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| NestJS | 11.x | Framework Node.js |
| Prisma | 6.x | ORM |
| Winston | 3.x | Logging estruturado |
| Passport | 0.7.x | Autenticação |
| Nodemailer | 6.x | Envio de emails |
| Stripe | 17.x | Pagamentos |
| bcrypt | 5.x | Criptografia |

### Testes
| Tecnologia | Descrição |
|------------|-----------|
| Jest | Testes unitários |
| Playwright | Testes E2E |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Git

### Clone o repositório

```bash
git clone https://github.com/Ynd-Icaro/Uss.git
cd Uss/Ecommerce-UssBrasil
```

### Frontend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar desenvolvimento
npm run dev
```

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar banco de dados
npx prisma generate
npx prisma db push

# Seed (dados iniciais)
npm run db:seed

# Iniciar desenvolvimento
npm run start:dev
```

### Variáveis de Ambiente

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
```

#### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📁 Estrutura do Projeto

```
Ecommerce-UssBrasil/
├── app/                      # Next.js App Router
│   ├── admin/               # Painel administrativo
│   │   ├── page.tsx        # Dashboard
│   │   ├── products/       # CRUD produtos
│   │   ├── orders/         # Gestão pedidos
│   │   ├── customers/      # Clientes
│   │   └── settings/       # Configurações
│   ├── produto/[slug]/     # Página produto
│   ├── produtos/           # Listagem produtos
│   ├── carrinho/           # Carrinho
│   ├── checkout/           # Finalização compra
│   └── meus-pedidos/       # Histórico pedidos
│
├── components/              # Componentes React
│   ├── admin/              # Componentes admin
│   ├── ui/                 # Componentes UI base
│   └── *.tsx              # Componentes gerais
│
├── contexts/               # Contextos React
│   ├── CartContext.tsx    # Carrinho (com variações)
│   └── AuthContext.tsx    # Autenticação
│
├── services/               # Serviços API
│   └── api.ts             # Cliente HTTP
│
├── e2e/                    # Testes E2E (Playwright)
│   ├── basic.spec.ts
│   ├── product-variations.spec.ts
│   └── admin.spec.ts
│
├── backend/                # API NestJS
│   ├── src/
│   │   ├── auth/          # Autenticação JWT
│   │   ├── products/      # CRUD produtos
│   │   ├── orders/        # Gestão pedidos
│   │   ├── email/         # Templates e envio
│   │   ├── users/         # Gestão usuários
│   │   └── common/        # Shared (logger, etc)
│   │       └── logger/    # Winston logger
│   └── prisma/
│       └── schema.prisma  # Schema do banco
│
└── __tests__/              # Testes unitários (Jest)
```

---

## ✨ Features

### E-commerce
- [x] Catálogo de produtos com filtros
- [x] Página de produto com variações (cor, storage, tamanho)
- [x] Carrinho persistente com IDs únicos por variação
- [x] Checkout multi-step
- [x] Múltiplos métodos de pagamento
- [x] Cálculo de frete
- [x] Cupons de desconto

### Admin
- [x] Dashboard compacto com KPIs
- [x] CRUD de produtos
- [x] Gestão de pedidos com atualização de status
- [x] Gestão de clientes
- [x] Configurações (loja, frete, pagamentos, alertas)
- [x] Relatórios e exportação

### Sistema
- [x] Autenticação JWT
- [x] E-mails transacionais branded
- [x] Logging estruturado (Winston)
- [x] Testes E2E (Playwright)
- [x] Testes unitários (Jest)

---

## 📚 API Documentation

A documentação completa da API está disponível via Swagger:

```
http://localhost:3001/api/docs
```

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products` | Listar produtos |
| GET | `/products/:id` | Detalhes do produto |
| POST | `/orders` | Criar pedido |
| GET | `/orders` | Listar pedidos |
| PATCH | `/orders/:id/status` | Atualizar status |
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Registro |

---

## 🧪 Testes

### Testes Unitários (Jest)

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

### Testes E2E (Playwright)

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Modo UI interativo
npm run test:e2e:ui

# Com navegador visível
npm run test:e2e:headed

# Ver relatório
npm run test:e2e:report
```

---

## 🚢 Deploy

### Frontend (Vercel/Netlify)

```bash
# Build de produção
npm run build

# Vercel
vercel deploy --prod

# Netlify
netlify deploy --prod
```

### Backend (Render/Railway)

```bash
cd backend

# Build
npm run build

# Start produção
npm run start:prod
```

### Docker

```dockerfile
# Frontend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🔒 Segurança

- Validação de inputs com class-validator
- Sanitização de dados
- Rate limiting
- CORS configurado
- Helmet para headers HTTP
- Senhas hasheadas com bcrypt
- JWT com expiração

---

## 📈 Monitoramento

### Logs

Os logs são salvos em `backend/logs/`:
- `app-YYYY-MM-DD.log` - Todos os logs
- `error-YYYY-MM-DD.log` - Apenas erros

### Formato de Log

```json
{
  "timestamp": "2025-12-09T10:30:00.000Z",
  "level": "INFO",
  "context": "Orders",
  "message": "Order created",
  "meta": {
    "orderId": "abc123",
    "total": 1999.99
  }
}
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Feito com ❤️ pela equipe USS Brasil**

[🌐 Site](https://ussbrasil.com.br) · [📧 Contato](mailto:contato@ussbrasil.com) · [📱 Instagram](https://instagram.com/ussbrasil)

</div>
