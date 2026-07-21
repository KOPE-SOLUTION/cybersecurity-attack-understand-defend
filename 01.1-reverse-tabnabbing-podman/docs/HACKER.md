# Part 1 — Hacker Playbook

บทนี้จำลองกรณีที่ผู้โจมตีควบคุมเว็บ Partner ได้แล้ว ไม่ได้สอนการบุกรุกเว็บไซต์ภายนอก และอนุญาตให้ทดสอบเฉพาะสองเว็บไซต์บน `localhost` ของ Lab นี้เท่านั้น

> [!WARNING]
> ใช้ Credential สมมติเท่านั้น หน้า Login ใน Lab ไม่มี Backend และไม่ส่งหรือจัดเก็บข้อมูล แต่ไม่ควรนำขั้นตอนไปทดลองกับระบบที่ไม่ได้รับอนุญาต

## Objective

พิสูจน์ว่า External Site สามารถใช้ `window.opener` เปลี่ยน Navigation ของ Trusted Tab ไปยังหน้า Login ปลอมได้ พร้อมเก็บหลักฐานที่ Defender สามารถใช้ Reproduce และแก้ Root Cause

## Scope และ Architecture

| ระบบ | URL | บทบาทในสถานการณ์ |
| --- | --- | --- |
| Trusted Site | <http://localhost:8100> | หน้า Login จริงและ CloudOps Portal |
| External Site | <http://localhost:9100> | Partner Site ที่ Hacker ควบคุมใน Lab |

ตรวจสอบว่า Container พร้อมก่อนเริ่ม:

```bash
podman compose ps
```

ทั้งสอง Service ควรอยู่ในสถานะทำงาน และ Port ต้อง bind กับ `127.0.0.1` เท่านั้น

## Preconditions

การโจมตีจะสำเร็จเมื่อครบทุกเงื่อนไขต่อไปนี้:

- Trusted Site เปิด External Site ด้วย `target="_blank"` และ `rel="opener"`
- Hacker ควบคุมหรือสามารถรัน JavaScript บน External Site ได้
- ผู้ใช้เปิด External Site ผ่านลิงก์จาก Trusted Site ไม่ใช่พิมพ์ URL โดยตรง
- Browser อนุญาตให้หน้าใหม่ได้รับ `window.opener` ตามที่ Lab กำหนด

เพียงพบ External Link ยังไม่ถือว่าโจมตีได้ หาก Hacker ไม่สามารถควบคุมหรือรัน JavaScript ที่ปลายทาง

## 1. เก็บ Baseline ของหน้า Login จริง

1. เปิด <http://localhost:8100>
2. ยืนยันว่า Address Bar แสดง Port `8100`
3. สังเกตชื่อ KOPE CloudOps, Layout, ข้อความ และปุ่ม Login
4. ใช้ Username และ Password สมมติเข้าสู่หน้า Portal
5. ยืนยันว่า URL เปลี่ยนเป็น `/portal.html` และยังอยู่บน Port `8100`

เป้าหมายของขั้นตอนนี้คือให้เห็นว่าหน้า Login ปลอมสามารถเลียนแบบหน้าตาได้ แต่ไม่สามารถใช้ Origin เดียวกับเว็บจริงในสถานการณ์ Lab นี้

## 2. ตรวจ Vulnerable Link

ในหน้า Portal ให้ตรวจลิงก์ **อ่านบทความจาก Partner** ด้วย Browser DevTools หรือดู Source:

```html
<a href="http://localhost:9100/"
   target="_blank"
   rel="opener">
```

- `target="_blank"` เปิด Partner Site ในแท็บใหม่
- `rel="opener"` จงใจคง Reference กลับมายัง Trusted Tab สำหรับ Lab

## 3. เปิด External Site และตรวจ Opener

1. กด **อ่านบทความจาก Partner** จากหน้า Portal
2. ยืนยันว่าแท็บใหม่อยู่ที่ Port `9100`
3. ตรวจสถานะใน Hacker Console ซึ่งควรแสดง `EXPOSED`
4. เปิด DevTools Console ของ External Site แล้วรัน:

```js
Boolean(window.opener)
```

ผลที่คาดหวังก่อนแก้ไข:

```text
true
```

ผลนี้พิสูจน์ว่า External Site มี Reference กลับไปยังแท็บที่เปิดมันขึ้นมา

## 4. ทำความเข้าใจ Payload

External Site ใน Lab มี Payload เตรียมไว้แล้วและจะทำงานหลัง Countdown:

```js
const phishingUrl = new URL(
  "/session-expired.html",
  window.location.href
);

window.opener.location.href = phishingUrl.href;
```

Payload ไม่อ่านข้อมูลจาก Trusted Site แต่กำหนด URL ใหม่ให้ Navigation ของ Trusted Tab

## 5. ตรวจผลกระทบ

1. รอให้ Countdown สิ้นสุด
2. กลับไปยัง Trusted Tab เดิม
3. ยืนยันว่า URL เปลี่ยนจาก Port `8100` เป็น `9100`
4. ยืนยันว่าหน้าเดิมกลายเป็น `/session-expired.html`
5. เปรียบเทียบหน้า Login ปลอมกับ Baseline ที่เก็บไว้
6. หากทดลองแบบฟอร์ม ให้ใช้ข้อมูลสมมติเท่านั้น

### จุดสังเกตหน้า Login ปลอม

| สัญญาณ | Login จริง | Login ปลอม |
| --- | --- | --- |
| Origin | `localhost:8100` | `localhost:9100` |
| จังหวะ | ผู้ใช้เปิดหน้า Login เอง | ปรากฏขึ้นหลังเปิดเว็บ Partner |
| ข้อความ | เข้าสู่ระบบตามปกติ | อ้างว่า Session หมดอายุและเร่งให้กรอกซ้ำ |
| รูปลักษณ์ | UI ของระบบจริง | เลียนแบบสี โลโก้ และ Layout ได้ |

URL/Origin เป็นหลักฐานที่สำคัญกว่ารูปลักษณ์ เพราะสี โลโก้ ข้อความ และ Layout สามารถคัดลอกได้ ใน Production ควรตรวจ Domain, HTTPS/Certificate และสังเกตว่า Password Manager ยอมเติม Credential ให้ Origin นั้นหรือไม่

## สิ่งที่ Same-origin Policy ป้องกันและไม่ป้องกัน

Hacker ไม่สามารถอ่าน DOM, Cookie หรือ JavaScript state ของ Trusted Site เพราะทั้งสองเว็บไซต์เป็นคนละ Origin แต่ Browser ยังอนุญาตให้ External Site สั่ง Navigation ของ `window.opener` ไปยัง URL ใหม่ได้ในเงื่อนไขของ Lab

ผลกระทบของ Finding นี้จึงเป็นการเปลี่ยน Trusted Tab ไปยังหน้า Phishing ไม่ใช่การอ่านข้อมูลภายใน Trusted Site โดยตรง

## Evidence checklist

- [ ] URL ของหน้า Login จริงและ Portal ก่อนโจมตี
- [ ] Source ของลิงก์ที่มี `target="_blank"` และ `rel="opener"`
- [ ] URL ของ External Site บน Port `9100`
- [ ] สถานะ `EXPOSED` ใน Hacker Console
- [ ] ผล `Boolean(window.opener) === true`
- [ ] URL ของ Trusted Tab ก่อนและหลัง Payload ทำงาน
- [ ] ภาพเปรียบเทียบ Login จริงกับ Login ปลอม
- [ ] Browser และ Version ที่ใช้ทดสอบ
- [ ] Preconditions และ Scope ที่ได้รับอนุญาต

## Finding สำหรับส่งให้ Defender

```markdown
### Reverse Tabnabbing via external partner link

#### Preconditions
Attacker must be able to execute JavaScript on the external partner origin,
and the user must open that origin through the vulnerable link.

#### Root cause
Trusted Site explicitly preserves window.opener with rel="opener".

#### Impact
External Site can replace the trusted tab with a phishing page that imitates
the legitimate login experience.

#### Evidence
- Boolean(window.opener) returned true.
- Trusted Tab changed from localhost:8100 to localhost:9100.
- The original link contained target="_blank" and rel="opener".

#### Recommendation
Use rel="noopener noreferrer", rebuild the Trusted Site image, and retest
with the original External Site payload.
```

## ส่งมอบให้ Defender

ส่ง Finding, Evidence และขั้นตอน Reproduce ให้ Defender โดยไม่แก้ Trusted Site หรือปรับ Payload ในช่วง Hacker จากนั้นให้ Defender ใช้ [DEFENDER.md](./DEFENDER.md) แก้ Root Cause และ Retest ด้วย Payload เดิม
