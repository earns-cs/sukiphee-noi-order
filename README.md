# สุกี้ผีน้อย

ระบบสั่งอาหารร้านบุฟเฟต์ สร้างด้วย Next.js (App Router, JavaScript) + Supabase, deploy บน Vercel

## เริ่มต้นใช้งาน

1. ติดตั้ง dependencies
   ```bash
   npm install
   ```

2. คัดลอกไฟล์ env ตัวอย่างแล้วใส่ค่าจริงจาก Supabase project ของคุณ
   ```bash
   cp .env.local.example .env.local
   ```

3. รันเซิร์ฟเวอร์สำหรับพัฒนา
   ```bash
   npm run dev
   ```
   เปิด [http://localhost:3000](http://localhost:3000)

## Build สำหรับ production
```bash
npm run build
npm run start
```

## Deploy
Push ขึ้น GitHub แล้วเชื่อมต่อ repo กับ Vercel จากนั้นตั้งค่า Environment Variables
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ใน Vercel Project Settings

## หมายเหตุสำคัญสำหรับนักพัฒนา / AI
ดูรายละเอียดโครงสร้างฐานข้อมูล Supabase และข้อควรระวังเรื่อง Dynamic Route `params`
(ที่เป็น Promise ต้อง unwrap ด้วย `use()`) ได้ที่ [`CLAUDE.md`](./CLAUDE.md)
