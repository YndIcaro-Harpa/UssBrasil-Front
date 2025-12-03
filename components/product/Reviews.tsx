'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  Camera,
  CheckCircle,
  User,
  Calendar,
  Filter,
  ChevronDown,
  Flag,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// Tipos
interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  notHelpful: number
  createdAt: string
  response?: {
    text: string
    date: string
  }
}

interface ProductReviewsProps {
  productId: string
  productName: string
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
  onSubmitReview?: (review: { rating: number; title: string; comment: string }) => void
}

// Dados mockados para demonstração
const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'João Silva',
    rating: 5,
    title: 'Produto excelente!',
    comment: 'Superou todas as minhas expectativas. A qualidade é incrível e chegou antes do prazo. Recomendo muito!',
    images: [],
    verified: true,
    helpful: 24,
    notHelpful: 2,
    createdAt: '2025-11-20T10:00:00Z',
    response: {
      text: 'Obrigado pela avaliação, João! Ficamos felizes que você gostou do produto. Volte sempre!',
      date: '2025-11-21T14:00:00Z'
    }
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Maria Santos',
    rating: 4,
    title: 'Muito bom, mas pode melhorar',
    comment: 'O produto é de ótima qualidade, mas a embalagem poderia ser melhor. De resto, estou satisfeita com a compra.',
    images: [],
    verified: true,
    helpful: 15,
    notHelpful: 1,
    createdAt: '2025-11-18T15:30:00Z'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Pedro Costa',
    rating: 5,
    title: 'Perfeito!',
    comment: 'Exatamente como nas fotos. Qualidade premium e entrega super rápida. Já é minha segunda compra aqui!',
    images: [],
    verified: true,
    helpful: 32,
    notHelpful: 0,
    createdAt: '2025-11-15T09:20:00Z'
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Ana Oliveira',
    rating: 3,
    title: 'Bom, mas esperava mais',
    comment: 'O produto é bom, mas não é tão bom quanto eu esperava pelo preço. A qualidade é ok, mas nada excepcional.',
    images: [],
    verified: false,
    helpful: 8,
    notHelpful: 3,
    createdAt: '2025-11-10T18:45:00Z'
  }
]

// Componente de Estrelas
function StarRating({ 
  rating, 
  size = 'md',
  interactive = false,
  onRatingChange 
}: { 
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}) {
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? star <= (hoveredRating || rating) : star <= rating
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
            onClick={() => interactive && onRatingChange?.(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          >
            <Star 
              className={`${sizeClasses[size]} ${
                filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

// Componente de Barra de Progresso de Rating
function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-8">{rating} ★</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>
      <span className="text-sm text-gray-500 w-8">{count}</span>
    </div>
  )
}

// Componente Principal
export default function ProductReviews({
  productId,
  productName,
  reviews = mockReviews,
  averageRating = 4.3,
  totalReviews = mockReviews.length,
  onSubmitReview
}: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newTitle, setNewTitle] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())

  // Calcular distribuição de ratings
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }))

  // Ordenar reviews
  const sortedReviews = [...reviews]
    .filter(r => filterRating === null || r.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful
        case 'rating':
          return b.rating - a.rating
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para avaliar')
      return
    }

    if (newRating === 0) {
      toast.error('Selecione uma nota')
      return
    }

    if (!newComment.trim()) {
      toast.error('Escreva um comentário')
      return
    }

    setSubmitting(true)
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSubmitReview?.({
        rating: newRating,
        title: newTitle,
        comment: newComment
      })

      toast.success('Avaliação enviada com sucesso!')
      setShowReviewForm(false)
      setNewRating(0)
      setNewTitle('')
      setNewComment('')
    } catch (error) {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    if (helpfulClicked.has(reviewId)) {
      toast.info('Você já votou nesta avaliação')
      return
    }
    
    setHelpfulClicked(prev => new Set([...prev, reviewId]))
    toast.success(isHelpful ? 'Marcado como útil!' : 'Feedback registrado!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header com Resumo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Avaliações de Clientes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resumo Geral */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <p className="text-gray-500 mt-2">{totalReviews} avaliações</p>
          </div>

          {/* Distribuição de Ratings */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full transition-opacity ${
                  filterRating !== null && filterRating !== rating ? 'opacity-50' : ''
                }`}
              >
                <RatingBar rating={rating} count={count} total={totalReviews} />
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Nova Avaliação */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="w-full md:w-auto bg-blue-400 hover:bg-blue-500"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Escrever Avaliação
          </Button>
        </div>
      </div>

      {/* Formulário de Nova Avaliação */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Avalie {productName}
              </h3>

              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sua nota
                  </label>
                  <StarRating
                    rating={newRating}
                    size="lg"
                    interactive
                    onRatingChange={setNewRating}
                  />
                </div>

                {/* Título (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Resumo da sua avaliação"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Comentário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Conte sua experiência com o produto..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="bg-blue-400 hover:bg-blue-500"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros e Ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {filterRating ? `Mostrando ${filterRating} estrelas` : 'Todas as avaliações'}
          </span>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-blue-500 hover:underline"
            >
              Limpar filtro
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Mais recentes</option>
            <option value="helpful">Mais úteis</option>
            <option value="rating">Maior nota</option>
          </select>
        </div>
      </div>

      {/* Lista de Reviews */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-500">
              {filterRating 
                ? 'Tente outro filtro de estrelas'
                : 'Seja o primeiro a avaliar este produto!'}
            </p>
          </div>
        ) : (
          sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              {/* Header da Review */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {review.userAvatar ? (
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                <StarRating rating={review.rating} size="sm" />
              </div>

              {/* Conteúdo */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>

              {/* Imagens */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {review.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={img}
                        alt={`Foto ${i + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Resposta da Loja */}
              {review.response && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-900">USS Brasil</span>
                    <span className="text-xs text-blue-600">
                      {formatDate(review.response.date)}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{review.response.text}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id, true)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      helpfulClicked.has(review.id) 
                        ? 'text-green-600' 
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Útil ({review.helpful})
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, false)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      helpfulClicked.has(review.id) 
                        ? 'text-red-600' 
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    ({review.notHelpful})
                  </button>
                </div>

                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
