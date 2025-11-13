'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, Share2, Shield,
  Truck, RotateCcw, CreditCard, CheckCircle, ChevronLeft, ChevronRight,
  Tag, Info, Package, Zap, Award, Clock, Eye, ThumbsUp
} from 'lucide-react'

import apiClient, { Product, formatPrice } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'

// Componente do Product Hero com Gallery
function ProductHero({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const images = product.images || ['/fallback-product.png']

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <Image
            src={images[selectedImageIndex]}
            alt={product.name}
            fill
            className="object-contain p-8"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 relative aspect-square w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedImageIndex 
                    ? 'border-blue-600 ring-2 ring-blue-600/20' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} - Imagem ${index + 1}`}
                  fill
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <ProductInfo product={product} />
    </div>
  )
}

// Componente de Informações do Produto
function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { favorites, toggleFavorite, user } = useAuth()
  const { openAuthModal } = useModal()
  const router = useRouter()
  
  const isFavorite = favorites.includes(product.id)
  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0] || '/fallback-product.png',
      category: product.category?.name || 'Geral',
      quantity
    })
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`)
  }

  const handleToggleFavorite = () => {
    if (!user) {
      openAuthModal()
      return
    }
    toggleFavorite(product.id)
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      {/* Brand & Category */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          {product.brand?.name || 'Marca'}
        </Badge>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          {product.category?.name || 'Categoria'}
        </Badge>
        {product.featured && (
          <Badge className="bg-blue-600 text-white">
            <Tag className="h-3 w-3 mr-1" />
            Destaque
          </Badge>
        )}
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <p className="text-gray-600 text-lg">
          {product.description || 'Produto de alta qualidade com tecnologia avançada'}
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-medium text-gray-900">4.8</span>
          <span className="text-gray-600">(324 avaliações)</span>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600">
          <Eye className="h-4 w-4 mr-1" />
          Ver avaliações
        </Button>
      </div>

      {/* Price */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          {product.discountPrice ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <Badge className="bg-red-500 text-white">
                  -{discountPercentage}% OFF
                </Badge>
              </div>
              <span className="text-lg line-through text-gray-500">
                De {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Em até 12x sem juros</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>5% de desconto no PIX</span>
          </div>
        </div>
      </div>

      {/* Stock Info */}
      <div className={`flex items-center gap-3 p-4 rounded-lg ${
        product.stock > 0 
          ? product.stock < 10 
            ? 'bg-amber-50 border border-amber-200' 
            : 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        {product.stock > 0 ? (
          <>
            <CheckCircle className={`h-5 w-5 ${product.stock < 10 ? 'text-amber-600' : 'text-green-600'}`} />
            <span className={`font-medium ${product.stock < 10 ? 'text-amber-800' : 'text-green-800'}`}>
              {product.stock < 10 
                ? `Apenas ${product.stock} unidades disponíveis` 
                : 'Disponível em estoque'
              }
            </span>
          </>
        ) : (
          <>
            <Package className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Produto esgotado</span>
          </>
        )}
      </div>

      {/* Quantity & Actions */}
      <div className="space-y-4">
        {/* Quantity Selector */}
        {product.stock > 0 && (
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-900">Quantidade:</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-16 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-gray-600">
              {product.stock} disponível
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold h-14 text-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="flex items-center justify-center gap-3"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </motion.div>
          </Button>

          <Button
            variant="outline"
            onClick={handleToggleFavorite}
            className="h-14 w-14 border-gray-300 hover:border-red-300 hover:bg-red-50"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="h-14 w-14 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
          >
            <Share2 className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Entrega Rápida</div>
            <div className="text-sm text-gray-600">Em até 2 dias úteis</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Garantia</div>
            <div className="text-sm text-gray-600">12 meses de garantia</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <RotateCcw className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Troca Grátis</div>
            <div className="text-sm text-gray-600">7 dias para trocar</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Qualidade Premium</div>
            <div className="text-sm text-gray-600">Produto certificado</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Especificações
function ProductSpecs({ product }: { product: Product }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Especificações Técnicas</h3>
      
      <div className="grid gap-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Informações Básicas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Marca:</span>
              <span className="font-medium text-gray-900">{product.brand?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Categoria:</span>
              <span className="font-medium text-gray-900">{product.category?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">SKU:</span>
              <span className="font-medium text-gray-900">{product.sku || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Peso:</span>
              <span className="font-medium text-gray-900">1.2kg</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Características</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Alta Performance</div>
                <div className="text-sm text-gray-600">
                  Tecnologia avançada para máximo desempenho
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Durabilidade</div>
                <div className="text-sm text-gray-600">
                  Construção robusta e materiais de qualidade
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Certificação</div>
                <div className="text-sm text-gray-600">
                  Produto certificado pelos órgãos competentes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Página Principal do Produto
export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        
        // Buscar produto por slug
        const productsResponse = await apiClient.getProducts({ limit: 1, search: slug })
        const foundProduct = productsResponse?.find(p => p.slug === slug)
        
        if (foundProduct) {
          setProduct(foundProduct)
          
          // Buscar produtos relacionados da mesma categoria
          if (foundProduct.category?.id) {
            const relatedResponse = await apiClient.getProducts({
              categoryId: foundProduct.category.id,
              limit: 6
            })
            setRelatedProducts(relatedResponse?.filter(p => p.id !== foundProduct.id).slice(0, 4) || [])
          }
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
        toast.error('Erro ao carregar produto')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">
            O produto que você procura não existe ou foi removido.
          </p>
          <Button 
            onClick={() => window.location.href = '/produtos'}
            className="bg-blue-900 hover:bg-blue-800"
          >
            Ver Todos os Produtos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Product Hero */}
        <ProductHero product={product} />

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="specs">Especificações</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sobre o Produto</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {product.description || `
                      Este produto representa o que há de mais avançado em tecnologia e qualidade. 
                      Desenvolvido com os melhores materiais e seguindo rigorosos padrões de qualidade, 
                      oferece uma experiência excepcional para nossos clientes.
                    `}
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Principais Benefícios</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">Alta durabilidade e resistência</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">Design moderno e elegante</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">Tecnologia de ponta</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">Garantia estendida</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Na Caixa</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">1x {product.name}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">Manual de instruções</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">Certificado de garantia</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">Acessórios inclusos</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <ProductSpecs product={product} />
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="text-center py-16">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Star className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Seja o primeiro a avaliar
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Compartilhe sua experiência com este produto
                  </p>
                  <Button className="bg-blue-900 hover:bg-blue-800">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Escrever Avaliação
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Produtos Relacionados
              </h2>
              <p className="text-gray-600 text-lg">
                Outros produtos que você pode gostar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => window.location.href = `/produto/${relatedProduct.slug}`}
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={relatedProduct.images?.[0] || '/fallback-product.png'}
                      alt={relatedProduct.name}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(relatedProduct.discountPrice || relatedProduct.price)}
                      </span>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}