'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface FormData {
    name: string
    imageUrl: string
    features: string
    concept: string
    targetAudience: string
    caption: string
}

export default function EditProductPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const productId = params.id as string

    const [formData, setFormData] = useState<FormData>({
        name: '',
        imageUrl: '',
        features: '',
        concept: 'unboxing',
        targetAudience: 'gen_z',
        caption: '',
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        if (session && productId) {
            fetchProduct()
        }
    }, [session, productId])

    const fetchProduct = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/products/${productId}`)
            if (res.ok) {
                const product = await res.json()
                setFormData({
                    name: product.name,
                    imageUrl: product.imageUrl,
                    features: product.features,
                    concept: product.concept,
                    targetAudience: product.targetAudience,
                    caption: product.caption || '',
                })
            } else {
                setError('ไม่พบสินค้านี้')
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSaving(true)

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push('/products')
            } else {
                const data = await res.json()
                setError(data.error || 'เกิดข้อผิดพลาดในการบันทึก')
            }
        } catch (error) {
            console.error('Error updating product:', error)
            setError('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setIsSaving(false)
        }
    }

    if (status === 'loading' || isLoading) {
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

    if (error && !formData.name) {
        return (
            <div className="page-container">
                <div className="container py-5 text-center">
                    <div className="display-1 mb-3">😕</div>
                    <h2>{error}</h2>
                    <Link href="/products" className="btn btn-primary mt-3">
                        กลับไปหน้าสินค้า
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="container py-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link href="/dashboard">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/products">สินค้า</Link>
                            </li>
                            <li className="breadcrumb-item active">แก้ไข</li>
                        </ol>
                    </nav>
                </div>

                <div className="row g-4">
                    {/* Form */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-transparent border-0 py-3">
                                <h4 className="mb-0 fw-bold">
                                    <i className="bi bi-pencil me-2 text-primary"></i>
                                    แก้ไขสินค้า
                                </h4>
                            </div>
                            <div className="card-body p-4">
                                {error && (
                                    <div className="alert alert-danger">{error}</div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">ชื่อสินค้า *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            style={{ borderRadius: '12px' }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">URL รูปภาพ *</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            value={formData.imageUrl}
                                            onChange={e => {
                                                setFormData({ ...formData, imageUrl: e.target.value })
                                                setImageError(false)
                                            }}
                                            required
                                            style={{ borderRadius: '12px' }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">คุณสมบัติสินค้า *</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.features}
                                            onChange={e => setFormData({ ...formData, features: e.target.value })}
                                            rows={4}
                                            required
                                            style={{ borderRadius: '12px' }}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Concept</label>
                                            <select
                                                className="form-select"
                                                value={formData.concept}
                                                onChange={e => setFormData({ ...formData, concept: e.target.value })}
                                                style={{ borderRadius: '12px' }}
                                            >
                                                <option value="unboxing">📦 Unboxing</option>
                                                <option value="lifestyle">🏠 Lifestyle</option>
                                                <option value="closeup">🔍 Close-up</option>
                                                <option value="before_after">✨ Before/After</option>
                                                <option value="demo">🎯 Demo</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">กลุ่มเป้าหมาย</label>
                                            <select
                                                className="form-select"
                                                value={formData.targetAudience}
                                                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                                                style={{ borderRadius: '12px' }}
                                            >
                                                <option value="gen_z">🎮 Gen Z</option>
                                                <option value="millennials">💼 Millennials</option>
                                                <option value="parents">👨‍👩‍👧 พ่อแม่</option>
                                                <option value="professionals">🏢 คนทำงาน</option>
                                                <option value="beauty">💄 สายบิวตี้</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Caption */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold d-flex align-items-center gap-2">
                                            <i className="bi bi-chat-left-text me-1"></i>
                                            Caption สำหรับโพส
                                            <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>
                                                ไม่บังคับ
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            value={formData.caption}
                                            onChange={e => setFormData({ ...formData, caption: e.target.value })}
                                            rows={3}
                                            placeholder="✨ สินค้าใหม่มาแรง! ลองแล้วจะติดใจ 💖&#10;#TikTokShop #สินค้าดี #รีวิวสินค้า"
                                            style={{ borderRadius: '12px' }}
                                        />
                                        <small className="text-muted mt-1 d-block">
                                            💡 ถ้าไม่ใส่ ระบบจะสร้าง Caption และ Hashtags ให้อัตโนมัติหลัง generate video
                                        </small>
                                    </div>

                                    <div className="d-flex gap-3 mt-4">
                                        <Link
                                            href="/products"
                                            className="btn btn-outline-secondary rounded-pill px-4"
                                        >
                                            ยกเลิก
                                        </Link>
                                        <button
                                            type="submit"
                                            className="btn btn-primary rounded-pill px-4"
                                            disabled={isSaving}
                                            style={{
                                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                                border: 'none',
                                            }}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    กำลังบันทึก...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    บันทึกการแก้ไข
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-transparent border-0 py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bi bi-eye me-2"></i>
                                    ตัวอย่างรูปภาพ
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="position-relative" style={{
                                    aspectRatio: '1',
                                    background: '#f1f5f9',
                                }}>
                                    {formData.imageUrl && !imageError ? (
                                        <Image
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-fit-cover"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                            <i className="bi bi-image fs-1 mb-2"></i>
                                            <span className="small">ใส่ URL รูปภาพเพื่อดูตัวอย่าง</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
