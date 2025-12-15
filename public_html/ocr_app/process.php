<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['success' => true, 'status' => 'ready', 'message' => 'OCR Backend is ready']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method: ' . $_SERVER['REQUEST_METHOD']]);
    exit;
}

// Fix permissions logic
if (isset($_REQUEST['action']) && $_REQUEST['action'] === 'fix_permissions') {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(__DIR__ . '/lib'));
    foreach ($iterator as $item) {
        chmod($item, 0755);
    }
    chmod(__DIR__ . '/bin/tesseract', 0755);
    echo "Permissions fixed.";
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No image uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type']);
    exit;
}

// Generate unique temp filename
$tempFile = sys_get_temp_dir() . '/ocr_' . uniqid() . '.png';
$outputFileBase = sys_get_temp_dir() . '/ocr_out_' . uniqid();

// Save uploaded image to temp file
if (!move_uploaded_file($file['tmp_name'], $tempFile)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save temporary file']);
    exit;
}

$startTime = microtime(true);

// Execute Tesseract
// Command: <loader> --library-path <lib_path> <tesseract_bin> <image> <output_base> [-l <lang>]
$binPath = __DIR__ . '/bin/tesseract';
$libPath = __DIR__ . '/lib';
$loaderPath = $libPath . '/ld-linux-x86-64.so.2';
$tessDataPath = __DIR__ . '/tessdata';

// Construct command using bundled loader
$command = "export TESSDATA_PREFIX=" . escapeshellarg($tessDataPath) . " && " . 
           escapeshellarg($loaderPath) . " --library-path " . escapeshellarg($libPath) . " " . 
           escapeshellarg($binPath) . " " . escapeshellarg($tempFile) . " " . escapeshellarg($outputFileBase) . " -l eng+jpn 2>&1";

// Debug logging
$debugLog = __DIR__ . '/ocr_debug.log';
file_put_contents($debugLog, "[" . date('Y-m-d H:i:s') . "] Command: $command\n", FILE_APPEND);

$output = [];
$returnVar = 0;
exec($command, $output, $returnVar);

file_put_contents($debugLog, "[" . date('Y-m-d H:i:s') . "] Return: $returnVar\nOutput: " . implode("\n", $output) . "\n", FILE_APPEND);

$endTime = microtime(true);
$duration = round($endTime - $startTime, 2);

// Tesseract appends .txt to the output filename
$outputTxtFile = $outputFileBase . '.txt';

if ($returnVar === 0 && file_exists($outputTxtFile)) {
    $text = file_get_contents($outputTxtFile);
    
    // Debug: Save extracted text to file
    file_put_contents(__DIR__ . '/debug_extracted_text.txt', $text);
    
    // Cleanup
    @unlink($tempFile);
    @unlink($outputTxtFile);
    
    echo json_encode([
        'success' => true, 
        'text' => trim($text),
        'duration' => $duration,
        'model' => 'tesseract (CPU)',
        'image_size' => round($file['size'] / 1024, 2) . ' KB'
    ]);
} else {
    // Cleanup
    @unlink($tempFile);
    @unlink($outputTxtFile);
    
    echo json_encode([
        'success' => false, 
        'error' => 'OCR failed: ' . implode("\n", $output) . " (Code: $returnVar)",
        'duration' => $duration,
        'debug_cmd' => $command
    ]);
}
