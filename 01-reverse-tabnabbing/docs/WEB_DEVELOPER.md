# Part 1 — Web Developer: สร้าง Trusted Site และ External Link

บทนี้สร้างเว็บไซต์ต้นทางที่ผู้ใช้เชื่อถือ และลิงก์ไปยัง External Site ซึ่งรันคนละ Origin

## Architecture

| Site | URL | เจ้าของในสถานการณ์ |
| --- | --- | --- |
| Trusted Site | `http://localhost:8000/trusted-site/` | Web Developer |
| External Site | `http://localhost:9000/external-site/` | Partner ภายนอก |

Port ต่างกันถือเป็นคนละ Origin แม้ใช้ `localhost` เหมือนกัน

## ไฟล์ที่ Web Developer สร้าง

```text
demo/
├── trusted-site/
│   └── index.html
└── style.css
```

External Site จะถูกสร้างแยกใน Part 2 เพื่อจำลองเว็บไซต์ภายนอกที่ Red Team ควบคุม

## 1. สร้าง `trusted-site/index.html`

```html
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Trusted Developer Portal</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <main>
    <h1>Developer Portal</h1>
    <p>อ่านบทความจาก Partner Security Blog</p>

    <a href="http://localhost:9000/external-site/"
       target="_blank"
       rel="opener">
      เปิดบทความในแท็บใหม่
    </a>
  </main>
</body>
</html>
```

## 2. ทำความเข้าใจลิงก์

| Code | ความหมาย |
| --- | --- |
| `localhost:9000` | External Site คนละ Origin |
| `target="_blank"` | เปิด External Site ในแท็บใหม่ |
| `rel="opener"` | จงใจยอมให้หน้าใหม่ได้รับ `window.opener` สำหรับ Lab |

ในสถานการณ์จริง Developer อาจลิงก์ไปยัง Partner, Documentation, Blog, Advertisement หรือ User-generated URL

Lab ใช้ `rel="opener"` อย่างชัดเจน เพราะ Browser รุ่นใหม่จำนวนมากป้องกัน `_blank` โดยอัตโนมัติแล้ว

## 3. เพิ่ม CSS เท่าที่จำเป็น

CSS ไม่มีผลต่อช่องโหว่ ใช้ไฟล์ `style.css` ที่ให้มา หรือไม่ใช้ CSS ก็ได้

## 4. เปิด Trusted Site

เปิด Terminal ที่โฟลเดอร์ `demo`

```bash
python -m http.server 8000
```

เปิด <http://localhost:8000/trusted-site/>

External Link จะเชื่อมต่อไม่ได้จนกว่าจะเปิด Server ของ External Site ใน Part 2

## 5. ส่งมอบให้ Red Team

Red Team ได้รับ Scope ดังนี้

- ทดสอบ Trusted Site บน Port `8000`
- จำลองการควบคุม External Site บน Port `9000`
- ห้ามใช้งานกับเว็บไซต์ภายนอกจริง
- ใช้ข้อมูลสมมติเท่านั้น

ในระบบจริง Hacker จะโจมตีได้ก็ต่อเมื่อควบคุม External Site หรือสามารถรัน JavaScript บน External Site ได้ ไม่ใช่เพียงพบลิงก์เท่านั้น
