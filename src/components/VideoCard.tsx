'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

interface VideoCardProps {
    id: string
    jobId: string
    status: 'processing' | 'completed' | 'failed'
    progressState?: 'waiting' | 'queuing' | 'generating' | null // Detailed state for progress
    provider?: string // phaya or kie
    videoUrl?: string | null
    coverUrl?: string | null
    prompt: string
    caption?: string | null
    productName?: string
    createdAt: string
    onRegenerate?: (id: string) => void
    onStatusUpdate?: () => void // Callback to refresh parent data
}

export default function VideoCard({
    id,
    jobId,
    status: initialStatus,
    progressState: initialProgressState,
    provider,
    videoUrl: initialVideoUrl,
    coverUrl,
    prompt,
    caption,
    productName,
    createdAt,
    onRegenerate,
    onStatusUpdate,
}: VideoCardProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [status, setStatus] = useState(initialStatus)
    const [progressState, setProgressState] = useState(initialProgressState)
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl)

    // Poll for Kie video status updates
    const checkStatus = useCallback(async () => {
        if (provider !== 'kie' || status !== 'processing') return

        try {
            const res = await fetch('/api/videos/kie/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: id }),
            })

            if (res.ok) {
                const data = await res.json()
                if (data.status !== status) {
                    setStatus(data.status)
                    setVideoUrl(data.videoUrl)
                    setProgressState(data.progressState)
                    if (data.status === 'completed' && onStatusUpdate) {
                        onStatusUpdate()
                    }
                } else if (data.progressState !== progressState) {
                    setProgressState(data.progressState)
                }
            }
        } catch (error) {
            console.error('Error checking Kie status:', error)
        }
    }, [id, provider, status, progressState, onStatusUpdate])

    useEffect(() => {
        if (provider !== 'kie' || status !== 'processing') return

        // Poll every 5 seconds
        const interval = setInterval(checkStatus, 5000)

        // Also check immediately
        checkStatus()

        return () => clearInterval(interval)
    }, [provider, status, checkStatus])

    // Calculate progress percentage and text based on progressState
    const { progress, progressText } = useMemo(() => {
        if (status === 'completed') return { progress: 100, progressText: 'เสร็จสิ้น' }
        if (status === 'failed') return { progress: 0, progressText: 'ล้มเหลว' }

        switch (progressState) {
            case 'waiting':
                return { progress: 10, progressText: 'รอคิว' }
            case 'queuing':
                return { progress: 25, progressText: 'อยู่ในคิว' }
            case 'generating':
                return { progress: 60, progressText: 'กำลังสร้าง' }
            default:
                return { progress: 30, progressText: 'กำลังประมวลผล' }
        }
    }, [status, progressState])

    const statusConfig = {
        processing: {
            color: 'warning',
            icon: 'hourglass-split',
            text: 'กำลังสร้าง...',
        },
        completed: {
            color: 'success',
            icon: 'check-circle-fill',
            text: 'เสร็จสิ้น',
        },
        failed: {
            color: 'danger',
            icon: 'x-circle-fill',
            text: 'ล้มเหลว',
        },
    }

    const config = statusConfig[status]

    const handleRegenerate = async () => {
        if (!onRegenerate) return
        if (!confirm('ต้องการสร้างวิดีโอใหม่หรือไม่? (ใช้ 15 coins)')) return

        setIsRegenerating(true)
        try {
            await onRegenerate(id)
        } finally {
            setIsRegenerating(false)
        }
    }

    const handleDownload = async () => {
        if (!videoUrl) return

        try {
            const response = await fetch(videoUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `popcorn-video-${id}.mp4`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download failed:', error)
            alert('ไม่สามารถดาวน์โหลดวิดีโอได้')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="card h-100 border-0 shadow-sm" style={{
            borderRadius: '16px',
            overflow: 'hidden',
        }}>
            {/* Video Preview */}
            <div className="position-relative" style={{
                aspectRatio: '9/16',
                background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                maxHeight: '400px',
            }}>
                {/* Overlay for readability if cover exists */}
                {coverUrl && <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }} />}

                {status === 'completed' && videoUrl ? (
                    <>
                        {isPlaying ? (
                            <video
                                src={videoUrl}
                                poster={coverUrl || undefined}
                                className="w-100 h-100 object-fit-cover"
                                controls
                                autoPlay
                                onEnded={() => setIsPlaying(false)}
                            />
                        ) : (
                            <div
                                className="w-100 h-100 d-flex align-items-center justify-content-center cursor-pointer"
                                onClick={() => setIsPlaying(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="text-center text-white">
                                    <div className="btn btn-light rounded-circle mb-3" style={{
                                        width: '70px',
                                        height: '70px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    }}>
                                        ▶️
                                    </div>
                                    <p className="small opacity-75">คลิกเพื่อเล่น</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : status === 'processing' ? (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        <div className="text-center text-white px-4" style={{ width: '100%' }}>
                            <div className="spinner-border text-warning mb-3" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="fw-medium mb-2">กำลังสร้างวิดีโอ...</p>

                            {/* Progress Bar */}
                            <div className="progress mb-2" style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                    role="progressbar"
                                    style={{
                                        width: `${progress}%`,
                                        background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                                    }}
                                    aria-valuenow={progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </div>
                            <p className="small opacity-75 mb-0">{progress}% - {progressText}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        <div className="text-center text-white">
                            <i className="bi bi-x-circle fs-1 text-danger mb-3"></i>
                            <p className="fw-medium">การสร้างวิดีโอล้มเหลว</p>
                            <p className="small opacity-75">กรุณาลองใหม่อีกครั้ง</p>
                        </div>
                    </div>
                )}

                {/* Status badge */}
                <div className="position-absolute top-0 start-0 m-2">
                    <span className={`badge bg-${config.color} d-flex align-items-center gap-1`}>
                        <i className={`bi bi-${config.icon}`}></i>
                        {config.text}
                    </span>
                </div>
            </div>

            <div className="card-body p-3">
                {productName && (
                    <h6 className="fw-bold mb-2 text-truncate">{productName}</h6>
                )}

                <p className="text-muted small mb-3" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {caption || prompt}
                </p>

                <small className="text-muted d-block mb-3">
                    <i className="bi bi-clock me-1"></i>
                    {formatDate(createdAt)}
                </small>

                <div className="d-flex gap-2">
                    {status === 'completed' && (
                        <button
                            className="btn btn-success flex-grow-1 rounded-pill"
                            onClick={handleDownload}
                        >
                            <i className="bi bi-download me-1"></i>
                            ดาวน์โหลด
                        </button>
                    )}

                    {(status === 'completed' || status === 'failed') && onRegenerate && (
                        <button
                            className="btn btn-outline-primary rounded-pill"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                        >
                            {isRegenerating ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <>
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    สร้างใหม่
                                </>
                            )}
                        </button>
                    )}

                    {status === 'processing' && (
                        <button className="btn btn-outline-warning flex-grow-1 rounded-pill" disabled>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            กำลังประมวลผล...
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
