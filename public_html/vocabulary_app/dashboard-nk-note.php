<?php
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
                <span>Welcome, <?php echo h(isset($_SESSION['username']) ? $_SESSION['username'] : $_SESSION['email']); ?></span>
                <a href="add_word.php">Add Word</a>
                <a href="logout.php">Logout</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Your Vocabulary</h2>
                <div class="filters">
                    <a href="dashboard.php?filter=all" class="filter-btn <?php echo $filter === 'all' ? 'active' : ''; ?>">All</a>
                    <a href="dashboard.php?filter=en-ja" class="filter-btn <?php echo $filter === 'en-ja' ? 'active' : ''; ?>">En-Ja</a>
                    <a href="dashboard.php?filter=en-en" class="filter-btn <?php echo $filter === 'en-en' ? 'active' : ''; ?>">En-En</a>
                </div>
            </div>

            <?php if (empty($words)): ?>
                <p>No words found. <a href="add_word.php">Add a word!</a></p>
            <?php else: ?>
                <?php foreach ($words as $word): ?>
                    <div class="word-item">
                        <div class="word-header">
                            <span class="word-term">
                                <?php echo h($word['word']); ?>
                                <?php if ($word['dictionary_type'] === 'mixed'): ?>
                                    <span class="badge badge-mixed">Both</span>
                                <?php elseif ($word['dictionary_type'] === 'en-en'): ?>
                                    <span class="badge badge-en-en">En-En</span>
                                <?php else: ?>
                                    <span class="badge badge-en-ja">En-Ja</span>
                                <?php endif; ?>
                            </span>
                            <span class="word-source">
                                Source: <a href="view_source.php?source=<?php echo urlencode($word['source']); ?>"><?php echo h($word['source']); ?></a>
                                <form method="post" action="delete_word" style="display:inline; margin-left: 10px;" onsubmit="return confirm('Are you sure you want to remove this word?');">
                                    <input type="hidden" name="id" value="<?php echo $word['id']; ?>">
                                    <button type="submit" class="btn-remove">Remove</button>
                                </form>
                            </span>
                        </div>
                        <div class="word-meaning view-mode-<?php echo h($filter); ?>">
                            <?php 
                            // Allow HTML for rich meanings, but strip dangerous tags if needed.
                            // Since we generate the HTML in functions.php, we trust it reasonably well,
                            // but good practice to be careful. For now, echo directly as we control the input.
                            echo $word['meaning']; 
                            ?>
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
