<?php
echo "User: " . get_current_user() . "\n";
echo "Exec User: " . exec('whoami') . "\n";
echo "Temp Dir: " . sys_get_temp_dir() . "\n";
echo "Is /tmp writable? " . (is_writable('/tmp') ? 'Yes' : 'No') . "\n";
echo "Is __DIR__ writable? " . (is_writable(__DIR__) ? 'Yes' : 'No') . "\n";
echo "Current Dir: " . __DIR__ . "\n";
$logFile = __DIR__ . '/ocr_debug_v2.log';
file_put_contents($logFile, "Test log from diag.php\n");
echo "Wrote to $logFile? " . (file_exists($logFile) ? 'Yes' : 'No') . "\n";
?>
