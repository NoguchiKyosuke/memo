<?php
header('Content-Type: application/json');
die("I AM HERE");

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

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

$debugLog = __DIR__ . '/ocr_debug_v2.log';
$debugMessages = [];

function debug_log($msg) {
    global $debugLog, $debugMessages;
    $entry = "[" . date('Y-m-d H:i:s') . "] " . $msg;
    file_put_contents($debugLog, $entry . "\n", FILE_APPEND);
    $debugMessages[] = $msg;
}

try {
    $startTime = microtime(true);
    debug_log("Starting request...");
    debug_log("Log file: $debugLog");

    // Execute Tesseract
    // Command: <loader> --library-path <lib_path> <tesseract_bin> <image> <output_base> [-l <lang>]
    $binPath = __DIR__ . '/bin/tesseract';
    $libPath = __DIR__ . '/lib';
    $loaderPath = $libPath . '/ld-linux-x86-64.so.2';
    $tessDataPath = __DIR__ . '/tessdata';

    // Check file existence
    if (!file_exists($binPath)) debug_log("Error: Binary not found at $binPath");
    if (!file_exists($loaderPath)) debug_log("Error: Loader not found at $loaderPath");
    if (!file_exists($tessDataPath)) debug_log("Error: Tessdata not found at $tessDataPath");

    // Construct command using bundled loader
    $command = "export TESSDATA_PREFIX=" . escapeshellarg($tessDataPath) . " && " . 
               escapeshellarg($loaderPath) . " --library-path " . escapeshellarg($libPath) . " " . 
               escapeshellarg($binPath) . " " . escapeshellarg($tempFile) . " " . escapeshellarg($outputFileBase) . " -l eng+jpn 2>&1";

    debug_log("Command: $command");

    $output = [];
    $returnVar = 0;
    exec($command, $output, $returnVar);

    debug_log("Return Code: $returnVar");
    debug_log("Output: " . implode("\n", $output));

    $endTime = microtime(true);
    $duration = round($endTime - $startTime, 2);

    // Tesseract appends .txt to the output filename
    $outputTxtFile = $outputFileBase . '.txt';

    if (file_exists($outputTxtFile)) {
        $textContent = file_get_contents($outputTxtFile);
        debug_log("Generated Text Content: " . substr($textContent, 0, 100) . "..."); 
    } else {
        debug_log("Error: Output text file not found: $outputTxtFile");
    }

    $response = [
        'duration' => $duration,
        'model' => 'tesseract (CPU)',
        'debug_log_file' => $debugLog,
        'debug_messages' => $debugMessages
    ];

    if ($returnVar === 0 && file_exists($outputTxtFile)) {
        $text = file_get_contents($outputTxtFile);
        
        // Cleanup
        @unlink($tempFile);
        @unlink($outputTxtFile);
        
        $response['success'] = true;
        $response['text'] = trim($text);
        $response['image_size'] = round($file['size'] / 1024, 2) . ' KB';
    } else {
        // Cleanup
        @unlink($tempFile);
        @unlink($outputTxtFile);
        
        $response['success'] = false;
        $response['error'] = 'OCR failed: ' . implode("\n", $output) . " (Code: $returnVar)";
        $response['debug_cmd'] = $command;
    }

    echo json_encode($response);

} catch (Exception $e) {
    debug_log("Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'error' => 'Server Exception: ' . $e->getMessage(),
        'debug_messages' => $debugMessages
    ]);
}
