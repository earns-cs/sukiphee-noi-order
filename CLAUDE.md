# สุกี้ผีน้อย — บันทึกอ้างอิงโปรเจกต์

## ภาพรวม
ระบบสั่งอาหารร้านบุฟเฟต์ "สุกี้ผีน้อย"
- Framework: Next.js (App Router) — **JavaScript เท่านั้น ไม่ใช่ TypeScript**
- Backend/DB: Supabase
- Deploy: Vercel

## ⚠️ ข้อควรระวังสำคัญ: Dynamic Route Params เป็น Promise
โปรเจกต์นี้ใช้ Next.js เวอร์ชันล่าสุด ซึ่ง `params` (และ `searchParams`) ใน Dynamic Route
**ไม่ใช่ object ธรรมดาอีกต่อไป แต่เป็น Promise** ต้อง unwrap ก่อนใช้งานเสมอ

- ใน **Server Component**: ต้อง `await params` ก่อนใช้
  ```js
  export default async function Page({ params }) {
    const { id } = await params;
    ...
  }
  ```
- ใน **Client Component**: ต้อง unwrap ด้วย `use()` จาก React
  ```js
  'use client';
  import { use } from 'react';

  export default function Page({ params }) {
    const { id } = use(params);
    ...
  }
  ```

จะต้องใช้กฎนี้ตอนสร้างหน้าสั่งอาหาร (เช่น `/order/[tableNumber]` หรือคล้ายกัน) ในขั้นตอนถัดไป
ห้ามเขียนโค้ดที่เข้าถึง `params.xxx` ตรง ๆ โดยไม่ unwrap ก่อน

## โครงสร้างฐานข้อมูล Supabase (มีอยู่แล้ว ใช้อ้างอิงเท่านั้น ไม่ต้องสร้าง)

### `sessions`
| column | type |
|---|---|
| id | — |
| table_number | — |
| adult_count | — |
| child_count | — |
| status | — |
| created_at | — |

### `menu_categories`
| column | type |
|---|---|
| id | — |
| name | — |
| sort_order | — |

### `menu_items`
| column | type |
|---|---|
| id | — |
| category_id | — |
| name | — |

### `orders`
| column | type |
|---|---|
| id | — |
| session_id | — |
| table_number | — |
| items | jsonb |
| status | — |
| created_at | — |

## Environment Variables
ตั้งค่าใน `.env.local` (ห้าม commit — อยู่ใน `.gitignore` แล้ว) และใน Vercel Project Settings:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
ดูตัวอย่างได้ที่ `.env.local.example`

## หน้าเว็บที่มีตอนนี้ (placeholder สำหรับทดสอบ deploy)
- `/` — หน้าแรก แสดงชื่อร้านและลิงก์ไปหน้าอื่น
- `/generate-qr` — placeholder
- `/kitchen` — placeholder
