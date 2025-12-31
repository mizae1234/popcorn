'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const CONCEPTS = [
    { value: 'unboxing', label: '📦 Unboxing', description: 'เปิดกล่องสินค้าอย่างตื่นเต้น' },
    { value: 'lifestyle', label: '🏠 Lifestyle', description: 'การใช้งานในชีวิตประจำวัน' },
    { value: 'closeup', label: '🔍 Close-up', description: 'โชว์รายละเอียดสินค้าอย่างใกล้ชิด' },
    { value: 'before_after', label: '✨ Before/After', description: 'เปรียบเทียบก่อน-หลัง' },
    { value: 'demo', label: '🎯 Demo', description: 'สาธิตวิธีใช้งาน' },
]

const TARGET_AUDIENCES = [
    { value: 'gen_z', label: '🎮 Gen Z', description: 'วัยรุ่น 15-24 ปี' },
    { value: 'millennials', label: '💼 Millennials', description: 'คนรุ่นใหม่ 25-40 ปี' },
    { value: 'parents', label: '👨‍👩‍👧 พ่อแม่', description: 'ครอบครัวที่มีลูก' },
    { value: 'professionals', label: '🏢 คนทำงาน', description: 'มืออาชีพและพนักงานออฟฟิศ' },
    { value: 'beauty', label: '💄 สายบิวตี้', description: 'คนรักสวยรักงาม' },
]

interface FormData {
    name: string
    imageUrl: string
    features: string
    concept: string
    targetAudience: string
    caption: string
    saveProduct: boolean
}

function GenerateContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId')

    const [formData, setFormData] = useState<FormData>({
        name: '',
        imageUrl: '',
        features: '',
        concept: 'unboxing',
        targetAudience: 'gen_z',
        caption: '',
        saveProduct: false,
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [isGeneratingKie, setIsGeneratingKie] = useState(false)
    const [isGeneratingVeo3, setIsGeneratingVeo3] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/?signin=true')
        }
    }, [status, router])

    useEffect(() => {
        if (productId) {
            fetchProduct(productId)
        }
    }, [productId])

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`)
            if (res.ok) {
                const product = await res.json()
                setFormData({
                    name: product.name,
                    imageUrl: product.imageUrl,
                    features: product.features,
                    concept: product.concept,
                    targetAudience: product.targetAudience,
                    caption: product.caption || '',
                    saveProduct: false,
                })
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))

        if (name === 'imageUrl') {
            setImageError(false)
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const coins = session?.user?.coins ?? 0
        if (coins < 15) {
            setError('Coins ไม่เพียงพอ กรุณาเติม coins เพื่อสร้างวิดีโอ')
            return
        }

        setIsGenerating(true)

        try {
            const res = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    imageUrl: formData.imageUrl,
                    features: formData.features,
                    concept: formData.concept,
                    targetAudience: formData.targetAudience,
                    caption: formData.caption || undefined,
                    saveProduct: formData.saveProduct,
                    productId: productId || undefined,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างวิดีโอ')
            }

            const data = await res.json()
            router.push(`/profile?videoId=${data.video.id}`)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateKie = async () => {
        setError(null)

        const coins = session?.user?.coins ?? 0
        if (coins < 15) {
            setError('Coins ไม่เพียงพอ กรุณาเติม coins เพื่อสร้างวิดีโอ')
            return
        }

        if (!formData.name || !formData.imageUrl || !formData.features) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน')
            return
        }

        setIsGeneratingKie(true)

        try {
            const res = await fetch('/api/videos/kie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    imageUrl: formData.imageUrl,
                    features: formData.features,
                    concept: formData.concept,
                    targetAudience: formData.targetAudience,
                    caption: formData.caption || undefined,
                    saveProduct: formData.saveProduct,
                    productId: productId || undefined,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างวิดีโอ')
            }

            const data = await res.json()
            router.push(`/profile?videoId=${data.video.id}`)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
        } finally {
            setIsGeneratingKie(false)
        }
    }

    const handleGenerateVeo3 = async () => {
        setError(null)

        const coins = session?.user?.coins ?? 0
        if (coins < 15) {
            setError('Coins ไม่เพียงพอ กรุณาเติม coins เพื่อสร้างวิดีโอ')
            return
        }

        if (!formData.name || !formData.imageUrl || !formData.features) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน')
            return
        }

        setIsGeneratingVeo3(true)

        try {
            const res = await fetch('/api/videos/veo3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    imageUrl: formData.imageUrl,
                    features: formData.features,
                    concept: formData.concept,
                    targetAudience: formData.targetAudience,
                    caption: formData.caption || undefined,
                    saveProduct: formData.saveProduct,
                    productId: productId || undefined,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างวิดีโอ')
            }

            const data = await res.json()
            router.push(`/profile?videoId=${data.video.id}`)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
        } finally {
            setIsGeneratingVeo3(false)
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

    const coins = session.user?.coins ?? 0
    const canGenerate = coins >= 15

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
                                <li className="breadcrumb-item active">สร้างวิดีโอ</li>
                            </ol>
                        </nav>
                        <h1 className="fw-bold mb-0">
                            <i className="bi bi-magic me-2 text-primary"></i>
                            สร้างวิดีโอ TikTok
                        </h1>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="px-4 py-2 rounded-pill" style={{
                            background: canGenerate
                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        }}>
                            <span className="me-2">🪙</span>
                            <span className="fw-bold text-dark">{coins} coins</span>
                        </div>
                    </div>
                </div>

                {/* Cost info */}
                <div className="alert alert-info border-0 rounded-3 mb-4" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)',
                }}>
                    <div className="d-flex align-items-center gap-3">
                        <span style={{ fontSize: '1.5rem' }}>💡</span>
                        <div>
                            <strong>ค่าใช้จ่าย: 15 coins ต่อวิดีโอ</strong>
                            <div className="small text-muted">
                                คุณสามารถสร้างวิดีโอได้อีก {Math.floor(coins / 15)} ครั้ง   (ใช้เวลา ประมาน 4-6 นาที ต่อคลิป กดสร้างไว้แล้วสามารถออกจากหน้าจอไปทำอย่างอื่นรอได้เลย สามารถกดสร้างรอไว้หลายคลิปในทีเดียวได้เลย)
                            </div>
                            <strong>ความเร็วขึ้นอยู่กับช่วงเวลา หาก Fail สามารถกด Generate ใหม่ได้</strong>

                        </div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 rounded-3 mb-4">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}
                        {error.includes('Coins') && (
                            <Link href="/pricing" className="btn btn-danger btn-sm ms-3">
                                เติม Coins
                            </Link>
                        )}
                    </div>
                )}

                <form onSubmit={handleGenerate}>
                    <div className="row g-4">
                        {/* Left column - Form */}
                        <div className="col-lg-7">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-body p-4">
                                    {/* Product Name */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-tag me-2"></i>
                                            ชื่อสินค้า *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="เช่น เซรั่มบำรุงผิว Vitamin C"
                                            required
                                            style={{ borderRadius: '12px' }}
                                        />
                                    </div>

                                    {/* Image URL */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-image me-2"></i>
                                            URL รูปภาพสินค้า *
                                        </label>
                                        <input
                                            type="url"
                                            className="form-control form-control-lg"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            placeholder="https://example.com/product-image.jpg"
                                            required
                                            style={{ borderRadius: '12px' }}
                                        />
                                        <small className="text-muted">
                                            ใส่ลิงก์รูปภาพที่ต้องการใช้เป็นภาพหลักในวิดีโอ
                                        </small>
                                    </div>

                                    {/* Features */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-list-check me-2"></i>
                                            คุณสมบัติสินค้า *
                                        </label>
                                        <textarea
                                            className="form-control"
                                            name="features"
                                            value={formData.features}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="เช่น ช่วยลดริ้วรอย, ผิวกระจ่างใส, ซึมซาบเร็ว, ใช้ได้กับทุกสภาพผิว"
                                            required
                                            style={{ borderRadius: '12px' }}
                                        />
                                    </div>

                                    {/* Caption for TikTok */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold d-flex align-items-center gap-2">
                                            <i className="bi bi-chat-left-text me-2"></i>
                                            Caption สำหรับโพส
                                            <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>
                                                ไม่บังคับ
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            name="caption"
                                            value={formData.caption}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="✨ สินค้าใหม่มาแรง! ลองแล้วจะติดใจ 💖&#10;#TikTokShop #สินค้าดี #รีวิวสินค้า"
                                            style={{ borderRadius: '12px' }}
                                        />
                                        <small className="text-muted mt-1 d-block">
                                            <i className="bi bi-magic me-1"></i>
                                            💡 ถ้าไม่ใส่ ระบบจะสร้าง Caption และ Hashtags ให้อัตโนมัติด้วย AI หลัง generate video เสร็จ
                                        </small>
                                    </div>

                                    {/* Concept */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-lightbulb me-2"></i>
                                            Concept วิดีโอ *
                                        </label>
                                        <div className="row g-2">
                                            {CONCEPTS.map(concept => (
                                                <div key={concept.value} className="col-md-6">
                                                    <div
                                                        className={`p-3 rounded-3 border ${formData.concept === concept.value
                                                            ? 'border-primary bg-primary bg-opacity-10'
                                                            : 'border-secondary-subtle'
                                                            }`}
                                                        onClick={() => setFormData(prev => ({ ...prev, concept: concept.value }))}
                                                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="concept"
                                                                value={concept.value}
                                                                checked={formData.concept === concept.value}
                                                                onChange={() => setFormData(prev => ({ ...prev, concept: concept.value }))}
                                                                className="form-check-input"
                                                            />
                                                            <div>
                                                                <div className="fw-medium">{concept.label}</div>
                                                                <small className="text-muted">{concept.description}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Target Audience */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <i className="bi bi-people me-2"></i>
                                            กลุ่มลูกค้าเป้าหมาย *
                                        </label>
                                        <div className="row g-2">
                                            {TARGET_AUDIENCES.map(audience => (
                                                <div key={audience.value} className="col-md-6">
                                                    <div
                                                        className={`p-3 rounded-3 border ${formData.targetAudience === audience.value
                                                            ? 'border-primary bg-primary bg-opacity-10'
                                                            : 'border-secondary-subtle'
                                                            }`}
                                                        onClick={() => setFormData(prev => ({ ...prev, targetAudience: audience.value }))}
                                                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="targetAudience"
                                                                value={audience.value}
                                                                checked={formData.targetAudience === audience.value}
                                                                onChange={() => setFormData(prev => ({ ...prev, targetAudience: audience.value }))}
                                                                className="form-check-input"
                                                            />
                                                            <div>
                                                                <div className="fw-medium">{audience.label}</div>
                                                                <small className="text-muted">{audience.description}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Save Product Checkbox */}
                                    {!productId && (
                                        <div className="form-check mb-4">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="saveProduct"
                                                name="saveProduct"
                                                checked={formData.saveProduct}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="saveProduct">
                                                บันทึกข้อมูลสินค้าไว้ใช้ภายหลัง
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right column - Preview & Generate */}
                        <div className="col-lg-5">
                            <div className="sticky-lg-top" style={{ top: '100px' }}>
                                {/* Image Preview */}
                                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
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

                                {/* Summary */}
                                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                                    <div className="card-body p-4">
                                        <h6 className="fw-bold mb-3">สรุปข้อมูล</h6>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">ชื่อสินค้า</span>
                                                <span className="fw-medium">{formData.name || '-'}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Concept</span>
                                                <span className="badge bg-primary">
                                                    {CONCEPTS.find(c => c.value === formData.concept)?.label}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">กลุ่มเป้าหมาย</span>
                                                <span className="badge bg-secondary">
                                                    {TARGET_AUDIENCES.find(a => a.value === formData.targetAudience)?.label}
                                                </span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">ค่าใช้จ่าย</span>
                                                <span className="fw-bold text-warning">🪙 15 coins</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">คงเหลือหลังสร้าง</span>
                                                <span className="fw-bold">{Math.max(0, coins - 15)} coins</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Generate Button */}

                                {/* Phaya Generate Button (Hidden) */}
                                {/* <button
                                    type="submit"
                                    className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                                    disabled={isGenerating || !canGenerate}
                                    style={{
                                        background: canGenerate
                                            ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                                            : '#9ca3af',
                                        border: 'none',
                                        color: 'white',
                                        boxShadow: canGenerate ? '0 10px 30px rgba(59, 130, 246, 0.3)' : 'none',
                                    }}
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            กำลังสร้างวิดีโอ...
                                        </>
                                    ) : !canGenerate ? (
                                        <>
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            Coins ไม่เพียงพอ
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-magic me-2"></i>
                                            สร้างวิดีโอ (15 coins)
                                        </>
                                    )}
                                </button> */}

                                {/* Kie AI Generate Button */}
                                {/* Kie AI Generate Button (Hidden) */}
                                {/* <button
                                    type="button"
                                    onClick={handleGenerateKie}
                                    className="btn btn-lg w-100 py-3 rounded-pill fw-bold mt-3"
                                    disabled={isGeneratingKie || !canGenerate}
                                    style={{
                                        background: canGenerate
                                            ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
                                            : '#9ca3af',
                                        border: 'none',
                                        color: 'white',
                                        boxShadow: canGenerate ? '0 10px 30px rgba(139, 92, 246, 0.3)' : 'none',
                                    }}
                                >
                                    {isGeneratingKie ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            กำลังสร้างวิดีโอ Kie...
                                        </>
                                    ) : !canGenerate ? (
                                        <>
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            Coins ไม่เพียงพอ
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-stars me-2"></i>
                                            สร้างวิดีโอ (15 วินาที)
                                        </>
                                    )}
                                </button> */}

                                {/* Veo 3.1 AI Generate Button */}
                                <button
                                    type="button"
                                    onClick={handleGenerateVeo3}
                                    className="btn btn-lg w-100 py-3 rounded-pill fw-bold mt-3"
                                    disabled={isGeneratingVeo3 || !canGenerate}
                                    style={{
                                        background: canGenerate
                                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                            : '#9ca3af',
                                        border: 'none',
                                        color: 'white',
                                        boxShadow: canGenerate ? '0 10px 30px rgba(16, 185, 129, 0.3)' : 'none',
                                    }}
                                >
                                    {isGeneratingVeo3 ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            กำลังสร้างวิดีโอ Veo3...
                                        </>
                                    ) : !canGenerate ? (
                                        <>
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            Coins ไม่เพียงพอ
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-play-circle me-2"></i>
                                            สร้างวิดีโอ(15 coins)
                                        </>
                                    )}
                                </button>

                                {!canGenerate && (
                                    <Link
                                        href="/pricing"
                                        className="btn btn-warning btn-lg w-100 mt-3 py-3 rounded-pill fw-bold"
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        เติม Coins
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function GeneratePage() {
    return (
        <Suspense fallback={
            <div className="page-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        }>
            <GenerateContent />
        </Suspense>
    )
}
