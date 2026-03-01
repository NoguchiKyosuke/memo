// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Application State
const state = {
    file: null,
    pdfDoc: null,
    originalSize: 0,
    isCompressing: false
};

// DOM Elements
const elements = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    selectBtn: document.getElementById('select-file-btn'),
    // Sections
    uploadSection: document.getElementById('upload-section'),
    settingsSection: document.getElementById('settings-section'),
    progressSection: document.getElementById('progress-section'),
    resultSection: document.getElementById('result-section'),
    // Info
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
    removeBtn: document.getElementById('remove-file-btn'),
    // Settings
    qualitySlider: document.getElementById('quality-slider'),
    qualityValue: document.getElementById('quality-value'),
    scaleSelect: document.getElementById('scale-select'),
    compressBtn: document.getElementById('compress-btn'),
    // Progress
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    processLog: document.getElementById('process-log'),
    // Result
    originalStat: document.getElementById('original-size'),
    compressedStat: document.getElementById('compressed-size'),
    reductionBadge: document.getElementById('reduction-badge'),
    downloadBtn: document.getElementById('download-btn'),
    resetBtn: document.getElementById('reset-btn')
};

// --- Event Listeners ---

// File Drop & Selection
elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('drag-over');
});

elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('drag-over');
});

elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

elements.selectBtn.addEventListener('click', () => {
    elements.fileInput.click();
});

elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
});

elements.removeBtn.addEventListener('click', resetApp);
elements.resetBtn.addEventListener('click', resetApp);

// Settings Changes
elements.qualitySlider.addEventListener('input', (e) => {
    elements.qualityValue.textContent = Math.round(e.target.value * 100) + '%';
});

// Action
elements.compressBtn.addEventListener('click', startCompression);

// --- Functions ---

function handleFileSelect(file) {
    if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
    }

    state.file = file;
    state.originalSize = file.size;

    // Update UI
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatBytes(file.size);

    // Switch View
    switchSection('settings');

    // Load PDF Metadata
    loadPDF(file);
}

function switchSection(sectionName) {
    const sections = ['upload', 'settings', 'progress', 'result'];
    sections.forEach(name => {
        const el = document.getElementById(`${name}-section`);
        if (name === sectionName) {
            el.classList.remove('hidden');
            setTimeout(() => el.classList.add('active'), 10);
        } else {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
    });
}

async function loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    try {
        state.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        log(`Loaded PDF: ${state.pdfDoc.numPages} pages.`);
    } catch (err) {
        alert('Error loading PDF: ' + err.message);
        resetApp();
    }
}

async function startCompression() {
    if (!state.pdfDoc) return;

    state.isCompressing = true;
    switchSection('progress');

    const quality = parseFloat(elements.qualitySlider.value);
    const scale = parseFloat(elements.scaleSelect.value);
    const isGrayscale = document.getElementById('mode-gray').checked;

    log(`Starting compression... (Quality: ${quality}, Scale: ${scale})`);

    // Initialize jsPDF
    // We'll create it with the dimensions of the first page initially, then adjust
    const { jsPDF } = window.jspdf;
    let pdfWriter = null;

    const totalPages = state.pdfDoc.numPages;

    for (let i = 1; i <= totalPages; i++) {
        updateProgress(i, totalPages);
        log(`Processing page ${i}...`);

        try {
            const page = await state.pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: scale });

            // Create Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render to Canvas
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            // Convert to Image (Compression happens here)
            // 'image/jpeg' is key for compression. PNG is lossless/big.
            let imgData = canvas.toDataURL('image/jpeg', quality);

            // Apply Grayscale via Canvas if needed (more optimized to do it on context before export, but this is simpler)
            if (isGrayscale) {
                // To do high-perf grayscale we should have done:
                // ctx.filter = 'grayscale(100%)';
                // context.drawImage... before toDataURL.
                // Let's redo context if grayscale is requested to be accurate
                const grayCanvas = document.createElement('canvas');
                grayCanvas.width = canvas.width;
                grayCanvas.height = canvas.height;
                const grayCtx = grayCanvas.getContext('2d');
                grayCtx.filter = 'grayscale(100%)';
                grayCtx.drawImage(canvas, 0, 0);
                imgData = grayCanvas.toDataURL('image/jpeg', quality);
            }

            // Initialize jsPDF on first page to match dimensions
            if (i === 1) {
                // Determine orientation
                const orientation = viewport.width > viewport.height ? 'l' : 'p';
                // Units: 'pt' allows using exact viewport dimensions
                pdfWriter = new jsPDF({
                    orientation: orientation,
                    unit: 'pt',
                    format: [viewport.width, viewport.height]
                });
            } else {
                // Add new page with specific dimensions
                const orientation = viewport.width > viewport.height ? 'l' : 'p';
                pdfWriter.addPage([viewport.width, viewport.height], orientation);
            }

            // Add image to full page
            pdfWriter.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);

        } catch (err) {
            log(`Error on page ${i}: ${err.message}`);
        }
    }

    log('Finalizing PDF...');
    const pdfBlob = pdfWriter.output('blob');

    handleCompletion(pdfBlob);
}

function handleCompletion(blob) {
    const compressedSize = blob.size;
    const reduction = Math.round((1 - (compressedSize / state.originalSize)) * 100);

    elements.originalStat.textContent = formatBytes(state.originalSize);
    elements.compressedStat.textContent = formatBytes(compressedSize);
    elements.reductionBadge.textContent = reduction > 0 ? `-${reduction}%` : '0%';
    elements.reductionBadge.style.background = reduction > 0 ? '#ff5555' : '#888';

    switchSection('result');

    // Setup Download
    elements.downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `compressed_${state.file.name.replace('.pdf', '')}.pdf`;
        link.click();
    };
}

function updateProgress(current, total) {
    const percent = Math.round((current / total) * 100);
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `Page ${current} of ${total}`;
}

function log(msg) {
    const p = document.createElement('div');
    p.textContent = `> ${msg}`;
    elements.processLog.prepend(p);
}

function resetApp() {
    state.file = null;
    state.pdfDoc = null;
    state.isCompressing = false;
    elements.fileInput.value = '';
    elements.progressFill.style.width = '0%';
    elements.processLog.innerHTML = '';
    switchSection('upload');
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
