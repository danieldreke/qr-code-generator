let qrCode;
const SAVE_SIZE = 640;
const QUIET_ZONE = 3;

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

function createQR() {
  const content = document.getElementById("qr-content").value;
  if (!content) return;
  deleteQR();
  qrCode = new QRCode("qrcode", {
    text: content,
    correctLevel: QRCode.CorrectLevel.H,
    useSVG: true
  });
  const svg = document.querySelector('#qrcode svg');
  if (svg) {
    const n = parseInt(svg.getAttribute('viewBox').split(' ')[2]);
    const total = n + QUIET_ZONE * 2;
    svg.setAttribute('viewBox', `${-QUIET_ZONE} ${-QUIET_ZONE} ${total} ${total}`);
    svg.setAttribute('width', '100%');
    svg.removeAttribute('height');
    const bgRect = svg.querySelector('rect');
    bgRect.setAttribute('x', -QUIET_ZONE);
    bgRect.setAttribute('y', -QUIET_ZONE);
    bgRect.setAttribute('width', total);
    bgRect.setAttribute('height', total);
  }
}

function deleteContent() {
  document.getElementById("qr-content").value = '';
  deleteQR();
}

function deleteQR() {
  document.querySelector('#qrcode svg')?.remove();
  qrCode = null;
}

function saveQRsvg() {
  const svg = document.querySelector('#qrcode svg');
  if (!svg) { console.error('No QR code to download'); return; }
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', SAVE_SIZE);
  clone.setAttribute('height', SAVE_SIZE);
  clone.setAttribute('shape-rendering', 'crispEdges');
  const svgStr = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'qrcode.svg';
  link.click();
  URL.revokeObjectURL(url);
}

function saveQRpng() {
  if (!qrCode?._oQRCode) { console.error('No QR code to download'); return; }
  const qr = qrCode._oQRCode;
  const n = qr.getModuleCount();
  const total = n + QUIET_ZONE * 2;
  const mod = Math.floor(SAVE_SIZE / total);
  const size = mod * total;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  for (let row = 0; row < n; row++)
    for (let col = 0; col < n; col++)
      if (qr.isDark(row, col))
        ctx.fillRect((col + QUIET_ZONE) * mod, (row + QUIET_ZONE) * mod, mod, mod);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'qrcode.png';
  link.click();
}

document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  createQR();
  document.getElementById("qr-content").addEventListener("input", createQR);
});
