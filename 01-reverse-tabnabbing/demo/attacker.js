const statusBox = document.querySelector("#opener-status");
const attackButton = document.querySelector("#attack-button");
const result = document.querySelector("#result");

const hasOpener = Boolean(window.opener && !window.opener.closed);

if (hasOpener) {
  statusBox.classList.add("bad");
  statusBox.innerHTML = "<strong>พบ window.opener</strong>หน้า External Site สามารถอ้างอิงแท็บเดิมได้";
} else {
  statusBox.classList.add("good");
  statusBox.innerHTML = "<strong>ไม่พบ window.opener</strong>แท็บเดิมถูกแยกออกจากหน้า External Site แล้ว";
  attackButton.disabled = true;
  attackButton.textContent = "การโจมตีถูกป้องกัน";
  attackButton.classList.remove("danger");
  attackButton.classList.add("safe");
}

attackButton.addEventListener("click", () => {
  if (!window.opener || window.opener.closed) {
    result.textContent = "ไม่สามารถเปลี่ยนแท็บเดิมได้ เพราะไม่มี window.opener";
    return;
  }

  window.opener.location.href = "phishing.html";
  result.textContent = "เปลี่ยนแท็บเดิมเป็นหน้า Phishing จำลองแล้ว ลองกลับไปดูแท็บเดิม";
});
