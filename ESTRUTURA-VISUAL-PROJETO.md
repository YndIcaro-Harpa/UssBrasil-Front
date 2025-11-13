# 📁 ESTRUTURA VISUAL - Projeto USS Brasil

## 🌳 ÁRVORE COMPLETA DO PROJETO

```
c:\www\Uss\Ecommerce-UssBrasil\
│
├── 📱 APP/ (35+ páginas Next.js App Router)
│   ├── 🏠 page.tsx (Homepage)
│   ├── 📄 layout.tsx (Layout global)
│   ├── 🔍 not-found.tsx (404)
│   ├── 🎨 globals.css (CSS global)
│   ├── 💫 homepage-premium.tsx (Homepage alternativa)
│   │
│   ├── 🛍️ E-COMMERCE CORE
│   │   ├── 🏷️ products/ (Catálogo)
│   │   ├── 🛒 carrinho/ (Carrinho)
│   │   ├── 💳 checkout/ (Finalização)
│   │   ├── 📦 pedido-confirmado/ (Confirmação)
│   │   ├── 📋 meus-pedidos/ (Histórico)
│   │   └── 📊 orders/ (Gestão pedidos)
│   │
│   ├── 🗂️ CATEGORIZAÇÃO
│   │   ├── 📂 categorias/ (Categorias)
│   │   ├── 📂 categories/ (Categorias alt)
│   │   ├── 🏢 brands/ (Marcas)
│   │   ├── 🎯 ofertas/ (Ofertas)
│   │   ├── 🆕 lancamentos/ (Lançamentos)
│   │   └── 🌟 novidades/ (Novidades)
│   │
│   ├── 👤 ÁREA DO CLIENTE
│   │   ├── 🔐 auth/ (Login/Registro)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── callback/
│   │   ├── 👨‍💼 profile/ (Perfil)
│   │   ├── 👨‍💼 perfil/ (Perfil alt)
│   │   ├── ❤️ favoritos/ (Favoritos)
│   │   └── 🎖️ vip/ (Área VIP)
│   │
│   ├── ⚙️ ADMIN PANEL
│   │   ├── dashboard/ (Dashboard)
│   │   ├── products/ (Gestão produtos)
│   │   ├── orders/ (Gestão pedidos)
│   │   ├── users/ (Gestão usuários)
│   │   ├── categories/ (Gestão categorias)
│   │   ├── brands/ (Gestão marcas)
│   │   └── settings/ (Configurações)
│   │
│   ├── 📞 SUPORTE & INFORMAÇÕES
│   │   ├── 📞 contato/ (Contato)
│   │   ├── ❓ faq/ (FAQ)
│   │   ├── 🆘 suporte/ (Suporte)
│   │   ├── 🏢 sobre/ (Sobre empresa)
│   │   ├── 📞 atendimento/ (Atendimento)
│   │   ├── 🎯 central-ajuda/ (Central ajuda)
│   │   ├── 📰 imprensa/ (Imprensa)
│   │   └── 💼 trabalhe-conosco/ (Carreiras)
│   │
│   ├── 📋 POLÍTICAS & TERMOS
│   │   ├── 📋 termos/ (Termos gerais)
│   │   ├── 📋 termos-uso/ (Termos de uso)
│   │   ├── 🔒 politica-privacidade/ (Privacidade)
│   │   ├── 🔒 privacidade/ (Privacidade alt)
│   │   ├── 🔄 politica-troca/ (Política troca)
│   │   ├── 🔄 trocas-devolucoes/ (Trocas)
│   │   ├── 🛡️ garantia/ (Garantia)
│   │   └── 🔒 seguranca-pagamentos/ (Segurança)
│   │
│   ├── 📦 LOGÍSTICA
│   │   ├── 🚚 metodos-envio/ (Métodos envio)
│   │   ├── 📍 rastreamento/ (Rastreamento)
│   │   └── 📖 como-comprar/ (Como comprar)
│   │
│   ├── 📝 CONTEÚDO
│   │   └── 📝 blog/ (Blog)
│   │       ├── page.tsx
│   │       ├── [slug]/
│   │       └── category/
│   │
│   └── 🔌 API ROUTES
│       ├── auth/ (Autenticação)
│       ├── products/ (Produtos)
│       ├── categories/ (Categorias)
│       ├── brands/ (Marcas)
│       ├── orders/ (Pedidos)
│       ├── users/ (Usuários)
│       ├── admin/ (Admin endpoints)
│       ├── cart/ (Carrinho)
│       ├── checkout/ (Checkout)
│       ├── payment/ (Pagamentos)
│       ├── shipping/ (Frete)
│       ├── newsletter/ (Newsletter)
│       └── contact/ (Contato)
│
├── 🧩 COMPONENTS/ (50+ componentes React)
│   ├── 🧭 NAVEGAÇÃO
│   │   ├── ⭐ navbar-enhanced-content.tsx (PRINCIPAL)
│   │   ├── navbar-enhanced.tsx (Wrapper)
│   │   ├── navbar-professional.tsx (Profissional)
│   │   ├── navbar-premium.tsx (Premium)
│   │   ├── advanced-navbar.tsx (Avançada)
│   │   └── navbar/ (Subcomponentes)
│   │       ├── TopBar.tsx
│   │       └── ProductsMegaMenu.tsx
│   │
│   ├── 🛒 E-COMMERCE
│   │   ├── cart/ (Carrinho)
│   │   │   ├── CartModal.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── product/ (Produtos)
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductImage.tsx
│   │   │   ├── ProductDetails.tsx
│   │   │   └── ProductGallery.tsx
│   │   ├── products/ (Listagens)
│   │   ├── brand/ (Marcas)
│   │   └── search/ (Busca)
│   │
│   ├── 🎨 UI COMPONENTS
│   │   ├── ui/ (Shadcn/ui - 30+ componentes)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── carousel.tsx
│   │   │   └── chart.tsx
│   │   ├── animated-components.tsx (Animações)
│   │   ├── AccessibleComponents.tsx (Acessibilidade)
│   │   └── LazyComponents.tsx (Lazy loading)
│   │
│   ├── 🪟 MODAIS
│   │   ├── modals/ (Sistema de modais)
│   │   │   ├── index.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   ├── CartModal.tsx
│   │   │   ├── ProductModal.tsx
│   │   │   └── ContactModal.tsx
│   │   ├── apple-login-modal.tsx (Apple)
│   │   ├── login-modal-new.tsx (Login novo)
│   │   └── quick-view-modal.tsx (Quick view)
│   │
│   ├── 📊 ADMIN
│   │   ├── admin/ (Admin components)
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminNavigation.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ProductManagement.tsx
│   │   │   └── OrderManagement.tsx
│   │   ├── charts/ (Gráficos)
│   │   │   ├── SalesChart.tsx
│   │   │   ├── OrdersChart.tsx
│   │   │   └── RevenueChart.tsx
│   │   └── admin-layout.tsx
│   │
│   ├── 🎬 MÍDIA
│   │   ├── video/ (Vídeo)
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── YouTubeEmbed.tsx
│   │   ├── category-video-player.tsx
│   │   └── rotating-banner.tsx (Banner)
│   │
│   └── 🔧 UTILITÁRIOS
│       ├── pages/ (Templates)
│       ├── EmptyPageTemplate.tsx
│       ├── StandardPageTemplate.tsx
│       ├── ClientLayout.tsx
│       ├── ConditionalLayout.tsx
│       ├── providers.tsx (Providers)
│       ├── toast-wrapper.tsx (Toast)
│       ├── filters/ (Filtros)
│       └── shop-submenu.tsx
│
├── 🔄 CONTEXTS/ (Estados Globais)
│   ├── 🛒 CartContext.tsx (Carrinho)
│   ├── 👤 AuthContext.tsx (Autenticação)
│   ├── 🪟 ModalContext.tsx (Modais)
│   ├── 🎨 ThemeContext.tsx (Tema)
│   └── 🔔 NotificationContext.tsx (Notificações)
│
├── 🎣 HOOKS/ (Custom Hooks)
│   ├── use-theme.ts (Tema)
│   ├── use-cart.ts (Carrinho)
│   ├── use-auth.ts (Auth)
│   ├── use-search.ts (Busca)
│   ├── use-mobile.ts (Mobile)
│   ├── use-api.ts (API)
│   └── use-local-storage.ts (Storage)
│
├── 📚 LIB/ (Bibliotecas)
│   ├── utils.ts (Utilitários)
│   ├── colors.ts (Cores)
│   ├── auth.ts (Auth config)
│   ├── prisma.ts (Prisma client)
│   ├── api.ts (API client)
│   ├── products-manager.ts (Produtos)
│   ├── payment.ts (Pagamento)
│   ├── shipping.ts (Frete)
│   └── email.ts (Email)
│
├── 🗄️ PRISMA/ (Banco)
│   ├── schema.prisma (Schema)
│   ├── seed.ts (Seeds)
│   └── migrations/ (Migrações)
│
├── 🎨 PUBLIC/ (Assets)
│   ├── images/ (Imagens gerais)
│   │   ├── Apple/ (Produtos Apple)
│   │   ├── JBL/ (Produtos JBL)
│   │   ├── Xiomi/ (Produtos Xiaomi)
│   │   ├── Dji/ (Produtos DJI)
│   │   └── Geonav/ (Produtos Geonav)
│   ├── Produtos/ (Imagens produtos)
│   ├── Empresa/ (Imagens empresa)
│   ├── Banners/ (Banners)
│   ├── categories/ (Categorias)
│   ├── icons/ (Ícones)
│   ├── Svg/ (SVGs)
│   ├── Videos/ (Vídeos)
│   ├── favicon.ico
│   ├── fallback-product.png
│   └── _redirects
│
├── 💾 STORE/ (Zustand)
│   ├── cartStore.ts (Carrinho)
│   ├── authStore.ts (Auth)
│   ├── searchStore.ts (Busca)
│   ├── uiStore.ts (UI)
│   └── adminStore.ts (Admin)
│
├── 💅 STYLES/
│   ├── globals.css (CSS adicional)
│   └── components.css (Componentes CSS)
│
├── 🏷️ TYPES/ (TypeScript)
│   ├── product.ts (Produtos)
│   ├── user.ts (Usuários)
│   ├── cart.ts (Carrinho)
│   ├── order.ts (Pedidos)
│   ├── brand.ts (Marcas)
│   ├── category.ts (Categorias)
│   ├── api.ts (API)
│   └── globals.ts (Globais)
│
├── ⚙️ SCRIPTS/ (Automação)
│   ├── setup.js
│   ├── deploy.js
│   └── migrate.js
│
├── 🔧 BACKEND/ (API Backend)
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   └── logs/
│
├── 📚 DOCUMENTAÇÃO/ (20+ arquivos)
│   ├── 🧭 NAVBAR (Recém atualizada)
│   │   ├── ⭐ NAVBAR-INICIO-AQUI.md
│   │   ├── README-NAVBAR-FINAL.md
│   │   ├── NAVBAR-COMPARATIVO-VISUAL.md
│   │   ├── NAVBAR-RESPONSIVIDADE-GUIA.md
│   │   ├── NAVBAR-GUIA-IMPLEMENTACAO.md
│   │   ├── NAVBAR-MELHORIAS-IMPLEMENTADAS.md
│   │   ├── NAVBAR-CHECKLIST-FINAL.md
│   │   └── NAVBAR-INDICE-DOCUMENTACAO.md
│   │
│   ├── 📋 SISTEMA GERAL
│   │   ├── README.md (Principal)
│   │   ├── DOCUMENTACAO_COMPLETA_SISTEMA.md
│   │   ├── SISTEMA-PREMIUM-COMPLETO-FINAL.md
│   │   └── ANALISE-COMPLETA-SISTEMA.md
│   │
│   ├── 📊 RELATÓRIOS
│   │   ├── REFATORACAO-USS-BRASIL-COMPLETA.md
│   │   ├── REFATORACAO-COMPLETA-FINAL-REPORT.md
│   │   ├── PAGINAS-FUNCIONAIS-RELATORIO.md
│   │   └── FLUXO-COMPRAS-IMPLEMENTADO.md
│   │
│   └── 🎯 OVERVIEWS (Este arquivo)
│       ├── ⭐ OVERVIEW-COMPLETO-PROJETO.md
│       ├── ⭐ ARQUIVOS-CHAVE-GUIA-RAPIDO.md
│       └── ⭐ ESTRUTURA-VISUAL-PROJETO.md
│
└── ⚙️ CONFIGURAÇÕES
    ├── next.config.ts (Next.js)
    ├── next.config.netlify.js (Netlify)
    ├── middleware.ts (Middleware)
    ├── tsconfig.json (TypeScript)
    ├── tailwind.config.js (Tailwind)
    ├── postcss.config.mjs (PostCSS)
    ├── components.json (Shadcn/ui)
    ├── package.json (Dependências)
    ├── netlify.toml (Netlify)
    ├── vercel.json (Vercel)
    ├── railway.toml (Railway)
    ├── Dockerfile (Docker)
    ├── setup-deploy.ps1 (Deploy PS)
    ├── setup-deploy.sh (Deploy Bash)
    ├── create-pages.ps1 (Criar páginas)
    ├── db.json (Mock data)
    ├── products.json (Produtos mock)
    ├── scripts.json (Scripts data)
    └── system-structure.json (Estrutura)
```

## 🎯 **LEGENDA DE ÍCONES**

### 📱 **Estrutura de Pastas**
```
📱 App Router (Next.js 15)
🧩 Componentes React
🔄 Context & Estados
🎣 Custom Hooks
📚 Bibliotecas & Utils
🗄️ Banco de Dados
🎨 Assets & Imagens
💾 Stores (Zustand)
💅 Estilos CSS
🏷️ Tipos TypeScript
⚙️ Configurações
🔧 Backend & API
📚 Documentação
```

### 🛍️ **Funcionalidades**
```
🏠 Homepage
🛒 Carrinho de Compras
💳 Checkout & Pagamento
📦 Pedidos & Entrega
👤 Autenticação & Perfil
⚙️ Admin Panel
📞 Suporte & Contato
📋 Políticas & Termos
🎯 Ofertas & Promoções
🔍 Busca & Filtros
❤️ Favoritos & Wishlist
🎖️ Área VIP
```

### 🧭 **NavBar (Recém Atualizada)**
```
⭐ Arquivo Principal
🧭 Navegação
📱 Responsivo (Mobile/Tablet/Desktop)
🎨 Com Imagens (4 categorias + 5 marcas)
🎭 Animações Framer Motion
💨 Performance Otimizada
```

### 📊 **Status**
```
✅ Implementado
🚧 Em desenvolvimento
💡 Planejado
⭐ Recém atualizado
🔥 Crítico
💎 Premium
```

## 📈 **ESTATÍSTICAS VISUAIS**

### 📊 **Distribuição de Arquivos**
```
📱 Páginas App Router:      35+ arquivos
🧩 Componentes React:       50+ arquivos  
🔌 API Endpoints:           15+ endpoints
📚 Documentação:            20+ arquivos
🎨 Assets (Imagens/Icons):  100+ arquivos
⚙️ Configurações:           15+ arquivos
🏷️ Tipos TypeScript:        10+ arquivos
🔄 Estados/Stores:          10+ arquivos
```

### 🎯 **Áreas Principais**
```
🛍️ E-commerce (Core):       40% do projeto
🧭 Navegação & UI:          25% do projeto
⚙️ Admin & Management:      15% do projeto
📞 Suporte & Info:          10% do projeto
🔐 Auth & Security:         5% do projeto
📚 Documentação:            5% do projeto
```

### 📱 **Responsividade**
```
📱 Mobile (< 768px):        Otimizado
💻 Tablet (768px - 1024px): Otimizado
🖥️ Desktop (> 1024px):      Otimizado
📺 Large (> 1440px):        Suportado
```

---

**📍 Este é um overview visual da estrutura do projeto**  
**🔍 Para detalhes**: Veja `OVERVIEW-COMPLETO-PROJETO.md`  
**⚡ Para navegação rápida**: Veja `ARQUIVOS-CHAVE-GUIA-RAPIDO.md`  
**🧭 Para NavBar**: Comece com `NAVBAR-INICIO-AQUI.md`