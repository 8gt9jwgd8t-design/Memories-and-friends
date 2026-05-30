const video = document.getElementById("video");
const startCamera = document.getElementById("startCamera");
const capture = document.getElementById("capture");
const upload = document.getElementById("upload");
const cropCanvas = document.getElementById("cropCanvas");
const ctx = cropCanvas.getContext("2d");
const zoom = document.getElementById("zoom");
const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const addCard = document.getElementById("addCard");
const cards = document.getElementById("cards");
const shuffle = document.getElementById("shuffle");
const printBtn = document.getElementById("print");
const clearBtn = document.getElementById("clear");
const template = document.getElementById("cardTemplate");

let sourceImage = null;
let memoryCards = JSON.parse(localStorage.getItem("eyeMemoryCards") || "[]");

function save() {
  localStorage.setItem("eyeMemoryCards", JSON.stringify(memoryCards));
}

function renderCards() {
  cards.innerHTML = "";
  memoryCards.forEach(src => {
    const node = template.content.cloneNode(true);
    node.querySelector("img").src = src;
    cards.appendChild(node);
  });
}

async function startCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Kamera konnte nicht gestartet werden. Du kannst stattdessen ein Bild hochladen.");
  }
}

function setSourceFromCanvas(canvas) {
  const img = new Image();
  img.onload = () => {
    sourceImage = img;
    drawCrop();
  };
  img.src = canvas.toDataURL("image/jpeg", 0.95);
}

function drawCrop() {
  ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

  if (!sourceImage) {
    ctx.fillStyle = "#222";
    ctx.font = "28px Helvetica";
    ctx.fillText("Foto aufnehmen oder Bild hochladen", 120, 350);
    return;
  }

  const canvasSize = cropCanvas.width;
  const z = parseFloat(zoom.value);
  const baseScale = Math.max(canvasSize / sourceImage.width, canvasSize / sourceImage.height);
  const scale = baseScale * z;

  const w = sourceImage.width * scale;
  const h = sourceImage.height * scale;

  const x = (canvasSize - w) / 2 + Number(posX.value) * 3;
  const y = (canvasSize - h) / 2 + Number(posY.value) * 3;

  ctx.drawImage(sourceImage, x, y, w, h);

  ctx.strokeStyle = "rgba(0,0,0,.8)";
  ctx.lineWidth = 5;
  ctx.strokeRect(2.5, 2.5, canvasSize - 5, canvasSize - 5);
}

startCamera.addEventListener("click", startCam);

capture.addEventListener("click", () => {
  if (!video.videoWidth) {
    alert("Starte zuerst die Kamera.");
    return;
  }
  const temp = document.createElement("canvas");
  temp.width = video.videoWidth;
  temp.height = video.videoHeight;
  temp.getContext("2d").drawImage(video, 0, 0);
  setSourceFromCanvas(temp);
});

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    sourceImage = img;
    zoom.value = 1;
    posX.value = 0;
    posY.value = 0;
    drawCrop();
  };
  img.src = URL.createObjectURL(file);
});

[zoom, posX, posY].forEach(input => input.addEventListener("input", drawCrop));

addCard.addEventListener("click", () => {
  if (!sourceImage) {
    alert("Bitte erst ein Auge fotografieren oder hochladen.");
    return;
  }
  const data = cropCanvas.toDataURL("image/jpeg", 0.95);
  memoryCards.push(data, data);
  save();
  renderCards();
});

shuffle.addEventListener("click", () => {
  memoryCards = memoryCards
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  save();
  renderCards();
});

printBtn.addEventListener("click", () => window.print());

clearBtn.addEventListener("click", () => {
  if (confirm("Alle Karten löschen?")) {
    memoryCards = [];
    save();
    renderCards();
  }
});

drawCrop();
renderCards();
