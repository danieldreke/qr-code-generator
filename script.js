let qrCode;

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
  createQR();
  document.getElementById("qr-content").addEventListener("input", createQR);
});
