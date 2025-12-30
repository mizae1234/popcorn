'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'

interface Product {
    id: string
    name: string
    imageUrl: string
    features: string
    concept: string
    targetAudience: string
    createdAt: string
}

export default function ProductsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        imageUrl: '',
        features: '',
        concept: 'unboxing',
        targetAudience: 'gen_z',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        if (session) {
            fetchProducts()
        }
    }, [session])

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                await fetchProducts()
                setShowAddForm(false)
                setFormData({
                    name: '',
                    imageUrl: '',
                    features: '',
                    concept: 'unboxing',
                    targetAudience: 'gen_z',
                })
            }
        } catch (error) {
            console.error('Error adding product:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setProducts(products.filter(p => p.id !== id))
            }
        } catch (error) {
            console.error('Error deleting product:', error)
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
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-2">
                                <li className="breadcrumb-item">
                                    <Link href="/dashboard">Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active">สินค้า</li>
                            </ol>
                        </nav>
                        <h1 className="fw-bold mb-0">
                            <i className="bi bi-box me-2 text-primary"></i>
                            สินค้าของคุณ
                        </h1>
                    </div>
                    <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={() => setShowAddForm(true)}
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            border: 'none',
                        }}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        เพิ่มสินค้า
                    </button>
                </div>

                {/* Add Product Modal */}
                {showAddForm && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content" style={{ borderRadius: '16px' }}>
                                <div className="modal-header border-0">
                                    <h5 className="modal-title fw-bold">
                                        <i className="bi bi-plus-circle me-2 text-primary"></i>
                                        เพิ่มสินค้าใหม่
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddForm(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleAddProduct}>
                                    <div className="modal-body">
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
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
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
                                                rows={3}
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
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary rounded-pill px-4"
                                            onClick={() => setShowAddForm(false)}
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary rounded-pill px-4"
                                            disabled={isSubmitting}
                                            style={{
                                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                                border: 'none',
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    กำลังบันทึก...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    บันทึกสินค้า
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="row g-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <div className="skeleton" style={{ height: '200px', borderRadius: '16px 16px 0 0' }} />
                                    <div className="card-body">
                                        <div className="skeleton mb-2" style={{ height: '20px', width: '80%' }} />
                                        <div className="skeleton mb-3" style={{ height: '14px', width: '60%' }} />
                                        <div className="skeleton" style={{ height: '38px', borderRadius: '20px' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="row g-4">
                        {products.map(product => (
                            <div key={product.id} className="col-md-6 col-lg-4">
                                <ProductCard
                                    {...product}
                                    onDelete={handleDeleteProduct}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
                        <div className="card-body">
                            <div className="display-1 mb-3">📦</div>
                            <h4 className="fw-bold mb-2">ยังไม่มีสินค้า</h4>
                            <p className="text-muted mb-4">
                                เพิ่มสินค้าเพื่อสร้างวิดีโอได้เร็วขึ้น<br />
                                หรือสร้างวิดีโอโดยตรงก็ได้!
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <button
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={() => setShowAddForm(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                        border: 'none',
                                    }}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    เพิ่มสินค้า
                                </button>
                                <Link href="/generate" className="btn btn-outline-primary rounded-pill px-4">
                                    <i className="bi bi-magic me-2"></i>
                                    สร้างวิดีโอเลย
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
