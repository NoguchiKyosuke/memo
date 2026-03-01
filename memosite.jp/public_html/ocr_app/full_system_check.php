<?php
// full_system_check.php

echo "=== OCR App System Check ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "User: " . get_current_user() . "\n";
echo "----------------------------\n";

// 1. Check PHP Configuration
echo "[1] Checking PHP Configuration...\n";
if (ini_get('allow_url_fopen')) {
    echo "  [PASS] allow_url_fopen is ON\n";
} else {
    echo "  [FAIL] allow_url_fopen is OFF (Required for file_get_contents)\n";
}

// 2. Check Ollama Connectivity
echo "\n[2] Checking Ollama Connectivity...\n";
$ollamaUrl = 'http://localhost:11434/api/tags';
$context = stream_context_create(['http' => ['timeout' => 2]]);
$response = @file_get_contents($ollamaUrl, false, $context);

if ($response) {
    echo "  [PASS] Ollama is reachable.\n";
    $data = json_decode($response, true);
    $models = array_column($data['models'] ?? [], 'name');
    echo "  Available Models: " . implode(', ', $models) . "\n";
    
    if (in_array('llava:latest', $models) || in_array('llava', $models)) {
        echo "  [PASS] 'llava' model is available.\n";
    } else {
        echo "  [WARN] 'llava' model NOT found. OCR will fail.\n";
    }
} else {
    echo "  [FAIL] Could not connect to Ollama at $ollamaUrl.\n";
    echo "  Error: " . error_get_last()['message'] . "\n";
}

// 3. Test Image Processing
echo "\n[3] Testing OCR Processing...\n";
$testImage = '/home/nk21137/Pictures/Screenshots/curl_error_screenshot.png';

if (file_exists($testImage)) {
    echo "  Test Image: $testImage\n";
    $imageData = base64_encode(file_get_contents($testImage));
    
    $payload = json_encode([
        'model' => 'llava',
        'prompt' => 'Read the text in this image.',
        'images' => [$imageData],
        'stream' => false
    ]);
    
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 30
        ]
    ];
    
    echo "  Sending request to Ollama (timeout 30s)...\n";
    $start = microtime(true);
    $ocrResponse = @file_get_contents('http://localhost:11434/api/generate', false, stream_context_create($opts));
    $end = microtime(true);
    
    if ($ocrResponse) {
        $json = json_decode($ocrResponse, true);
        if (isset($json['response'])) {
            echo "  [PASS] OCR Successful!\n";
            echo "  Time: " . round($end - $start, 2) . "s\n";
            echo "  Output Preview: " . substr(str_replace("\n", " ", $json['response']), 0, 100) . "...\n";
        } else {
            echo "  [FAIL] Invalid response from Ollama.\n";
        }
    } else {
        echo "  [FAIL] OCR Request failed.\n";
        echo "  Error: " . error_get_last()['message'] . "\n";
    }
} else {
    echo "  [SKIP] Test image not found at $testImage\n";
}

echo "\n----------------------------\n";
echo "System Check Complete.\n";
