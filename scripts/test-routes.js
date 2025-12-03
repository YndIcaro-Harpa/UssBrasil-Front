/**
 * Script para testar todas as rotas do frontend USS Brasil
 * Execute com: node scripts/test-routes.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Lista de todas as rotas do frontend
const routes = [
  // Páginas principais
  { path: '/', name: 'Home' },
  { path: '/produtos', name: 'Produtos' },
  { path: '/categorias', name: 'Categorias' },
  { path: '/ofertas', name: 'Ofertas' },
  { path: '/lancamentos', name: 'Lançamentos' },
  { path: '/novidades', name: 'Novidades' },
  
  // Carrinho e Checkout
  { path: '/carrinho', name: 'Carrinho' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/favoritos', name: 'Favoritos' },
  { path: '/pedido-confirmado', name: 'Pedido Confirmado' },
  
  // Usuário
  { path: '/perfil', name: 'Perfil' },
  { path: '/meus-pedidos', name: 'Meus Pedidos' },
  { path: '/rastreamento', name: 'Rastreamento' },
  
  // Marcas
  { path: '/brands', name: 'Marcas' },
  { path: '/iphone17', name: 'iPhone 17' },
  { path: '/iphone17-pro', name: 'iPhone 17 Pro' },
  { path: '/vip', name: 'VIP' },
  
  // Institucional
  { path: '/sobre', name: 'Sobre' },
  { path: '/contato', name: 'Contato' },
  { path: '/blog', name: 'Blog' },
  { path: '/faq', name: 'FAQ' },
  { path: '/como-comprar', name: 'Como Comprar' },
  { path: '/garantia', name: 'Garantia' },
  { path: '/politica-troca', name: 'Política de Troca' },
  { path: '/trocas-devolucoes', name: 'Trocas e Devoluções' },
  { path: '/metodos-envio', name: 'Métodos de Envio' },
  { path: '/seguranca-pagamentos', name: 'Segurança de Pagamentos' },
  
  // Suporte
  { path: '/suporte', name: 'Suporte' },
  { path: '/atendimento', name: 'Atendimento' },
  { path: '/central-ajuda', name: 'Central de Ajuda' },
  
  // Outros
  { path: '/imprensa', name: 'Imprensa' },
  { path: '/trabalhe-conosco', name: 'Trabalhe Conosco' },
  
  // Admin
  { path: '/admin', name: 'Admin Dashboard' },
  
  // API Health
  { path: '/api/health', name: 'API Health' },
];

// Função para testar uma rota
async function testRoute(route) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${route.path}`;
    const client = url.startsWith('https') ? https : http;
    
    const startTime = Date.now();
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      const duration = Date.now() - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: route.name,
          path: route.path,
          status: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400,
          message: res.statusCode >= 200 && res.statusCode < 400 
            ? 'OK' 
            : `HTTP ${res.statusCode}`
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        name: route.name,
        path: route.path,
        status: 0,
        duration: Date.now() - startTime,
        success: false,
        message: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: route.name,
        path: route.path,
        status: 0,
        duration: 10000,
        success: false,
        message: 'Timeout (10s)'
      });
    });
  });
}

// Função principal
async function main() {
  console.log('\n🔍 USS BRASIL - Teste de Rotas do Frontend');
  console.log('='.repeat(60));
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📊 Total de rotas: ${routes.length}`);
  console.log('='.repeat(60) + '\n');
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    const statusText = result.success 
      ? `${result.status} (${result.duration}ms)`
      : result.message;
    
    console.log(`${icon} ${route.name.padEnd(25)} ${route.path.padEnd(30)} ${statusText}`);
    
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO');
  console.log('='.repeat(60));
  console.log(`✅ Rotas funcionando: ${passed}`);
  console.log(`❌ Rotas com erro: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / routes.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  Rotas com problemas:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.path}: ${r.message}`);
    });
  }
  
  console.log('\n');
  
  // Retorna código de saída baseado nos resultados
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
