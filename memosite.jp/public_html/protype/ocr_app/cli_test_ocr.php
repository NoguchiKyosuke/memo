<?php
$imagePath = '/home/nk21137/Pictures/Screenshots/curl_error_screenshot.png';

echo "Target Image: $imagePath\n";

if (!file_exists($imagePath)) {
    die("Error: File not found at $imagePath\n");
}

$imageData = file_get_contents($imagePath);
$base64Image = base64_encode($imageData);

$ollamaUrl = 'http://localhost:11434/api/generate';
$data = [
    'model' => 'llava',
    'prompt' => 'Extract all text from this image. Output only the text content found in the image.',
    'images' => [$base64Image],
    'stream' => false
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'timeout' => 120
    ]
];

echo "Sending request to Ollama (http://localhost:11434/api/generate)...\n";
$startTime = microtime(true);

$context  = stream_context_create($options);
$response = @file_get_contents($ollamaUrl, false, $context);

$endTime = microtime(true);
$duration = round($endTime - $startTime, 2);

if ($response === FALSE) {
    $error = error_get_last();
    die("Error: " . ($error['message'] ?? 'Unknown error') . "\n");
}

echo "Request completed in {$duration}s\n";

$responseData = json_decode($response, true);
if (isset($responseData['response'])) {
    echo "\n--- OCR Result ---\n";
    echo trim($responseData['response']) . "\n";
    echo "------------------\n";
} else {
    echo "Error: Invalid response from Ollama\n";
    print_r($responseData);
}
