'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, User, Check, ChevronDown, Loader2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

interface Review {
  id: string
  productId: string
  userId: string
  userName?: string
  rating: number
  title?: string
  comment: string | null
  verified?: boolean
  helpful?: number
  images?: string[]
  createdAt: string
  updatedAt?: string
}

interface ReviewStats {
  total: number
  average: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface ProductReviewsProps {
  productId: string
  productName?: string
}

// Star Rating Component
function StarRating({ 
  rating, 
  size = 'md', 
  interactive = false,
  onChange
}: { 
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}) {
  const [hoverRating, setHoverRating] = useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// Rating Distribution Bar
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-8">{stars}★</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: stars * 0.1 }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>
      <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
    </div>
  )
}

// Single Review Card
function ReviewCard({ review, onHelpful }: { review: Review; onHelpful: (id: string) => void }) {
  const [helpfulClicked, setHelpfulClicked] = useState(false)
  
  const handleHelpful = () => {
    if (helpfulClicked) return
    setHelpfulClicked(true)
    onHelpful(review.id)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-100 last:border-0 py-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#034a6e]/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-[#034a6e]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {review.userName || 'Usuário'}
            </span>
            {review.verified && (
              <Badge variant="outline" className="text-green-600 border-green-200 text-xs py-0">
                <Check className="w-3 h-3 mr-1" />
                Compra Verificada
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} size="sm" />
            {review.title && (
              <span className="font-medium text-gray-800">{review.title}</span>
            )}
          </div>
          <p className="text-gray-600 mb-3 whitespace-pre-line">{review.comment}</p>
          
          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Foto ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('pt-BR')}
            </span>
            <button
              onClick={handleHelpful}
              disabled={helpfulClicked}
              className={`flex items-center gap-1 text-sm ${
                helpfulClicked
                  ? 'text-[#034a6e]'
                  : 'text-gray-500 hover:text-[#034a6e]'
              } transition-colors`}
            >
              <ThumbsUp className={`w-4 h-4 ${helpfulClicked ? 'fill-current' : ''}`} />
              <span>Útil ({(review.helpful || 0) + (helpfulClicked ? 1 : 0)})</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Review Form
function ReviewForm({ 
  productId, 
  onSubmit, 
  isSubmitting 
}: { 
  productId: string
  onSubmit: (data: { rating: number; title: string; comment: string }) => void
  isSubmitting: boolean
}) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Selecione uma avaliação')
      return
    }
    
    if (comment.length < 10) {
      toast.error('Comentário deve ter pelo menos 10 caracteres')
      return
    }
    
    onSubmit({ rating, title, comment })
    setRating(0)
    setTitle('')
    setComment('')
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua Avaliação *
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título (opcional)
        </label>
        <Input
          placeholder="Resumo da sua avaliação"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seu Comentário *
        </label>
        <Textarea
          placeholder="Conte sua experiência com o produto..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={800}
        />
        <span className="text-xs text-gray-400">{comment.length}/800</span>
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting || rating === 0 || comment.length < 10}
        className="w-full bg-[#034a6e] hover:bg-[#023a58]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Avaliação
          </>
        )}
      </Button>
    </form>
  )
}

// Main Component
export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  
  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        const reviewsData = Array.isArray(data) ? data : data.reviews || []
        setReviews(reviewsData)
        
        // Calculate stats
        if (reviewsData.length > 0) {
          const total = reviewsData.length
          const average = reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0) / total
          const distribution = {
            5: reviewsData.filter((r: Review) => r.rating === 5).length,
            4: reviewsData.filter((r: Review) => r.rating === 4).length,
            3: reviewsData.filter((r: Review) => r.rating === 3).length,
            2: reviewsData.filter((r: Review) => r.rating === 2).length,
            1: reviewsData.filter((r: Review) => r.rating === 1).length
          }
          setStats({ total, average, distribution })
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])
  
  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])
  
  const handleSubmitReview = async (data: { rating: number; title: string; comment: string }) => {
    if (!user) {
      toast.error('Faça login para avaliar')
      return
    }
    
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          userId: user.id,
          ...data
        })
      })
      
      if (response.ok) {
        toast.success('Avaliação enviada com sucesso!')
        setShowForm(false)
        fetchReviews()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao enviar avaliação')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews?id=${reviewId}&action=helpful`, {
        method: 'PUT'
      })
    } catch (error) {
      console.error('Error marking helpful:', error)
    }
  }
  
  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return (b.helpful || 0) - (a.helpful || 0)
      case 'rating':
        return b.rating - a.rating
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#034a6e]" />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Avaliações dos Clientes</span>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#034a6e] hover:bg-[#023a58]"
            >
              Avaliar Produto
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-5xl font-bold text-gray-900">
                {stats.average.toFixed(1)}
              </span>
              <div>
                <StarRating rating={Math.round(stats.average)} size="lg" />
                <p className="text-sm text-gray-500 mt-1">
                  {stats.total} avaliação{stats.total !== 1 ? 'ões' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={stats.distribution[stars as keyof typeof stats.distribution]}
                total={stats.total}
              />
            ))}
          </div>
        </div>
        
        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 pb-8 border-b overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Escrever Avaliação</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
              {user ? (
                <ReviewForm
                  productId={productId}
                  onSubmit={handleSubmitReview}
                  isSubmitting={submitting}
                />
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Faça login para deixar sua avaliação</p>
                  <Button variant="outline">Fazer Login</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sort Options */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#034a6e]"
            >
              <option value="recent">Mais Recentes</option>
              <option value="helpful">Mais Úteis</option>
              <option value="rating">Maior Nota</option>
            </select>
          </div>
        )}
        
        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma avaliação ainda</p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="border-[#034a6e] text-[#034a6e]"
            >
              Seja o primeiro a avaliar
            </Button>
          </div>
        ) : (
          <div>
            {sortedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={handleHelpful}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StarRating, ReviewCard }
