'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Hero() {
    const { data: session } = useSession()
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

    useEffect(() => {
        // Generate random particles for animation
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 2,
        }))
        setParticles(newParticles)
    }, [])

    return (
        <section className="hero-section position-relative overflow-hidden" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
        }}>
            {/* Animated background particles */}
            <div className="particles-container position-absolute w-100 h-100" style={{ pointerEvents: 'none' }}>
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="particle position-absolute rounded-circle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: '10px',
                            height: '10px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            animation: `float 6s ease-in-out infinite`,
                            animationDelay: `${particle.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Gradient overlay */}
            <div className="position-absolute w-100 h-100" style={{
                background: 'radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
            }} />

            <div className="container position-relative py-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6 text-center text-lg-start">
                        {/* Badge */}
                        <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4" style={{
                            background: 'rgba(251, 191, 36, 0.2)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                        }}>
                            <span className="text-warning">✨</span>
                            <span className="text-white small fw-medium">AI Video Generator</span>
                            <span className="badge bg-warning text-dark">NEW</span>
                        </div>

                        {/* Main heading */}
                        <h1 className="display-3 fw-bold text-white mb-4" style={{
                            lineHeight: 1.2,
                        }}>
                            สร้างวิดีโอ{' '}
                            <span style={{
                                background: 'linear-gradient(to right, #fbbf24, #f472b6, #a855f7)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                TikTok
                            </span>{' '}
                            ด้วย{' '}
                            <span style={{
                                background: 'linear-gradient(to right, #fbbf24, #f472b6, #a855f7)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Popcorn AI
                            </span>

                        </h1>

                        <p className="lead text-white-50 mb-4" style={{ fontSize: '1.25rem' }}>
                            เพิ่มยอดขายสินค้าของคุณด้วยวิดีโอสุดปังที่สร้างจาก AI
                            แค่ใส่รูปสินค้า พิมพ์คำอธิบาย แล้วรอรับวิดีโอสวยๆ 🎬
                        </p>

                        {/* Features badges */}
                        <div className="d-flex flex-wrap gap-3 mb-4 justify-content-center justify-content-lg-start">
                            <span className="badge rounded-pill px-3 py-2" style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                color: '#86efac',
                            }}>
                                🚀 สร้างได้ใน 1 นาที
                            </span>
                            <span className="badge rounded-pill px-3 py-2" style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#93c5fd',
                            }}>
                                🎯 เหมาะกับ TikTok
                            </span>
                            <span className="badge rounded-pill px-3 py-2" style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                color: '#fcd34d',
                            }}>
                                💰 ประหยัดงบโฆษณา
                            </span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                            {session ? (
                                <Link
                                    href="/generate"
                                    className="btn btn-lg px-5 py-3 rounded-pill d-flex align-items-center gap-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        border: 'none',
                                        color: '#1e3a8a',
                                        fontWeight: 700,
                                        boxShadow: '0 10px 40px rgba(251, 191, 36, 0.4)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🎬</span>
                                    สร้างวิดีโอเลย
                                </Link>
                            ) : (
                                <button
                                    className="btn btn-lg px-5 py-3 rounded-pill d-flex align-items-center gap-2"
                                    onClick={() => signIn('google', { callbackUrl: '/generate' })}
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        border: 'none',
                                        color: '#1e3a8a',
                                        fontWeight: 700,
                                        boxShadow: '0 10px 40px rgba(251, 191, 36, 0.4)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🚀</span>
                                    เริ่มต้นใช้งานฟรี
                                </button>
                            )}
                            <Link
                                href="/pricing"
                                className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill"
                                style={{
                                    borderWidth: 2,
                                    fontWeight: 600,
                                }}
                            >
                                ดูราคา
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="d-flex gap-4 mt-5 justify-content-center justify-content-lg-start">
                            <div>
                                <div className="fw-bold fs-4 text-white">40+</div>
                                <small className="text-white-50">Coins ฟรี</small>
                            </div>
                            <div className="vr bg-white-25"></div>
                            <div>
                                <div className="fw-bold fs-4 text-white">15 Coins</div>
                                <small className="text-white-50">ต่อวิดีโอ</small>
                            </div>
                            <div className="vr bg-white-25"></div>
                            <div>
                                <div className="fw-bold fs-4 text-white">149฿</div>
                                <small className="text-white-50">ต่อเดือน</small>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Video mockup */}
                    <div className="col-lg-6">
                        <div className="position-relative">
                            {/* Phone mockup */}
                            <div className="mx-auto" style={{
                                width: '280px',
                                height: '580px',
                                background: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
                                borderRadius: '40px',
                                padding: '10px',
                                boxShadow: '0 50px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                            }}>
                                <div className="w-100 h-100 rounded-4 overflow-hidden position-relative" style={{
                                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                                }}>
                                    {/* Video placeholder content */}
                                    <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4">
                                        <div className="display-1 mb-3">🍿</div>
                                        <h5 className="fw-bold text-center">วิดีโอสินค้าสุดปัง</h5>
                                        <p className="small text-center opacity-75">สร้างด้วย AI อัตโนมัติ</p>
                                        <div className="d-flex gap-2 mt-3">
                                            <span className="badge bg-white text-dark px-3 py-2">❤️ 12.5K</span>
                                            <span className="badge bg-white text-dark px-3 py-2">💬 856</span>
                                            <span className="badge bg-white text-dark px-3 py-2">↗️ Share</span>
                                        </div>
                                    </div>

                                    {/* TikTok-like UI overlay */}
                                    <div className="position-absolute bottom-0 start-0 end-0 p-3" style={{
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                                    }}>
                                        <p className="text-white small mb-2">
                                            <span className="fw-bold">@yourshop</span> สินค้าใหม่มาแล้ว! 🛍️✨
                                        </p>
                                        <div className="d-flex gap-2">
                                            <span className="badge bg-dark bg-opacity-50">#TikTokShop</span>
                                            <span className="badge bg-dark bg-opacity-50">#สินค้าเด็ด</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            <div className="position-absolute" style={{
                                top: '10%',
                                left: '-10%',
                                animation: 'float 4s ease-in-out infinite',
                            }}>
                                <div className="px-4 py-3 rounded-3 shadow-lg" style={{
                                    background: 'white',
                                }}>
                                    <span className="fs-4">🎥</span>
                                    <span className="fw-bold text-dark ms-2">HD Quality</span>
                                </div>
                            </div>

                            <div className="position-absolute" style={{
                                bottom: '15%',
                                right: '-5%',
                                animation: 'float 5s ease-in-out infinite',
                                animationDelay: '1s',
                            }}>
                                <div className="px-4 py-3 rounded-3 shadow-lg" style={{
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                }}>
                                    <span className="fs-4">⚡</span>
                                    <span className="fw-bold text-dark ms-2">สร้างเร็ว</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
        </section>
    )
}
