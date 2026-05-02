let qrCode;

const SVG_SUN = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const SVG_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

function setToggleIcon(isDark) {
  document.getElementById('dark-mode-toggle').innerHTML = isDark ? SVG_SUN : SVG_MOON;
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
  setToggleIcon(isDark);
}

function applyStoredTheme() {
  const stored = localStorage.getItem('darkMode');
  const isDark = stored !== 'light';
  document.documentElement.classList.toggle('dark', isDark);
  setToggleIcon(isDark);
}

function updateSizeLabel() {
  const size = document.getElementById("qr-size-slider").value;
  document.getElementById("qr-size-label").textContent = `${size}px`;
}

function updateSize() {
  updateSizeLabel();
  if (qrCode)
  {
    createQR();
  }
}

function addWhiteBorder(canvas) {
  const border = Math.max(20, Math.round(canvas.width * 0.06));
  const newW = canvas.width + border * 2;
  const newH = canvas.height + border * 2;
  const bordered = document.createElement('canvas');
  bordered.width = newW;
  bordered.height = newH;
  const ctx = bordered.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, newW, newH);
  ctx.drawImage(canvas, border, border);
  canvas.replaceWith(bordered);
}

function createQR() {
  const content = document.getElementById("qr-content").value;
  if (!content) {
    return;
  }
  const size = parseInt(document.getElementById("qr-size-slider").value);
  deleteQR();
  qrCode = new QRCode("qrcode", {
    text: content,
    width: size,
    height: size,
    // colorDark : "#000000",
    // colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H  // Highest error correction
    // correctLevel : QRCode.CorrectLevel.L  // Lowest error correction
  });
  setTimeout(() => {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) addWhiteBorder(canvas);
    const img = document.querySelector('#qrcode img');
    if (img) img.remove();
  }, 0);
}

function deleteContent() {
  document.getElementById("qr-content").value = '';
  deleteQR();
}

function deleteQR() {
  document.querySelector('#qrcode img')?.remove()
  document.querySelector('#qrcode canvas')?.remove()
  qrCode = null
}

function saveQR() {
  const canvas = document.querySelector('#qrcode canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'qrcode.png';
    link.click();
  } else {
    console.error('No QR code to download');
  }
}

function resetQR() {
  deleteQR();
  document.getElementById("qr-size-slider").value = 320;
  updateSizeLabel();
  document.getElementById("qr-content").value = 'Hello World!';
  createQR();
}

document.addEventListener('DOMContentLoaded', (event) => {
  applyStoredTheme();
  createQR();
  document.getElementById("qr-content").addEventListener("input", createQR);
});
