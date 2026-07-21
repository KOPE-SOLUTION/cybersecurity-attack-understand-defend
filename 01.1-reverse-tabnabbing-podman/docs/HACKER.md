# Part 1 — Hacker Playbook

บทนี้จำลองกรณีที่ผู้โจมตีควบคุมเว็บ Partner ได้แล้ว ไม่ได้สอนการบุกรุกเว็บภายนอก และอนุญาตให้ทดสอบเฉพาะสองเว็บบน localhost ใน Lab นี้

## Objective

พิสูจน์ว่า External Site สามารถใช้ Reference จาก `window.opener` เปลี่ยน Navigation ของ Trusted Tab ไปยังหน้า Phishing Simulation ได้

## Preconditions

- Trusted Site เปิดลิงก์ด้วย `target="_blank"` และ `rel="opener"`
- Hacker ควบคุมหรือรัน JavaScript บน External Site ได้
- ผู้ใช้เปิด External Site ผ่านลิงก์จาก Trusted Site ไม่ใช่พิมพ์ URL โดยตรง

## Attack flow

1. เปิด http://localhost:8100 และบันทึกว่า Address Bar เป็น Port 8100
2. ใช้ข้อมูลสมมติเข้าสู่หน้า Portal
3. กด **อ่านบทความจาก Partner**
4. ตรวจสถานะ EXPOSED ที่ Hacker Console บน Port 9100
5. เปิด DevTools Console และตรวจ:
```js
Boolean(window.opener)
```

6. Payload ของ Lab จะทำงานหลัง 5 วินาที:

```js
window.opener.location.href = new URL(
  "/session-expired.html",
  window.location.href
).href;
```

7. กลับไปแท็บเดิมและยืนยันว่า URL เปลี่ยนจาก Port `8100` เป็น Port `9100`

## สิ่งที่เกิดขึ้นจริง

Hacker ไม่สามารถอ่าน DOM, Cookie หรือ JavaScript state ของ Trusted Site เพราะ Same-origin Policy แต่ Browser ยอมให้ Navigation ของ opener ไปยัง URL ใหม่ได้ จึงสร้างหน้า Login ปลอมขึ้นมาแทนหน้าที่ผู้ใช้เคยเชื่อถือ

## Evidence checklist

- [ ] Trusted URL ก่อนโจมตี
- [ ] External URL และสถานะ `EXPOSED`
- [ ] ผล `Boolean(window.opener) === true`
- [ ] Vulnerable link ที่มี `rel="opener"`
- [ ] Trusted Tab หลังถูกเปลี่ยนไป Port `9100`
- [ ] Browser และ Version ที่ใช้ทดสอบ

## Finding summary

```markdown
### Reverse Tabnabbing via external partner link

Precondition: Attacker can execute JavaScript on the external partner origin.
Root cause: Trusted Site explicitly preserves window.opener with rel="opener".
Impact: External Site can replace the trusted tab with a phishing page.
Recommendation: Use rel="noopener noreferrer" and add a regression check.
```
