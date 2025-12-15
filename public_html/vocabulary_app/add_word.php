<?php
require_once 'db.php';
require_once 'functions.php';

requireLogin();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sentence = trim($_POST['sentence']);
    $source = trim($_POST['source']);

    if (empty($sentence) || empty($source)) {
        $error = 'Please fill in all fields.';
    } else {
        // Translate using DeepL
        $translation = translateWithDeepL($sentence, 'JA');
        
        // Save to database
        // word column stores the English Sentence
        // meaning column stores the Japanese Translation
        // sentence column is left empty or could store the same, but we'll use word for the main content
        $type = 'en-ja'; // Default type

        $stmt = $pdo->prepare("INSERT INTO vocabulary (user_id, word, sentence, source, meaning, dictionary_type) VALUES (?, ?, ?, ?, ?, ?)");
        // We store the sentence in 'word' column. 'sentence' column is redundant now, so we can pass null or same value.
        // Let's pass the sentence to 'sentence' column too just in case, or leave it empty.
        // Plan said: Save sentence (input) to word column.
        if ($stmt->execute([$_SESSION['user_id'], $sentence, $sentence, $source, $translation, $type])) {
            $success = '<div class="success-details">' .
                       '<strong>Added:</strong> ' . h($sentence) . '<br>' .
                       '<strong>Meaning:</strong> ' . h($translation) .
                       '</div>';
        } else {
            $error = 'Something went wrong. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Sentence - My Dictionary</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <a href="https://memosite.jp" style="background-color: #555; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; margin-right: 10px;">🏠 Home</a>
                <a href="dashboard.php">Dashboard</a>
                <a href="logout.php">Logout</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <h2>Add New Sentence</h2>
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo h($error); ?></div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?> <br><a href="dashboard.php" style="display:inline-block; margin-top:10px;">Back to Dashboard</a></div>
            <?php endif; ?>
<?php
    // Fetch recent sources for datalist
    $stmt_sources = $pdo->prepare("SELECT DISTINCT source FROM vocabulary WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
    $stmt_sources->execute([$_SESSION['user_id']]);
    $recent_sources = $stmt_sources->fetchAll(PDO::FETCH_COLUMN);
?>
<form method="post">
                <label for="sentence">English Sentence</label>
                <textarea id="sentence" name="sentence" rows="3" required placeholder="e.g. The quick brown fox jumps over the lazy dog."></textarea>
                
                <label for="source">Source (URL, Book Title, etc.)</label>
                <input type="text" id="source" name="source" required placeholder="e.g. Typing Test" list="source_list" autocomplete="off">
                <datalist id="source_list">
                    <?php foreach ($recent_sources as $src): ?>
                        <option value="<?php echo h($src); ?>">
                    <?php endforeach; ?>
                </datalist>
                
                <button type="submit">Translate & Add</button>
            </form>
        </div>
    </div>
</body>
</html>
