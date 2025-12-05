<?php
header('Content-Type: application/json');

// Security check: Ensure this is a local environment or authorized user
// For this specific task, we assume local usage as requested.

$request = json_decode(file_get_contents('php://input'), true);

$command = $request['command'] ?? '';
$cwd = $request['cwd'] ?? getenv('HOME');

if (empty($cwd)) {
    $cwd = getcwd();
}

$response = [
    'stdout' => '',
    'stderr' => '',
    'cwd' => $cwd
];

// Handle 'cd' command internally
if (preg_match('/^cd\s*(.*)$/', $command, $matches)) {
    $target = trim($matches[1]);
    if (empty($target)) {
        $target = getenv('HOME');
    }
    
    // Resolve path relative to current cwd
    if ($target[0] !== '/') {
        $target = $cwd . '/' . $target;
    }
    
    // Realpath to resolve .. and .
    $realTarget = realpath($target);
    
    if ($realTarget && is_dir($realTarget)) {
        $response['cwd'] = $realTarget;
    } else {
        $response['stderr'] = "cd: $matches[1]: No such file or directory";
    }
} else {
    // Execute other commands
    $descriptorspec = [
        0 => ["pipe", "r"],  // stdin
        1 => ["pipe", "w"],  // stdout
        2 => ["pipe", "w"]   // stderr
    ];

    $process = proc_open($command, $descriptorspec, $pipes, $cwd, null);

    if (is_resource($process)) {
        // We are not writing to stdin
        fclose($pipes[0]);

        $response['stdout'] = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $response['stderr'] = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        proc_close($process);
    } else {
        $response['stderr'] = "Failed to execute command";
    }
}

// Get user and hostname for prompt
$response['user'] = get_current_user();
$response['hostname'] = gethostname();

// Shorten CWD for prompt (replace /home/user with ~)
$home = getenv('HOME');
if (strpos($response['cwd'], $home) === 0) {
    $response['prompt_cwd'] = '~' . substr($response['cwd'], strlen($home));
} else {
    $response['prompt_cwd'] = $response['cwd'];
}

echo json_encode($response);
