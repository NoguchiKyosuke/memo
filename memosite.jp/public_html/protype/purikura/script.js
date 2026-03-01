// DOM Elements
const uploadSection = document.getElementById('upload-section');
const editorSection = document.getElementById('editor-section');
const fileInput = document.getElementById('file-input');
const cameraBtn = document.getElementById('camera-btn');
const mainCanvas = document.getElementById('main-canvas');
const ctx = mainCanvas.getContext('2d');
const stickerContainer = document.getElementById('sticker-container');
const textContainer = document.getElementById('text-container');

// Camera elements
const cameraModal = document.getElementById('camera-modal');
const cameraVideo = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const captureBtn = document.getElementById('capture-btn');
const cancelCameraBtn = document.getElementById('cancel-camera-btn');
const closeCameraBtn = document.getElementById('close-camera');

// Tool elements
const filterBtns = document.querySelectorAll('.filter-btn');
const stickerBtns = document.querySelectorAll('.sticker-btn');
const frameBtns = document.querySelectorAll('.frame-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const textInput = document.getElementById('text-input');
const addTextBtn = document.getElementById('add-text-btn');
const brightnessSlider = document.getElementById('brightness-slider');
const brightnessValue = document.getElementById('brightness-value');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const newPhotoBtn = document.getElementById('new-photo-btn');

// State
let originalImage = null;
let currentFilter = 'none';
let currentFrame = 'none';
let currentBrightness = 100;
let currentTextColor = '#FFFFFF';
let stickers = [];
let texts = [];
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

// File upload
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
});

// Camera
cameraBtn.addEventListener('click', () => {
    openCamera();
});

closeCameraBtn.addEventListener('click', closeCamera);
cancelCameraBtn.addEventListener('click', closeCamera);

captureBtn.addEventListener('click', () => {
    const camCtx = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    camCtx.drawImage(cameraVideo, 0, 0);

    cameraCanvas.toBlob((blob) => {
        loadImage(blob);
        closeCamera();
    });
});

async function openCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
        });
        cameraVideo.srcObject = stream;
        cameraModal.classList.remove('hidden');
    } catch (err) {
        alert('カメラにアクセスできません: ' + err.message);
    }
}

function closeCamera() {
    const stream = cameraVideo.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    cameraModal.classList.add('hidden');
}

// Load image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            resetEditor();
            uploadSection.classList.add('hidden');
            editorSection.classList.remove('hidden');
            renderCanvas();
        };
        img.src = e.target.result;
    };

    if (file instanceof Blob) {
        reader.readAsDataURL(file);
    } else {
        reader.readAsDataURL(file);
    }
}

// Render canvas
function renderCanvas() {
    if (!originalImage) return;

    // Set canvas size
    const maxWidth = 800;
    const maxHeight = 600;
    let width = originalImage.width;
    let height = originalImage.height;

    if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }

    mainCanvas.width = width;
    mainCanvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply brightness
    ctx.filter = `brightness(${currentBrightness}%)`;

    // Draw image
    ctx.drawImage(originalImage, 0, 0, width, height);

    // Apply filter
    applyFilter(currentFilter);

    // Apply frame
    applyFrame(currentFrame);

    // Reset filter for next draw
    ctx.filter = 'none';
}

// Filters
function applyFilter(filter) {
    const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    const data = imageData.data;

    switch (filter) {
        case 'kawaii':
            // Bright pink tint
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + 30);     // R
                data[i + 1] = Math.min(255, data[i + 1] - 10); // G
                data[i + 2] = Math.min(255, data[i + 2] + 20); // B
            }
            break;
        case 'pastel':
            // Soft pastel effect
            for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i] + (255 - data[i]) * 0.3;
                data[i + 1] = data[i + 1] + (255 - data[i + 1]) * 0.3;
                data[i + 2] = data[i + 2] + (255 - data[i + 2]) * 0.3;
            }
            break;
        case 'sweet':
            // Warm sweet filter
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + 40);
                data[i + 1] = Math.min(255, data[i + 1] + 20);
                data[i + 2] = Math.max(0, data[i + 2] - 10);
            }
            break;
        case 'vintage':
            // Vintage sepia
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                data[i] = r * 0.393 + g * 0.769 + b * 0.189;
                data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
                data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
            }
            break;
        case 'dreamy':
            // Soft blue-purple tint
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + 20);
                data[i + 1] = Math.min(255, data[i + 1] + 10);
                data[i + 2] = Math.min(255, data[i + 2] + 40);
            }
            break;
    }

    ctx.putImageData(imageData, 0, 0);
}

// Frames
function applyFrame(frame) {
    const w = mainCanvas.width;
    const h = mainCanvas.height;

    ctx.save();
    ctx.font = '40px Arial';

    switch (frame) {
        case 'hearts':
            const hearts = '💕';
            for (let i = 0; i < 8; i++) {
                ctx.fillText(hearts, Math.random() * w, Math.random() * h);
            }
            break;
        case 'stars':
            const stars = '⭐';
            for (let i = 0; i < 10; i++) {
                ctx.fillText(stars, Math.random() * w, Math.random() * h);
            }
            break;
        case 'flowers':
            const flowers = '🌸';
            for (let i = 0; i < 8; i++) {
                ctx.fillText(flowers, Math.random() * w, Math.random() * h);
            }
            break;
    }

    ctx.restore();
}

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderCanvas();
    });
});

// Frame buttons
frameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        frameBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFrame = btn.dataset.frame;
        renderCanvas();
    });
});

// Sticker buttons
stickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addSticker(btn.dataset.sticker);
    });
});

function addSticker(emoji) {
    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    sticker.textContent = emoji;
    sticker.style.left = '50%';
    sticker.style.top = '50%';
    sticker.style.transform = 'translate(-50%, -50%)';

    // Double click to remove
    sticker.addEventListener('dblclick', () => {
        sticker.remove();
    });

    makeDraggable(sticker);
    stickerContainer.appendChild(sticker);
}

// Text color
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTextColor = btn.dataset.color;
    });
});

// Add text
addTextBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('テキストを入力してください！');
        return;
    }

    const textElement = document.createElement('div');
    textElement.className = 'text-element';
    textElement.textContent = text;
    textElement.style.color = currentTextColor;
    textElement.style.left = '50%';
    textElement.style.top = '50%';
    textElement.style.transform = 'translate(-50%, -50%)';

    // Double click to remove
    textElement.addEventListener('dblclick', () => {
        textElement.remove();
    });

    makeDraggable(textElement);
    textContainer.appendChild(textElement);
    textInput.value = '';
});

// Make elements draggable
function makeDraggable(element) {
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag);
}

function startDrag(e) {
    draggedElement = e.target;
    const rect = draggedElement.getBoundingClientRect();
    const parentRect = draggedElement.parentElement.getBoundingClientRect();

    if (e.type === 'mousedown') {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    } else {
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDrag);
}

function drag(e) {
    if (!draggedElement) return;

    const parentRect = draggedElement.parentElement.getBoundingClientRect();
    let clientX, clientY;

    if (e.type === 'mousemove') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const x = clientX - parentRect.left - offsetX;
    const y = clientY - parentRect.top - offsetY;

    draggedElement.style.left = x + 'px';
    draggedElement.style.top = y + 'px';
    draggedElement.style.transform = 'none';
}

function stopDrag() {
    draggedElement = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
}

// Brightness
brightnessSlider.addEventListener('input', (e) => {
    currentBrightness = e.target.value;
    brightnessValue.textContent = currentBrightness + '%';
    renderCanvas();
});

// Download
downloadBtn.addEventListener('click', () => {
    // Create a temporary canvas to merge everything
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = mainCanvas.width;
    tempCanvas.height = mainCanvas.height;

    // Draw main canvas
    tempCtx.drawImage(mainCanvas, 0, 0);

    // Draw stickers
    const stickers = stickerContainer.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
        const rect = sticker.getBoundingClientRect();
        const parentRect = stickerContainer.getBoundingClientRect();
        const x = rect.left - parentRect.left;
        const y = rect.top - parentRect.top;

        tempCtx.font = '60px Arial';
        tempCtx.fillText(sticker.textContent, x, y + 50);
    });

    // Draw texts
    const textElements = textContainer.querySelectorAll('.text-element');
    textElements.forEach(text => {
        const rect = text.getBoundingClientRect();
        const parentRect = textContainer.getBoundingClientRect();
        const x = rect.left - parentRect.left;
        const y = rect.top - parentRect.top;

        tempCtx.font = '900 40px "M PLUS Rounded 1c"';
        tempCtx.fillStyle = text.style.color;
        tempCtx.strokeStyle = '#000';
        tempCtx.lineWidth = 3;
        tempCtx.strokeText(text.textContent, x, y + 35);
        tempCtx.fillText(text.textContent, x, y + 35);
    });

    // Download
    tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kawaii-photo-' + Date.now() + '.png';
        a.click();
        URL.revokeObjectURL(url);
    });
});

// Reset
resetBtn.addEventListener('click', () => {
    if (confirm('リセットしますか？すべての編集が失われます。')) {
        resetEditor();
        renderCanvas();
    }
});

function resetEditor() {
    currentFilter = 'none';
    currentFrame = 'none';
    currentBrightness = 100;
    brightnessSlider.value = 100;
    brightnessValue.textContent = '100%';
    stickerContainer.innerHTML = '';
    textContainer.innerHTML = '';

    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'none') btn.classList.add('active');
    });

    frameBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.frame === 'none') btn.classList.add('active');
    });
}

// New photo
newPhotoBtn.addEventListener('click', () => {
    if (confirm('新しい写真を選択しますか？現在の編集は失われます。')) {
        editorSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        originalImage = null;
        fileInput.value = '';
    }
});
