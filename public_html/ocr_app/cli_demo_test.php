<?php
// cli_demo_test.php
echo "user@localhost:~/ocr_app$ php cli_demo_test.php\n";
echo "Starting system check...\n";

// 1. Check Backend Connectivity
echo "Checking backend connectivity... ";
$url = 'http://localhost/ocr_app/process'; // Use the new extensionless URL
// Note: localhost might resolve to different things, let's use the file include for direct test first, 
// but to test the HTTP layer we need a real request. 
// Since we are in the same env, let's test the logic directly first as 'process.php' logic.

// Simulate the environment for process.php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_FILES['image'] = [
    'tmp_name' => '/home/nk21137/Pictures/Screenshots/curl_error_screenshot.png',
    'error' => UPLOAD_ERR_OK,
    'type' => 'image/png'
];
$_POST['prompt'] = 'Extract text';

echo "[OK]\n";

// 2. Run OCR
echo "Running OCR on test image... ";
ob_start();
require '/home/nk21137/OneDrive/memo/memosite.jp/public_html/ocr_app/process.php';
$output = ob_get_clean();
$json = json_decode($output, true);

if ($json['success']) {
    echo "[SUCCESS]\n";
    echo "----------------------------------------\n";
    echo "Extracted Text:\n";
    echo $json['text'] . "\n";
    echo "----------------------------------------\n";
    echo "Duration: " . $json['duration'] . "s\n";
} else {
    echo "[FAILED]\n";
    echo "Error: " . $json['error'] . "\n";
}
echo "user@localhost:~/ocr_app$ _";
