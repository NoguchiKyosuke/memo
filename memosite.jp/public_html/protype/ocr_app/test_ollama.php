<?php
$ollamaUrl = 'http://localhost:11434/api/generate';
$data = [
    'model' => 'llava',
    'prompt' => 'Hello, are you working?',
    'stream' => false
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'timeout' => 10
    ]
];

$context  = stream_context_create($options);
$response = @file_get_contents($ollamaUrl, false, $context);

if ($response === FALSE) {
    $error = error_get_last();
    echo "Error: " . ($error['message'] ?? 'Unknown error') . "\n";
} else {
    echo "Response: " . $response . "\n";
}
