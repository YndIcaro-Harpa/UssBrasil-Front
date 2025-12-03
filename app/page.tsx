'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import {
    ShoppingCart, Heart, ChevronRight, ChevronLeft,
    Zap, Truck, Shield, HeadphonesIcon, Award,
    Sparkles, ArrowRight, Package, Star, Check,
    Smartphone, Headphones, Plane, Camera, Cable
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'
import apiClient, { Product, Category, Brand } from '@/lib/api-client'

// Configuração de animações refinadas
const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
}

const staggerChildren = {
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
}

// Hero Videos
const heroVideos = [
    {
        src: '/Videos/IphoneVideo.mp4',
        poster: '/Videos/IphoneVideoPoster.jpg',
        title: 'iPhone 16',
        subtitle: 'Titânio. Precisão. Performance.',
        description: 'O futuro da tecnologia móvel',
        cta: 'Descubra Agora',
        link: '/iphone17'
    },
    {
        src: '/Videos/AirPods Video.webm',
        poster: '/fallback-product.png',
        title: 'AirPods',
        subtitle: 'Som que envolve. Silêncio que liberta.',
        description: 'Experiência auditiva premium',
        cta: 'Explore AirPods',
        link: '/produtos'
    },
    {
        src: '/Videos/Apple Watch.mp4',
        poster: '/fallback-product.png',
        title: 'Apple Watch',
        subtitle: 'Seu aliado na saúde e fitness.',
        description: 'Tecnologia no seu pulso',
        cta: 'Conheça Apple Watch',
        link: '/produtos'
    },
    {
        src: '/Videos/IpadVideo.mp4',
        poster: '/fallback-product.png',
        title: 'iPad',
        subtitle: 'Potência. Criatividade. Portabilidade.',
        description: 'Seu estúdio criativo portátil',
        cta: 'Descubra iPad',
        link: '/produtos'
    },
    {
        src: '/Videos/Macs Video.mp4',
        poster: '/fallback-product.png',
        title: 'Mac',
        subtitle: 'Performance profissional.',
        description: 'Poder para criar o extraordinário',
        cta: 'Ver Macs',
        link: '/produtos'
    }
]

// Ícones das categorias
const categoryIcons = {
    'Fones': Headphones,
    'Smartphones': Smartphone,
    'Drones': Plane,
    'Câmeras': Camera,
    'Cameras': Camera,
    'Acessórios': Cable,
    'Acessorios': Cable
}

// Video Hero Section - Optimized
function VideoHeroSection() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)

    const currentVideo = heroVideos[currentVideoIndex]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex(prev => (prev + 1) % heroVideos.length)
        }, 15000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative h-screen overflow-hidden bg-black">
            <div className="absolute inset-0">
                <video
                    key={currentVideoIndex}
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity duration-500"
                    autoPlay
                    muted
                    loop={false}
                    playsInline
                    poster={currentVideo.poster}
                    preload="metadata"
                    onEnded={() => setCurrentVideoIndex(prev => (prev + 1) % heroVideos.length)}
                >
                    <source src={currentVideo.src} type="video/mp4" />
                </video>
            </div>

            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

            <div className="relative h-full flex items-center justify-center pt-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div
                        key={currentVideoIndex}
                        className="max-w-4xl mx-auto text-center animate-fade-in"
                    >
                        <div
                            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                        >
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span className="text-sm uppercase tracking-widest font-semibold text-white">
                                Premium Technology
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none text-white tracking-tight">
                            {currentVideo.title}
                        </h1>

                        <p className="text-2xl md:text-3xl mb-4 font-light text-gray-200 tracking-wide">
                            {currentVideo.subtitle}
                        </p>

                        <p className="text-lg text-gray-400 mb-12">
                            {currentVideo.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={currentVideo.link}>
                                <button className="group px-10 py-5 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-400/50 hover:scale-105 flex items-center justify-center gap-3">
                                    {currentVideo.cta}
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/produtos">
                                <button className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold text-lg backdrop-blur-md border border-white/30 transition-all duration-300">
                                    Saiba Mais
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls - Premium Style */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
                <button
                    onClick={() => setCurrentVideoIndex(prev => prev === 0 ? heroVideos.length - 1 : prev - 1)}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <div className="flex gap-3">
                    {heroVideos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentVideoIndex(index)}
                            className={`h-2 rounded-full transition-all duration-500 ${
                                index === currentVideoIndex 
                                    ? 'w-12 bg-white shadow-lg shadow-white/50' 
                                    : 'w-2 bg-white/30 hover:bg-white/50'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setCurrentVideoIndex(prev => (prev + 1) % heroVideos.length)}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </button>
            </div>
        </section>
    )
}

// Product Card - Optimized
function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart()
    const { user, favorites, toggleFavorite } = useAuth()
    const { openModal } = useModal()
    
    const images = Array.isArray(product.images) ? product.images : []
    const imageUrl = images[0] || '/fallback-product.png'
    const displayPrice = product.discountPrice || product.price
    const isFavorite = favorites.includes(product.id)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        addToCart({
            id: product.id,
            name: product.name,
            price: displayPrice,
            image: imageUrl,
            category: product.category?.name || 'Geral',
            stock: product.stock
        })
        toast.success('Produto adicionado ao carrinho!')
    }

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) {
            toast.error('Faça login para adicionar aos favoritos')
            openModal('auth')
            return
        }
        const wasFavorite = favorites.includes(product.id)
        toggleFavorite(product.id)
        toast.success(wasFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', {
            icon: wasFavorite ? '💔' : '❤️'
        })
    }

    return (
        <Link href={`/produto/${product.slug}`} className="block h-full">
            <div
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                        priority={false}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.featured && (
                            <div className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                                <Zap className="h-3 w-3" />
                                DESTAQUE
                            </div>
                        )}
                        {product.discountPrice && (
                            <div className="px-3 py-1 bg-blue-400 text-white text-xs font-bold rounded-full shadow-lg">
                                -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                            </div>
                        )}
                    </div>

                    {/* Botão Favorito */}
                    <button
                        onClick={handleToggleFavorite}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 hover:bg-white transition-all duration-200 z-10"
                        aria-label="Adicionar aos favoritos"
                    >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    {/* Marca */}
                    <div className="mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                            {product.brand?.name || 'Premium'}
                        </span>
                    </div>

                    {/* Nome do Produto */}
                    <h3 className="font-bold text-base mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                        {product.name}
                    </h3>

                    {/* Preço e CTA */}
                    <div className="mt-auto space-y-3">
                        <div>
                            {product.discountPrice ? (
                                <div className="space-y-0.5">
                                    <div className="text-xs text-gray-400 line-through">
                                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-2xl font-black text-gray-900">
                                        R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-2xl font-black text-gray-900">
                                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">ou 12x de R$ {(displayPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            className="w-full bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-white py-3 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// Featured Products Carousel - Optimized
function FeaturedProductsCarousel({ products }: { products: Product[] }) {
    const [currentPage, setCurrentPage] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const productsPerPage = 5
    const totalPages = Math.ceil(products.length / productsPerPage)
    
    const getCurrentPageProducts = () => {
        const start = currentPage * productsPerPage
        const end = start + productsPerPage
        return products.slice(start, end)
    }

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages)
    }

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
    }

    return (
        <section ref={ref} className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div
                    className={`text-center mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-400 font-bold text-sm mb-6">
                        <Star className="h-4 w-4" />
                        PRODUTOS PREMIUM
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black mb-6 text-black tracking-tight">
                        Destaques da Semana
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Seleção exclusiva dos melhores produtos de tecnologia premium
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={prevPage}
                        disabled={totalPages <= 1}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center group border border-gray-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-6 w-6 text-black group-hover:text-blue-400" />
                    </button>

                    <div
                        key={currentPage}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 transition-opacity duration-300"
                    >
                        {getCurrentPageProducts().map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={totalPages <= 1}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-16 h-16 rounded-full bg-white shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center group border border-gray-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-7 w-7 text-black group-hover:text-blue-400" />
                    </button>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-3 mt-12">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        index === currentPage 
                                            ? 'w-12 bg-blue-400' 
                                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

// Categories Section - Premium
function CategoriesSection({ categories }: { categories: Category[] }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })
    const [currentPage, setCurrentPage] = useState(0)
    const categoriesPerPage = 5

    const getCategoryIcon = (categoryName: string) => {
        const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons] || Package
        return IconComponent
    }

    const totalPages = Math.ceil(categories.length / categoriesPerPage)
    const startIndex = currentPage * categoriesPerPage
    const endIndex = startIndex + categoriesPerPage
    const currentCategories = categories.slice(startIndex, endIndex)

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages)
    }

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
    }

    return (
        <section ref={ref} className="py-32 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-20"
                >
                    <h2 className="text-6xl md:text-7xl font-black mb-6 text-black tracking-tight">
                        Explore por Categoria
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Encontre exatamente o que você procura na nossa seleção premium
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Navigation Buttons */}
                    {totalPages > 1 && (
                        <>
                            <button
                                onClick={prevPage}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white hover:border-blue-400 hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
                                aria-label="Categorias anteriores"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-400 transition-colors" />
                            </button>
                            <button
                                onClick={nextPage}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white hover:border-blue-400 hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
                                aria-label="Próximas categorias"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-400 transition-colors" />
                            </button>
                        </>
                    )}

                    {/* Categories Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        >
                            {currentCategories.map((category) => {
                                const IconComponent = getCategoryIcon(category.name)
                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link href={`/produtos?category=${category.slug}`}>
                                            <div className="group cursor-pointer">
                                                <div className="relative p-10 bg-white rounded-3xl border-2 border-gray-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 text-center overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    
                                                    <div className="relative">
                                                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-800 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                            <IconComponent className="h-10 w-10 text-white" />
                                                        </div>
                                                        <h3 className="font-black text-lg text-black group-hover:text-blue-400 transition-colors">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination Indicators */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        index === currentPage
                                            ? 'bg-blue-400 w-8'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Ir para página ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

// Brands Section - Premium
function BrandsSection() {
    const [brands, setBrands] = useState<Brand[]>([])
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const data = await apiClient.getBrands()
                setBrands(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Error fetching brands:', error)
                setBrands([])
            }
        }
        fetchBrands()
    }, [])

    return (
        <section ref={ref} className="py-32 bg-white">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white font-bold text-sm mb-6">
                        <Award className="h-4 w-4" />
                        MARCAS OFICIAIS
                    </div>
                    <h2 className="text-6xl md:text-7xl font-black mb-6 text-black tracking-tight">
                        Parceiros Premium
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Trabalhamos exclusivamente com as marcas mais prestigiadas do mercado
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
                >
                    {brands.map((brand) => (
                        <motion.div key={brand.id} variants={fadeInUp} whileHover={{ y: -12 }}>
                            <Link href={`/produtos?brand=${brand.slug}`}>
                                <div className="group cursor-pointer bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-500">
                                    <div className="relative w-full h-24 mb-6 flex items-center justify-center">
                                        {brand.logo ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={brand.logo}
                                                    alt={brand.name}
                                                    fill
                                                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                                    sizes="100px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <Award className="h-10 w-10 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-black text-xl text-black mb-2 group-hover:text-blue-400 transition-colors">
                                            {brand.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-semibold">
                                            {brand._count?.products || 0} produtos
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// iPhone 17 Section - Premium Black
function IPhone17Section() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })
    
    const imageY = useTransform(scrollYProgress, [0, 1], [50, -50])
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5])

    const features = [
        { icon: '🎨', title: 'Display ProMotion', desc: 'LTPO 120Hz com Always-On' },
        { icon: '⚡', title: 'Chip A18 Pro', desc: 'Arquitetura 3nm revolucionária' },
        { icon: '📸', title: 'Câmera 48MP', desc: 'Sistema triple com zoom 5x' },
        { icon: '🔋', title: 'Bateria Suprema', desc: 'Até 29h de reprodução de vídeo' },
    ]

    return (
        <section ref={ref} className="relative min-h-screen overflow-hidden bg-black">
            {/* Background dinâmico */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-black to-black" />
                <motion.div 
                    style={{ opacity }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-blue-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl"
                />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
            </div>

            {/* Linhas decorativas animadas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    initial={{ x: '-100%' }}
                    animate={isInView ? { x: '100%' } : {}}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                    className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
                />
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={isInView ? { x: '-100%' } : {}}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                />
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10 py-24 lg:py-32">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-400/30 text-blue-400 font-bold text-sm mb-8"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        PRÉ-VENDA EXCLUSIVA
                        <Sparkles className="h-4 w-4" />
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Imagem do iPhone com efeitos */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                        animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="relative order-2 lg:order-1 flex items-center justify-center perspective-1000"
                    >
                        {/* Glow effects */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-blue-500/30 rounded-full blur-[100px] animate-pulse" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] bg-blue-400/20 rounded-full blur-[80px] animate-pulse delay-500" />
                        </div>

                        {/* Círculos decorativos */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute w-[450px] h-[450px] lg:w-[550px] lg:h-[550px] border border-blue-400/10 rounded-full"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] border border-blue-400/5 rounded-full"
                        />

                        {/* Imagem principal */}
                        <motion.div 
                            style={{ y: imageY }}
                            className="relative w-full h-[500px] lg:h-[650px] z-10"
                        >
                            {(() => {
                                const [currentImageIndex, setCurrentImageIndex] = useState(0)
                                
                                const iPhoneImages = [
                                    { src: '/iphone17/Iphone 17 coleção 1 Unico Foco.webp', model: 'iPhone 17', variant: 'Standard' },
                                    { src: '/iphone17/Iphone 17 coleção 1 Unico.webp', model: 'iPhone 17', variant: 'Standard' },
                                    { src: '/iphone17/Iphone 17 Coleção 1.webp', model: 'iPhone 17', variant: 'Collection' },
                                    { src: '/iphone17/iphone-17-colecao-2-par.webp', model: 'iPhone 17', variant: 'Duo' },
                                    { src: '/iphone17/iphone-17-pro-colecao-2-unico.webp', model: 'iPhone 17 Pro', variant: 'Single' },
                                    { src: '/iphone17/iphone-17-pro-max-colecao-completa.webp', model: 'iPhone 17 Pro Max', variant: 'Collection' },
                                    { src: '/iphone17/iphone-17-pro-max-unico-zoom.webp', model: 'iPhone 17 Pro Max', variant: 'Zoom' },
                                    { src: '/iphone17/iphone-17-pro-max-unico.webp', model: 'iPhone 17 Pro Max', variant: 'Single' },
                                    { src: '/iphone17/iphone-17-pro-model-unselect-gallery-1-202509.webp', model: 'iPhone 17 Pro', variant: 'Gallery 1' },
                                    { src: '/iphone17/iphone-17-pro-model-unselect-gallery-2-202509.webp', model: 'iPhone 17 Pro', variant: 'Gallery 2' },
                                ]

                                useEffect(() => {
                                    const interval = setInterval(() => {
                                        setCurrentImageIndex((prev) => (prev + 1) % iPhoneImages.length)
                                    }, 4000)
                                    return () => clearInterval(interval)
                                }, [])

                                const currentImage = iPhoneImages[currentImageIndex]

                                return (
                                    <div className="relative w-full h-full">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentImageIndex}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.05 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0"
                                            >
                                                <Image
                                                    src={currentImage.src}
                                                    alt={`${currentImage.model} - ${currentImage.variant}`}
                                                    fill
                                                    className="object-contain drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]"
                                                    priority
                                                    style={{ objectFit: 'contain', mixBlendMode: 'normal' }}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                        
                                        {/* Model indicator */}
                                        <motion.div
                                            key={`label-${currentImageIndex}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2"
                                        >
                                            <p className="text-white text-sm font-bold">{currentImage.model}</p>
                                        </motion.div>

                                        {/* Carousel indicators */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {iPhoneImages.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        index === currentImageIndex 
                                                            ? 'w-6 bg-blue-400' 
                                                            : 'w-1.5 bg-white/30 hover:bg-white/50'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })()}
                        </motion.div>

                        {/* Floating badges */}
                        <motion.div
                            initial={{ opacity: 0, x: -50, y: -20 }}
                            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="absolute top-20 -left-4 lg:left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl"
                        >
                            <p className="text-xs text-blue-400 font-bold">Titânio Grau 5</p>
                            <p className="text-white font-black text-lg">4 Cores</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50, y: 20 }}
                            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 1 }}
                            className="absolute bottom-32 -right-4 lg:right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl"
                        >
                            <p className="text-xs text-blue-400 font-bold">Armazenamento</p>
                            <p className="text-white font-black text-lg">Até 1TB</p>
                        </motion.div>
                    </motion.div>

                    {/* Conteúdo */}
                    <div className="space-y-8 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 tracking-tight leading-[0.9]">
                                iPhone 17
                                <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-transparent bg-clip-text">
                                    Pro Max
                                </span>
                            </h2>
                            <p className="text-xl lg:text-2xl text-gray-300 font-light leading-relaxed max-w-lg">
                                O smartphone mais avançado já criado. Design em titânio aeroespacial com tecnologia de ponta.
                            </p>
                        </motion.div>
                        
                        {/* Features Grid */}
                        <motion.div 
                            className="grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            {features.map((feature, index) => (
                                <motion.div 
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="group p-4 lg:p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 cursor-default"
                                >
                                    <span className="text-2xl lg:text-3xl mb-3 block">{feature.icon}</span>
                                    <h4 className="text-white font-bold text-sm lg:text-base mb-1 group-hover:text-blue-400 transition-colors">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-400 text-xs lg:text-sm">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Price Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 1 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur-xl" />
                            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 lg:p-8">
                                <div className="flex items-end justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-1">A partir de</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl lg:text-5xl font-black text-white">R$ 7.999</p>
                                            <span className="text-gray-400 text-sm line-through">R$ 9.499</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">-16%</span>
                                            ou 12x de R$ 666,58 sem juros
                                        </p>
                                    </div>
                                    <div className="hidden lg:flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">4.9 (2.847 avaliações)</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/iphone17" className="flex-1">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold text-base transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 flex items-center justify-center gap-3"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            Comprar Agora
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </Link>
                                    <Link href="/iphone17">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-base backdrop-blur-sm border border-white/20 hover:border-blue-400/50 transition-all duration-300"
                                        >
                                            Saiba Mais
                                        </motion.button>
                                    </Link>
                                </div>

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Truck className="h-4 w-4 text-blue-400" />
                                        <span>Frete Grátis</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Shield className="h-4 w-4 text-blue-400" />
                                        <span>Garantia Apple</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Package className="h-4 w-4 text-blue-400" />
                                        <span>Produto Oficial</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Features Section - Premium
function FeaturesSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const features = [
        {
            icon: Truck,
            title: 'Entrega Premium',
            description: 'Frete grátis em compras acima de R$ 199 com entrega expressa',
            highlight: 'Express'
        },
        {
            icon: Shield,
            title: 'Garantia Estendida',
            description: 'Até 24 meses de proteção total contra defeitos',
            highlight: '24 meses'
        },
        {
            icon: HeadphonesIcon,
            title: 'Suporte VIP',
            description: 'Atendimento prioritário 24/7 por especialistas certificados',
            highlight: '24/7'
        },
        {
            icon: Award,
            title: 'Produtos Oficiais',
            description: 'Importação oficial com garantia internacional e nota fiscal',
            highlight: 'Certificado'
        }
    ]

    return (
        <section ref={ref} className="py-32 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-20"
                >
                    <h2 className="text-6xl md:text-7xl font-black mb-6 text-black tracking-tight">
                        Experiência Premium
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Benefícios exclusivos para proporcionar a melhor experiência de compra
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerChildren}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {features.map((feature) => (
                        <motion.div 
                            key={feature.title} 
                            variants={fadeInUp} 
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="group"
                        >
                            <div className="relative h-full p-10 bg-white rounded-3xl border-2 border-gray-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                <div className="absolute top-6 right-6 px-3 py-1 bg-blue-50 text-blue-400 rounded-full text-xs font-bold">
                                    {feature.highlight}
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-800 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <feature.icon className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-black group-hover:text-blue-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Newsletter Section - Premium
function NewsletterSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <section ref={ref} className="py-32 bg-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400 text-white font-bold text-sm mb-8">
                        <Sparkles className="h-4 w-4" />
                        FIQUE POR DENTRO
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Novidades Exclusivas
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                        Receba em primeira mão lançamentos, ofertas especiais e conteúdo exclusivo
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <input
                            type="email"
                            placeholder="Seu melhor e-mail"
                            className="flex-1 px-8 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-all text-lg"
                        />
                        <button className="px-10 py-5 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-400/50 hover:scale-105 whitespace-nowrap">
                            Inscrever-se
                        </button>
                    </div>

                    <p className="text-sm text-gray-400 mt-6">
                        🔒 Seus dados estão protegidos. Sem spam, apenas conteúdo premium.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

// Main Component
export default function HomePage() {
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    apiClient.getProducts({ limit: 100 }),
                    apiClient.getCategories()
                ])
                
                setProducts(productsRes)
                setCategories(categoriesRes)
            } catch (error) {
                console.error('Error loading data:', error)
                toast.error('Erro ao carregar dados')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-white font-bold text-xl tracking-wide">Carregando experiência premium</p>
                    <p className="text-gray-400 text-sm mt-2">Preparando o melhor para você...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <VideoHeroSection />
            <FeaturedProductsCarousel products={products} />
            <CategoriesSection categories={categories} />
            <BrandsSection />
            <IPhone17Section />
            <FeaturesSection />
            <NewsletterSection />
        </div>
    )
}

