<?php
header('Content-Type: application/json');

// Directory to store game data (must be writable)
$dataDir = __DIR__ . '/data';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

$action = $_GET['action'] ?? '';
$response = ['status' => 'error', 'message' => 'Invalid action'];

// Helper to cleanup old files
function cleanupOldFiles($dir) {
    if ($handle = opendir($dir)) {
        while (false !== ($file = readdir($handle))) {
            if ($file != "." && $file != "..") {
                $path = $dir . '/' . $file;
                // Delete if older than 5 minutes
                if (file_exists($path) && (time() - filemtime($path) > 300)) {
                    unlink($path);
                }
            }
        }
        closedir($handle);
    }
}

// 1 in 10 chance to trigger cleanup
if (rand(1, 10) === 1) {
    cleanupOldFiles($dataDir);
}

if ($action === 'find_match') {
    // Lock queue file for atomicity
    $queueFile = $dataDir . '/queue.json';
    $fp = fopen($queueFile, 'c+'); // Create if not exists
    if (flock($fp, LOCK_EX)) {
        $filesize = filesize($queueFile);
        $queueData = $filesize > 0 ? json_decode(fread($fp, $filesize), true) : null;
        
        $myId = $_GET['client_id'] ?? uniqid('player_', true);
        
        if ($queueData && $queueData['player_id'] !== $myId) {
            // Match found!
            $gameId = uniqid('game_', true);
            $opponentId = $queueData['player_id'];
            
            // Create game file
            $gameFile = $dataDir . '/' . $gameId . '.json';
            $initialState = [
                'p1' => $opponentId,
                'p2' => $myId,
                'status' => 'active',
                'updated' => time(),
                'state' => [
                    $opponentId => ['board' => [], 'score' => 0, 'attacks' => []],
                    $myId => ['board' => [], 'score' => 0, 'attacks' => []]
                ]
            ];
            file_put_contents($gameFile, json_encode($initialState));
            
            // Clear queue
            ftruncate($fp, 0);
            
            // Signal opponent (via queue status update - simplistic)
            // Ideally, opponent polls "check_status" which checks their queue status? No.
            // Opponent polls "check_status" with their player ID. We need to store match info somewhere?
            // Easier: Opponent polls a separate "status_{player_id}.json" or we check all games? 
            // Checking all games is slow. Let's make a file for the waiting player.
            file_put_contents($dataDir . '/status_' . $opponentId . '.json', json_encode([
                'status' => 'matched',
                'game_id' => $gameId,
                'opponent_id' => $myId,
                'role' => 'p1'
            ]));
            
            $response = [
                'status' => 'matched',
                'game_id' => $gameId,
                'opponent_id' => $opponentId,
                'role' => 'p2',
                'my_id' => $myId
            ];
        } else {
            // Wait in queue
            $queueData = ['player_id' => $myId, 'timestamp' => time()];
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($queueData));
            
            // Clear any old status file for self to be safe
            @unlink($dataDir . '/status_' . $myId . '.json');
            
            $response = [
                'status' => 'waiting',
                'my_id' => $myId
            ];
        }
        flock($fp, LOCK_UN);
    }
    fclose($fp);

} elseif ($action === 'check_status') {
    $myId = $_GET['client_id'];
    $statusFile = $dataDir . '/status_' . $myId . '.json';
    
    if (file_exists($statusFile)) {
        $statusData = json_decode(file_get_contents($statusFile), true);
        $response = $statusData;
        // Clean up status file once read? Maybe keep it for a bit or let cleanup handle it.
        // If we delete it, subsequent polls fail. Leave it.
    } else {
        $response = ['status' => 'waiting'];
    }

} elseif ($action === 'sync') {
    $gameId = $_GET['game_id'];
    $myId = $_GET['client_id'];
    $gameFile = $dataDir . '/' . $gameId . '.json';
    
    // Read input (POST) for my state
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (file_exists($gameFile)) {
        // We shouldn't lock for pure reads/writes if we trust atomic writes, but for partial updates...
        // Let's use simple file_get/put. Race conditions are possible but acceptable for this casual game.
        // Ideally: flock
        $fp = fopen($gameFile, 'c+');
        if (flock($fp, LOCK_EX)) {
            $filesize = filesize($gameFile);
            $gameState = $filesize > 0 ? json_decode(fread($fp, $filesize), true) : null;
            
            if ($gameState) {
                // Update my state
                if ($input) {
                    // Accumulate attacks instead of overwriting? 
                    // Input "attacks" should be *new* attacks to send.
                    // State "attacks" should be what opponent receives.
                    
                    // Simple logic:
                    // 1. I send "attacks_out" -> stored in opponent's "attacks_in" list?
                    // Better: I send "state".
                    
                    $gameState['state'][$myId]['board'] = $input['board'] ?? [];
                    $gameState['state'][$myId]['score'] = $input['score'] ?? 0;
                    
                    if (!empty($input['attacks_out'])) {
                         // Find opponent ID
                         $oppId = ($gameState['p1'] === $myId) ? $gameState['p2'] : $gameState['p1'];
                         // Push to opponent's attack queue
                         if (!isset($gameState['state'][$oppId]['attacks'])) {
                             $gameState['state'][$oppId]['attacks'] = [];
                         }
                         $gameState['state'][$oppId]['attacks'][] = $input['attacks_out'];
                    }
                    
                    if (!empty($input['game_over'])) {
                        $gameState['status'] = 'finished';
                        $gameState['winner'] = ($gameState['p1'] === $myId) ? $gameState['p2'] : $gameState['p1'];
                    }
                    
                    // Rewrite file
                    ftruncate($fp, 0);
                    rewind($fp);
                    fwrite($fp, json_encode($gameState));
                }
                
                // Prepare response (Opponent State)
                $oppId = ($gameState['p1'] === $myId) ? $gameState['p2'] : $gameState['p1'];
                $oppState = $gameState['state'][$oppId] ?? [];
                
                // Retrieve my attacks to process
                $myAttacks = $gameState['state'][$myId]['attacks'] ?? [];
                
                // Clear my attacks after reading? Yes, otherwise we get infinite garbage.
                if (!empty($myAttacks)) {
                     $gameState['state'][$myId]['attacks'] = [];
                     // Rewrite file again? Expensive. 
                     // Optimization: Do all mutations before write.
                     // Re-mutatinggameState...
                     ftruncate($fp, 0);
                     rewind($fp);
                     fwrite($fp, json_encode($gameState));
                }
                
                $response = [
                    'status' => 'active',
                    'opponent_state' => $oppState,
                    'attacks_received' => $myAttacks,
                    'game_status' => $gameState['status'],
                    'winner' => $gameState['winner'] ?? null
                ];
            }
            flock($fp, LOCK_UN);
        }
        fclose($fp);
    } else {
        $response = ['status' => 'error', 'message' => 'Game not found'];
    }
}

echo json_encode($response);
