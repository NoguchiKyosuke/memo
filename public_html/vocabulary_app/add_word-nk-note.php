<?php
require_once 'db.php';
require_once 'functions.php';

requireLogin();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $word = trim($_POST['word']);
    $sentence = trim($_POST['sentence']);
    $source = trim($_POST['source']);
    $type = isset($_POST['type']) ? $_POST['type'] : 'en-ja';

    if (empty($word) || empty($sentence) || empty($source)) {
        $error = 'Please fill in all fields.';
    } else {
        // Fetch meanings from both APIs
        $meaning_ja = fetchMeaning($word, 'en-ja');
        $meaning_en = fetchMeaning($word, 'en-en');
        
        // Combine meanings
        $meaning = '';
        if ($meaning_ja && $meaning_ja !== "Meaning not found.") {
            $meaning .= $meaning_ja;
        }
        if ($meaning_en && $meaning_en !== "Meaning not found.") {
            // Add a separator if both exist
            if (!empty($meaning)) {
                $meaning .= '<hr class="meaning-divider">';
            }
            $meaning .= $meaning_en;
        }

        if (empty($meaning)) {
            $meaning = "Meaning not found.";
        }

        // Determine type based on results
        if ($meaning_ja !== "Meaning not found." && $meaning_en !== "Meaning not found.") {
            $type = 'mixed';
        } elseif ($meaning_en !== "Meaning not found.") {
            $type = 'en-en';
        } else {
            $type = 'en-ja';
        }

        $stmt = $pdo->prepare("INSERT INTO vocabulary (user_id, word, sentence, source, meaning, dictionary_type) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$_SESSION['user_id'], $word, $sentence, $source, $meaning, $type])) {
            $success = 'Word added successfully!';
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
    <title>Add Word - My Dictionary</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
</head>
<body>
    <header>
        <div class="container">
            <h1>My Dictionary</h1>
            <nav>
                <a href="dashboard.php">Dashboard</a>
                <a href="logout.php">Logout</a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="card">
            <h2>Add New Word</h2>
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo h($error); ?></div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?> <a href="dashboard.php">Back to Dashboard</a></div>
            <?php endif; ?>
            <form method="post">
                <label for="word">Unknown Word</label>
                <input type="text" id="word" name="word" required placeholder="e.g. Serendipity">
                
                <!-- Dictionary Type selection removed: automatically fetches both -->

                <label for="sentence">Sentence containing the word</label>
                <textarea id="sentence" name="sentence" rows="3" required placeholder="e.g. It was pure serendipity that we met."></textarea>
                
                <label for="source">Source (URL, Book Title, etc.)</label>
                <input type="text" id="source" name="source" required placeholder="e.g. https://example.com or The Great Gatsby">
                
                <button type="submit">Add Word</button>
            </form>
        </div>
    </div>
</body>
</html>
