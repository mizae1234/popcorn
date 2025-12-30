'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import VideoCard from '@/components/VideoCard'

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

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [videos, setVideos] = useState<Video[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        if (session) {
            fetchVideos()
        }
    }, [session])

    // Poll for processing videos
    useEffect(() => {
        const processingVideos = videos.filter(v => v.status === 'processing')
        if (processingVideos.length === 0) return

        const interval = setInterval(() => {
            processingVideos.forEach(video => {
                checkVideoStatus(video.id)
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [videos])

    const fetchVideos = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/videos')
            if (res.ok) {
                const data = await res.json()
                setVideos(data.videos || [])
            }
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const checkVideoStatus = async (videoId: string) => {
        try {
            const res = await fetch(`/api/videos/status?videoId=${videoId}`)
            if (res.ok) {
                const data = await res.json()
                setVideos(prev => prev.map(v =>
                    v.id === videoId
                        ? { ...v, status: data.status, videoUrl: data.videoUrl }
                        : v
                ))
            }
        } catch (error) {
            console.error('Error checking video status:', error)
        }
    }

    const handleRegenerate = async (videoId: string) => {
        try {
            const res = await fetch('/api/videos/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId }),
            })

            if (res.ok) {
                const data = await res.json()
                // Update the video in the list
                setVideos(prev => prev.map(v =>
                    v.id === videoId
                        ? { ...v, id: data.video.id, jobId: data.video.jobId, status: 'processing', videoUrl: null }
                        : v
                ))
                // Refresh the session to update coins
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'เกิดข้อผิดพลาด')
            }
        } catch (error) {
            console.error('Error regenerating video:', error)
            alert('เกิดข้อผิดพลาด')
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

    const filteredVideos = videos.filter(v => {
        if (filter === 'all') return true
        return v.status === filter
    })

    const stats = {
        all: videos.length,
        completed: videos.filter(v => v.status === 'completed').length,
        processing: videos.filter(v => v.status === 'processing').length,
        failed: videos.filter(v => v.status === 'failed').length,
    }

    return (
        <div className="page-container">
            <div className="container py-4">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-2">
                                <li className="breadcrumb-item">
                                    <Link href="/dashboard">Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active">โปรไฟล์</li>
                            </ol>
                        </nav>
                        <h1 className="fw-bold mb-0">
                            <i className="bi bi-collection-play me-2 text-primary"></i>
                            วิดีโอของคุณ
                        </h1>
                    </div>
                    <Link
                        href="/generate"
                        className="btn btn-primary rounded-pill px-4"
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            border: 'none',
                        }}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        สร้างวิดีโอใหม่
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                    <div className="card-body p-2">
                        <div className="d-flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'ทั้งหมด', color: 'primary' },
                                { key: 'completed', label: 'เสร็จสิ้น', color: 'success' },
                                { key: 'processing', label: 'กำลังสร้าง', color: 'warning' },
                                { key: 'failed', label: 'ล้มเหลว', color: 'danger' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`btn rounded-pill px-4 ${filter === tab.key
                                        ? `btn-${tab.color}`
                                        : `btn-outline-${tab.color}`
                                        }`}
                                    onClick={() => setFilter(tab.key as typeof filter)}
                                >
                                    {tab.label}
                                    <span className="badge bg-white text-dark ms-2">
                                        {stats[tab.key as keyof typeof stats]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Videos Grid */}
                {isLoading ? (
                    <div className="row g-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="col-md-6 col-lg-4 col-xl-3">
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
                ) : filteredVideos.length > 0 ? (
                    <div className="row g-4">
                        {filteredVideos.map(video => (
                            <div key={video.id} className="col-md-6 col-lg-4 col-xl-3">
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
                                    onRegenerate={handleRegenerate}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
                        <div className="card-body">
                            <div className="display-1 mb-3">🎬</div>
                            <h4 className="fw-bold mb-2">
                                {filter === 'all' ? 'ยังไม่มีวิดีโอ' : `ไม่มีวิดีโอที่${filter === 'completed' ? 'เสร็จสิ้น' :
                                    filter === 'processing' ? 'กำลังสร้าง' : 'ล้มเหลว'
                                    }`}
                            </h4>
                            <p className="text-muted mb-4">
                                {filter === 'all'
                                    ? 'เริ่มสร้างวิดีโอแรกของคุณเลย!'
                                    : 'ลองเปลี่ยนตัวกรองเพื่อดูวิดีโออื่นๆ'
                                }
                            </p>
                            {filter === 'all' && (
                                <Link href="/generate" className="btn btn-primary rounded-pill px-4">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    สร้างวิดีโอ
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
