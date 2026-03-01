<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OCR - Image to Text Converter</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>OCR Converter</h1>
            <p class="subtitle">Extract text from images instantly using server-side processing</p>

            <div class="upload-area" id="dropZone">
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <div class="upload-text">Click or drag image here</div>
                <div class="upload-subtext">Supports JPG, PNG, WEBP</div>
                <input type="file" id="fileInput" accept="image/*">
            </div>

            <div class="preview-container" id="previewContainer">
                <img id="imagePreview" src="" alt="Preview">
                <br>
                <button id="convertBtn" class="btn">
                    <span>Convert to Text</span>
                </button>
            </div>

            <div class="result-container" id="resultContainer">
                <div class="result-header">
                    <span>Extracted Text</span>
                    <button id="copyBtn" class="btn" style="margin-top:0; padding: 0.5rem 1rem; font-size: 0.875rem;">Copy</button>
                </div>
                <textarea id="resultText" readonly></textarea>
                <div id="statusMessage" style="margin-top: 10px; font-size: 0.9rem; color: #666;"></div>
            </div>
        </div>
    </div>

    <div id="toast" class="toast">Copied to clipboard!</div>

    <script>
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const convertBtn = document.getElementById('convertBtn');
        const resultContainer = document.getElementById('resultContainer');
        const resultText = document.getElementById('resultText');
        const copyBtn = document.getElementById('copyBtn');
        const toast = document.getElementById('toast');
        const statusMessage = document.getElementById('statusMessage');

        let selectedFile = null;

        // Drag and drop handlers
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });

        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file.');
                return;
            }
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                previewContainer.style.display = 'block';
                resultContainer.style.display = 'none';
                statusMessage.textContent = '';
                setTimeout(() => previewContainer.scrollIntoView({ behavior: 'smooth' }), 100);
            };
            reader.readAsDataURL(file);
        }

        convertBtn.addEventListener('click', () => {
            if (selectedFile) {
                processImage(selectedFile);
            }
        });

        async function processImage(file) {
            const originalBtnText = convertBtn.innerHTML;
            convertBtn.innerHTML = '<span class="loading"></span> Processing...';
            convertBtn.disabled = true;
            resultText.value = '';
            statusMessage.textContent = 'Uploading and processing...';

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('api', {
                    method: 'POST',
                    body: formData
                });
                
                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error('Invalid JSON response: ' + text.substring(0, 200) + '...');
                }

                if (data.success) {
                    resultText.value = data.text;
                    const duration = data.duration !== undefined ? data.duration : '?';
                    const model = data.model || 'Server-side';
                    statusMessage.textContent = `Completed in ${duration}s (${model})`;
                } else {
                    console.error('OCR Error:', data);
                    resultText.value = 'Error: ' + (data.error || 'Unknown error') + '\n\nDebug Info:\n' + JSON.stringify(data, null, 2);
                    statusMessage.textContent = 'Processing failed.';
                }
                
                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Error:', error);
                resultText.value = 'Network or Server Error: ' + error.message;
                resultContainer.style.display = 'block';
            } finally {
                convertBtn.innerHTML = originalBtnText;
                convertBtn.disabled = false;
            }
        }

        copyBtn.addEventListener('click', () => {
            resultText.select();
            document.execCommand('copy');
            
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        });
    </script>
</body>
</html>
