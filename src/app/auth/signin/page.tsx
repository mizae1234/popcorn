'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

function SignInContent() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="card border-0 shadow-lg" style={{ borderRadius: '24px' }}>
                            <div className="card-body p-5">
                                {/* Logo */}
                                <div className="text-center mb-4">
                                    <Link href="/" className="text-decoration-none">
                                        <Image
                                            src="/logo.jpg"
                                            alt="Popcorn Creator"
                                            width={80}
                                            height={80}
                                            className="rounded-circle mb-3"
                                        />
                                        <h2 className="fw-bold" style={{
                                            background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}>
                                            Popcorn Creator
                                        </h2>
                                    </Link>
                                    <p className="text-muted">เข้าสู่ระบบเพื่อสร้างวิดีโอ TikTok</p>
                                </div>

                                {/* Sign in button */}
                                <button
                                    className="btn btn-lg w-100 py-3 rounded-pill d-flex align-items-center justify-content-center gap-3"
                                    onClick={() => signIn('google', { callbackUrl })}
                                    style={{
                                        background: 'white',
                                        border: '2px solid #e2e8f0',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    เข้าสู่ระบบด้วย Google
                                </button>

                                {/* Benefits */}
                                <div className="mt-4 p-3 rounded-3 bg-light">
                                    <h6 className="fw-bold small mb-3">✨ สิทธิประโยชน์เมื่อสมัคร:</h6>
                                    <ul className="list-unstyled small mb-0">
                                        <li className="d-flex align-items-center gap-2 mb-2">
                                            <span className="text-success">✓</span>
                                            ได้รับ 50 Coins ฟรีทันที
                                        </li>
                                        <li className="d-flex align-items-center gap-2 mb-2">
                                            <span className="text-success">✓</span>
                                            สร้างวิดีโอ TikTok ได้ ~3 ครั้ง
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <span className="text-success">✓</span>
                                            ดาวน์โหลดวิดีโอได้ไม่จำกัด
                                        </li>
                                    </ul>
                                </div>

                                {/* Back to home */}
                                <div className="text-center mt-4">
                                    <Link href="/" className="text-muted text-decoration-none small">
                                        <i className="bi bi-arrow-left me-1"></i>
                                        กลับหน้าหลัก
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
            }}>
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    )
}
