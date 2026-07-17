# Part 3 — Blue Team: แก้ Trusted Site และ Retest

Blue Team รับ Finding จาก Red Team แล้วแก้ Root Cause ที่ Trusted Site บน Port `8000`

## 1. Reproduce

ก่อนแก้ไขให้ทำ PoC ซ้ำและยืนยันว่า

- External Site พบ `window.opener`
- Trusted Tab ถูกเปลี่ยนจาก Port `8000` ไป Port `9000`
- Preconditions ระบุชัดว่า Attacker ต้องควบคุม External Site

## 2. หา Scope

```bash
rg -n 'target="_blank"' .
rg -n 'rel="opener"' .
rg -n 'window\.open' .
```

## 3. แก้ `trusted-site/index.html`

### ก่อนแก้

```html
<a href="http://localhost:9000/external-site/"
   target="_blank"
   rel="opener">
  เปิดบทความในแท็บใหม่
</a>
```

### หลังแก้

```html
<a href="http://localhost:9000/external-site/"
   target="_blank"
   rel="noopener noreferrer">
  เปิดบทความในแท็บใหม่
</a>
```

- `noopener` ตัด Reference ไปยัง Trusted Tab
- `noreferrer` ไม่ส่งค่า Referer ไป External Site

ใน Production ต้องแทนที่ Code ที่มีช่องโหว่ ไม่ควรเก็บ `rel="opener"` ไว้

## 4. กรณีใช้ JavaScript

```js
const popup = window.open(url, "_blank", "noopener,noreferrer");
if (popup) popup.opener = null;
```

## 5. Retest ด้วย External Site เดิม

1. Reload Trusted Site
2. เปิด External Link
3. ที่ External Site ตรวจ `Boolean(window.opener)`
4. ผลต้องเป็น `false`
5. รอเกิน 3 วินาที
6. Trusted Tab ต้องไม่เปลี่ยน URL

Blue Team ต้องใช้ PoC เดิมของ Red Team ไม่ควรแก้ External Site เพื่อทำให้ผลทดสอบผ่าน

## 6. Guardrail

- Shared External Link Component
- Linter Rule เช่น `react/jsx-no-target-blank`
- Code Review Checklist
- Browser Regression Test
- Browser/WebView Support Policy

## 7. Closure Criteria

```text
Boolean(window.opener) === false
Trusted Tab ยังคงอยู่บน Port 8000
PoC เดิมไม่สำเร็จ
Regression Test ผ่าน
```

จากนั้นให้ Red Team Retest และทำ Purple Team Review ร่วมกัน
