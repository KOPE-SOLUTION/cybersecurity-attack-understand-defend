# Blue Team Playbook — Reverse Tabnabbing

คู่มือนี้ใช้ฝึกการตรวจหา วิเคราะห์ แก้ไข และป้องกัน Reverse Tabnabbing หลังได้รับ Finding จาก Red Team

## 1. รับและตรวจสอบ Finding

ก่อนแก้ไขให้ตรวจว่า Report มีข้อมูลครบ
- URL หรือไฟล์ที่ได้รับผลกระทบ
- Code Snippet ของลิงก์
- Browser และ Version ที่ใช้ทดสอบ
- ขั้นตอนทำซ้ำ
- หลักฐานว่า `window.opener` ใช้งานได้
- ผลกระทบต่อผู้ใช้และ Business Context

ทำ PoC ซ้ำเฉพาะใน Lab เพื่อยืนยัน Finding ก่อนเริ่มแก้ไข

## 2. Scope Analysis

อย่าแก้เฉพาะลิงก์ที่ Red Team พบ ให้ค้นหาทั้ง Codebase

```bash
rg -n 'target="_blank"' .
```

จัดกลุ่มผลลัพธ์เป็น

| กลุ่ม | การดำเนินการ |
| --- | --- |
| ไม่มี `rel` | ตรวจและเพิ่ม `noopener noreferrer` |
| มี `rel="opener"` | ลบ `opener` หากไม่มีเหตุผลจำเป็น |
| มี `noopener` | ตรวจว่าค่าไม่ถูกสร้างทับแบบ Dynamic |
| ใช้ `window.open()` | ตรวจ Feature String และ Reference ที่คืนกลับมา |
| Shared Component | แก้ที่ Component กลางและทดสอบทุก Consumer |

## 3. Root Cause

Root Cause ของ Lab คือหน้า External Site ได้รับ Reference ไปยังแท็บต้นทางผ่าน `window.opener`

```html
<a href="attacker.html" target="_blank" rel="opener">
```

Browser รุ่นใหม่จำนวนมากใช้พฤติกรรมคล้าย `noopener` เป็นค่าเริ่มต้นสำหรับ `_blank` แต่ไม่ควรใช้ค่าเริ่มต้นของ Browser เป็น Security Control เพียงชั้นเดียว โดยเฉพาะเมื่อระบบรองรับ Browser เก่า, Embedded WebView หรือ Code ที่ระบุ `rel="opener"`

## 4. Remediation

### HTML

```html
<a
  href="https://external.example"
  target="_blank"
  rel="noopener noreferrer"
>
  เปิดเว็บไซต์ภายนอก
</a>
```

### JavaScript

```js
const externalWindow = window.open(
  "https://external.example",
  "_blank",
  "noopener,noreferrer"
);

if (externalWindow) {
  externalWindow.opener = null;
}
```

### React / JSX

```jsx
<a
  href={externalUrl}
  target="_blank"
  rel="noopener noreferrer"
>
  เปิดเว็บไซต์ภายนอก
</a>
```

หาก Application มี External Link หลายจุด ให้สร้าง Shared Component ที่กำหนดค่าปลอดภัยเป็น Default

## 5. Defense in Depth

- เปิดใช้ Linter Rule เช่น `react/jsx-no-target-blank` สำหรับ React Project
- เพิ่ม Code Review Checklist สำหรับ External Link และ `window.open()`
- สร้าง Shared External Link Component
- พิจารณา `Cross-Origin-Opener-Policy` ตามสถาปัตยกรรมและทดสอบผลกระทบต่อ OAuth, Payment Popup หรือ Integration อื่นก่อนเปิดใช้
- ระบุ Browser Support Policy และ Regression Test ที่ชัดเจน

Security Header เป็นมาตรการเสริม ไม่ใช่สิ่งทดแทน `noopener` ที่ลิงก์

## 6. Detection และ Incident Analysis

Reverse Tabnabbing เกิดฝั่ง Browser จึงอาจไม่มี Server Log ที่ระบุการใช้ `window.opener` โดยตรง สัญญาณที่อาจเกี่ยวข้อง ได้แก่
- ผู้ใช้แจ้งว่าแท็บเดิมเปลี่ยนหน้าเอง
- มีการเข้าสู่หน้า Login ที่ไม่คาดคิดหลังเปิด External Link
- Browser History แสดง Navigation จากหน้าที่ควรคงอยู่
- พบ External Link ที่ขาด `noopener` จาก SAST หรือ Code Review
- พบ Domain เลียนแบบ Brand จากระบบ Monitoring ภายนอก

อย่าสรุปเหตุการณ์จากสัญญาณเดียว ให้ตรวจ URL, Timeline, Source Code และ Browser Context ร่วมกัน

เมื่อพบเหตุการณ์จริง:
1. เก็บ URL, เวลา, Browser และ Screenshot โดยไม่เก็บ Credential
2. ตรวจลิงก์ต้นทางและ Domain ปลายทาง
3. ปิดหรือลบลิงก์เสี่ยงชั่วคราวหากจำเป็น
4. แก้ Code และค้นหาจุดเสี่ยงแบบเดียวกันทั้งระบบ
5. แจ้งทีมที่ดูแล Brand/Domain หากพบหน้าเลียนแบบจริง
6. Retest และบันทึกผลหลังแก้ไข

## 7. Retest

ทดสอบเส้นทาง Safe ของ Lab

1. เปิดหน้า **Safe**
2. เปิด External Site ในแท็บใหม่
3. ยืนยันว่าหน้าแสดง **ไม่พบ window.opener**
4. ยืนยันว่าปุ่มโจมตีถูกปิดใช้งาน
5. ยืนยันว่าแท็บต้นทางไม่เปลี่ยน URL

ตรวจด้วย DevTools Console:

```js
Boolean(window.opener)
```

ผลที่คาดหวัง:
```text
false
```

## 8. Regression Test

ตัวอย่างแนวคิดสำหรับ Browser Test:

```js
const [popup] = await Promise.all([
  page.waitForEvent("popup"),
  page.getByRole("link", { name: "เปิดเว็บไซต์ภายนอก" }).click()
]);

const hasOpener = await popup.evaluate(() => Boolean(window.opener));
expect(hasOpener).toBe(false);
```

ปรับตัวอย่างให้ตรงกับ Test Framework ของโปรเจกต์ และรันบน Browser ที่องค์กรรองรับ

## 9. Closure Criteria

ปิด Finding ได้เมื่อ

- จุดที่ได้รับผลกระทบได้รับการแก้ไข
- ค้นหาและจัดการ Pattern เดียวกันทั้ง Codebase แล้ว
- External Page ไม่ได้รับ `window.opener`
- PoC เดิมไม่สามารถเปลี่ยนแท็บต้นทาง
- Regression Test ผ่าน
- Red Team หรือผู้รายงานยืนยันผล Retest

## 10. Purple Team Review

Red Team และ Blue Team ควรสรุปร่วมกันว่า

- วิธีค้นหาใดพบช่องโหว่ได้เร็วที่สุด
- หลักฐานใดช่วยให้แก้ไขได้ง่าย
- Guardrail ใดป้องกันการเกิดซ้ำได้จริง
- มี Browser, WebView หรือ Integration ใดที่ต้องทดสอบเพิ่ม
