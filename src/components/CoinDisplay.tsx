'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function CoinDisplay() {
    const { data: session } = useSession()

    if (!session) return null

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return 'ไม่มีกำหนด'
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const coins = session.user?.coins ?? 0
    const isLowCoins = coins < 30

    return (
        <div className="card border-0 shadow-sm" style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        }}>
            <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold mb-0 text-dark">
                        <span className="me-2">🪙</span>
                        Coins ของคุณ
                    </h5>
                    {isLowCoins && (
                        <span className="badge bg-danger">เหลือน้อย!</span>
                    )}
                </div>

                <div className="d-flex align-items-baseline gap-2 mb-3">
                    <span className="display-4 fw-bold" style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {coins}
                    </span>
                    <span className="text-muted">coins</span>
                </div>

                <p className="small text-muted mb-3">
                    <i className="bi bi-clock me-1"></i>
                    หมดอายุ: {formatDate(session.user?.coinsExpireAt)}
                </p>

                <div className="d-flex gap-2">
                    <Link
                        href="/pricing"
                        className="btn btn-dark flex-grow-1 rounded-pill"
                    >
                        <i className="bi bi-plus-circle me-1"></i>
                        เติม Coins
                    </Link>
                    <Link
                        href="/generate"
                        className="btn btn-outline-dark rounded-pill"
                    >
                        สร้างวิดีโอ
                    </Link>
                </div>

                <div className="mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.1)' }}>
                    <small className="text-dark">
                        💡 ใช้ 15 coins ต่อการสร้างวิดีโอ 1 ครั้ง
                    </small>
                </div>
            </div>
        </div>
    )
}
