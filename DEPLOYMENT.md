# วิธีการ Deploy Popcorn Creator ขึ้น Vercel 🚀

การ Deploy เว็บไซต์ Next.js + Prisma ที่ง่ายที่สุดคือการใช้ **Vercel** คู่กับ Database บน Cloud (แนะนำ **Neon** หรือ **Supabase** เพราะมี Free Tier ที่ดี)

## 1. เตรียม Database (PostgreSQL) 🗄️

เนื่องจาก Vercel เป็น Serverless ไม่สามารถเก็บไฟล์ SQLite ได้ คุณต้องใช้ PostgreSQL บน Cloud

### ทางเลือกที่ 1: Neon.tech (แนะนำสำหรับ Prisma)
1. สมัคร [Neon.tech](https://neon.tech)
2. สร้าง Project ใหม่
3. Copy **Connection String** (เลือกแบบ pooled connection ถ้ามี)
4. เก็บไว้ใส่ใน Environment Variables ชื่อ `DATABASE_URL`

### ทางเลือกที่ 2: Supabase
1. สมัคร [Supabase](https://supabase.com)
2. สร้าง Project
3. ไปที่ Project Settings -> Database -> Connection String -> URI
4. Copy URI (อย่าลืมใส่ password แทน `[YOUR-PASSWORD]`)

## 2. เตรียม Project (Local) 💻

1. **เช็คไฟล์ prisma/schema.prisma**:
   - ต้องมั่นใจว่าเป็น `provider = "postgresql"` (ซึ่งตอนนี้เป็นแล้ว)
2. **Push Code ไป GitHub**:
   - คุณต้องมี Repository ของโปรเจคนี้บน GitHub

## 3. Deploy บน Vercel ▲

1. สมัคร/Login [Vercel](https://vercel.com)
2. กด **Add New...** -> **Project**
3. เลือก Repository `popcorn` ของคุณ
4. **Configure Project**:
   - **Framework Preset**: Next.js (ระบบเลือกให้อัตโนมัติ)
   - **Root Directory**: `./` (ไม่ต้องแก้)
   - **Build Command**: `next build` (Vercel จะรัน prisma generate ให้เองจาก postinstall script ที่เราเพิ่งเพิ่ม)

5. **Environment Variables** (สำคัญมาก!):
   ต้องใส่ค่าเหล่านี้ในส่วน Environment Variables:

   | Name | Value | หมายเหตุ |
   |------|-------|----------|
   | `DATABASE_URL` | `postgres://...` | Connection string จาก Neon/Supabase |
   | `NEXTAUTH_URL` | `https://your-project.vercel.app` | URL ที่ได้จาก Vercel (ใส่หลัง Deploy เสร็จก็ได้ แต่ต้องใส่) |
   | `NEXTAUTH_SECRET` | (สร้างใหม่) | รัน `openssl rand -base64 32` ใน terminal เพื่อสุ่มค่า |
   | `GOOGLE_CLIENT_ID` | `...` | จาก Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | `...` | จาก Google Cloud Console |
   | `STRIPE_SECRET_KEY` | `sk_live_...` | ใช้ key จริง หรือ test key |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ต้องตั้งค่า Webhook ใน Stripe Dashboard มาที่ `https://your-domain/api/webhooks/stripe` |
   | `OMISE_SECRET_KEY` | `skey_...` | |
   | `OMISE_PUBLIC_KEY` | `pkey_...` | |
   | `PHAYA_API_KEY` | `...` | |
   | `KIE_API_KEY` | `...` | |
   | `OPENROUTER_API_KEY` | `...` | |

6. กด **Deploy**

## 4. ตั้งค่าหลัง Deploy ⚙️

### 4.1 Update Database Schema
เนื่องจาก Vercel จะไม่ Migrate Database ให้อัตโนมัติ (เพื่อความปลอดภัย) คุณต้องรันคำสั่งนี้จากเครื่องของคุณ เพื่อ push schema ไปที่ Cloud Database:

```bash
# ในเครื่องของคุณ (Local Terminal)
# เปลี่ยน DATABASE_URL ใน .env ชั่วคราวไปเป็นของ Cloud หรือรันแบบ inline:
DATABASE_URL="postgres://..." npx prisma db push
```

### 4.2 Update Google OAuth
ไปที่ Google Cloud Console -> APIs & Services -> Credentials
- แก้ไข OAuth 2.0 Client ID
- เพิ่ม **Authorized redirect URIs**: `https://your-project.vercel.app/api/auth/callback/google`

### 4.3 Update Stripe/Omise Webhooks
- **Stripe**: Developer -> Webhooks -> Add endpoint -> `https://your-project.vercel.app/api/webhooks/stripe`
- **Omise**: Webhooks -> `https://your-project.vercel.app/api/webhooks/omise`

## เสร็จเรียบร้อย! 🎉
ตอนนี้เว็บของคุณควรจะใช้งานได้บน Vercel แล้วครับ!
