let qrCode;
let undoStack = [];
let redoStack = [];
let previousValue = '';
const SAVE_SIZE = 640;
const QUIET_ZONE = 3;
const CAPACITY_WARN = 0.95;

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
  updateCapacityWarning(content);
  if (!content) return;
  deleteQR();
  try {
    qrCode = qrcodegen.QrCode.encodeText(content, qrcodegen.QrCode.Ecc.HIGH);
  } catch (e) {
    return;
  }
  const n = qrCode.size;
  const total = n + QUIET_ZONE * 2;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `${-QUIET_ZONE} ${-QUIET_ZONE} ${total} ${total}`);
  svg.setAttribute('width', '100%');
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', -QUIET_ZONE);
  bg.setAttribute('y', -QUIET_ZONE);
  bg.setAttribute('width', total);
  bg.setAttribute('height', total);
  bg.setAttribute('fill', '#ffffff');
  svg.appendChild(bg);
  let d = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (qrCode.getModule(x, y))
        d += `M${x},${y}h1v1h-1z`;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', '#000000');
  svg.appendChild(path);
  document.getElementById('qrcode').appendChild(svg);
}

function deleteContent() {
  const textarea = document.getElementById("qr-content");
  undoStack.push(textarea.value);
  redoStack = [];
  textarea.value = '';
  previousValue = '';
  localStorage.removeItem('qrContent');
  deleteQR();
  updateCapacityWarning('');
}

function undo() {
  if (!undoStack.length) return;
  const textarea = document.getElementById("qr-content");
  redoStack.push(textarea.value);
  textarea.value = undoStack.pop();
  previousValue = textarea.value;
  localStorage.setItem('qrContent', textarea.value);
  createQR();
}

function redo() {
  if (!redoStack.length) return;
  const textarea = document.getElementById("qr-content");
  undoStack.push(textarea.value);
  textarea.value = redoStack.pop();
  previousValue = textarea.value;
  localStorage.setItem('qrContent', textarea.value);
  createQR();
}

function deleteQR() {
  document.querySelector('#qrcode svg')?.remove();
  qrCode = null;
}

function updateCapacityWarning(content) {
  const ecl = qrcodegen.QrCode.Ecc.HIGH;
  const maxBits = qrcodegen.QrCode.getNumDataCodewords(40, ecl) * 8;
  const segs = content ? qrcodegen.QrSegment.makeSegments(content) : [];
  const usedBits = qrcodegen.QrSegment.getTotalBits(segs, 40);
  const ratio = usedBits / maxBits;
  const bar = document.getElementById('capacity-bar');
  bar.style.width = `${(Math.min(ratio, 1) * 100).toFixed(1)}%`;
  const remaining = document.getElementById('capacity-remaining');
  const charsLeft = Math.floor((maxBits - usedBits) / 8);
  let level;
  if (charsLeft < 0) {
    const tooMany = Math.ceil((usedBits - maxBits) / 8);
    remaining.textContent = `Text is too long. Remove ${tooMany} ${tooMany === 1 ? 'char' : 'chars'}.`;
    level = 'critical';
  } else if (charsLeft === 0) {
    remaining.textContent = `0 chars left`;
    level = 'warn';
  } else {
    remaining.textContent = `${charsLeft} chars left`;
    level = ratio >= CAPACITY_WARN ? 'warn' : 'ok';
  }
  bar.dataset.level = level;
  remaining.dataset.level = level;
}

function getQRsvgStr() {
  const svg = document.querySelector('#qrcode svg');
  if (!svg) return null;
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', SAVE_SIZE);
  clone.setAttribute('height', SAVE_SIZE);
  clone.setAttribute('shape-rendering', 'crispEdges');
  return new XMLSerializer().serializeToString(clone);
}

function getQRcanvas() {
  if (!qrCode) return null;
  const n = qrCode.size;
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
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (qrCode.getModule(x, y))
        ctx.fillRect((x + QUIET_ZONE) * mod, (y + QUIET_ZONE) * mod, mod, mod);
  return canvas;
}

function saveQRsvg() {
  const svgStr = getQRsvgStr();
  if (!svgStr) { console.error('No QR code to download'); return; }
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'qrcode.svg';
  link.click();
  URL.revokeObjectURL(url);
}

function saveQRpng() {
  const canvas = getQRcanvas();
  if (!canvas) { console.error('No QR code to download'); return; }
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'qrcode.png';
  link.click();
}

async function copyQRsvg() {
  const svgStr = getQRsvgStr();
  if (!svgStr) return;
  await navigator.clipboard.writeText(svgStr);
  showToast('QR code copied as SVG to clipboard');
}

async function copyQRpng() {
  const canvas = getQRcanvas();
  if (!canvas) return;
  canvas.toBlob(async (blob) => {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('QR code copied as PNG to clipboard');
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function toggleMenu(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('menu-dropdown');
  dropdown.hidden = !dropdown.hidden;
}

function closeMenu() {
  document.getElementById('menu-dropdown').hidden = true;
}

document.addEventListener('click', () => closeMenu());

document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  const textarea = document.getElementById("qr-content");
  const saved = localStorage.getItem('qrContent');
  if (saved !== null) textarea.value = saved;
  else textarea.value = 'Hello World!';
  createQR();
  previousValue = textarea.value;
  textarea.addEventListener("input", () => {
    undoStack.push(previousValue);
    redoStack = [];
    previousValue = textarea.value;
    localStorage.setItem('qrContent', textarea.value);
    createQR();
  });
});
