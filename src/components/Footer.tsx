import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="py-5" style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: 'white',
        }}>
            <div className="container">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span style={{ fontSize: '2rem' }}>🍿</span>
                            <span className="fw-bold fs-4" style={{
                                background: 'linear-gradient(to right, #fbbf24, #f472b6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Popcorn Creator
                            </span>
                        </div>
                        <p className="text-white-50">
                            สร้างวิดีโอ TikTok ด้วย AI ง่ายๆ แค่ไม่กี่คลิก
                            เพิ่มยอดขายให้สินค้าของคุณวันนี้!
                        </p>
                    </div>

                    <div className="col-lg-2 col-md-4">
                        <h6 className="fw-bold mb-3">ลิงก์</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link href="/" className="text-white-50 text-decoration-none hover-white">
                                    หน้าหลัก
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link href="/generate" className="text-white-50 text-decoration-none">
                                    สร้างวิดีโอ
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link href="/pricing" className="text-white-50 text-decoration-none">
                                    ราคา
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-2 col-md-4">
                        <h6 className="fw-bold mb-3">บริการ</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <span className="text-white-50">AI Video Generator</span>
                            </li>
                            <li className="mb-2">
                                <span className="text-white-50">TikTok Content</span>
                            </li>
                            <li className="mb-2">
                                <span className="text-white-50">Product Videos</span>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-4 col-md-4">
                        <h6 className="fw-bold mb-3">ติดต่อเรา</h6>
                        <p className="text-white-50 mb-2">
                            <i className="bi bi-envelope me-2"></i>
                            support@popcorncreator.com
                        </p>
                        <div className="d-flex gap-3 mt-3">
                            <a href="#" className="text-white fs-4">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="text-white fs-4">
                                <i className="bi bi-twitter-x"></i>
                            </a>
                            <a href="#" className="text-white fs-4">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="#" className="text-white fs-4">
                                <i className="bi bi-tiktok"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <hr className="my-4 border-white-25" />

                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <small className="text-white-50">
                            © 2024 Popcorn Creator. All rights reserved.
                        </small>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <small className="text-white-50">
                            Made with ❤️ for TikTok Creators
                        </small>
                    </div>
                </div>
            </div>
        </footer>
    )
}
