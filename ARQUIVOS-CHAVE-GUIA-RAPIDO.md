# 📋 ARQUIVOS-CHAVE - Guia Rápido

## 🎯 **ARQUIVOS PRINCIPAIS - Top 15**

### 🥇 **CRÍTICOS (Modificar com cuidado)**
```
1. app/layout.tsx                           📄 Layout global
2. components/navbar-enhanced-content.tsx   🧭 NavBar PRINCIPAL ⭐
3. app/page.tsx                             🏠 Homepage principal
4. package.json                             📦 Dependências
5. tailwind.config.js                       🎨 Configuração visual
```

### 🥈 **IMPORTANTES (Funcionalidades core)**
```
6. contexts/CartContext.tsx                 🛒 Estado carrinho
7. contexts/AuthContext.tsx                 👤 Estado autenticação
8. lib/utils.ts                             🔧 Utilitários
9. prisma/schema.prisma                     🗄️ Banco de dados
10. app/api/                                🔌 Endpoints API
```

### 🥉 **ESSENCIAIS (Configuração)**
```
11. next.config.ts                          ⚙️ Config Next.js
12. middleware.ts                           🛡️ Middleware
13. components/ui/                          🎨 Componentes base
14. app/globals.css                         💅 CSS global
15. .env.local                              🔐 Variáveis ambiente
```

---

## 📁 **ESTRUTURA NAVEGÁVEL**

### 🧭 **NavBar (RECÉM ATUALIZADA)**
```
📂 Documentação NavBar (20 arquivos)
├── 📄 NAVBAR-INICIO-AQUI.md               ⭐ COMEÇAR AQUI
├── 📄 README-NAVBAR-FINAL.md              📋 Resumo executivo
├── 📄 NAVBAR-COMPARATIVO-VISUAL.md        👀 Antes vs Depois
├── 📄 NAVBAR-RESPONSIVIDADE-GUIA.md       📱 Mobile/Tablet/Desktop
├── 📄 NAVBAR-GUIA-IMPLEMENTACAO.md        🛠️ Como customizar
└── 📄 NAVBAR-MELHORIAS-IMPLEMENTADAS.md   🔬 Detalhes técnicos

📂 Código NavBar
├── 📄 components/navbar-enhanced-content.tsx  ⭐ ARQUIVO PRINCIPAL
├── 📄 components/navbar-enhanced.tsx          🧭 Wrapper
└── 📄 components/navbar/                      📁 Subcomponentes
```

### 🛍️ **E-commerce Core**
```
📂 Carrinho
├── 📄 contexts/CartContext.tsx             🛒 Estado global
├── 📄 components/cart/                     🧩 Componentes
└── 📄 app/carrinho/page.tsx               📄 Página

📂 Produtos
├── 📄 app/products/                        📂 Páginas
├── 📄 components/product/                  🧩 Componentes
└── 📄 types/product.ts                    🏷️ Tipos

📂 Autenticação
├── 📄 contexts/AuthContext.tsx             👤 Estado
├── 📄 app/auth/                           📂 Páginas
└── 📄 lib/auth.ts                         🔐 Configuração
```

### 🎨 **Design System**
```
📂 UI Components
├── 📄 components/ui/                       🎨 Shadcn/ui base
├── 📄 tailwind.config.js                 ⚙️ Config cores/espaços
└── 📄 app/globals.css                     💅 CSS customizado

📂 Assets
├── 📄 public/images/                       📸 Imagens produtos
├── 📄 public/icons/                       🔗 Ícones
└── 📄 public/Svg/                         🖼️ SVGs
```

---

## 🗂️ **MAPA DE PÁGINAS**

### 🏠 **Principais**
```
/ ➜ app/page.tsx                           🏠 Homepage
/products ➜ app/products/page.tsx          🛍️ Catálogo
/carrinho ➜ app/carrinho/page.tsx         🛒 Carrinho
/checkout ➜ app/checkout/page.tsx          💳 Finalizar compra
/admin ➜ app/admin/page.tsx               ⚙️ Painel admin
```

### 👤 **Usuário**
```
/auth/login ➜ app/auth/login/page.tsx     🔐 Login
/profile ➜ app/profile/page.tsx           👤 Perfil
/meus-pedidos ➜ app/meus-pedidos/page.tsx 📦 Pedidos
/favoritos ➜ app/favoritos/page.tsx       ❤️ Favoritos
```

### 📞 **Suporte**
```
/contato ➜ app/contato/page.tsx           📞 Contato
/faq ➜ app/faq/page.tsx                   ❓ FAQ
/suporte ➜ app/suporte/page.tsx           🆘 Suporte
/sobre ➜ app/sobre/page.tsx               🏢 Sobre
```

### 📋 **Legais**
```
/termos ➜ app/termos/page.tsx             📋 Termos de uso
/privacidade ➜ app/privacidade/page.tsx   🔒 Privacidade
/trocas ➜ app/trocas-devolucoes/page.tsx  🔄 Trocas
```

---

## 🔌 **API ENDPOINTS**

### 🛍️ **E-commerce**
```
/api/products                               📦 Produtos
/api/categories                             📂 Categorias  
/api/brands                                 🏢 Marcas
/api/cart                                   🛒 Carrinho
/api/orders                                 📋 Pedidos
/api/checkout                               💳 Checkout
```

### 👤 **Autenticação**
```
/api/auth/login                             🔐 Login
/api/auth/register                          📝 Registro
/api/auth/session                           👤 Sessão
/api/auth/logout                            🚪 Logout
```

### ⚙️ **Admin**
```
/api/admin/users                            👥 Usuários
/api/admin/dashboard                        📊 Dashboard
/api/admin/products                         📦 Gestão produtos
/api/admin/orders                           📋 Gestão pedidos
```

---

## 🎯 **GUIA RÁPIDO DE EDIÇÃO**

### ✏️ **Para Alterar NavBar**
```
1. 📄 components/navbar-enhanced-content.tsx   ⭐ Código principal
2. 📄 tailwind.config.js                      🎨 Cores/estilos
3. 📄 public/images/                          📸 Adicionar imagens
4. 📄 types/globals.ts                        🏷️ Tipos (se necessário)
```

### ✏️ **Para Adicionar Página**
```
1. 📄 app/nova-pagina/page.tsx                📄 Criar página
2. 📄 app/nova-pagina/layout.tsx              📄 Layout (opcional)
3. 📄 components/navbar-enhanced-content.tsx  🧭 Link na navegação
4. 📄 app/api/nova-funcionalidade/             🔌 API (se necessário)
```

### ✏️ **Para Alterar Estilos**
```
1. 📄 tailwind.config.js                      ⚙️ Config principal
2. 📄 app/globals.css                          💅 CSS customizado  
3. 📄 components/ui/                          🎨 Componentes base
4. 📄 styles/                                 💅 CSS adicional
```

### ✏️ **Para Adicionar Funcionalidade**
```
1. 📄 contexts/NovoContext.tsx                🔄 Estado global
2. 📄 hooks/use-nova-funcionalidade.ts       🎣 Hook customizado
3. 📄 components/nova-feature/               🧩 Componentes
4. 📄 app/api/nova-funcionalidade/          🔌 Backend
```

---

## 📊 **RESUMO TÉCNICO**

### 🏗️ **Arquitetura**
```
Framework: Next.js 15.4.3 App Router
UI: React 19 + TypeScript 5
Styling: Tailwind CSS 4 + Shadcn/ui
Estado: Context API + Zustand
Banco: Prisma ORM + PostgreSQL
Auth: NextAuth.js 5.0
Deploy: Netlify/Vercel/Railway
```

### 📈 **Estatísticas**
```
📄 Páginas: 35+
🧩 Componentes: 50+
🔌 API Routes: 15+
📚 Documentação: 20+
🎨 Breakpoints: 3 (Mobile/Tablet/Desktop)
🌐 Idioma: Português Brasil
```

### 🔗 **Integrações**
```
✅ NextAuth (Google, Apple)
✅ Framer Motion (Animações)
✅ Lucide Icons (Ícones)
✅ Date-fns (Datas)
🚧 Stripe (Pagamentos)
🚧 Correios API (Frete)
```

---

## 🚀 **COMANDOS RÁPIDOS**

### 💻 **Development**
```powershell
npm run dev                                 # Servidor desenvolvimento
npm run build                              # Build produção
npm run start                              # Servidor produção
npm run lint                               # Verificar código
```

### 📦 **Database**
```powershell
npx prisma generate                         # Gerar cliente
npx prisma db push                          # Sincronizar schema
npx prisma studio                           # Interface visual
npx prisma db seed                          # Popular dados
```

### 🚀 **Deploy**
```powershell
.\setup-deploy.ps1                          # Deploy automático
npm run build && npm run export             # Build estático
```

---

## 🆘 **QUANDO USAR ESTE GUIA**

### ✅ **Use para:**
- Encontrar arquivos específicos rapidamente
- Entender estrutura do projeto
- Localizar onde fazer alterações
- Começar desenvolvimento em nova feature
- Orientar novos desenvolvedores

### ❌ **Não use para:**
- Documentação técnica detalhada (veja outros .md)
- Implementação específica de código
- Troubleshooting de bugs específicos
- Configuração inicial do ambiente

---

**📍 Para documentação completa**: Veja `OVERVIEW-COMPLETO-PROJETO.md`  
**🧭 Para NavBar**: Comece com `NAVBAR-INICIO-AQUI.md`  
**📋 Para implementação**: Veja `DOCUMENTACAO_COMPLETA_SISTEMA.md`