<?php
require_once 'db.php';
require_once 'functions.php';

requireLogin();

$source = isset($_GET['source']) ? $_GET['source'] : '';
$user_id = $_SESSION['user_id'];

if (empty($source)) {
    header("Location: dashboard.php");
    exit;
}

// Fetch words by source
$stmt = $pdo->prepare("SELECT * FROM vocabulary WHERE user_id = ? AND source = ? ORDER BY created_at DESC");
$stmt->execute([$user_id, $source]);
$words = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Source: <?php echo h($source); ?> - My Dictionary</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <a href="dashboard.php">Dashboard</a>
                <a href="add_word.php">Add Word</a>
                <a href="logout.php">Logout</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <h2>Words from: <?php echo h($source); ?></h2>
            <?php if (empty($words)): ?>
                <p>No words found for this source.</p>
            <?php else: ?>
                <?php foreach ($words as $word): ?>
                    <div class="word-item">
                        <div class="word-header">
                            <span class="word-term"><?php echo h($word['word']); ?></span>
                        </div>
                        <div class="word-meaning">
                            <?php echo $word['meaning']; ?>
                        </div>
                        <div class="word-sentence">
                            "<?php echo h($word['sentence']); ?>"
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
