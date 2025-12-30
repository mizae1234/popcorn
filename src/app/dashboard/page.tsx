'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import CoinDisplay from '@/components/CoinDisplay'
import VideoCard from '@/components/VideoCard'
import ProductCard from '@/components/ProductCard'

interface Video {
    id: string
    jobId: string
    status: 'processing' | 'completed' | 'failed'
    progressState?: 'waiting' | 'queuing' | 'generating' | null
    provider?: string
    videoUrl: string | null
    prompt: string
    caption?: string
    product?: {
        name: string
        imageUrl?: string
        caption?: string
    }
    createdAt: string
}

interface Product {
    id: string
    name: string
    imageUrl: string
    features: string
    concept: string
    targetAudience: string
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [videos, setVideos] = useState<Video[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        if (session) {
            fetchData()
        }
    }, [session])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [videosRes, productsRes] = await Promise.all([
                fetch('/api/videos?limit=4'),
                fetch('/api/products?limit=4'),
            ])

            if (videosRes.ok) {
                const videosData = await videosRes.json()
                setVideos(videosData.videos || [])
            }

            if (productsRes.ok) {
                const productsData = await productsRes.json()
                setProducts(productsData.products || [])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="page-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="page-container">
            <div className="container py-4">
                {/* Welcome Section */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100" style={{
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        }}>
                            <div className="card-body p-4 p-lg-5">
                                <div className="row align-items-center">
                                    <div className="col-lg-8">
                                        <h1 className="display-6 fw-bold text-white mb-3">
                                            สวัสดี, {session.user?.name?.split(' ')[0]} 👋
                                        </h1>
                                        <p className="text-white-50 mb-4">
                                            พร้อมสร้างวิดีโอ TikTok สุดปังสำหรับสินค้าของคุณแล้วหรือยัง?
                                            เริ่มต้นสร้างวิดีโอใหม่เลยวันนี้!
                                        </p>
                                        <div className="d-flex gap-3 flex-wrap">
                                            <Link
                                                href="/generate"
                                                className="btn btn-lg px-4 py-3 rounded-pill fw-bold"
                                                style={{
                                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                    border: 'none',
                                                    color: '#1e3a8a',
                                                }}
                                            >
                                                <i className="bi bi-plus-circle me-2"></i>
                                                สร้างวิดีโอใหม่
                                            </Link>
                                            <Link
                                                href="/products"
                                                className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill"
                                            >
                                                <i className="bi bi-box me-2"></i>
                                                จัดการสินค้า
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 d-none d-lg-block text-center">
                                        <span style={{ fontSize: '8rem' }}>🍿</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <CoinDisplay />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'วิดีโอทั้งหมด', value: videos.length, icon: '🎬', color: '#3b82f6' },
                        { label: 'สินค้าทั้งหมด', value: products.length, icon: '📦', color: '#8b5cf6' },
                        { label: 'Coins คงเหลือ', value: session.user?.coins ?? 0, icon: '🪙', color: '#f59e0b' },
                    ].map((stat, index) => (
                        <div key={index} className="col-md-4">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                <div className="card-body p-4 d-flex align-items-center gap-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                                        width: '60px',
                                        height: '60px',
                                        background: `${stat.color}20`,
                                        fontSize: '1.5rem',
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div className="text-muted small">{stat.label}</div>
                                        <div className="fs-3 fw-bold" style={{ color: stat.color }}>{stat.value}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Videos */}
                <div className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold mb-0">
                            <i className="bi bi-collection-play me-2 text-primary"></i>
                            วิดีโอล่าสุด
                        </h4>
                        <Link href="/profile" className="btn btn-outline-primary btn-sm rounded-pill">
                            ดูทั้งหมด <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="row g-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="col-md-6 col-lg-3">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="skeleton" style={{ aspectRatio: '9/16', borderRadius: '16px 16px 0 0' }} />
                                        <div className="card-body">
                                            <div className="skeleton mb-2" style={{ height: '20px', width: '80%' }} />
                                            <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="row g-4">
                            {videos.map(video => (
                                <div key={video.id} className="col-md-6 col-lg-3">
                                    <VideoCard
                                        id={video.id}
                                        jobId={video.jobId}
                                        status={video.status}
                                        videoUrl={video.videoUrl}
                                        prompt={video.prompt}
                                        caption={video.caption || video.product?.caption}
                                        productName={video.product?.name}
                                        progressState={video.progressState}
                                        provider={video.provider}
                                        coverUrl={video.product?.imageUrl}
                                        createdAt={video.createdAt}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
                            <div className="card-body">
                                <div className="display-1 mb-3">🎬</div>
                                <h5 className="fw-bold mb-2">ยังไม่มีวิดีโอ</h5>
                                <p className="text-muted mb-4">เริ่มสร้างวิดีโอแรกของคุณเลย!</p>
                                <Link href="/generate" className="btn btn-primary rounded-pill px-4">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    สร้างวิดีโอ
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Products */}
                <div className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold mb-0">
                            <i className="bi bi-box me-2 text-primary"></i>
                            สินค้าของคุณ
                        </h4>
                        <Link href="/products" className="btn btn-outline-primary btn-sm rounded-pill">
                            ดูทั้งหมด <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="row g-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="col-md-6 col-lg-3">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="skeleton" style={{ height: '200px', borderRadius: '16px 16px 0 0' }} />
                                        <div className="card-body">
                                            <div className="skeleton mb-2" style={{ height: '20px', width: '80%' }} />
                                            <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="row g-4">
                            {products.map(product => (
                                <div key={product.id} className="col-md-6 col-lg-3">
                                    <ProductCard {...product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
                            <div className="card-body">
                                <div className="display-1 mb-3">📦</div>
                                <h5 className="fw-bold mb-2">ยังไม่มีสินค้า</h5>
                                <p className="text-muted mb-4">เพิ่มสินค้าเพื่อสร้างวิดีโอได้เร็วขึ้น!</p>
                                <Link href="/products" className="btn btn-primary rounded-pill px-4">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    เพิ่มสินค้า
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
