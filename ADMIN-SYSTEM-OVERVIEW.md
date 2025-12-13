# 📊 OVERVIEW COMPLETO DO SISTEMA DE ADMINISTRAÇÃO - USS BRASIL

## Última Atualização: 13 de Dezembro de 2025

---

## 🎯 VISÃO GERAL DO SISTEMA

O sistema de e-commerce USS Brasil é uma plataforma completa desenvolvida com:
- **Frontend**: Next.js 14 + React + TailwindCSS
- **Backend**: NestJS + Prisma ORM + SQLite
- **Autenticação**: JWT + NextAuth
- **Pagamentos**: Stripe + PIX
- **Email**: Serviço integrado para notificações

---

## 💰 ESTRUTURA DE TAXAS E PRECIFICAÇÃO

### Taxas Aplicadas (Total: 15%)

| Taxa | Porcentagem | Descrição |
|------|-------------|-----------|
| **Taxa do Cartão** | 5.0% | Operadoras de cartão (Visa, Master, etc.) |
| **Taxa do Gateway** | 3.5% | Stripe - processamento de pagamentos |
| **Impostos** | 6.5% | Simples Nacional, ICMS e outras tributações |
| **TOTAL** | **15.0%** | Taxa total sobre o valor da venda |

### Cálculo de Precificação

```
Preço de Venda = Custo × (1 + Margem Desejada) / (1 - Taxa Total)
Preço de Venda = Custo × (1 + Margem) / 0.85
```

### Exemplo Prático
- **Custo do Produto**: R$ 1.300,00
- **Margem Desejada**: 25%
- **Cálculo**: R$ 1.300 × 1.25 / 0.85 = R$ 1.911,76
- **Preço Sugerido**: R$ 1.999,99

### Indicadores de Margem

| Margem | Status | Cor |
|--------|--------|-----|
| ≥ 20% | ✅ Ideal | 🟢 Verde |
| 10% - 19% | ⚠️ Atenção | 🟡 Amarelo |
| < 10% | ❌ Crítico | 🔴 Vermelho |

---

## 📦 MÓDULOS DO SISTEMA

### 1. Gestão de Produtos (`/admin/products`)

**Funcionalidades:**
- CRUD completo de produtos
- Upload múltiplo de imagens
- Variações (cor, armazenamento, tamanho)
- Controle de estoque
- Precificação automática com cálculo de margem
- Categorias e marcas
- SKU e código de barras

**Campos de Precificação:**
| Campo | Descrição |
|-------|-----------|
| `costPrice` | Preço de custo do fornecedor |
| `price` | Preço original de venda |
| `discountPrice` | Preço com desconto |
| `profitMargin` | Margem de lucro calculada |
| `markup` | Markup sobre o custo |

### 2. Gestão de Pedidos (`/admin/orders`)

**Funcionalidades:**
- Lista de pedidos com filtros
- Visualização detalhada com cálculo financeiro
- Atualização de status
- Envio de notificações (Email/WhatsApp)
- Processamento de reembolso via Stripe
- Exportação Excel/PDF
- Criação manual de pedidos

**Status do Pedido:**
| Status | Descrição | Próximo Status |
|--------|-----------|----------------|
| PENDING | Aguardando processamento | PROCESSING |
| PROCESSING | Em preparação | SHIPPED |
| SHIPPED | Enviado ao cliente | DELIVERED |
| DELIVERED | Entregue | - |
| CANCELLED | Cancelado | - |

**Status do Pagamento:**
| Status | Descrição |
|--------|-----------|
| PENDING | Aguardando pagamento |
| PAID | Pago |
| FAILED | Falhou |
| REFUNDED | Reembolsado |

### 3. Gestão de Clientes (`/admin/customers`)

**Funcionalidades:**
- Lista de clientes cadastrados
- Histórico de pedidos por cliente
- Informações de contato
- Endereços cadastrados
- Status VIP

### 4. Gestão de Categorias (`/admin/categories`)

**Funcionalidades:**
- Categorias hierárquicas
- Imagens de categoria
- SEO (meta title, description)
- Status ativo/inativo

### 5. Gestão de Marcas (`/admin/brands`)

**Funcionalidades:**
- Cadastro de marcas
- Logo da marca
- Descrição e informações

### 6. Gestão de Cupons (`/admin/coupons`)

**Funcionalidades:**
- Cupons de desconto (porcentagem/valor fixo)
- Código único
- Validade
- Limite de usos
- Valor mínimo do pedido

### 7. Dashboard (`/admin`)

**Métricas Exibidas:**
- Receita total
- Total de pedidos
- Pedidos por status
- Gráficos de vendas
- Produtos mais vendidos
- Clientes recentes

---

## 🛒 FLUXO DO PEDIDO

```
1. Cliente adiciona produtos ao carrinho
    ↓
2. Cliente finaliza compra (checkout)
    ↓
3. Pagamento processado (Stripe/PIX)
    ↓
4. Pedido criado com status PENDING
    ↓
5. Email de confirmação enviado
    ↓
6. Admin processa pedido (PROCESSING)
    ↓
7. Admin envia pedido (SHIPPED)
    → Código de rastreio adicionado
    → Notificação enviada ao cliente
    ↓
8. Pedido entregue (DELIVERED)
    → Data de entrega registrada
```

---

## 📧 SISTEMA DE NOTIFICAÇÕES

### Notificações Automáticas por Status

| Mudança de Status | Email | WhatsApp |
|-------------------|-------|----------|
| PENDING → PROCESSING | ✅ | ✅ |
| PROCESSING → SHIPPED | ✅ + Rastreio | ✅ + Rastreio |
| SHIPPED → DELIVERED | ✅ | ✅ |
| Qualquer → CANCELLED | ✅ | ✅ |
| PAID → REFUNDED | ✅ | ✅ |

### Templates de Email Disponíveis
- Confirmação de pedido
- Atualização de status
- Confirmação de pagamento
- Código de rastreio
- Pedido entregue
- Pedido cancelado
- Reembolso processado

---

## 💳 MÉTODOS DE PAGAMENTO

| Método | Integração | Taxas |
|--------|------------|-------|
| Cartão de Crédito | Stripe | 5% + 3.5% |
| Cartão de Débito | Stripe | 3.5% |
| PIX | Stripe | 0% (apenas impostos) |
| Boleto | - | 2% |

### Parcelamento
- Até 12x sem juros (acima de R$ 300)
- Até 6x sem juros (R$ 150 - R$ 299)
- Até 3x sem juros (abaixo de R$ 150)

---

## 📊 CÁLCULO FINANCEIRO DO PEDIDO

### Fórmulas Utilizadas

```typescript
// Receita
receita = subtotal + frete - desconto

// Custo Total dos Produtos
custoTotal = Σ(custoUnitário × quantidade)

// Taxas
taxaCartao = receita × 0.05      // 5%
taxaGateway = receita × 0.035    // 3.5%
taxaImpostos = receita × 0.065   // 6.5%
taxasTotal = receita × 0.15      // 15%

// Lucro Líquido
lucroLiquido = receita - custoTotal - taxasTotal - frete

// Margem de Lucro
margemLucro = (lucroLiquido / receita) × 100
```

### Exemplo de Pedido

```
Pedido #ABC12345
─────────────────────────────────
Produto: iPhone 15 Pro 128GB
  Quantidade: 1
  Preço: R$ 8.499,00
  Custo: R$ 6.500,00

RECEITA
  Subtotal:        R$  8.499,00
  Frete:           R$     89,90
  Desconto:        R$    849,90
  ─────────────────────────────
  Total:           R$  7.739,00

CUSTOS
  Custo Produtos:  R$  6.500,00
  Frete (custo):   R$     45,00

TAXAS (15% de R$ 7.739,00)
  Cartão (5%):     R$    386,95
  Gateway (3.5%):  R$    270,87
  Impostos (6.5%): R$    503,04
  ─────────────────────────────
  Total Taxas:     R$  1.160,85

RESULTADO
  Lucro Líquido:   R$     33,15
  Margem:          0.43%
  Status:          ❌ Crítico
```

---

## 🔐 NÍVEIS DE ACESSO

| Nível | Permissões |
|-------|------------|
| **SUPER_ADMIN** | Acesso total, configurações do sistema |
| **ADMIN** | CRUD completo, relatórios, pedidos |
| **MANAGER** | Pedidos, estoque, clientes |
| **SUPPORT** | Visualização, atendimento ao cliente |

---

## 🗂️ ESTRUTURA DO BANCO DE DADOS

### Principais Entidades

```prisma
User {
  id, email, name, phone, cpf
  role, isVip, image
  address, city, state, zipCode
  cart, wishlist, orders
}

Product {
  id, name, slug, description
  price, costPrice, discountPrice
  profitMargin, markup
  stock, images, sku, barcode
  weight, width, height, depth
  category, brand, variations
}

Order {
  id, userId, status, paymentStatus
  paymentMethod, installments
  subtotal, shipping, discount, total
  shippingAddress, trackingCode
  notes, estimatedDelivery, deliveredAt
  items, user, coupon
}

OrderItem {
  id, orderId, productId
  quantity, price
  selectedColor, selectedStorage
  selectedSize, variationId
}
```

---

## 📈 BOAS PRÁTICAS DE OPERAÇÃO

### Diárias
- [ ] Verificar pedidos pendentes
- [ ] Processar pagamentos PIX aguardando confirmação
- [ ] Atualizar status de pedidos enviados
- [ ] Responder mensagens de clientes

### Semanais
- [ ] Revisar estoque baixo
- [ ] Analisar produtos sem vendas
- [ ] Verificar margens de lucro
- [ ] Exportar relatório de vendas

### Mensais
- [ ] Análise de performance por categoria
- [ ] Revisão de preços de custo
- [ ] Avaliação de cupons/promoções
- [ ] Relatório financeiro completo

---

## 🚀 COMANDOS ÚTEIS

### Iniciar Sistema

```bash
# Backend (pasta /backend)
npm run start:dev

# Frontend (pasta raiz)
npm run dev
```

### URLs

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| Desenvolvimento | http://localhost:3000 | http://localhost:3001 |
| Admin | http://localhost:3000/admin | - |

### API Endpoints Principais

```
GET    /products         - Listar produtos
GET    /products/:id     - Detalhes do produto
POST   /products         - Criar produto
PUT    /products/:id     - Atualizar produto
DELETE /products/:id     - Remover produto

GET    /orders           - Listar pedidos
GET    /orders/:id       - Detalhes do pedido
POST   /orders           - Criar pedido
PATCH  /orders/:id/status     - Atualizar status
PATCH  /orders/:id/payment    - Atualizar pagamento
POST   /orders/:id/notify     - Enviar notificação

GET    /users            - Listar clientes
GET    /users/:id        - Detalhes do cliente

GET    /categories       - Listar categorias
GET    /brands           - Listar marcas
GET    /coupons          - Listar cupons
```

---

## ⚙️ CONFIGURAÇÕES DO SISTEMA

### Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="email@gmail.com"
SMTP_PASS="senha-app"

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 📞 SUPORTE E CONTATOS

- **Email Técnico**: suporte@ussbrasil.com.br
- **Documentação API**: /api/docs (Swagger)
- **Logs do Sistema**: /backend/logs/

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Funcionalidades Core ✅
- [x] CRUD de Produtos
- [x] CRUD de Pedidos
- [x] CRUD de Clientes
- [x] CRUD de Categorias
- [x] CRUD de Marcas
- [x] CRUD de Cupons
- [x] Sistema de Autenticação
- [x] Dashboard Admin
- [x] Carrinho de Compras
- [x] Lista de Desejos
- [x] Checkout
- [x] Pagamentos Stripe

### Funcionalidades Avançadas ✅
- [x] Cálculo de Margem/Lucro
- [x] Sistema de Notificações
- [x] Exportação Excel/PDF
- [x] Modal Detalhado de Pedidos
- [x] Persistência Carrinho/Favoritos
- [x] Processamento de Reembolso
- [x] Rastreamento de Pedidos

### Pendentes/Futuras 📋
- [ ] Relatórios avançados (BI)
- [ ] Integração com Correios API
- [ ] Sistema de Avaliações
- [ ] Chat ao vivo
- [ ] App Mobile

---

*Documento gerado automaticamente. Para atualizações, consulte a equipe de desenvolvimento.*
