'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ProductCardProps {
    id: string
    name: string
    imageUrl: string
    features: string
    concept: string
    targetAudience: string
    onDelete?: (id: string) => void
}

export default function ProductCard({
    id,
    name,
    imageUrl,
    features,
    concept,
    targetAudience,
    onDelete,
}: ProductCardProps) {
    const [imageError, setImageError] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const conceptLabels: Record<string, string> = {
        'unboxing': '📦 Unboxing',
        'lifestyle': '🏠 Lifestyle',
        'closeup': '🔍 Close-up',
        'before_after': '✨ Before/After',
        'demo': '🎯 Demo',
    }

    const audienceLabels: Record<string, string> = {
        'gen_z': 'Gen Z',
        'millennials': 'Millennials',
        'parents': 'พ่อแม่',
        'professionals': 'คนทำงาน',
        'beauty': 'สายบิวตี้',
    }

    const handleDelete = async () => {
        if (!onDelete) return
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return

        setIsDeleting(true)
        try {
            await onDelete(id)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="card h-100 border-0 shadow-sm" style={{
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
        }}>
            {/* Image */}
            <div className="position-relative" style={{ height: '200px', background: '#f1f5f9' }}>
                {!imageError ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-fit-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        <div className="text-center text-muted">
                            <i className="bi bi-image fs-1"></i>
                            <p className="small mt-2">ไม่สามารถโหลดรูปได้</p>
                        </div>
                    </div>
                )}

                {/* Concept badge */}
                <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge rounded-pill px-3 py-2" style={{
                        background: 'rgba(30, 58, 138, 0.9)',
                        backdropFilter: 'blur(10px)',
                    }}>
                        {conceptLabels[concept] || concept}
                    </span>
                </div>
            </div>

            <div className="card-body p-3">
                <h5 className="card-title fw-bold mb-2 text-truncate">{name}</h5>

                <p className="text-muted small mb-3" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {features}
                </p>

                <div className="d-flex gap-2 mb-3">
                    <span className="badge bg-light text-dark">
                        🎯 {audienceLabels[targetAudience] || targetAudience}
                    </span>
                </div>

                <div className="d-flex gap-2">
                    <Link
                        href={`/generate?productId=${id}`}
                        className="btn btn-primary flex-grow-1 rounded-pill"
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            border: 'none',
                        }}
                    >
                        <i className="bi bi-play-circle me-1"></i>
                        สร้างวิดีโอ
                    </Link>

                    <Link
                        href={`/products/${id}/edit`}
                        className="btn btn-outline-secondary rounded-circle"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <i className="bi bi-pencil"></i>
                    </Link>

                    {onDelete && (
                        <button
                            className="btn btn-outline-danger rounded-circle"
                            style={{ width: '40px', height: '40px' }}
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <i className="bi bi-trash"></i>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
