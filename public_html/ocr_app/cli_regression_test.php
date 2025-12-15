<?php
$imagePath = '/home/nk21137/Pictures/Screenshots/curl_error_screenshot.png';
$prompt = 'Extract text';

echo "Testing process.php logic...\n";

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_FILES['image'] = [
    'tmp_name' => $imagePath,
    'error' => UPLOAD_ERR_OK,
    'type' => 'image/png'
];
$_POST['prompt'] = $prompt;

// Capture output
ob_start();
require '/home/nk21137/OneDrive/memo/memosite.jp/public_html/ocr_app/process.php';
$output = ob_get_clean();

$json = json_decode($output, true);
if ($json['success']) {
    echo "[PASS] OCR Success\n";
    echo "Text: " . substr($json['text'], 0, 50) . "...\n";
} else {
    echo "[FAIL] OCR Failed: " . $json['error'] . "\n";
}
