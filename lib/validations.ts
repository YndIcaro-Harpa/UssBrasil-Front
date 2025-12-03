import { z } from 'zod'

// ========================================
// SCHEMAS DE VALIDAÇÃO PARA API
// ========================================

// --- Produto ---
export const ProductCreateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200, 'Nome muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(5000, 'Descrição muito longa').optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido').optional(),
  price: z.number().positive('Preço deve ser positivo').max(999999.99, 'Preço máximo excedido'),
  discountPrice: z.number().positive('Preço com desconto deve ser positivo').optional().nullable(),
  stock: z.number().int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo'),
  sku: z.string().min(3, 'SKU deve ter pelo menos 3 caracteres').max(50, 'SKU muito longo').optional(),
  brandId: z.string().uuid('ID da marca inválido'),
  categoryId: z.string().uuid('ID da categoria inválido'),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  images: z.array(z.string().url('URL de imagem inválida')).optional().default([]),
  specifications: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional().default([]),
  weight: z.number().positive('Peso deve ser positivo').optional(),
  dimensions: z.string().optional(),
  warranty: z.number().int().min(0).max(120, 'Garantia máxima de 120 meses').optional()
}).refine(data => {
  if (data.discountPrice && data.discountPrice >= data.price) {
    return false
  }
  return true
}, { message: 'Preço com desconto deve ser menor que o preço normal', path: ['discountPrice'] })

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  id: z.string().uuid('ID do produto inválido')
})

// --- Categoria ---
export const CategoryCreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido').optional(),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  image: z.string().url('URL de imagem inválida').optional(),
  isActive: z.boolean().optional().default(true),
  parentId: z.string().uuid('ID da categoria pai inválido').optional().nullable()
})

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  id: z.string().uuid('ID da categoria inválido')
})

// --- Marca ---
export const BrandCreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido').optional(),
  logo: z.string().url('URL do logo inválida').optional(),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  website: z.string().url('URL do website inválida').optional(),
  isActive: z.boolean().optional().default(true)
})

export const BrandUpdateSchema = BrandCreateSchema.partial().extend({
  id: z.string().uuid('ID da marca inválido')
})

// --- Pedido ---
export const OrderStatusEnum = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
export const PaymentStatusEnum = z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])

export const OrderItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1').max(999, 'Quantidade máxima excedida'),
  price: z.number().positive('Preço deve ser positivo')
})

export const OrderCreateSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido').optional(),
  items: z.array(OrderItemSchema).min(1, 'Pedido deve ter pelo menos 1 item'),
  shippingAddress: z.object({
    street: z.string().min(5, 'Endereço muito curto'),
    number: z.string().min(1, 'Número obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 letras'),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    country: z.string().default('Brasil')
  }),
  paymentMethod: z.string().min(1, 'Método de pagamento obrigatório'),
  couponCode: z.string().optional()
})

export const OrderUpdateStatusSchema = z.object({
  status: OrderStatusEnum,
  trackingCode: z.string().optional(),
  notes: z.string().max(500, 'Notas muito longas').optional()
})

// --- Usuário ---
export const UserRegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido').optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional()
})

export const UserLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória')
})

export const UserUpdateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido').optional(),
  avatar: z.string().url('URL do avatar inválida').optional()
})

// --- Endereço ---
export const AddressSchema = z.object({
  label: z.string().min(1, 'Nome do endereço obrigatório').max(50, 'Nome muito longo'),
  street: z.string().min(5, 'Endereço muito curto'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().max(100, 'Complemento muito longo').optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().default('Brasil'),
  isDefault: z.boolean().optional().default(false)
})

// --- Review ---
export const ReviewCreateSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  rating: z.number().int().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5'),
  title: z.string().min(5, 'Título muito curto').max(100, 'Título muito longo'),
  comment: z.string().min(10, 'Comentário muito curto').max(2000, 'Comentário muito longo'),
  images: z.array(z.string().url('URL de imagem inválida')).max(5, 'Máximo de 5 imagens').optional()
})

// --- Cupom ---
export const CouponCreateSchema = z.object({
  code: z.string().min(3, 'Código deve ter pelo menos 3 caracteres').max(20, 'Código muito longo').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Valor do desconto deve ser positivo'),
  minPurchase: z.number().min(0, 'Compra mínima não pode ser negativa').optional(),
  maxDiscount: z.number().positive('Desconto máximo deve ser positivo').optional(),
  maxUses: z.number().int().positive('Número máximo de usos deve ser positivo').optional(),
  validFrom: z.string().datetime('Data de início inválida'),
  validUntil: z.string().datetime('Data de término inválida'),
  isActive: z.boolean().optional().default(true)
}).refine(data => {
  const from = new Date(data.validFrom)
  const until = new Date(data.validUntil)
  return until > from
}, { message: 'Data de término deve ser posterior à data de início', path: ['validUntil'] })
.refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false
  }
  return true
}, { message: 'Percentual de desconto não pode ser maior que 100%', path: ['discountValue'] })

// --- Newsletter ---
export const NewsletterSubscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo').optional()
})

// --- Contato ---
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Assunto muito curto').max(200, 'Assunto muito longo'),
  message: z.string().min(20, 'Mensagem muito curta').max(5000, 'Mensagem muito longa')
})

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Valida dados contra um schema Zod e retorna o resultado
 * @param schema Schema Zod para validação
 * @param data Dados a serem validados
 * @returns Objeto com success, data e errors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: { field: string; message: string }[]
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors = result.error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message
  }))
  
  return { success: false, errors }
}

/**
 * Cria resposta de erro de validação para API
 * @param errors Lista de erros de validação
 * @returns Objeto de resposta com status 400
 */
export function validationErrorResponse(errors: { field: string; message: string }[]) {
  return {
    error: 'Dados inválidos',
    details: errors
  }
}

// ========================================
// TYPES EXPORTED FROM SCHEMAS
// ========================================

export type ProductCreate = z.infer<typeof ProductCreateSchema>
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>
export type BrandCreate = z.infer<typeof BrandCreateSchema>
export type BrandUpdate = z.infer<typeof BrandUpdateSchema>
export type OrderCreate = z.infer<typeof OrderCreateSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type OrderUpdateStatus = z.infer<typeof OrderUpdateStatusSchema>
export type UserRegister = z.infer<typeof UserRegisterSchema>
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type Address = z.infer<typeof AddressSchema>
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>
export type CouponCreate = z.infer<typeof CouponCreateSchema>
export type NewsletterSubscribe = z.infer<typeof NewsletterSubscribeSchema>
export type ContactForm = z.infer<typeof ContactFormSchema>
