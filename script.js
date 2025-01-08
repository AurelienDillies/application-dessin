"use strict";

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color');
const clearButton = document.getElementById('clearButton');
const taille = document.getElementById('number');
const annuler = document.getElementById('annuler');
const revenir = document.getElementById('revenir');
const gomme = document.getElementById('gomme');
const dessine = document.getElementById('dessin');
const save = document.getElementById('save');
const upload = document.getElementById('upload');

let drawing = false;
let gum = false;
let currentColor = "#000000";
let currentTaille = 5;

let undoStack = [];
let redoStack = [];

function resize() {
    const widthViewport = 99;
    const heightViewport = 87;

    canvas.style.width = widthViewport + "vw";
    canvas.style.height = heightViewport + "vh";

    canvas.width = window.innerWidth * (widthViewport / 100);
    canvas.height = window.innerHeight * (heightViewport / 100);

    setCanvasBackground();
}
resize();
window.addEventListener("resize", resize);

function setCanvasBackground() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

colorPicker.addEventListener('input', changeColor);
taille.addEventListener('input', changeTaille);
gomme.addEventListener('click', efface);
dessine.addEventListener('click', dessin);
save.addEventListener('click', saveimg);
clearButton.addEventListener('click', clean);
upload.addEventListener('change', uploadimg);

annuler.addEventListener('click', undo);
revenir.addEventListener('click', redo);

window.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undo();
    }

    if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        redo();
    }
});

dessine.style.backgroundColor = "grey";

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = currentTaille;
    ctx.lineCap = 'round';

    if (gum) {
        ctx.strokeStyle = "#FFFFFF";
    } else {
        ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
    saveState();
}

function saveState() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(imageData);
    redoStack = [];
}

function changeColor() {
    currentColor = colorPicker.value;
}

function changeTaille() {
    currentTaille = taille.value;
}

function efface() {
    gum = true;
    ctx.strokeStyle = "#FFFFFF";
    dessine.style.backgroundColor = "darkgrey";
    gomme.style.backgroundColor = "grey";
    canvas.style.cursor = "url('./eraser.png') 3 35, auto";
}

function dessin() {
    gum = false;
    ctx.strokeStyle = currentColor;
    dessine.style.backgroundColor = "grey";
    gomme.style.backgroundColor = "darkgrey";
    canvas.style.cursor = "url('./pencil.png') 1 38, auto";
}

function saveimg() {
    const imageData = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'mon_jolie_dessin.png';
    link.click();
}

function clean() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    undoStack = [];
    redoStack = [];
}

function uploadimg(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            setCanvasBackground();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

function undo() {
    if (undoStack.length > 0) {
        const lastState = undoStack.pop();
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));  
        ctx.putImageData(lastState, 0, 0);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const lastState = redoStack.pop();
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));  
        ctx.putImageData(lastState, 0, 0);
    }
}