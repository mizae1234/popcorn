'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProductFormData {
    name: string
    imageUrl: string
    features: string
    concept: string
    targetAudience: string
}

interface ProductFormProps {
    initialData?: ProductFormData
    onSubmit: (data: ProductFormData) => Promise<void>
    submitLabel?: string
    isLoading?: boolean
}

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

export default function ProductForm({
    initialData,
    onSubmit,
    submitLabel = 'บันทึก',
    isLoading = false,
}: ProductFormProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        imageUrl: '',
        features: '',
        concept: 'unboxing',
        targetAudience: 'gen_z',
    })
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'imageUrl') {
            setImageError(false)
            setImageLoading(true)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-4">
                {/* Left column - Form fields */}
                <div className="col-lg-7">
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
                                        className={`p-3 rounded-3 border cursor-pointer ${formData.concept === concept.value
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
                                                onChange={handleChange}
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
                                        className={`p-3 rounded-3 border cursor-pointer ${formData.targetAudience === audience.value
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
                                                onChange={handleChange}
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
                </div>

                {/* Right column - Preview */}
                <div className="col-lg-5">
                    <div className="sticky-lg-top" style={{ top: '100px' }}>
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-transparent border-0 py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bi bi-eye me-2"></i>
                                    ตัวอย่าง
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Image Preview */}
                                <div className="position-relative mb-3" style={{
                                    aspectRatio: '1',
                                    background: '#f1f5f9',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                }}>
                                    {formData.imageUrl && !imageError ? (
                                        <>
                                            {imageLoading && (
                                                <div className="position-absolute top-50 start-50 translate-middle">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <Image
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                fill
                                                className="object-fit-cover"
                                                onLoad={() => setImageLoading(false)}
                                                onError={() => {
                                                    setImageError(true)
                                                    setImageLoading(false)
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                            <i className="bi bi-image fs-1 mb-2"></i>
                                            <span className="small">ใส่ URL รูปภาพเพื่อดูตัวอย่าง</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info Preview */}
                                <h5 className="fw-bold mb-2">
                                    {formData.name || 'ชื่อสินค้า'}
                                </h5>
                                <p className="text-muted small mb-3">
                                    {formData.features || 'คุณสมบัติสินค้า...'}
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-primary">
                                        {CONCEPTS.find(c => c.value === formData.concept)?.label}
                                    </span>
                                    <span className="badge bg-secondary">
                                        {TARGET_AUDIENCES.find(a => a.value === formData.targetAudience)?.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-lg w-100 mt-4 py-3 rounded-pill fw-bold"
                            disabled={isLoading}
                            style={{
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                border: 'none',
                                color: 'white',
                                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    กำลังดำเนินการ...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-2"></i>
                                    {submitLabel}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
