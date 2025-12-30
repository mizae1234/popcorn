'use client'

import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Footer from '@/components/Footer'

const PRICE_PLANS = [
    // { id: 'mini_20', name: 'Mini Pack', price: 20, coins: 20 },
    // { id: 'topup_100', name: 'Top-up 100', price: 99, coins: 100 },
    { id: 'monthly_250', name: 'Monthly Plan', price: 199, coins: 250 },
    { id: 'pro_450', name: 'Pro Plan', price: 299, coins: 450 },
    { id: 'topup_500', name: 'Top-up 500', price: 399, coins: 500 },
]

function PricingContent() {
    const { data: session, update: updateSession } = useSession()
    const searchParams = useSearchParams()
    const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    const coins = session?.user?.coins ?? 0

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id')
            if (searchParams.get('success') === 'true' && sessionId) {
                setShowSuccess(true)

                try {
                    // Call verify API to add coins (fallback for webhook)
                    const res = await fetch('/api/stripe/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId }),
                    })

                    if (res.ok) {
                        const data = await res.json()
                        console.log('Payment verified:', data)
                    }
                } catch (error) {
                    console.error('Verify error:', error)
                }

                // Refresh session to get updated coins
                updateSession()

                // Clear URL params after 5 seconds
                setTimeout(() => {
                    window.history.replaceState({}, '', '/pricing')
                    setShowSuccess(false)
                }, 5000)
            }
        }

        verifyPayment()
    }, [searchParams, updateSession])

    const handleCheckout = async (planId: string) => {
        if (!session) {
            signIn('google', { callbackUrl: '/pricing' })
            return
        }

        setIsCheckingOut(planId)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            })

            if (res.ok) {
                const data = await res.json()
                window.location.href = data.url
            } else {
                const error = await res.json()
                alert(error.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setIsCheckingOut(null)
        }
    }

    return (
        <>
            <div className="page-container">
                {/* Success Notification */}
                {showSuccess && (
                    <div className="alert alert-success alert-dismissible fade show m-0 rounded-0 text-center" role="alert">
                        <strong>🎉 ชำระเงินสำเร็จ!</strong> Coins ได้ถูกเพิ่มเข้าบัญชีของคุณแล้ว
                        <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
                    </div>
                )}

                {/* Hero Section */}
                <section className="py-5" style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                }}>
                    <div className="container py-5 text-center">
                        <span className="badge rounded-pill px-4 py-2 mb-3" style={{
                            background: 'rgba(251, 191, 36, 0.2)',
                            color: '#fcd34d',
                        }}>
                            💰 Pricing
                        </span>
                        <h1 className="display-4 fw-bold text-white mb-3">
                            ราคาที่คุ้มค่าสำหรับทุกคน
                        </h1>
                        <p className="lead text-white-50 mb-0">
                            เริ่มต้นฟรี 50 coins • ใช้ 15 coins ต่อวิดีโอ
                        </p>
                        {session && (
                            <div className="mt-4 d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill" style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>🪙</span>
                                <span className="fw-bold text-dark fs-5">คุณมี {coins} coins</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="py-5">
                    <div className="container">
                        <div className="row justify-content-center g-4">
                            {/* Free Tier */}
                            <div className="col-md-6 col-lg-5 col-xl-4">
                                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                                    <div className="card-body p-4 p-lg-5">
                                        <div className="text-center mb-4">
                                            <span className="badge bg-success rounded-pill px-3 py-2 mb-3">
                                                สำหรับเริ่มต้น
                                            </span>
                                            <h3 className="fw-bold">Free Trial</h3>
                                            <p className="text-muted mb-0">สำหรับทดลองใช้งาน</p>
                                        </div>

                                        <div className="text-center mb-4">
                                            <span className="display-3 fw-bold text-success">ฟรี</span>
                                        </div>

                                        <div className="text-center mb-4 p-3 rounded-3 bg-light">
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <span style={{ fontSize: '2rem' }}>🪙</span>
                                                <span className="fs-3 fw-bold text-success">50 Coins</span>
                                            </div>
                                            <small className="text-muted">ได้รับทันทีเมื่อสมัคร</small>
                                        </div>

                                        <ul className="list-unstyled mb-4">
                                            {[
                                                // { text: 'สร้างวิดีโอได้ ~3 ครั้ง', included: true },
                                                { text: 'วิดีโอคุณภาพ HD', included: true },
                                                { text: 'ดาวน์โหลดได้ไม่จำกัด', included: true },
                                                { text: 'Regenerate ได้', included: true },
                                                { text: 'เก็บวิดีโอย้อนหลังได้', included: true },
                                                { text: 'สร้างวิดีโอเพิ่มเติม', included: false },
                                            ].map((feature, index) => (
                                                <li key={index} className={`d-flex align-items-center gap-2 mb-3 ${!feature.included && 'text-muted'}`}>
                                                    <span className={feature.included ? 'text-success' : 'text-muted'}>
                                                        {feature.included ? '✓' : '✗'}
                                                    </span>
                                                    {feature.text}
                                                </li>
                                            ))}
                                        </ul>

                                        {session ? (
                                            <Link
                                                href="/generate"
                                                className="btn btn-outline-success btn-lg w-100 py-3 rounded-pill"
                                            >
                                                เริ่มใช้งานเลย
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => signIn('google', { callbackUrl: '/generate' })}
                                                className="btn btn-outline-success btn-lg w-100 py-3 rounded-pill"
                                            >
                                                สมัครฟรี
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Plan */}
                            <div className="col-md-6 col-lg-5 col-xl-4">
                                <div className="card h-100 border-0 shadow-lg position-relative" style={{
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                    transform: 'scale(1.02)',
                                }}>
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <span className="badge bg-warning text-dark px-4 py-2 fs-6 rounded-pill shadow">
                                            🌟 แนะนำ
                                        </span>
                                    </div>
                                    <div className="card-body p-4 p-lg-5 text-white">
                                        <div className="text-center mb-4 mt-2">
                                            <h3 className="fw-bold">Monthly Plan</h3>
                                            <p className="text-white-50 mb-0">เหมาะสำหรับ TikTok Creator</p>
                                        </div>

                                        <div className="text-center mb-4">
                                            <span className="display-3 fw-bold text-warning">฿199</span>
                                            <span className="text-white-50">/เดือน</span>
                                        </div>

                                        <div className="text-center mb-4 p-3 rounded-3" style={{
                                            background: 'rgba(251, 191, 36, 0.2)',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                        }}>
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <span style={{ fontSize: '2rem' }}>🪙</span>
                                                <span className="fs-3 fw-bold text-warning">250 Coins</span>
                                            </div>
                                            <small className="text-white-50">ใช้ได้ภายใน 1 เดือน</small>
                                        </div>

                                        <ul className="list-unstyled mb-4">
                                            {[

                                                'วิดีโอคุณภาพ HD',
                                                'ดาวน์โหลดได้ไม่จำกัด',
                                                'Regenerate ได้หากไม่พอใจ',
                                                'เก็บวิดีโอย้อนหลังได้',
                                                'เติม Coins เพิ่มได้',
                                            ].map((feature, index) => (
                                                <li key={index} className="d-flex align-items-center gap-2 mb-3">
                                                    <span className="text-warning">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleCheckout('monthly_250')}
                                            disabled={isCheckingOut === 'monthly_250'}
                                            className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                                            style={{
                                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                border: 'none',
                                                color: '#1e3a8a',
                                                boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
                                            }}
                                        >
                                            {isCheckingOut === 'monthly_250' ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    กำลังดำเนินการ...
                                                </>
                                            ) : (
                                                'สมัครสมาชิก'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Plan */}
                            <div className="col-md-6 col-lg-5 col-xl-4">
                                <div className="card h-100 border-0 shadow-lg position-relative" style={{
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                }}>
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <span className="badge bg-light text-dark px-4 py-2 fs-6 rounded-pill shadow">
                                            🚀 คุ้มค่าสุด
                                        </span>
                                    </div>
                                    <div className="card-body p-4 p-lg-5 text-white">
                                        <div className="text-center mb-4 mt-2">
                                            <h3 className="fw-bold">Pro Plan</h3>
                                            <p className="text-white-50 mb-0">สำหรับ Creator มืออาชีพ</p>
                                        </div>

                                        <div className="text-center mb-4">
                                            <span className="display-3 fw-bold" style={{ color: '#fcd34d' }}>฿299</span>
                                            <span className="text-white-50">/เดือน</span>
                                        </div>

                                        <div className="text-center mb-4 p-3 rounded-3" style={{
                                            background: 'rgba(252, 211, 77, 0.2)',
                                            border: '1px solid rgba(252, 211, 77, 0.3)',
                                        }}>
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <span style={{ fontSize: '2rem' }}>🪙</span>
                                                <span className="fs-3 fw-bold" style={{ color: '#fcd34d' }}>450 Coins</span>
                                            </div>
                                            <small className="text-white-50">ใช้ได้ภายใน 1 เดือน</small>
                                        </div>

                                        <ul className="list-unstyled mb-4">
                                            {[
                                                // 'สร้างวิดีโอได้ ~30 ครั้ง',
                                                'วิดีโอคุณภาพ HD',
                                                'ดาวน์โหลดได้ไม่จำกัด',
                                                'Regenerate ได้หากไม่พอใจ',
                                                'เก็บวิดีโอย้อนหลังได้',
                                                'เติม Coins เพิ่มได้',
                                            ].map((feature, index) => (
                                                <li key={index} className="d-flex align-items-center gap-2 mb-3">
                                                    <span style={{ color: '#fcd34d' }}>✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleCheckout('pro_450')}
                                            disabled={isCheckingOut === 'pro_450'}
                                            className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                                            style={{
                                                background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
                                                border: 'none',
                                                color: '#7c3aed',
                                                boxShadow: '0 10px 30px rgba(252, 211, 77, 0.4)',
                                            }}
                                        >
                                            {isCheckingOut === 'pro_450' ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    กำลังดำเนินการ...
                                                </>
                                            ) : (
                                                'สมัครสมาชิก Pro'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/*
                <section className="py-4" style={{ background: '#f8fafc' }}>
                    <div className="container">
                        <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '400px', borderRadius: '16px' }}>
                            <div className="card-body p-4 text-center">
                                <span className="badge bg-success rounded-pill px-3 py-2 mb-3">💡 ลองก่อน</span>
                                <h5 className="fw-bold mb-2">Mini Pack</h5>
                                <p className="text-muted small mb-3">สำหรับทดลองสร้างวิดีโอ 1 ครั้ง</p>
                                <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                                    <span className="fs-2 fw-bold text-success">฿20</span>
                                    <span className="text-muted">=</span>
                                    <span className="fs-4">🪙 20 Coins</span>
                                </div>
                                <button
                                    onClick={() => handleCheckout('mini_20')}
                                    disabled={isCheckingOut === 'mini_20'}
                                    className="btn btn-success rounded-pill px-4"
                                >
                                    {isCheckingOut === 'mini_20' ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            กำลังดำเนินการ...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-lightning-charge me-1"></i>
                                            เติม 20 Coins
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Coin Details */}
                <section className="py-5 bg-light">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold">ระบบ Coin อธิบาย</h2>
                            <p className="text-muted">ทำความเข้าใจการใช้ Coins ในระบบ</p>
                        </div>

                        <div className="row g-4 justify-content-center">
                            {[
                                {
                                    icon: '🪙',
                                    title: 'Coin คืออะไร?',
                                    description: 'Coin เป็นหน่วยเครดิตที่ใช้ในการสร้างวิดีโอ คุณจะได้รับ 50 Coins ฟรีเมื่อสมัครใช้งาน',
                                },
                                {
                                    icon: '⏱️',
                                    title: 'อายุ Coin',
                                    description: 'Coins ที่ได้รับจากแพ็กเกจรายเดือนจะหมดอายุใน 1 เดือน ใช้ให้หมดก่อนหมดอายุนะ!',
                                },
                                {
                                    icon: '🎬',
                                    title: 'ค่าใช้จ่ายต่อวิดีโอ',
                                    description: 'การสร้างวิดีโอ 1 ครั้งใช้ 15 Coins แพ็กเกจ 250 Coins สร้างได้ประมาณ 16 วิดีโอ',
                                },
                                {
                                    icon: '🔄',
                                    title: 'Regenerate',
                                    description: 'หากไม่พอใจวิดีโอที่ได้ สามารถสร้างใหม่ได้ โดยจะใช้ 15 Coins ต่อครั้ง',
                                },
                            ].map((item, index) => (
                                <div key={index} className="col-md-6 col-lg-3">
                                    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="display-4 mb-3">{item.icon}</div>
                                            <h5 className="fw-bold mb-2">{item.title}</h5>
                                            <p className="text-muted small mb-0">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-5">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold">คำถามที่พบบ่อย</h2>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="accordion" id="faqAccordion">
                                    {[
                                        {
                                            q: 'สมัครสมาชิกแล้วได้อะไรบ้าง?',
                                            a: 'เมื่อสมัครแพ็กเกจ Monthly Plan (199 บาท/เดือน) คุณจะได้รับ 250 Coins ซึ่งสามารถใช้สร้างวิดีโอได้ประมาณ 16 ครั้ง (15 Coins/วิดีโอ)',
                                        },
                                        {
                                            q: 'Coins หมดอายุเมื่อไหร่?',
                                            a: 'Coins จากแพ็กเกจรายเดือนจะหมดอายุใน 1 เดือนหลังจากซื้อ แนะนำให้ใช้ให้คุ้มค่าก่อนหมดอายุ',
                                        },
                                        {
                                            q: 'สามารถเติม Coins เพิ่มได้ไหม?',
                                            a: 'ได้ครับ/ค่ะ! คุณสามารถซื้อ Coins เพิ่มได้ตลอดเวลา ไม่จำเป็นต้องรอ Coins หมดก่อน',
                                        },
                                        {
                                            q: 'วิดีโอไม่ถูกใจสามารถ Regenerate ได้ไหม?',
                                            a: 'ได้ครับ/ค่ะ! หากวิดีโอที่ได้ไม่ตรงใจ คุณสามารถกด Regenerate ได้ โดยจะใช้ 15 Coins ต่อครั้ง',
                                        },
                                        {
                                            q: 'รูปแบบวิดีโอเป็นอย่างไร?',
                                            a: 'วิดีโอจะถูกสร้างในแบบแนวตั้ง (9:16) เหมาะสำหรับ TikTok, Reels และ Shorts โดยอัตโนมัติ',
                                        },
                                    ].map((faq, index) => (
                                        <div key={index} className="accordion-item border-0 mb-3 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className="accordion-button collapsed fw-bold"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#faq${index}`}
                                                >
                                                    {faq.q}
                                                </button>
                                            </h2>
                                            <div id={`faq${index}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                                <div className="accordion-body text-muted">
                                                    {faq.a}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-5" style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                }}>
                    <div className="container py-4 text-center">
                        <h2 className="display-6 fw-bold text-white mb-3">
                            พร้อมเริ่มต้นสร้างวิดีโอแล้วหรือยัง?
                        </h2>
                        <p className="text-white-50 mb-4">
                            เริ่มต้นฟรี 50 coins วันนี้!
                        </p>
                        {session ? (
                            <Link
                                href="/generate"
                                className="btn btn-lg px-5 py-3 rounded-pill fw-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    border: 'none',
                                    color: '#1e3a8a',
                                }}
                            >
                                🚀 สร้างวิดีโอเลย
                            </Link>
                        ) : (
                            <button
                                onClick={() => signIn('google', { callbackUrl: '/generate' })}
                                className="btn btn-lg px-5 py-3 rounded-pill fw-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    border: 'none',
                                    color: '#1e3a8a',
                                }}
                            >
                                🚀 เริ่มใช้งานฟรี
                            </button>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    )
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="page-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
            <PricingContent />
        </Suspense>
    )
}
