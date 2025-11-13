'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { 
    ShoppingCart, Heart, Star, Play, Pause, ChevronRight, ChevronLeft,
    Zap, Eye, Truck, Shield, HeadphonesIcon, Award, TrendingUp,
    Sparkles, ArrowRight, Monitor, Smartphone, Headphones, Camera, 
    Watch, Gamepad2, Laptop, Users, Globe, CheckCircle, Clock,
    Tag, Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'
import apiClient, { Product, Category, Brand, formatPrice } from '@/lib/api-client'

// Interfaces
interface CarouselProduct extends Product {
    isNew?: boolean
    isBestSeller?: boolean
}

// Videos para hero section
const heroVideos = [
    {
        src: '/Videos/IphoneVideo.mp4',
        title: 'iPhone 16 Pro',
        subtitle: 'Titânio. Tão forte. Tão leve. Tão Pro.',
        description: 'Experimente o futuro da tecnologia móvel',
        cta: 'Descubra Agora',
        link: '/produtos'
    },
    {
        src: '/Videos/IpadVideo.mp4', 
        title: 'iPad Pro M4',
        subtitle: 'Poder infinito para profissionais.',
        description: 'Criatividade sem limites em suas mãos',
        cta: 'Explore Agora',
        link: '/produtos'
    },
    {
        src: '/Videos/Apple Watch.mp4',
        title: 'Apple Watch Ultra',
        subtitle: 'Seu assistente de saúde mais inteligente.',
        description: 'Monitore, conecte-se e supere seus limites',
        cta: 'Conheça Agora',
        link: '/produtos'
    }
]

// Mapeamento de ícones para categorias
const categoryIcons = {
    'smartphones': Smartphone,
    'laptops': Laptop,
    'audio': Headphones,
    'wearables': Watch,
    'cameras': Camera,
    'gaming': Gamepad2,
    'monitores': Monitor,
    'default': Package
}

// Features
const features = [
    {
        icon: Truck,
        title: 'Entrega Grátis',
        description: 'Em compras acima de R$ 199'
    },
    {
        icon: Shield,
        title: 'Garantia Estendida',
        description: 'Até 24 meses de proteção'
    },
    {
        icon: HeadphonesIcon,
        title: 'Suporte 24/7',
        description: 'Atendimento especializado'
    },
    {
        icon: Award,
        title: 'Qualidade Premium',
        description: 'Produtos certificados'
    }
]

// Stats
const stats = [
    { icon: Users, value: '50K+', label: 'Clientes Satisfeitos' },
    { icon: CheckCircle, value: '100%', label: 'Produtos Originais' },
    { icon: Globe, value: '24/7', label: 'Suporte Online' },
    { icon: Clock, value: '48h', label: 'Entrega Rápida' }
]

// Animations
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}

const staggerChildren = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

// Component: Video Hero Section
function VideoHeroSection() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
    const [isVideoPlaying, setIsVideoPlaying] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 500], [0, 150])

    const currentVideo = heroVideos[currentVideoIndex]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex(prev => (prev + 1) % heroVideos.length)
        }, 15000)
        return () => clearInterval(interval)
    }, [])

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsVideoPlaying(!isVideoPlaying)
        }
    }

    return (
        <section className="relative h-screen overflow-hidden">
            <motion.div style={{ y }} className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.video
                        key={currentVideoIndex}
                        ref={videoRef}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        muted
                        loop={false}
                        playsInline
                        onEnded={() => setCurrentVideoIndex(prev => (prev + 1) % heroVideos.length)}
                    >
                        <source src={currentVideo.src} type="video/mp4" />
                    </motion.video>
                </AnimatePresence>
            </motion.div>
            
            <div className="absolute inset-0 bg-black/50" />
            
            <div className="relative h-full flex items-center pt-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        key={currentVideoIndex}
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-3xl text-white"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            <span className="text-sm uppercase tracking-wider font-medium">
                                Lançamento Exclusivo
                            </span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                        >
                            {currentVideo.title}
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl md:text-3xl mb-4 font-light"
                        >
                            {currentVideo.subtitle}
                        </motion.p>

                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg md:text-xl mb-10 text-gray-300 max-w-2xl"
                        >
                            {currentVideo.description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link href={currentVideo.link}>
                                <Button 
                                    size="lg" 
                                    className="px-10 py-4 text-lg font-semibold bg-blue-900 hover:bg-blue-800 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 group"
                                >
                                    {currentVideo.cta}
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            
                            <Button 
                                size="lg"
                                variant="outline"
                                onClick={togglePlayPause}
                                className="border-white/30 text-white hover:bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm"
                            >
                                {isVideoPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                                {isVideoPlaying ? 'Pausar' : 'Reproduzir'}
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4">
                <button
                    onClick={() => setCurrentVideoIndex(prev => prev === 0 ? heroVideos.length - 1 : prev - 1)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                >
                    <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                
                <div className="flex gap-2">
                    {heroVideos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentVideoIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentVideoIndex 
                                    ? 'w-8 bg-white' 
                                    : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                        />
                    ))}
                </div>
                
                <button
                    onClick={() => setCurrentVideoIndex(prev => (prev + 1) % heroVideos.length)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                >
                    <ChevronRight className="h-5 w-5 text-white" />
                </button>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-white/60">
                <span className="text-xs uppercase tracking-wider">Scroll</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-px h-12 bg-white/60"
                />
            </div>
        </section>
    )
}

// Component: Product Card (Conectado com Backend)
function ProductCard({ product, index }: { product: CarouselProduct; index: number }) {
    const { addToCart } = useCart()
    const { favorites, toggleFavorite, user } = useAuth()
    const { openAuthModal } = useModal()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const isFavorite = favorites.includes(product.id)
    const discountPercentage = product.discountPrice 
        ? Math.round((1 - product.discountPrice / product.price) * 100)
        : 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        addToCart({
            id: Number(product.id),
            name: product.name,
            price: product.discountPrice || product.price,
            image: product.images?.[0] || '/fallback-product.png',
            category: product.category?.name || 'Geral'
        })
        toast.success(`${product.name} adicionado ao carrinho!`)
    }

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!user) {
            openAuthModal()
            return
        }
        toggleFavorite(product.id)
        toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
            <Link href={`/produto/${product.slug}`} className="block">
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                    <Image
                        src={product.images?.[0] || '/fallback-product.png'}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.featured && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 px-3 py-1 rounded-full shadow-sm">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Destaque
                            </Badge>
                        )}
                        {discountPercentage > 0 && (
                            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 px-3 py-1 rounded-full shadow-sm font-bold">
                                -{discountPercentage}%
                            </Badge>
                        )}
                        {product.isNew && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 rounded-full shadow-sm">
                                <Tag className="h-3 w-3 mr-1" />
                                Novo
                            </Badge>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleToggleFavorite}
                            className="h-10 w-10 p-0 shadow-md rounded-full bg-white/95 hover:bg-white border border-gray-200 hover:border-gray-300"
                        >
                            <Heart 
                                className={`h-4 w-4 transition-colors ${
                                    isFavorite ? 'fill-current text-red-500' : 'text-gray-500 hover:text-red-500'
                                }`}
                            />
                        </Button>
                        
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-10 w-10 p-0 shadow-md rounded-full bg-white/95 hover:bg-white border border-gray-200 hover:border-gray-300"
                        >
                            <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                    </div>

                    {/* Stock Warning */}
                    {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute bottom-4 left-4">
                            <Badge className="bg-amber-500 text-white px-3 py-1 rounded-full shadow-sm">
                                Últimas {product.stock} unidades
                            </Badge>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-6 bg-white">
                {/* Brand & Category */}
                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-medium border-blue-600 text-blue-600 bg-blue-50">
                        {product.brand?.name || 'Marca'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {product.category?.name || 'Categoria'}
                    </Badge>
                </div>

                {/* Product Name */}
                <h3 className="font-bold text-lg line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors duration-300 text-gray-900">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < 4 ? 'fill-current text-amber-400' : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-900 font-medium">4.5</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                    {product.discountPrice ? (
                        <div className="flex flex-col">
                            <span className="text-sm line-through text-gray-500">
                                {formatPrice(product.price)}
                            </span>
                            <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(product.discountPrice)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <Button 
                    onClick={handleAddToCart}
                    className="w-full py-3 px-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-colors duration-200 group/btn"
                    disabled={product.stock === 0}
                >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                </Button>
            </div>
        </motion.div>
    )
}

// Component: Categories Grid (Reformulado com Background Diferenciado)
function CategoriesSection({ categories }: { categories: Category[] }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const categoryColors = [
        'bg-gradient-to-br from-blue-500 to-blue-600',
        'bg-gradient-to-br from-purple-500 to-purple-600',
        'bg-gradient-to-br from-green-500 to-green-600',
        'bg-gradient-to-br from-orange-500 to-orange-600',
        'bg-gradient-to-br from-red-500 to-red-600',
        'bg-gradient-to-br from-teal-500 to-teal-600',
    ]

    return (
        <section ref={ref} className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        🗂️ Explore por Categoria
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Encontre exatamente o que você procura em nossas categorias especializadas
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
                >
                    {categories.map((category, index) => {
                        const IconComponent = categoryIcons[category.name?.toLowerCase() as keyof typeof categoryIcons] || categoryIcons.default
                        const bgColor = categoryColors[index % categoryColors.length]
                        
                        return (
                            <Link key={category.id} href={`/categorias/${category.slug}`}>
                                <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="group bg-white rounded-xl p-8 cursor-pointer hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-lg ${bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className="h-8 w-8 text-white" />
                                        </div>
                                        
                                        <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors text-gray-900">
                                            {category.name}
                                        </h3>
                                        
                                        <p className="text-sm text-gray-600">
                                            Ver produtos
                                        </p>
                                    </div>
                                </motion.div>
                            </Link>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}

// Component: Brands Section (Reformulado)
function BrandsSection({ brands }: { brands: Brand[] }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        🏷️ Explore por Marca
                    </h2>
                    <p className="text-xl text-gray-600">
                        Produtos premium das melhores marcas do mundo
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {brands.map((brand, index) => (
                        <Link key={brand.id} href={`/marcas/${brand.slug}`}>
                            <motion.div
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-white rounded-xl p-8 text-center group hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                {brand.logo ? (
                                    <div className="relative h-20 mb-6">
                                        <Image
                                            src={brand.logo}
                                            alt={brand.name}
                                            fill
                                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-20 mb-6 flex items-center justify-center bg-gray-100 rounded-lg">
                                        <span className="text-2xl font-bold text-gray-600">{brand.name.charAt(0)}</span>
                                    </div>
                                )}
                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors text-gray-900">
                                    {brand.name}
                                </h3>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Component: Features Section (Mantido)
function FeaturesSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <section ref={ref} className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {features.map((feature, index) => (
                        <Card key={feature.title} className="bg-white text-center group hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-8">
                                <div className="w-20 h-20 mx-auto rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all duration-300">
                                    <feature.icon className="h-10 w-10 text-blue-600" />
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2 text-gray-900">
                                    {feature.title}
                                </h3>
                                
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Component: Stats Section (Movido para o final)
function StatsSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <section ref={ref} className="py-20 bg-blue-900 text-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-white">
                        📊 Nossa Performance
                    </h2>
                    <p className="text-xl text-blue-100">
                        Números que comprovam nossa excelência no mercado
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={fadeInUp}
                            whileHover={{ scale: 1.05 }}
                            className="text-center group"
                        >
                            <div className="w-20 h-20 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300">
                                <stat.icon className="h-10 w-10 text-white" />
                            </div>
                            
                            <h3 className="text-3xl font-bold mb-2 text-white">
                                {stat.value}
                            </h3>
                            
                            <p className="text-blue-100">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Main Component - Homepage Refatorada
export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [promoProducts, setPromoProducts] = useState<Product[]>([])
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)

    // Carregar dados do backend
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                
                // Buscar produtos em destaque
                const featuredResponse = await apiClient.getFeaturedProducts()
                setFeaturedProducts(featuredResponse.slice(0, 8))
                
                // Buscar produtos em promoção (com discountPrice)
                const allProductsResponse = await apiClient.getProducts({ limit: 20 })
                const allProds = allProductsResponse || []
                setAllProducts(allProds.slice(0, 12))
                
                const promoProds = allProds.filter((p: Product) => p.discountPrice && p.discountPrice < p.price)
                setPromoProducts(promoProds.slice(0, 8))
                
                // Buscar categorias
                const categoriesResponse = await apiClient.getCategories()
                setCategories(categoriesResponse.slice(0, 6))
                
                // Buscar marcas
                const brandsResponse = await apiClient.getBrands()
                setBrands(brandsResponse.slice(0, 4))
                
            } catch (error) {
                console.error('Erro ao carregar dados:', error)
                toast.error('Erro ao carregar dados da loja')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
                    <p className="mt-4 text-gray-600">Carregando loja...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white transition-colors duration-300">
            <VideoHeroSection />
            
            {/* Produtos em Destaque */}
            <FeaturedProductsSection products={featuredProducts} />
            
            {/* Produtos em Promoção */}
            <PromoProductsSection products={promoProducts} />
            
            {/* Carrossel Todos os Produtos */}
            <AllProductsCarousel products={allProducts} />
            
            {/* Explorar por Categoria - Reformulado */}
            <CategoriesSection categories={categories} />
            
            {/* Explorar por Marca */}
            <BrandsSection brands={brands} />
            
            {/* Features */}
            <FeaturesSection />
            
            {/* Stats no final */}
            <StatsSection />
        </div>
    )
}

// Seção Produtos em Destaque
function FeaturedProductsSection({ products }: { products: Product[] }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        🌟 Produtos em Destaque
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Selecionados especialmente para você com as melhores ofertas e novidades
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {products.map((product, index) => (
                        <ProductCard 
                            key={`featured-${product.id}`} 
                            product={{ ...product, featured: true }} 
                            index={index} 
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Seção Produtos em Promoção
function PromoProductsSection({ products }: { products: Product[] }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <section ref={ref} className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        🔥 Produtos em Promoção
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Aproveite descontos imperdíveis nos melhores produtos
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {products.map((product, index) => (
                        <ProductCard 
                            key={`promo-${product.id}`} 
                            product={product} 
                            index={index} 
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Carrossel de Todos os Produtos
function AllProductsCarousel({ products }: { products: Product[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const productsPerPage = 4
    const maxIndex = Math.max(0, products.length - productsPerPage)
    
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
    }

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0))
    }

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        📦 Todos os Produtos
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore nossa coleção completa de produtos premium
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <button
                        onClick={nextSlide}
                        disabled={currentIndex >= maxIndex}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 transition-all"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* Products Grid */}
                    <div className="overflow-hidden">
                        <motion.div 
                            className="flex transition-transform duration-500"
                            style={{ transform: `translateX(-${currentIndex * (100 / productsPerPage)}%)` }}
                        >
                            {products.map((product, index) => (
                                <div key={product.id} className="w-1/4 flex-shrink-0 px-4">
                                    <ProductCard product={product} index={index} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    className="text-center mt-16"
                >
                    <Link href="/produtos">
                        <Button 
                            size="lg" 
                            className="bg-blue-900 hover:bg-blue-800 font-semibold px-10 py-4 text-lg rounded-lg group"
                        >
                            Ver Todos os Produtos
                            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
