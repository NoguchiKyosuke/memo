<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI OCR - Image to Text Converter</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
    <script src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'></script>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>AI OCR Converter</h1>
            <p class="subtitle">Extract text from images instantly using local AI</p>

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
            </div>
        </div>
    </div>

    <div class="console-container" id="consoleContainer">
        <div class="console-header">
            <span>user@localhost:~/ocr_app</span>
            <span id="consoleStatus">Idle</span>
        </div>
        <div class="console-body" id="consoleBody">
            <div id="consoleLogs"></div>
            <div class="console-input-container">
                <span class="console-prompt-label">user@localhost:~/ocr_app$</span>
                <input type="text" id="consoleInput" class="console-input" placeholder="" autocomplete="off" spellcheck="false">
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
        const consoleContainer = document.getElementById('consoleContainer');
        const consoleLogs = document.getElementById('consoleLogs');
        const consoleStatus = document.getElementById('consoleStatus');
        const consoleInput = document.getElementById('consoleInput');
        const consoleBody = document.getElementById('consoleBody');
        const promptLabel = document.querySelector('.console-prompt-label');
        const headerTitle = document.querySelector('.console-header span:first-child');

        let currentFile = null;
        let commandHistory = [];
        let historyIndex = -1;
        let currentCwd = '';
        let currentUser = 'user';
        let currentHost = 'localhost';

        // Initialize terminal
        window.addEventListener('load', async () => {
            await executeCommand(''); // Init to get cwd
        });

        function updatePrompt(cwd) {
            const prompt = `${currentUser}@${currentHost}:${cwd}$`;
            promptLabel.textContent = prompt;
            headerTitle.textContent = `${currentUser}@${currentHost}:${cwd}`;
        }

        function log(message, type = 'info') {
            const logEntry = document.createElement('div');
            logEntry.className = `console-log ${type}`;
            
            if (message) {
                const lines = message.split('\n');
                lines.forEach(line => {
                    const lineDiv = document.createElement('div');
                    lineDiv.textContent = line;
                    logEntry.appendChild(lineDiv);
                });
            }
            
            consoleLogs.appendChild(logEntry);
            consoleBody.scrollTop = consoleBody.scrollHeight;
        }

        function clearConsole() {
            consoleLogs.innerHTML = '';
        }

        async function checkBackend() {
            log('Checking backend connectivity...', 'info');
            try {
                const response = await fetch('process.php');
                const data = await response.json();
                if (data.success) {
                    log(`Backend Status: ${data.status}`, 'success');
                    log(data.message, 'info');
                } else {
                    log(`Backend Error: ${data.error}`, 'error');
                }
            } catch (error) {
                log(`Connection Error: ${error.message}`, 'error');
            }
        }

        async function executeCommand(command) {
            try {
                const response = await fetch('terminal.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: command, cwd: currentCwd })
                });
                const data = await response.json();

                if (data.stdout) log(data.stdout, 'info');
                if (data.stderr) log(data.stderr, 'error');

                currentCwd = data.cwd;
                currentUser = data.user;
                currentHost = data.hostname;
                updatePrompt(data.prompt_cwd);

            } catch (error) {
                log(`Error: ${error.message}`, 'error');
            }
        }

        async function processImage() {
            if (!currentFile) return;

            clearConsole();
            log('Starting OCR process (Tesseract.js Client-side)...', 'info');
            log(`Selected file: ${currentFile.name} (${(currentFile.size / 1024).toFixed(2)} KB)`, 'info');

            const originalBtnText = convertBtn.innerHTML;
            convertBtn.innerHTML = '<span class="loading"></span> Processing...';
            convertBtn.disabled = true;
            consoleStatus.textContent = 'Processing...';

            try {
                const startTime = performance.now();
                
                // Tesseract.js execution
                const worker = await Tesseract.createWorker('eng+jpn', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            consoleStatus.textContent = `Recognizing: ${Math.round(m.progress * 100)}%`;
                        }
                    }
                });
                
                const { data: { text } } = await worker.recognize(currentFile);
                await worker.terminate();

                const endTime = performance.now();
                const duration = ((endTime - startTime) / 1000).toFixed(2);

                resultText.value = text;
                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth' });
                
                log(`OCR Complete: ${duration}s`, 'success');
                log(`Model: Tesseract.js (Client-side)`, 'info');
                consoleStatus.textContent = 'Completed';

            } catch (error) {
                console.error('OCR Error:', error);
                log(`Error: ${error.message}`, 'error');
                resultText.value = 'Error processing image: ' + error.message;
                resultContainer.style.display = 'block';
                consoleStatus.textContent = 'Failed';
            } finally {
                convertBtn.innerHTML = originalBtnText;
                convertBtn.disabled = false;
                consoleBody.scrollTop = consoleBody.scrollHeight;
            }
        }

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
                setTimeout(() => previewContainer.scrollIntoView({ behavior: 'smooth' }), 100);
            };
            reader.readAsDataURL(file);
        }

        convertBtn.addEventListener('click', () => {
            if (selectedFile) {
                processImage(selectedFile);
            }
        });

        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = consoleInput.value.trim();
                
                // Echo command
                const cmdEntry = document.createElement('div');
                cmdEntry.className = 'console-log';
                cmdEntry.innerHTML = `<span style="color:#4ade80; font-weight:bold;">${promptLabel.textContent}</span> ${consoleInput.value}`;
                consoleLogs.appendChild(cmdEntry);
                
                consoleInput.value = '';
                
                if (command) {
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    
                    if (command === 'clear') {
                        clearConsole();
                    } else if (command === 'check') {
                        checkBackend();
                    } else {
                        executeCommand(command);
                    }
                }
                consoleBody.scrollTop = consoleBody.scrollHeight;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    consoleInput.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    consoleInput.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    consoleInput.value = '';
                }
            }
        });
        
        consoleBody.addEventListener('click', () => {
             if (!consoleInput.disabled) consoleInput.focus();
        });

        copyBtn.addEventListener('click', () => {
            resultText.select();
            document.execCommand('copy');
            
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
            log('Text copied to clipboard', 'info');
        });
    </script>
</body>
</html>
