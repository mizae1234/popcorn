'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'

interface PricingCardProps {
    recommended?: boolean
}

export default function PricingCard({ recommended = false }: PricingCardProps) {
    const { data: session } = useSession()

    return (
        <div className={`card h-100 border-0 shadow-lg ${recommended ? 'scale-105' : ''}`} style={{
            background: recommended
                ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                : 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            transform: recommended ? 'scale(1.02)' : 'scale(1)',
        }}>
            {recommended && (
                <div className="text-center py-2 fw-bold" style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#1e3a8a',
                }}>
                    🌟 แนะนำ
                </div>
            )}

            <div className="card-body p-4 p-lg-5">
                <div className="text-center mb-4">
                    <h3 className={`fw-bold ${recommended ? 'text-white' : 'text-dark'}`}>
                        Entry Plan
                    </h3>
                    <p className={recommended ? 'text-white-50' : 'text-muted'}>
                        สำหรับทดลองใช้งาน
                    </p>
                </div>

                <div className="text-center mb-4">
                    <span className={`display-4 fw-bold ${recommended ? 'text-warning' : 'text-primary'}`}>
                        ฿149
                    </span>
                    <span className={recommended ? 'text-white-50' : 'text-muted'}></span>
                </div>

                {/* Coin highlight */}
                <div className="text-center mb-4 p-3 rounded-3" style={{
                    background: recommended
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: `1px solid ${recommended ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                }}>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                        <span style={{ fontSize: '2rem' }}>🪙</span>
                        <span className={`fs-3 fw-bold ${recommended ? 'text-warning' : 'text-warning'}`}>
                            120 Coins
                        </span>
                    </div>
                    <small className={recommended ? 'text-white-50' : 'text-muted'}>
                        สร้างได้ ~8 วิดีโอ
                    </small>
                </div>

                <ul className="list-unstyled mb-4">
                    {[
                        // 'สร้างวิดีโอได้ ~16 ครั้ง (15 coins/ครั้ง)',
                        'วิดีโอคุณภาพ HD',
                        'เหมาะสำหรับ TikTok',
                        'ดาวน์โหลดได้ไม่จำกัด',
                        'เก็บวิดีโอย้อนหลังได้',
                        'Regenerate ได้หากไม่พอใจ',
                    ].map((feature, index) => (
                        <li key={index} className={`d-flex align-items-center gap-2 mb-3 ${recommended ? 'text-white' : 'text-dark'}`}>
                            <span className="text-success">✓</span>
                            {feature}
                        </li>
                    ))}
                </ul>

                {session ? (
                    <Link
                        href="/pricing"
                        className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                        style={{
                            background: recommended
                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            border: 'none',
                            color: recommended ? '#1e3a8a' : 'white',
                            boxShadow: recommended
                                ? '0 10px 30px rgba(251, 191, 36, 0.4)'
                                : '0 10px 30px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        เลือกแพ็กเกจนี้
                    </Link>
                ) : (
                    <button
                        className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                        onClick={() => signIn('google', { callbackUrl: '/pricing' })}
                        style={{
                            background: recommended
                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            border: 'none',
                            color: recommended ? '#1e3a8a' : 'white',
                            boxShadow: recommended
                                ? '0 10px 30px rgba(251, 191, 36, 0.4)'
                                : '0 10px 30px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        เริ่มต้นใช้งาน
                    </button>
                )}
            </div>
        </div>
    )
}
