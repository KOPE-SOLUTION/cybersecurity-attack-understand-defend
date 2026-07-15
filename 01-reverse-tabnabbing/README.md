# EP01 — Reverse Tabnabbing

Lab นี้สาธิตว่าเว็บไซต์ปลายทางซึ่งเปิดในแท็บใหม่อาจใช้ `window.opener` เปลี่ยนหน้าเดิมให้กลายเป็นหน้า Phishing ได้อย่างไร และป้องกันด้วย `rel="noopener noreferrer"`

> ใช้เพื่อการศึกษาในเครื่องของตนเองเท่านั้น ทุกหน้าใน Lab เป็นข้อมูลจำลอง

## สิ่งที่จะได้เรียนรู้

- `target="_blank"` และ `window.opener` เกี่ยวข้องกันอย่างไร
- วิธีพิสูจน์ช่องโหว่และเก็บหลักฐานแบบ Red Team
- วิธีวิเคราะห์ แก้ไข และป้องกันการเกิดซ้ำแบบ Blue Team
- วิธี Retest ร่วมกันแบบ Purple Team

## เลือกเส้นทางการฝึก

| บทบาท | เป้าหมาย | คู่มือ |
| --- | --- | --- |
| Red Team | ค้นหาจุดเสี่ยง สร้าง PoC ประเมินผลกระทบ และเขียน Finding | [Red Team Playbook](./docs/RED_TEAM.md) |
| Blue Team | ตรวจสอบ Finding, Scope ระบบ, แก้ไข เพิ่ม Guardrail และ Regression Test | [Blue Team Playbook](./docs/BLUE_TEAM.md) |
| Purple Team | นำ PoC เดิมมาทดสอบหลังแก้ไขและสรุปสิ่งที่ต้องปรับปรุงร่วมกัน | ใช้ Checklist จากทั้งสอง Playbook |

## เริ่ม Lab

เปิด Terminal ที่โฟลเดอร์ Repository แล้วรัน

```bash
cd 01-reverse-tabnabbing/demo
python -m http.server 8000
```

จากนั้นเปิด <http://localhost:8000>

> ไม่แนะนำให้เปิดไฟล์ด้วย `file://` เพราะ Browser อาจจัดการสิทธิ์และ Origin แตกต่างจาก Web Server

## ทดลองแบบย่อ

### 1. Attack — หน้า Vulnerable

1. เลือก **ทดลองแบบ Vulnerable**
2. เปิด External Site ในแท็บใหม่
3. กด **จำลอง Reverse Tabnabbing**
4. กลับไปดูแท็บเดิม ซึ่งจะถูกเปลี่ยนเป็นหน้า Phishing จำลอง

โค้ดที่ทำให้เกิดความเสี่ยง:

```html
<a href="attacker.html" target="_blank" rel="opener">
  เปิด External Site
</a>
```

Lab ระบุ `rel="opener"` อย่างชัดเจนเพื่อให้สาธิตได้สม่ำเสมอ เนื่องจาก Browser รุ่นใหม่จำนวนมากป้องกันลิงก์ `target="_blank"` โดยอัตโนมัติแล้ว

### 2. Understand — ต้นเหตุ

เมื่อแท็บใหม่เข้าถึง `window.opener` ได้ จะสามารถสั่งให้แท็บเดิมเปลี่ยน URL ได้

```js
window.opener.location.href = "phishing.html";
```

ผู้ใช้อาจเชื่อว่าแท็บเดิมยังเป็นเว็บไซต์ที่ไว้ใจ และกรอกข้อมูลลงในหน้า Phishing ที่ถูกสับเปลี่ยนเข้ามา

### 3. Defend — หน้า Safe

ตัดการเชื่อมโยงกับแท็บเดิมด้วย `noopener`

```html
<a href="attacker.html" target="_blank" rel="noopener noreferrer">
  เปิด External Site อย่างปลอดภัย
</a>
```

- `noopener` ทำให้หน้าใหม่ไม่ได้รับ `window.opener`
- `noreferrer` ไม่ส่งค่า `Referer` และมีผลคล้าย `noopener` ใน Browser ที่รองรับ

### 4. Retest — ทดสอบซ้ำ

1. กลับหน้าแรกและเลือก **ทดลองแบบ Safe**
2. เปิด External Site
3. ยืนยันว่าหน้าใหม่แสดง **ไม่พบ window.opener**
4. ยืนยันว่าแท็บเดิมไม่ถูกเปลี่ยน

## Purple Team Exercise

1. Red Team ส่ง Finding โดยใช้ Template ใน Playbook
2. Blue Team ทำ PoC ซ้ำและค้นหา Pattern เดียวกันทั้ง Codebase
3. Blue Team แก้ไขหน้า Vulnerable โดยไม่ดู `safe.html`
4. Red Team ใช้ขั้นตอนเดิม Retest
5. ทั้งสองทีมสรุป Root Cause, Detection Gap และ Guardrail ที่จะป้องกันการเกิดซ้ำ

เงื่อนไขผ่าน Lab:

```text
Boolean(window.opener) === false
และแท็บต้นทางไม่เปลี่ยนเมื่อใช้ PoC เดิม
```

## โครงสร้างไฟล์

```text
01-reverse-tabnabbing/
├── README.md
├── docs/
│   ├── RED_TEAM.md
│   └── BLUE_TEAM.md
└── demo/
    ├── index.html
    ├── vulnerable.html
    ├── safe.html
    ├── attacker.html
    ├── phishing.html
    ├── attacker.js
    └── styles.css
```

[กลับไปหน้าหลัก](../README.md)
