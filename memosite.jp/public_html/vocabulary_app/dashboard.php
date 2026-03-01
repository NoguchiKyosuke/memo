<?php
// Initialize persistent session
require_once __DIR__ . '/../game/includes/session.php';
require_once 'db.php';
require_once 'functions.php';

requireLogin();

$user_id = $_SESSION['user_id'];
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';

// Build Query
$sql = "SELECT * FROM vocabulary WHERE user_id = ?";
$params = [$user_id];

if ($filter === 'en-ja') {
    $sql .= " AND (dictionary_type = 'en-ja' OR dictionary_type = 'mixed')";
} elseif ($filter === 'en-en') {
    $sql .= " AND (dictionary_type = 'en-en' OR dictionary_type = 'mixed')";
}

$sql .= " ORDER BY created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$words = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - My Dictionary</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <span>Welcome, <?php echo h($_SESSION['name'] ?? $_SESSION['email']); ?></span>
                <a href="https://memosite.jp" style="background-color: #555; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; margin-right: 10px;">🏠 Home</a>
                <a href="game.php" style="background-color: #f39c12; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; margin-right: 10px;">🎮 Vocab Game</a>
                <a href="add_word.php">Add Word</a>
                <a href="logout.php">Logout</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Your Sentences</h2>
            </div>

            <?php if (empty($words)): ?>
                <p>No words found. <a href="add_word.php">Add a word!</a></p>
            <?php else: ?>
                <?php foreach ($words as $word): ?>
                    <div class="word-item" style="display: flex; flex-direction: column; gap: 8px; padding: 15px; border-bottom: 1px solid #eee;">
                        <!-- 1. English (Word/Sentence) -->
                        <div class="word-term" style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">
                            <?php echo nl2br(h($word['word'])); ?>
                        </div>
                        
                        <!-- 2. Japanese (Meaning) -->
                        <div class="word-meaning" style="font-size: 1rem; color: #555;">
                            <?php echo nl2br(h($word['meaning'])); ?>
                        </div>

                        <!-- 3. Source -->
                        <div class="word-source" style="font-size: 0.85rem; color: #7f8c8d;">
                            Source: <a href="view_source.php?source=<?php echo urlencode($word['source']); ?>" style="color: #3498db;"><?php echo h($word['source']); ?></a>
                        </div>

                        <!-- 4. Delete Button -->
                        <div class="word-actions">
                            <form method="post" action="delete_word?t=<?php echo time(); ?>" onsubmit="return confirm('Are you sure you want to remove this item?');">
                                <input type="hidden" name="id" value="<?php echo $word['id']; ?>">
                                <button type="submit" class="btn-remove" style="background: #e74c3c; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Remove</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
