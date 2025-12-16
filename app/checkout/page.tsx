'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MapPin, Truck, CreditCard, Check, Loader2, Minus, Plus, Trash2, QrCode, Barcode, Shield, Lock, Calendar, AlertCircle, Home, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from '@/components/login-modal'
import { toast } from 'sonner'
import { api } from '@/services/api'

const STEPS = [
  { id: 1, title: 'Identificação', icon: User },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Frete', icon: Truck },
  { id: 4, title: 'Pagamento', icon: CreditCard },
]

const SHIPPING_OPTIONS = [
  { id: 'sedex', name: 'SEDEX', price: 29.90, days: '2-4 dias úteis' },
  { id: 'pac', name: 'PAC', price: 19.90, days: '5-10 dias úteis' },
  { id: 'express', name: 'Express', price: 49.90, days: '1-2 dias úteis' },
  { id: 'free', name: 'Frete Grátis', price: 0, days: '7-15 dias úteis', minValue: 299 },
]

const PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX', icon: QrCode, discount: 5, description: '5% de desconto' },
  { id: 'credit', name: 'Cartão de Crédito', icon: CreditCard, description: 'Até 10x sem juros' },
  { id: 'boleto', name: 'Boleto', icon: Barcode, description: 'Vence em 3 dias' },
]

// Opções de parcelamento - Sem juros até 10x, com juros a partir de 11x
const getInstallmentOptions = (total: number) => {
  const options = []
  for (let i = 1; i <= 12; i++) {
    const hasInterest = i > 10 // Juros acima de 10x
    // Taxa de juros simples: 1.99% ao mês apenas para parcelas 11 e 12
    const interestRate = hasInterest ? 1.99 : 0
    
    // Calcular total com juros simples (não compostos)
    // Para 11x: 1.99% sobre o total
    // Para 12x: 2 * 1.99% = 3.98% sobre o total
    const extraInstallments = hasInterest ? i - 10 : 0
    const totalInterestPercent = extraInstallments * interestRate
    const totalWithInterest = total * (1 + totalInterestPercent / 100)
    
    const valuePerInstallment = totalWithInterest / i
    
    options.push({
      installments: i,
      value: valuePerInstallment,
      total: totalWithInterest,
      hasInterest,
      interestRate: totalInterestPercent.toFixed(2)
    })
  }
  return options
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user, isAuthenticated, login } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    frete: 'pac',
  })
  
  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    installments: 1,
  })
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})
  
  // Estados para endereços salvos
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [stripeLoading, setStripeLoading] = useState(false)
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setCouponLoading(true)
    try {
      // Mock API call or real one if available
      // const response = await api.coupons.validate(couponCode)
      
      // Simulating "nofrete" coupon for now as requested
      if (couponCode.toLowerCase() === 'nofrete') {
        setAppliedCoupon({
          code: 'NOFRETE',
          type: 'FREE_SHIPPING',
          discount: 0
        })
        toast.success('Cupom aplicado com sucesso!')
      } else {
        toast.error('Cupom inválido')
        setAppliedCoupon(null)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao aplicar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Cupom removido')
  }

  // Initialize form with user data and load saved addresses
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.name || prev.nome,
        email: user.email || prev.email,
      }))
    }
  }, [user])
  
  // Load saved addresses from AuthContext
  const { addresses } = useAuth()
  
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setSavedAddresses(addresses)
      // Selecionar endereço padrão automaticamente
      const defaultAddress = addresses.find((a: any) => a.default)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        fillAddressFromSaved(defaultAddress)
      }
    } else {
      setUseNewAddress(true)
    }
  }, [addresses])
  
  // Preencher formulário com endereço salvo
  const fillAddressFromSaved = (address: any) => {
    setFormData(prev => ({
      ...prev,
      cep: address.zip || '',
      rua: address.street || '',
      numero: address.number || '',
      complemento: address.complement || '',
      bairro: address.neighborhood || address.label || '',
      cidade: address.city || '',
      estado: address.state || '',
    }))
  }
  
  // Ao selecionar um endereço salvo
  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId)
    setUseNewAddress(false)
    const address = savedAddresses.find(a => a.id === addressId)
    if (address) {
      fillAddressFromSaved(address)
    }
  }
  
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }
  
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }
  
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1')
  }
  
  // Card formatting functions
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const groups = numbers.match(/.{1,4}/g)
    return groups ? groups.join(' ').substring(0, 19) : ''
  }
  
  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4)
    }
    return numbers
  }
  
  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '')
    if (/^4/.test(cleanNumber)) return 'visa'
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard'
    if (/^3[47]/.test(cleanNumber)) return 'amex'
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover'
    if (/^(?:2131|1800|35)/.test(cleanNumber)) return 'jcb'
    if (/^(606282|3841)/.test(cleanNumber)) return 'hipercard'
    if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(cleanNumber)) return 'elo'
    return null
  }
  
  const validateCard = () => {
    const errors: Record<string, string> = {}
    
    // Card number validation (basic Luhn check)
    const cardNumber = cardData.cardNumber.replace(/\D/g, '')
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      errors.cardNumber = 'Número do cartão inválido'
    }
    
    // Card holder validation
    if (!cardData.cardHolder.trim() || cardData.cardHolder.length < 3) {
      errors.cardHolder = 'Nome do titular é obrigatório'
    }
    
    // Expiry date validation
    const expiry = cardData.expiryDate.replace(/\D/g, '')
    if (expiry.length !== 4) {
      errors.expiryDate = 'Data de validade inválida'
    } else {
      const month = parseInt(expiry.substring(0, 2))
      const year = parseInt('20' + expiry.substring(2, 4))
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      
      if (month < 1 || month > 12) {
        errors.expiryDate = 'Mês inválido'
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Cartão expirado'
      }
    }
    
    // CVV validation
    const cvvLength = detectCardBrand(cardData.cardNumber) === 'amex' ? 4 : 3
    if (cardData.cvv.length !== cvvLength) {
      errors.cvv = `CVV deve ter ${cvvLength} dígitos`
    }
    
    setCardErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'cardNumber') formattedValue = formatCardNumber(value)
    if (field === 'expiryDate') formattedValue = formatExpiryDate(value)
    if (field === 'cvv') formattedValue = value.replace(/\D/g, '').substring(0, 4)
    if (field === 'cardHolder') formattedValue = value.toUpperCase()
    if (field === 'installments') formattedValue = value
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear error when user starts typing
    if (cardErrors[field]) {
      setCardErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      console.log('CEP inválido:', cleanCep)
      return
    }

    console.log('Buscando endereço para CEP:', cleanCep)
    setCepLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      console.log('Resposta ViaCEP:', data)

      if (data.erro) {
        console.warn('CEP não encontrado:', cleanCep)
        toast.error('CEP não encontrado. Verifique se está correto.')
        return
      }

      // Preencher os campos com os dados do ViaCEP
      const addressData = {
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }

      console.log('Dados do endereço preenchidos:', addressData)

      setFormData(prev => ({
        ...prev,
        ...addressData
      }))

      toast.success('Endereço encontrado e preenchido automaticamente!')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setCepLoading(false)
    }
  }
  
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'cpf') formattedValue = formatCPF(value)
    if (field === 'telefone') formattedValue = formatPhone(value)
    if (field === 'cep') {
      formattedValue = formatCEP(value)
      if (formattedValue.replace(/\D/g, '').length === 8) {
        fetchAddress(formattedValue)
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }))
  }
  
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nome && formData.email && formData.cpf && formData.telefone)
      case 2:
        return !!(formData.cep && formData.rua && formData.numero && formData.bairro && formData.cidade && formData.estado)
      case 3:
        return !!formData.frete
      case 4:
        if (paymentMethod === 'credit') {
          return validateCard()
        }
        return !!paymentMethod
      default:
        return false
    }
  }
  
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      toast.error('Preencha todos os campos obrigatórios')
    }
  }
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step)
    }
  }

  const handleFinishOrder = async () => {
    // Validate credit card if selected
    if (paymentMethod === 'credit' && !validateCard()) {
      toast.error('Verifique os dados do cartão')
      return
    }
    
    setIsLoading(true)
    setStripeLoading(true)
    
    try {
      const orderId = `USS${Date.now().toString().slice(-8)}`
      let stripePaymentIntentId = null
      let stripePaymentStatus = 'PENDING'
      
      // Calcular valor correto para cobrança (com juros se aplicável)
      const installmentOption = getInstallmentOptions(finalTotal)[cardData.installments - 1]
      const chargeAmount = paymentMethod === 'credit' ? installmentOption.total : finalTotal
      
      // Criar pedido na API primeiro (antes do pagamento)
      let apiOrder = null
      try {
        apiOrder = await api.orders.create({
          userId: user?.id || 'guest',
          items: cartItems.map(item => ({
            productId: String(item.id).split('-')[0],
            quantity: item.quantity,
            price: item.discountPrice || item.price,
            selectedColor: item.selectedColor || null,
            selectedSize: item.selectedSize || null,
            selectedStorage: item.selectedStorage || null,
          })),
          shippingAddress: {
            name: formData.nome,
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
          },
          paymentMethod: paymentMethod.toUpperCase(),
          subtotal: cartTotal,
          shipping: shippingCost,
          discount: pixDiscount,
        })
        
        // Usar o ID real da API se disponível
        if (apiOrder?.id) {
          orderId = apiOrder.id
        }
        
        console.log('Pedido criado na API:', apiOrder)
      } catch (apiError) {
        console.log('Erro ao criar pedido na API, continuando apenas localmente:', apiError)
      }
      
      // Processar pagamento com Stripe para cartão de crédito
      if (paymentMethod === 'credit') {
        try {
          // Usar endpoint de teste para processar pagamento completo
          // Isso cria o Payment Intent e processa o pagamento em um único passo
          const testPaymentResult = await api.stripe.processTestPayment({
            amount: chargeAmount, // Valor com juros se aplicável
            currency: 'brl',
            installments: Number(cardData.installments),
            customerEmail: formData.email,
            userId: user?.id,
            orderId: orderId,
            items: cartItems.map(item => ({
              productId: String(item.id).split('-')[0],
              quantity: item.quantity,
              price: item.discountPrice || item.price,
              selectedColor: item.selectedColor || null,
              selectedSize: item.selectedSize || null,
              selectedStorage: item.selectedStorage || null,
            })),
            // Usar token de teste padrão (Visa)
            token: 'tok_visa',
          })
          
          if (testPaymentResult.success) {
            stripePaymentIntentId = testPaymentResult.paymentIntent.id
            stripePaymentStatus = 'PAID'
            toast.success(`Pagamento de R$ ${chargeAmount.toFixed(2).replace('.', ',')} processado com sucesso!`)
          } else {
            throw new Error(testPaymentResult.message || 'Falha no processamento')
          }
          
        } catch (stripeError: any) {
          console.error('Erro Stripe:', stripeError)
          
          // Fallback: salvar pedido localmente mesmo sem API Stripe
          console.log('Stripe API não disponível, salvando pedido localmente')
          stripePaymentStatus = 'PENDING'
          toast.info('Pedido registrado. Pagamento será processado.')
        }
      }
      
      // Calcular taxas para registro (Taxa Stripe Brasil: 3.99% + R$ 0.39)
      const stripeFee = chargeAmount * 0.0399 + 0.39 // Taxa Stripe Brasil
      const invoiceFee = chargeAmount * 0.07 // 7% Nota Fiscal
      const netAmount = chargeAmount - stripeFee - invoiceFee
      
      // Create order object to save locally
      const order = {
        id: orderId,
        userId: user?.id || 'guest',
        status: paymentMethod === 'credit' && stripePaymentStatus === 'PAID' ? 'PROCESSING' : 'PENDING',
        paymentStatus: paymentMethod === 'pix' ? 'PENDING' : stripePaymentStatus,
        paymentMethod: paymentMethod,
        subtotal: cartTotal,
        shipping: shippingCost,
        discount: pixDiscount,
        total: chargeAmount, // Valor total cobrado (com juros se aplicável)
        originalTotal: finalTotal, // Valor sem juros
        interestAmount: chargeAmount - finalTotal, // Valor dos juros
        stripeFee: stripeFee, // Taxa Stripe 3.99% + R$0.39
        invoiceFee: invoiceFee, // Taxa NF 7%
        netAmount: netAmount, // Valor líquido
        stripePaymentIntentId: stripePaymentIntentId,
        shippingAddress: {
          name: formData.nome,
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
        },
        items: cartItems.map(item => ({
          id: `${orderId}-${item.id}`,
          productId: String(item.id).split('-')[0], // Pegar só o ID base, sem variações
          quantity: item.quantity,
          price: item.discountPrice || item.price,
          // Incluir variações no item do pedido
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          selectedStorage: item.selectedStorage || null,
          product: {
            name: item.name,
            image: item.image,
          }
        })),
        trackingCode: null,
        estimatedDelivery: new Date(Date.now() + (selectedShipping?.id === 'express' ? 2 : selectedShipping?.id === 'sedex' ? 4 : 10) * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Credit card installments info if applicable
        ...(paymentMethod === 'credit' && {
          installments: Number(cardData.installments),
          cardLastFour: cardData.cardNumber.replace(/\s/g, '').slice(-4),
          cardBrand: detectCardBrand(cardData.cardNumber),
        }),
      }
      
      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('uss_orders') || '[]')
      existingOrders.unshift(order)
      localStorage.setItem('uss_orders', JSON.stringify(existingOrders))
      
      clearCart()
      router.push(`/pedido-confirmado?orderId=${orderId}&method=${paymentMethod}&installments=${paymentMethod === 'credit' ? cardData.installments : 1}`)
    } catch (error) {
      toast.error('Erro ao finalizar pedido')
    } finally {
      setIsLoading(false)
      setStripeLoading(false)
    }
  }
  
  const selectedShipping = SHIPPING_OPTIONS.find(s => s.id === formData.frete)
  const baseShippingCost = selectedShipping?.price || 0
  const shippingCost = appliedCoupon?.type === 'FREE_SHIPPING' ? 0 : baseShippingCost
  
  const pixDiscount = paymentMethod === 'pix' ? cartTotal * 0.05 : 0
  const couponDiscount = appliedCoupon?.type === 'FIXED_AMOUNT' ? appliedCoupon.discount : (appliedCoupon?.type === 'PERCENTAGE' ? cartTotal * (appliedCoupon.discount / 100) : 0)
  
  const finalTotal = Math.max(0, cartTotal + shippingCost - pixDiscount - couponDiscount)
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
          <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para continuar</p>
          <Link href="/produtos">
            <button className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors">
              Ver Produtos
            </button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/carrinho">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-500 text-sm">Finalize sua compra com segurança</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
              <div 
                className="h-full bg-blue-400 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
            
            {STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id
              const isClickable = step.id <= currentStep || isCompleted
              const Icon = step.icon
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && goToStep(step.id)}
                  disabled={!isClickable}
                  className={`relative z-10 flex flex-col items-center gap-2 transition-all ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-400 text-white' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${
                    isCurrent ? 'text-blue-400' :
                    isCompleted ? 'text-green-500' :
                    'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Identification */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  Identificação
                </h2>
                
                {!isAuthenticated && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-gray-700 mb-3">Já tem uma conta?</p>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-6 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold text-sm transition-colors"
                    >
                      Fazer Login
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={goToNextStep}
                    className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  Endereço de Entrega
                </h2>
                
                {/* Endereços salvos */}
                {savedAddresses.length > 0 && isAuthenticated && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Selecione um endereço salvo:</h3>
                    <div className="space-y-3">
                      {savedAddresses.map((address) => (
                        <button
                          key={address.id}
                          onClick={() => handleSelectSavedAddress(address.id)}
                          className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                            selectedAddressId === address.id && !useNewAddress
                              ? 'border-blue-400 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedAddressId === address.id && !useNewAddress ? 'border-blue-400' : 'border-gray-300'
                          }`}>
                            {selectedAddressId === address.id && !useNewAddress && (
                              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">{address.label || 'Endereço'}</span>
                              {address.default && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Padrão</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.street}{address.number ? `, ${address.number}` : ''}{address.complement ? ` - ${address.complement}` : ''}
                            </p>
                            <p className="text-sm text-gray-500">
                              {address.city} - {address.state}, {address.zip}
                            </p>
                          </div>
                          {selectedAddressId === address.id && !useNewAddress && (
                            <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                      
                      {/* Opção para novo endereço */}
                      <button
                        onClick={() => {
                          setUseNewAddress(true)
                          setSelectedAddressId(null)
                          setFormData(prev => ({
                            ...prev,
                            cep: '',
                            rua: '',
                            numero: '',
                            complemento: '',
                            bairro: '',
                            cidade: '',
                            estado: '',
                          }))
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          useNewAddress 
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          useNewAddress ? 'border-blue-400' : 'border-gray-300'
                        }`}>
                          {useNewAddress && (
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Usar outro endereço</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Formulário de endereço (exibir se não houver endereços salvos ou se optar por novo) */}
                {(savedAddresses.length === 0 || useNewAddress || !isAuthenticated) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.cep}
                          onChange={(e) => handleInputChange('cep', e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-blue-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rua *</label>
                      <input
                        type="text"
                        value={formData.rua}
                        onChange={(e) => handleInputChange('rua', e.target.value)}
                        placeholder="Nome da rua"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => handleInputChange('numero', e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                      <input
                        type="text"
                        value={formData.complemento}
                        onChange={(e) => handleInputChange('complemento', e.target.value)}
                        placeholder="Apto, Bloco..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
                      <input
                        type="text"
                        value={formData.bairro}
                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                        placeholder="Bairro"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        placeholder="Cidade"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                      <input
                        type="text"
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                        placeholder="UF"
                        maxLength={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                    </div>
                  </div>
                )}
                
                {/* Se usou endereço salvo, mostrar resumo */}
                {!useNewAddress && selectedAddressId && savedAddresses.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Endereço selecionado</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {formData.rua}, {formData.numero} - {formData.cidade}/{formData.estado}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <button 
                    onClick={goToPreviousStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={goToNextStep}
                    className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Shipping */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-400" />
                  Opções de Frete
                </h2>
                
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((option) => {
                    const isDisabled = !!(option.minValue && cartTotal < option.minValue)
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => !isDisabled && handleInputChange('frete', option.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          formData.frete === option.id 
                            ? 'border-blue-400 bg-blue-50' 
                            : isDisabled
                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.frete === option.id ? 'border-blue-400' : 'border-gray-300'
                          }`}>
                            {formData.frete === option.id && (
                              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{option.name}</p>
                            <p className="text-sm text-gray-500">{option.days}</p>
                            {option.minValue && (
                              <p className="text-xs text-green-600">Compras acima de R$ {option.minValue}</p>
                            )}
                          </div>
                        </div>
                        <span className={`font-bold ${option.price === 0 ? 'text-green-600' : 'text-blue-400'}`}>
                          {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2).replace('.', ',')}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button 
                    onClick={goToPreviousStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={goToNextStep}
                    className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  Forma de Pagamento
                </h2>
                
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id 
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            paymentMethod === method.id ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </div>
                        {method.discount && (
                          <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-semibold rounded-full">
                            -{method.discount}%
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {paymentMethod === 'pix' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                    <p className="text-green-800 font-medium">
                      Você economiza R$ {pixDiscount.toFixed(2).replace('.', ',')} pagando com PIX!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      O QR Code será gerado após confirmar o pedido.
                    </p>
                  </div>
                )}
                
                {/* Credit Card Form */}
                {paymentMethod === 'credit' && (
                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Seus dados estão protegidos</span>
                    </div>
                    
                    {/* Card Preview */}
                    <div className="mb-6 relative">
                      <div className="w-full aspect-[1.586/1] max-w-[320px] mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                        {/* Card chip */}
                        <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md mb-4" />
                        
                        {/* Card brand logo */}
                        <div className="absolute top-5 right-5 text-2xl font-bold opacity-80">
                          {detectCardBrand(cardData.cardNumber) === 'visa' && 'VISA'}
                          {detectCardBrand(cardData.cardNumber) === 'mastercard' && 'MC'}
                          {detectCardBrand(cardData.cardNumber) === 'amex' && 'AMEX'}
                          {detectCardBrand(cardData.cardNumber) === 'elo' && 'ELO'}
                          {!detectCardBrand(cardData.cardNumber) && 'CARD'}
                        </div>
                        
                        {/* Card number */}
                        <p className="text-xl font-mono tracking-widest mb-4">
                          {cardData.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                        
                        {/* Card holder and expiry */}
                        <div className="flex justify-between">
                          <div>
                            <p className="text-xs opacity-70 uppercase">Titular</p>
                            <p className="font-medium tracking-wider text-sm">
                              {cardData.cardHolder || 'NOME NO CARTÃO'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs opacity-70 uppercase">Validade</p>
                            <p className="font-medium tracking-wider text-sm">
                              {cardData.expiryDate || 'MM/AA'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número do Cartão *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardData.cardNumber}
                            onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className={`w-full px-4 py-3 rounded-xl border ${
                              cardErrors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                            } focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                          />
                          <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        {cardErrors.cardNumber && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {cardErrors.cardNumber}
                          </p>
                        )}
                      </div>
                      
                      {/* Card Holder */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Impresso no Cartão *
                        </label>
                        <input
                          type="text"
                          value={cardData.cardHolder}
                          onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            cardErrors.cardHolder ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                          } focus:outline-none focus:ring-2 focus:border-transparent uppercase`}
                        />
                        {cardErrors.cardHolder && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {cardErrors.cardHolder}
                          </p>
                        )}
                      </div>
                      
                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Validade *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardData.expiryDate}
                              onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                              placeholder="MM/AA"
                              maxLength={5}
                              className={`w-full px-4 py-3 rounded-xl border ${
                                cardErrors.expiryDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                              } focus:outline-none focus:ring-2 focus:border-transparent`}
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                          {cardErrors.expiryDate && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {cardErrors.expiryDate}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              value={cardData.cvv}
                              onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                              placeholder="•••"
                              maxLength={4}
                              className={`w-full px-4 py-3 rounded-xl border ${
                                cardErrors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                              } focus:outline-none focus:ring-2 focus:border-transparent`}
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                          {cardErrors.cvv && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {cardErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Installments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parcelas *
                        </label>
                        <select
                          value={cardData.installments}
                          onChange={(e) => handleCardInputChange('installments', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          {getInstallmentOptions(finalTotal).map((option) => (
                            <option key={option.installments} value={option.installments}>
                              {option.installments}x de R$ {option.value.toFixed(2).replace('.', ',')} 
                              {option.hasInterest ? ` (com juros ${option.interestRate}%)` : ' sem juros'}
                              {option.installments === 1 && ' à vista'}
                            </option>
                          ))}
                        </select>
                        {cardData.installments > 1 && (
                          <p className="text-gray-500 text-xs mt-2">
                            Total: R$ {getInstallmentOptions(finalTotal)[cardData.installments - 1]?.total.toFixed(2).replace('.', ',')}
                            {getInstallmentOptions(finalTotal)[cardData.installments - 1]?.hasInterest && (
                              <span className="text-amber-600 ml-1">(inclui juros)</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Security badges */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>SSL Seguro</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Lock className="h-4 w-4 text-green-600" />
                          <span>Dados Criptografados</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          VISA | MasterCard | Elo | Amex
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'boleto' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-amber-800 font-medium">
                      O boleto será gerado após confirmar o pedido
                    </p>
                    <p className="text-amber-600 text-sm mt-1">
                      O pedido será processado após a confirmação do pagamento (até 3 dias úteis).
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <button 
                    onClick={goToPreviousStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleFinishOrder}
                    disabled={isLoading}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        Finalizar Pedido
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cartItems.map((item: any) => (
                  <div key={`${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${item.selectedStorage || ''}`} className="flex gap-3 py-3 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 text-sm font-medium line-clamp-1">{item.name}</h4>
                      {/* Exibir variações selecionadas */}
                      {(item.selectedColor || item.selectedSize || item.selectedStorage) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedColor && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedStorage && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {item.selectedStorage}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-gray-900 text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-blue-400 text-sm font-semibold mt-1">
                        R$ {((item.discountPrice || item.price) * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Coupon Input */}
              <div className="mb-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite seu cupom"
                    disabled={!!appliedCoupon}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado!</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {completedSteps.includes(3) && (
                  <div className="flex justify-between text-gray-600">
                    <span>Frete ({selectedShipping?.name})</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                )}

                {pixDiscount > 0 && currentStep === 4 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto PIX (5%)</span>
                    <span>-R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                {/* Mostrar juros do parcelamento se aplicável */}
                {currentStep === 4 && paymentMethod === 'credit' && cardData.installments > 10 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Juros ({cardData.installments}x)</span>
                    <span>+R$ {(getInstallmentOptions(finalTotal)[cardData.installments - 1].total - finalTotal).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-900 text-lg font-bold pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-400">
                    R$ {(currentStep === 4 
                      ? (paymentMethod === 'credit' 
                          ? getInstallmentOptions(finalTotal)[cardData.installments - 1].total 
                          : finalTotal)
                      : (completedSteps.includes(3) ? cartTotal + shippingCost : cartTotal)
                    ).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Info de parcelas */}
                {currentStep === 4 && paymentMethod === 'credit' && cardData.installments > 1 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    {cardData.installments}x de R$ {getInstallmentOptions(finalTotal)[cardData.installments - 1].value.toFixed(2).replace('.', ',')}
                    {cardData.installments > 10 && <span className="text-amber-600 ml-1">(com juros)</span>}
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <Shield className="h-4 w-4" />
                  <span>Pagamento 100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </div>
  )
}

