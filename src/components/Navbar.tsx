'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}>
            <div className="container">
                <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
                    <Image
                        src="/logo.jpg"
                        alt="Popcorn Creator"
                        width={45}
                        height={45}
                        className="rounded-circle"
                        style={{ border: '2px solid rgba(255,255,255,0.3)' }}
                    />
                    <span className="fw-bold" style={{
                        background: 'linear-gradient(to right, #fbbf24, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.25rem'
                    }}>
                        Popcorn Creator
                    </span>
                </Link>

                <button
                    className="navbar-toggler border-0"
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link href="/" className="nav-link text-white">
                                <i className="bi bi-house me-1"></i> หน้าหลัก
                            </Link>
                        </li>
                        {session && (
                            <>
                                <li className="nav-item">
                                    <Link href="/dashboard" className="nav-link text-white">
                                        <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/generate" className="nav-link text-white">
                                        <i className="bi bi-magic me-1"></i> สร้างวิดีโอ
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/products" className="nav-link text-white">
                                        <i className="bi bi-box me-1"></i> สินค้า
                                    </Link>
                                </li>
                            </>
                        )}
                        <li className="nav-item">
                            <Link href="/pricing" className="nav-link text-white">
                                <i className="bi bi-tag me-1"></i> ราคา
                            </Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {status === 'loading' ? (
                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) : session ? (
                            <>
                                {/* Coin Display */}
                                <Link href="/pricing" className="text-decoration-none">
                                    <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>🪙</span>
                                        <span className="fw-bold text-dark">{session.user?.coins ?? 0}</span>
                                    </div>
                                </Link>

                                {/* User Dropdown */}
                                <div className="dropdown">
                                    <button
                                        className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || 'User'}
                                                width={40}
                                                height={40}
                                                className="rounded-circle"
                                                style={{ border: '2px solid rgba(255,255,255,0.5)' }}
                                            />
                                        ) : (
                                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                                style={{ width: 40, height: 40 }}>
                                                <span className="text-white fw-bold">
                                                    {session.user?.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                                        <li>
                                            <div className="dropdown-item-text">
                                                <div className="fw-bold">{session.user?.name}</div>
                                                <small className="text-muted">{session.user?.email}</small>
                                            </div>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <Link href="/profile" className="dropdown-item">
                                                <i className="bi bi-person me-2"></i> โปรไฟล์
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/profile" className="dropdown-item">
                                                <i className="bi bi-collection-play me-2"></i> วิดีโอของฉัน
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger"
                                                onClick={() => signOut()}
                                            >
                                                <i className="bi bi-box-arrow-right me-2"></i> ออกจากระบบ
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <button
                                className="btn btn-light btn-lg px-4 rounded-pill d-flex align-items-center gap-2"
                                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                style={{
                                    background: 'white',
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                เข้าสู่ระบบด้วย Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
