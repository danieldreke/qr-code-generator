let qrCode;

function updateSize() {
  const size = document.getElementById("qr-size-slider").value;
  document.getElementById("qr-size-label").textContent = `${size}px`;
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
    height: size
    // colorDark : "#000000",
    // colorLight : "#ffffff",
    // correctLevel : QRCode.CorrectLevel.H
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

document.addEventListener('DOMContentLoaded', (event) => {
  createQR();
});
