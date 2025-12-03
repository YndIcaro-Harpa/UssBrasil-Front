/**
 * Serviço de Exportação - PDF e Excel
 * Gera relatórios exportáveis em múltiplos formatos
 */

// =====================================
// EXPORTAÇÃO EXCEL (CSV compatível)
// =====================================

interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

/**
 * Exporta dados para arquivo Excel (CSV)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string = 'relatorio'
): void {
  if (data.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  // Cabeçalhos
  const headers = columns.map(col => col.label)
  
  // Linhas de dados
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key]
      if (col.format) {
        return `"${col.format(value)}"`
      }
      if (value === null || value === undefined) {
        return '""'
      }
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`
      }
      return `"${value}"`
    })
  )

  // Montar CSV com BOM para Excel reconhecer UTF-8
  const BOM = '\uFEFF'
  const csvContent = BOM + [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n')

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${formatDateForFile()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// =====================================
// EXPORTAÇÃO PDF
// =====================================

interface PDFOptions {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  orientation?: 'portrait' | 'landscape'
  logo?: string
}

/**
 * Exporta dados para arquivo PDF
 * Usa uma abordagem de renderização HTML->Print
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  options: PDFOptions
): void {
  if (data.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  const { title, subtitle, columns, orientation = 'portrait' } = options

  // Gerar HTML do relatório
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4 ${orientation};
          margin: 15mm;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 10pt;
          color: #333;
          line-height: 1.4;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 2px solid #1a1a2e;
          margin-bottom: 20px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1a1a2e 0%, #4a4a6a 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14pt;
        }
        
        .company-name {
          font-size: 16pt;
          font-weight: bold;
          color: #1a1a2e;
        }
        
        .report-info {
          text-align: right;
        }
        
        .report-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1a1a2e;
        }
        
        .report-date {
          font-size: 9pt;
          color: #666;
          margin-top: 4px;
        }
        
        .subtitle {
          font-size: 10pt;
          color: #666;
          margin-bottom: 15px;
        }
        
        .summary {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-label {
          font-size: 8pt;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .summary-value {
          font-size: 14pt;
          font-weight: bold;
          color: #1a1a2e;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        th {
          background: #1a1a2e;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-size: 9pt;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        th:first-child {
          border-radius: 6px 0 0 0;
        }
        
        th:last-child {
          border-radius: 0 6px 0 0;
        }
        
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e9ecef;
          font-size: 9pt;
        }
        
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        tr:hover {
          background: #e9ecef;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          color: #999;
        }
        
        .page-number {
          text-align: right;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <div class="logo">USS</div>
          <span class="company-name">USS Brasil</span>
        </div>
        <div class="report-info">
          <div class="report-title">${title}</div>
          <div class="report-date">Gerado em: ${formatDateTime(new Date())}</div>
        </div>
      </div>
      
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total de Registros</div>
          <div class="summary-value">${data.length}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => {
                const value = item[col.key]
                const formatted = col.format ? col.format(value) : (value ?? '-')
                return `<td>${formatted}</td>`
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <div>USS Brasil - Sistema de Gestão</div>
        <div class="page-number">Documento gerado automaticamente</div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 1000);
        }
      </script>
    </body>
    </html>
  `

  // Abrir janela de impressão
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}

// =====================================
// RELATÓRIOS PRÉ-DEFINIDOS
// =====================================

// Colunas para relatório de produtos
export const productColumns: ExportColumn[] = [
  { key: 'name', label: 'Produto' },
  { key: 'slug', label: 'SKU' },
  { key: 'category', label: 'Categoria', format: (v) => v?.name || '-' },
  { key: 'brand', label: 'Marca', format: (v) => v?.name || '-' },
  { key: 'price', label: 'Preço', format: (v) => formatCurrency(v) },
  { key: 'discountPrice', label: 'Preço Promocional', format: (v) => v ? formatCurrency(v) : '-' },
  { key: 'stock', label: 'Estoque' },
  { key: 'isActive', label: 'Status', format: (v) => v ? 'Ativo' : 'Inativo' },
]

// Colunas para relatório de pedidos
export const orderColumns: ExportColumn[] = [
  { key: 'id', label: 'Pedido', format: (v) => `#${v.slice(-8).toUpperCase()}` },
  { key: 'createdAt', label: 'Data', format: (v) => formatDate(v) },
  { key: 'user', label: 'Cliente', format: (v) => v?.name || '-' },
  { key: 'status', label: 'Status', format: (v) => translateStatus(v) },
  { key: 'paymentStatus', label: 'Pagamento', format: (v) => translatePaymentStatus(v) },
  { key: 'paymentMethod', label: 'Método' },
  { key: 'subtotal', label: 'Subtotal', format: (v) => formatCurrency(v) },
  { key: 'shipping', label: 'Frete', format: (v) => formatCurrency(v) },
  { key: 'total', label: 'Total', format: (v) => formatCurrency(v) },
]

// Colunas para relatório de clientes
export const customerColumns: ExportColumn[] = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'phone', label: 'Telefone' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'createdAt', label: 'Cadastro', format: (v) => formatDate(v) },
  { key: 'isActive', label: 'Status', format: (v) => v ? 'Ativo' : 'Inativo' },
]

// Colunas para relatório de categorias
export const categoryColumns: ExportColumn[] = [
  { key: 'name', label: 'Categoria' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Descrição' },
  { key: '_count', label: 'Produtos', format: (v) => v?.products || 0 },
  { key: 'isActive', label: 'Status', format: (v) => v ? 'Ativa' : 'Inativa' },
]

// =====================================
// FUNÇÕES AUXILIARES
// =====================================

function formatDateForFile(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(value: number): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'PROCESSING': 'Processando',
    'SHIPPED': 'Enviado',
    'DELIVERED': 'Entregue',
    'CANCELLED': 'Cancelado',
  }
  return statusMap[status] || status
}

function translatePaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'PAID': 'Pago',
    'FAILED': 'Falhou',
    'REFUNDED': 'Reembolsado',
  }
  return statusMap[status] || status
}

// =====================================
// EXPORTAÇÕES RÁPIDAS
// =====================================

export function exportProducts(products: any[], format: 'pdf' | 'excel' = 'excel') {
  if (format === 'pdf') {
    exportToPDF(products, {
      title: 'Relatório de Produtos',
      subtitle: `${products.length} produtos encontrados`,
      columns: productColumns,
      orientation: 'landscape'
    })
  } else {
    exportToExcel(products, productColumns, 'produtos')
  }
}

export function exportOrders(orders: any[], format: 'pdf' | 'excel' = 'excel') {
  if (format === 'pdf') {
    exportToPDF(orders, {
      title: 'Relatório de Pedidos',
      subtitle: `${orders.length} pedidos encontrados`,
      columns: orderColumns,
      orientation: 'landscape'
    })
  } else {
    exportToExcel(orders, orderColumns, 'pedidos')
  }
}

export function exportCustomers(customers: any[], format: 'pdf' | 'excel' = 'excel') {
  if (format === 'pdf') {
    exportToPDF(customers, {
      title: 'Relatório de Clientes',
      subtitle: `${customers.length} clientes encontrados`,
      columns: customerColumns,
      orientation: 'portrait'
    })
  } else {
    exportToExcel(customers, customerColumns, 'clientes')
  }
}

export function exportCategories(categories: any[], format: 'pdf' | 'excel' = 'excel') {
  if (format === 'pdf') {
    exportToPDF(categories, {
      title: 'Relatório de Categorias',
      subtitle: `${categories.length} categorias encontradas`,
      columns: categoryColumns,
      orientation: 'portrait'
    })
  } else {
    exportToExcel(categories, categoryColumns, 'categorias')
  }
}

export default {
  exportToExcel,
  exportToPDF,
  exportProducts,
  exportOrders,
  exportCustomers,
  exportCategories,
  productColumns,
  orderColumns,
  customerColumns,
  categoryColumns
}
