# Red Team Playbook — Reverse Tabnabbing

คู่มือนี้ใช้ฝึกกระบวนการคิดและการทำงานของ Red Team ภายใน EP01 Lab เท่านั้น เป้าหมายคือพิสูจน์ความเสี่ยงอย่างปลอดภัยและส่งมอบหลักฐานที่ Blue Team นำไปแก้ไขได้

## 1. Rules of Engagement

ก่อนทดสอบให้กำหนดขอบเขต

| รายการ | ขอบเขตของ Lab |
| --- | --- |
| Target | `http://localhost:8000` |
| อนุญาต | ตรวจ Source Code, ทดสอบ `window.opener`, เปลี่ยนแท็บเดิมไปหน้า Phishing จำลอง |
| ไม่อนุญาต | เว็บไซต์ภายนอก, Credential จริง, การเผยแพร่หน้า Phishing, Social Engineering กับบุคคลอื่น |
| Test Data | ข้อมูลสมมติเท่านั้น |
| Stop Condition | หยุดทันทีเมื่อออกนอก `localhost` หรือพบข้อมูลจริง |

## 2. Mission

พิสูจน์ว่า External Page ที่เปิดจาก Target สามารถควบคุมแท็บต้นทาง และอธิบาย Business Impact โดยไม่รับหรือบันทึกข้อมูลผู้ใช้

เงื่อนไขสำเร็จ:
- ระบุลิงก์ที่เปิดแท็บใหม่และยังคง `window.opener` ได้
- แสดงว่าแท็บใหม่มองเห็น `window.opener`
- เปลี่ยนแท็บเดิมไปยัง `phishing.html` ได้
- เก็บหลักฐานและเขียนคำแนะนำแก้ไข

## 3. Reconnaissance

### ตรวจ Source Code

ค้นหาลิงก์ที่ใช้ `target="_blank"`

```bash
rg -n 'target="_blank"' .
```

ตรวจแต่ละผลลัพธ์ว่า
- มี `rel="noopener"` หรือไม่
- มีการระบุ `rel="opener"` หรือไม่
- URL ปลายทางอยู่ภายใต้การควบคุมของใคร
- หน้าต้นทางเกี่ยวข้องกับ Login, Account หรือข้อมูลสำคัญหรือไม่

### ตรวจใน Browser

ที่หน้า External Site เปิด DevTools Console แล้วตรวจ

```js
Boolean(window.opener)
```

- `true` หมายถึงหน้าใหม่ยังมี Reference ไปยังแท็บเดิม
- `false` หมายถึงไม่มี Reference ผ่าน `window.opener`

## 4. Exploitation ใน Lab

1. เริ่ม Web Server ตาม README ของ EP01
2. เปิดหน้า **Vulnerable**
3. เปิด External Site ในแท็บใหม่
4. ยืนยันว่าหน้าแสดง **พบ window.opener**
5. กด **จำลอง Reverse Tabnabbing**
6. ยืนยันว่าแท็บเดิมเปลี่ยนไปยัง `phishing.html`

กลไกที่ใช้ใน Lab:

```js
if (window.opener && !window.opener.closed) {
  window.opener.location.href = "phishing.html";
}
```

PoC ต้องหยุดเพียงการเปลี่ยนหน้า ห้ามเพิ่มการรับ Password, Cookie, Token หรือข้อมูลส่วนบุคคล

## 5. Evidence Collection

เก็บหลักฐานให้ Blue Team ทำซ้ำได้

| หลักฐาน | สิ่งที่ควรบันทึก |
| --- | --- |
| Affected Page | URL และชื่อไฟล์ที่มีลิงก์เสี่ยง |
| Vulnerable Code | บรรทัดที่มี `target="_blank"` และค่า `rel` |
| Browser Result | ผลของ `Boolean(window.opener)` |
| Impact | URL ของแท็บเดิมก่อนและหลัง PoC |
| Environment | Browser และ Version ที่ใช้ทดสอบ |
| Scope | ยืนยันว่าทดสอบบน `localhost` |

หลีกเลี่ยง Screenshot ที่มีข้อมูลจริงหรือข้อมูลส่วนตัว

## 6. Risk Analysis

ประเมินความเสี่ยงตามบริบท ไม่ใช่เพียงการมี `target="_blank"`

ความเสี่ยงสูงขึ้นเมื่อ
- ลิงก์ปลายทางเป็น Domain ที่องค์กรควบคุมไม่ได้
- หน้าต้นทางเป็นหน้า Login, Account หรือ Admin
- ผู้ใช้มีแนวโน้มกลับมาใช้แท็บเดิมภายหลัง
- หน้า Phishing สามารถเลียนแบบ Brand หรือเส้นทาง Login ได้แนบเนียน

ความเสี่ยงลดลงเมื่อ Browser ตัด `window.opener` โดยค่าเริ่มต้น แต่รายงานยังควรแนะนำการป้องกันใน Code อย่างชัดเจนเพื่อรองรับ Browser และ WebView ที่หลากหลาย

## 7. Finding Template

```markdown
## Reverse Tabnabbing ผ่าน External Link

Severity: Low / Medium / High ตามบริบท
Affected URL/File:
Test Environment:

### Description
อธิบายว่าหน้าใหม่ได้รับ window.opener อย่างไร

### Steps to Reproduce
1. ...
2. ...

### Evidence
- Vulnerable code:
- window.opener result:
- Original tab before/after:

### Impact
อธิบายสถานการณ์ Phishing หรือ Brand Impersonation ที่เป็นไปได้

### Recommendation
เพิ่ม rel="noopener noreferrer" และ Regression Test
```

## 8. Handoff ให้ Blue Team

ส่งมอบเฉพาะข้อมูลที่จำเป็น:

- ตำแหน่ง Code ที่ได้รับผลกระทบ
- ขั้นตอนทำซ้ำที่ชัดเจน
- Browser ที่ใช้ทดสอบ
- ผลกระทบตามบริบทของระบบ
- Acceptance Criteria หลังแก้ไข

Acceptance Criteria ที่แนะนำ: External Page ต้องได้ผล `Boolean(window.opener) === false` และแท็บต้นทางต้องไม่เปลี่ยนเมื่อรัน PoC เดิม
