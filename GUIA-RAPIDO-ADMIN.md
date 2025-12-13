# 📱 GUIA RÁPIDO DE ADMINISTRAÇÃO - USS BRASIL

## 🚀 Acesso ao Sistema

**URL Admin:** http://localhost:3000/admin  
**Credenciais Padrão:**
- Email: admin@ussbrasil.com
- Senha: admin123

---

## 📋 WORKFLOW DIÁRIO

### Manhã (Início do Expediente)

1. **Acessar Dashboard** (`/admin`)
   - Verificar métricas do dia anterior
   - Ver pedidos pendentes

2. **Processar Pedidos Pendentes** (`/admin/orders`)
   - Filtrar por status "Pendente"
   - Verificar pagamentos confirmados
   - Mover para "Processando"

### Durante o Dia

3. **Preparar Pedidos**
   - Na listagem, clicar no ícone 👁️ para ver detalhes
   - Ver todos os itens, variações e quantidades
   - Verificar endereço de entrega
   - Preparar a embalagem

4. **Enviar Pedidos**
   - Após empacotar, atualizar para "Enviado"
   - Inserir código de rastreio
   - Sistema envia notificação automática

### Final do Dia

5. **Revisar Vendas**
   - Verificar faturamento
   - Analisar lucro líquido
   - Exportar relatório (Excel/PDF)

---

## 🖱️ AÇÕES PRINCIPAIS

### Visualizar Pedido Completo

1. Acesse `/admin/orders`
2. Clique no ícone 👁️ (olho) na linha do pedido
3. Modal abre com 5 abas:
   - **Resumo**: Métricas gerais, lucro, taxas
   - **Produtos**: Lista completa com variações e cálculo individual
   - **Cliente**: Dados completos do comprador
   - **Financeiro**: Breakdown de custos, taxas e lucro
   - **Ações**: Botões para atualizar status e notificar

### Atualizar Status do Pedido

**Método 1 - Rápido:**
- Na tabela, clicar no ícone ✓ (check) avança para próximo status

**Método 2 - Na Modal:**
1. Abrir detalhes do pedido
2. Ir na aba "Ações"
3. Clicar no status desejado

### Enviar Notificação ao Cliente

1. Abrir detalhes do pedido
2. Aba "Ações" ou aba "Cliente"
3. Clicar em "Enviar Email" ou "WhatsApp"

### Processar Reembolso

1. Abrir detalhes do pedido
2. Se pagamento estiver "Pago", aparece botão "Processar Reembolso"
3. Confirmar a operação
4. Sistema atualiza Stripe e notifica cliente

---

## 💰 ENTENDENDO O FINANCEIRO

### Na Modal de Detalhes

**Aba Resumo - Cards Superiores:**
- 🟢 **Total do Pedido**: Valor pago pelo cliente
- 🔵 **Lucro Líquido**: Seu ganho real
- 🟣 **Qtd. Produtos**: Total de itens
- 🟠 **Taxas Totais**: 15% do valor

**Aba Financeiro - Detalhamento:**

```
RECEITA
├── Subtotal dos Produtos
├── Frete Cobrado
└── (-) Desconto Aplicado
    ─────────────────
    = Total Recebido

CUSTOS
├── Custo dos Produtos (preço de custo)
└── Frete (custo real)

TAXAS (15%)
├── Cartão: 5%
├── Gateway (Stripe): 3.5%
└── Impostos: 6.5%
    ─────────────────
    = Total Taxas

RESULTADO
└── Lucro Líquido = Receita - Custos - Taxas
```

### Indicadores de Margem

| Cor | Margem | Significado |
|-----|--------|-------------|
| 🟢 Verde | ≥ 20% | Excelente! Margem saudável |
| 🟡 Amarelo | 10-19% | Atenção! Revisar precificação |
| 🔴 Vermelho | < 10% | Crítico! Prejuízo provável |

---

## 📦 GESTÃO DE PRODUTOS

### Cadastrar Novo Produto

1. Acesse `/admin/products`
2. Clique "Novo Produto"
3. Preencha:
   - Nome, descrição, SKU
   - **Preço de Custo** (importante para cálculos!)
   - Preço de venda
   - Estoque
   - Imagens
   - Variações (se houver)

### Dica de Precificação

Use a fórmula:
```
Preço = Custo × 1.47 (para margem de 25%)
```

**Tabela Rápida:**
| Custo | Margem 20% | Margem 25% | Margem 30% |
|-------|------------|------------|------------|
| R$ 500 | R$ 735 | R$ 860 | R$ 1.005 |
| R$ 1.000 | R$ 1.470 | R$ 1.720 | R$ 2.010 |
| R$ 2.000 | R$ 2.940 | R$ 3.440 | R$ 4.020 |

---

## 📊 RELATÓRIOS

### Exportar Pedidos

1. Em `/admin/orders`
2. Aplicar filtros desejados
3. Clicar em:
   - 📊 **Excel**: Planilha completa
   - 📄 **PDF**: Relatório formatado

### Dashboard de Métricas

Em `/admin`, visualize:
- Receita do período
- Gráfico de vendas
- Pedidos por status
- Produtos mais vendidos

---

## ⚡ ATALHOS E DICAS

### Filtros Rápidos (Página de Pedidos)

- Digite no campo de busca: ID, nome do cliente, email, produto
- Selecione status no dropdown
- Use datas para período específico

### Ações em Lote

1. Selecione múltiplos pedidos
2. Use "Ações em Lote"
3. Atualize status de todos de uma vez

### Copiar Dados Rapidamente

Em qualquer modal, clique no ícone 📋 ao lado de:
- ID do pedido
- Email do cliente
- Código de rastreio
- Endereço completo

---

## 🔧 RESOLUÇÃO DE PROBLEMAS

### Pedido não aparece na lista
- Verifique os filtros ativos
- Clique em "Limpar filtros"
- Clique em "Atualizar"

### Erro ao atualizar status
- Verifique sua conexão
- Backend pode estar offline
- Tente novamente em alguns segundos

### Cliente não recebeu notificação
- Verifique se email está correto
- Verifique SMTP nas configurações
- Tente reenviar manualmente

### Cálculo de lucro zerado
- Verifique se o produto tem "Preço de Custo" cadastrado
- Produtos sem custo usam preço de venda como referência

---

## 📞 Suporte

- Email: suporte@ussbrasil.com.br
- WhatsApp: (48) 99999-9999
- Documentação: `/docs/admin`

---

*Guia atualizado em 13/12/2025*
