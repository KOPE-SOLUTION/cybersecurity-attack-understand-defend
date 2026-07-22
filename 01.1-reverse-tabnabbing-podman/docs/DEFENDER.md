# Part 2 — Defender Playbook

Defender รับ Finding และหลักฐานจาก Hacker แล้วแก้ที่ Root Cause ของ Trusted Site โดยใช้ Payload เดิมเป็น Regression Test

## ก่อนเริ่ม Defender

ใช้ External Site เวอร์ชันที่ Hacker เพิ่ม `hacker.js` และ rebuild แล้วเป็น Regression Test ห้ามลบ Payload หรือคืน External Site เป็นเวอร์ชันปกติเพื่อทำให้ผลทดสอบผ่าน Defender ต้องแก้เฉพาะ Trusted Site

## 1. Reproduce ก่อนแก้

ยืนยันให้ครบว่า Partner Site ไม่มี Visual Indicator, `Boolean(window.opener)` เป็น `true` และ Trusted Tab ถูกเปลี่ยนไป Port `9100` หลังรอ 5 วินาที

## 2. หา Scope

```bash
rg -n 'target="_blank"' demo/trusted-site
rg -n 'rel="opener"' demo/trusted-site
rg -n 'window\.open' demo/trusted-site
```

ในระบบจริงควรค้นหาทั้ง Source tree และตรวจ Shared Component ที่สร้าง External Link

## 3. แก้ Root Cause

ไฟล์ `demo/trusted-site/portal.html`

ก่อนแก้:

```html
<a href="http://localhost:9100/"
   target="_blank"
   rel="opener">
```

หลังแก้:

```html
<a href="http://localhost:9100/"
   target="_blank"
   rel="noopener noreferrer">
```

- `noopener` ทำให้หน้าใหม่ไม่ได้รับ Reference กลับไปยัง Trusted Tab
- `noreferrer` ไม่ส่ง HTTP `Referer` ไปยัง External Site และมีผลตัด opener ใน Browser ที่รองรับ

## 4. Rebuild และ Redeploy

```bash
podman compose up -d --build --force-recreate trusted-site
podman compose ps
```

Source ถูกบรรจุใน Image ด้วย `COPY` จึงต้อง build Image และ replace Container ก่อน Code ใหม่จะมีผล

## 5. Retest ด้วย Payload เดิม

1. ปิด External Tab เดิมทั้งหมด
2. Hard reload Trusted Site และเข้าสู่ Portal ใหม่
3. เปิดลิงก์เดิมในแท็บใหม่
4. สังเกตว่า Partner Site ยังไม่มี Visual Indicator ตามเดิม
5. ตรวจใน DevTools Console ของ External Site:

```js
Boolean(window.opener)
```

ผลต้องเป็น `false` และ Trusted Tab ต้องไม่เปลี่ยน URL หลังรอเกิน 5 วินาที

## 6. Production guardrails

- ใช้ Shared External Link Component ที่ใส่ `noopener noreferrer` เป็นค่าเริ่มต้น
- ใช้ Linter เช่น `react/jsx-no-target-blank` สำหรับ React project
- เพิ่ม Browser regression test สำหรับลิงก์ที่เปิดแท็บใหม่
- ตรวจ Link จาก CMS, Markdown renderer และ User-generated content
- กำหนด Browser/WebView support policy เพราะพฤติกรรมค่าเริ่มต้นต่างกันตามรุ่น

## Closure criteria

- [ ] `Boolean(window.opener) === false`
- [ ] Trusted Tab ยังคงอยู่บน Port `8100`
- [ ] Payload เดิมไม่สำเร็จ
- [ ] มีหลักฐานก่อนและหลังแก้ครบ
