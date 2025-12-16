const axios = require('axios')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente do .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
      }
    })
    return envVars
  }
  return {}
}

const env = loadEnv()
const API_URL = env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

console.log('🔧 Usando API URL:', API_URL)

// Teste do checkout com CEP de Santa Catarina
async function testCheckoutWithSCCEP() {
  console.log('🧪 Testando checkout com CEP de Santa Catarina...')

  try {
    // Usar um productId mock (assumindo que existe ou será criado)
    const mockProductId = 'test-product-sc-001'
    const mockProductPrice = 2499.99

    console.log('🔍 Usando produto mock:', mockProductId)

    // 1. Criar pedido na API primeiro
    const orderData = {
      userId: 'guest',
      items: [],
      shippingAddress: {
        street: 'Rua das Flores, 123',
        city: 'Florianópolis',
        state: 'SC',
        zipCode: '88010-000',
        country: 'Brasil',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro'
      },
      paymentMethod: 'CREDIT_CARD',
      subtotal: 2499.99,
      shipping: 25.00,
      discount: 0,
    }

    console.log('📦 Criando pedido na API...')
    const orderResponse = await axios.post(`${API_URL}/orders`, orderData)
    const orderId = orderResponse.data.id
    console.log('✅ Pedido criado:', orderId)

    // 2. Processar pagamento com orderId
    console.log('💳 Processando pagamento...')
    const paymentData = {
      amount: Math.round((orderData.subtotal + orderData.shipping) * 100) / 100, // Arredondar para 2 casas
      currency: 'brl',
      orderId: orderId,
      installments: 1,
      cardNumber: '4242424242424242',
      expiryMonth: 12,
      expiryYear: 2026,
      cvc: '123',
      cardholderName: 'João Silva'
    }

    const paymentResponse = await axios.post(`${API_URL}/stripe/test-payment`, paymentData)
    console.log('✅ Pagamento processado:', paymentResponse.data)

    // 3. Verificar se o pedido foi atualizado corretamente
    console.log('🔍 Verificando pedido atualizado...')
    const updatedOrderResponse = await axios.get(`${API_URL}/orders/${orderId}`)
    const updatedOrder = updatedOrderResponse.data
    console.log('📋 Status do pedido:', updatedOrder)

    // 4. Verificar endereço
    const address = JSON.parse(updatedOrder.shippingAddress)
    console.log('🏠 Endereço salvo:', address)

    if (address.zipCode === '88010-000' && address.city === 'Florianópolis' && address.state === 'SC') {
      console.log('✅ SUCESSO: Endereço correto salvo!')
      console.log('🎉 Correção implementada com sucesso!')
    } else {
      console.log('❌ ERRO: Endereço incorreto salvo!')
      console.log('Esperado: CEP 88010-000, Cidade Florianópolis, Estado SC')
      console.log('Recebido:', address)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message)
    if (error.response?.data?.message?.includes('product')) {
      console.log('💡 Dica: O produto mock não existe. Tente criar um produto real primeiro.')
    }
  }
}

// Executar teste
testCheckoutWithSCCEP()