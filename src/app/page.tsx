import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import PricingCard from '@/components/PricingCard'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-5" style={{ background: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-4 py-2 mb-3" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)',
              color: '#1e3a8a',
            }}>
              ✨ Features
            </span>
            <h2 className="display-5 fw-bold mb-3">
              ทำไมต้องเลือก{' '}
              <span className="gradient-text">Popcorn Creator</span>
            </h2>
            <p className="lead text-muted">
              เครื่องมือสร้างวิดีโอ TikTok ด้วย AI ที่ง่ายที่สุด
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: '🚀',
                title: 'สร้างได้ใน 1 นาที',
                description: 'ใส่รูปสินค้า พิมพ์คำอธิบาย แล้วรอรับวิดีโอสวยๆ ไม่ต้องมีทักษะตัดต่อ',
                color: '#3b82f6',
              },
              {
                icon: '🎯',
                title: 'เหมาะกับ TikTok',
                description: 'วิดีโอถูกออกแบบมาเพื่อ TikTok โดยเฉพาะ สัดส่วน 9:16 คุณภาพ HD',
                color: '#8b5cf6',
              },
              {
                icon: '💰',
                title: 'ประหยัดงบโฆษณา',
                description: 'ไม่ต้องจ้างทีมวิดีโอ ไม่ต้องซื้ออุปกรณ์แพงๆ สร้างได้ไม่จำกัด',
                color: '#10b981',
              },
              {
                icon: '🎨',
                title: 'Concept หลากหลาย',
                description: 'เลือก concept ได้ตามต้องการ ทั้ง Unboxing, Lifestyle, Close-up และอื่นๆ',
                color: '#f59e0b',
              },
              {
                icon: '👥',
                title: 'ตรงกลุ่มเป้าหมาย',
                description: 'เลือกกลุ่มลูกค้าที่ต้องการ AI จะปรับสไตล์ให้เหมาะสม',
                color: '#ec4899',
              },
              {
                icon: '🔄',
                title: 'Regenerate ได้',
                description: 'ไม่พอใจ? สร้างใหม่ได้เลย ดาวน์โหลดย้อนหลังได้ตลอด',
                color: '#6366f1',
              },
            ].map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm" style={{
                  borderRadius: '16px',
                  borderTop: `4px solid ${feature.color}`,
                }}>
                  <div className="card-body p-4">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <h5 className="fw-bold mb-2">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-4 py-2 mb-3" style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
              color: '#d97706',
            }}>
              📝 How it Works
            </span>
            <h2 className="display-5 fw-bold mb-3">
              ใช้งานง่ายแค่{' '}
              <span className="gradient-text-gold">3 ขั้นตอน</span>
            </h2>
          </div>

          <div className="row g-4 align-items-center">
            {[
              {
                step: '01',
                title: 'เพิ่มสินค้า',
                description: 'ใส่ชื่อ, URL รูปภาพ และคุณสมบัติสินค้าของคุณ',
                icon: '📝',
              },
              {
                step: '02',
                title: 'เลือก Concept',
                description: 'เลือกสไตล์วิดีโอและกลุ่มลูกค้าเป้าหมาย',
                icon: '🎨',
              },
              {
                step: '03',
                title: 'รับวิดีโอ',
                description: 'รอ AI สร้างวิดีโอ แล้วดาวน์โหลดไปใช้ได้เลย',
                icon: '🎬',
              },
            ].map((item, index) => (
              <div key={index} className="col-md-4">
                <div className="text-center">
                  <div className="position-relative d-inline-block mb-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{
                      width: '120px',
                      height: '120px',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                    }}>
                      <span style={{ fontSize: '3rem' }}>{item.icon}</span>
                    </div>
                    <div className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-warning text-dark px-3 py-2 fw-bold">
                      {item.step}
                    </div>
                  </div>
                  <h4 className="fw-bold mb-2">{item.title}</h4>
                  <p className="text-muted">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="d-none d-md-block position-absolute" style={{
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}>
                    <i className="bi bi-arrow-right fs-1 text-muted opacity-25"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-5" style={{ background: 'white' }} id="pricing">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-4 py-2 mb-3" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              color: '#059669',
            }}>
              💰 Pricing
            </span>
            <h2 className="display-5 fw-bold mb-3">
              ราคาที่คุ้มค่าสำหรับ{' '}
              <span className="gradient-text">ทุกคน</span>
            </h2>
            <p className="lead text-muted">
              เริ่มต้นฟรี 40 coins • ใช้ 15 coins ต่อวิดีโอ
            </p>
          </div>

          <div className="row justify-content-center g-4">
            {/* Free tier */}
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                <div className="card-body p-4 p-lg-5">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold">Free Trial</h3>
                    <p className="text-muted">สำหรับทดลองใช้งาน</p>
                  </div>

                  <div className="text-center mb-4">
                    <span className="display-4 fw-bold text-success">ฟรี</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>🪙</span>
                    <span className="fs-4 fw-bold text-success">40 Coins</span>
                  </div>
                  <small className="text-muted">สร้างวิดีโอได้ ~2 ครั้ง</small>

                  <ul className="list-unstyled mb-4">
                    {[
                      'สร้างวิดีโอได้ ~2 ครั้ง',
                      'วิดีโอคุณภาพ HD',
                      'ดาวน์โหลดได้',
                    ].map((feature, index) => (
                      <li key={index} className="d-flex align-items-center gap-2 mb-3">
                        <span className="text-success">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/generate"
                    className="btn btn-outline-primary btn-lg w-100 py-3 rounded-pill"
                  >
                    เริ่มทดลองใช้ฟรี
                  </Link>
                </div>
              </div>
            </div>

            {/* Entry tier */}
            <div className="col-md-6 col-lg-3">
              <PricingCard />
            </div>

            {/* Pro Plan */}
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-lg position-relative" style={{
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                transform: 'scale(1.02)',
                zIndex: 1,
              }}>
                <div className="position-absolute top-0 start-50 translate-middle">
                  <span className="badge bg-warning text-dark px-4 py-2 fs-6 rounded-pill shadow">
                    🌟 แนะนำ
                  </span>
                </div>
                <div className="card-body p-4 p-lg-5 text-white">
                  <div className="text-center mb-4 mt-2">
                    <h3 className="fw-bold">Pro Plan</h3>
                    <p className="text-white-50 mb-0">สำหรับใช้งานจริง</p>
                  </div>

                  <div className="text-center mb-4">
                    <span className="display-4 fw-bold text-warning">฿299</span>
                  </div>

                  <div className="text-center mb-4 p-3 rounded-3" style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                  }}>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span style={{ fontSize: '2rem' }}>🪙</span>
                      <span className="fs-3 fw-bold text-warning">300 Coins</span>
                    </div>
                    <small className="text-white-50">สร้างได้ ~20 วิดีโอ</small>
                  </div>

                  <ul className="list-unstyled mb-4">
                    {[
                      'วิดีโอคุณภาพ HD',
                      'ดาวน์โหลดได้ไม่จำกัด',
                      'Regenerate ได้หากไม่พอใจ',
                      'เก็บวิดีโอย้อนหลังได้',
                      'คุ้มค่ามากขึ้น!',
                    ].map((feature, index) => (
                      <li key={index} className="d-flex align-items-center gap-2 mb-3">
                        <span className="text-warning">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/pricing"
                    className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      border: 'none',
                      color: '#1e3a8a',
                      boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
                    }}
                  >
                    เลือกแพ็กเกจนี้
                  </Link>
                </div>
              </div>
            </div>

            {/* Power Plan */}
            <div className="col-md-6 col-lg-3">
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
                    <h3 className="fw-bold">Power Plan</h3>
                    <p className="text-white-50 mb-0">สำหรับใช้ต่อเนื่อง</p>
                  </div>

                  <div className="text-center mb-4">
                    <span className="display-4 fw-bold" style={{ color: '#fcd34d' }}>฿499</span>
                    <span className="text-white-50">/เดือน</span>
                  </div>

                  <div className="text-center mb-4 p-3 rounded-3" style={{
                    background: 'rgba(252, 211, 77, 0.2)',
                    border: '1px solid rgba(252, 211, 77, 0.3)',
                  }}>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span style={{ fontSize: '2rem' }}>🪙</span>
                      <span className="fs-3 fw-bold" style={{ color: '#fcd34d' }}>600 Coins</span>
                    </div>
                    <small className="text-white-50">สร้างได้ ~40 วิดีโอ</small>
                  </div>

                  <ul className="list-unstyled mb-4">
                    {[
                      'วิดีโอคุณภาพ HD',
                      'ดาวน์โหลดได้ไม่จำกัด',
                      'Regenerate ได้หากไม่พอใจ',
                      'เก็บวิดีโอย้อนหลังได้',
                      'คุ้มค่าที่สุด!',
                    ].map((feature, index) => (
                      <li key={index} className="d-flex align-items-center gap-2 mb-3">
                        <span style={{ color: '#fcd34d' }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/pricing"
                    className="btn btn-lg w-100 py-3 rounded-pill fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
                      border: 'none',
                      color: '#7c3aed',
                      boxShadow: '0 10px 30px rgba(252, 211, 77, 0.4)',
                    }}
                  >
                    เลือกแพ็กเกจนี้
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }}>
        <div className="container py-5 text-center">
          <h2 className="display-5 fw-bold text-white mb-4">
            พร้อมสร้างวิดีโอ TikTok แล้วหรือยัง?
          </h2>
          <p className="lead text-white-50 mb-4">
            เริ่มต้นฟรี 40 coins วันนี้ • ไม่ต้องใช้บัตรเครดิต
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link
              href="/generate"
              className="btn btn-lg px-5 py-3 rounded-pill fw-bold"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: 'none',
                color: '#1e3a8a',
                boxShadow: '0 10px 40px rgba(251, 191, 36, 0.4)',
              }}
            >
              🚀 เริ่มใช้งานฟรี
            </Link>
            <Link
              href="/pricing"
              className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill"
            >
              ดูรายละเอียดแพ็กเกจ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
