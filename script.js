let qrCode;

function updateSize() {
  // document.getElementById("qr-size-input").value = document.getElementById("qr-size-slider").value;
  generateQR();
}

function updateSizeSlider() {
  document.getElementById("qr-size-slider").value = document.getElementById("qr-size-input").value;
}

function generateQR() {
  const content = document.getElementById("qr-content").value;
  const size = parseInt(document.getElementById("qr-size-slider").value);
  document.querySelector('#qrcode img')?.remove();
  document.querySelector('#qrcode canvas')?.remove();

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
}

document.addEventListener('DOMContentLoaded', (event) => {
  generateQR();
});
