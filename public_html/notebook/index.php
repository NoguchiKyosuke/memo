<?php
require_once __DIR__ . '/../includes/common.php';
// We don't use head.php strictly because we want a full-screen app layout, but we can reuse meta logic if needed.
// For a "Web App", typically we want clean structure.
$v = time();
session_start();
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Web Notebook - MEMOSITE</title>
    <link rel="icon" href="assets/icon.png" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/style.css?v=<?= $v ?>">
</head>
<body>

<div id="app">
    <!-- Auth Screen -->
    <div id="auth-screen" class="<?php echo isset($_SESSION['user_id']) ? 'hidden' : ''; ?>">
        <?php if (!isset($_SESSION['user_id'])): ?>
        <div class="auth-card">
            <h1>Web Notebook</h1>
            <p>Premium Digital Canvas</p>
            <div id="g_id_onload"
                 data-client_id="485681185238-18l5j0atohb9aubgveaucp7r5l0cfk6q.apps.googleusercontent.com"
                 data-callback="handleCredentialResponse"
                 data-auto_select="true"
                 data-context="signin">
            </div>
            <div class="g_id_signin"
                 data-type="standard"
                 data-size="large"
                 data-theme="filled_black"
                 data-text="sign_in_with"
                 data-shape="pill"
                 data-logo_alignment="left">
            </div>
        </div>
        <?php endif; ?>
    </div>

    <!-- Main App -->
    <div id="main-layout" class="<?php echo isset($_SESSION['user_id']) ? '' : 'hidden'; ?>">
        <!-- Sidebar -->
        <aside id="sidebar">
            <div class="sidebar-header">
                <h2>Library</h2>
                <div class="sidebar-actions">
                    <button id="btn-toggle-sidebar" title="Toggle Sidebar"><i class="fas fa-bars"></i></button>
                    <button id="btn-add-folder" title="New Folder"><i class="fas fa-folder-plus"></i></button>
                    <button id="btn-add-note" title="New Note"><i class="fas fa-file-circle-plus"></i></button>
                    <button id="btn-logout" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
                </div>
            </div>
            <div id="file-tree" class="tree-container">
                <!-- Tree items injected by JS -->
            </div>
            <!-- Context Menu -->
            <div id="context-menu" class="hidden">
                <div id="ctx-rename" class="ctx-item"><i class="fas fa-edit"></i> Rename</div>
                <div id="ctx-delete" class="ctx-item"><i class="fas fa-trash"></i> Delete</div>
            </div>
            <div id="sidebar-footer">
                <div class="user-info">
                    <img id="user-avatar" src="<?php echo $_SESSION['picture'] ?? ''; ?>" alt="User">
                    <span id="user-name"><?php echo $_SESSION['name'] ?? 'User'; ?></span>
                </div>
            </div>
        </aside>

        <!-- Editor Area -->
        <main id="editor-area">
            <div id="toolbar">
                <div class="tool-group">
                    <button id="tool-hand" class="tool-btn" title="Hand Tool (Pan)"><i class="fas fa-hand-paper"></i></button>
                    <div class="separator" style="width:1px; height:24px; background:var(--border); margin:0 8px;"></div>
                    <button id="tool-pen" class="tool-btn active" title="Pen"><i class="fas fa-pen"></i></button>
                    <button id="tool-eraser" class="tool-btn" title="Eraser"><i class="fas fa-eraser"></i></button>
                    <div class="separator" style="width:1px; height:24px; background:var(--border); margin:0 8px;"></div>
                    <button id="tool-image" class="tool-btn" title="Insert Image"><i class="fas fa-image"></i></button>
                    <button id="tool-code" class="tool-btn" title="Insert Code"><i class="fas fa-code"></i></button>
                    
                    <div class="color-picker">
                        <input type="range" id="pen-size" min="1" max="50" value="3" title="Pen Size">
                    </div>

                    <div class="separator" style="width:1px; height:24px; background:var(--border); margin:0 8px;"></div>
                    <div class="size-inputs">
                        <input type="number" id="canvas-width" value="2000" step="100" title="Canvas Width">
                        <span>x</span>
                        <input type="number" id="canvas-height" value="2000" step="100" title="Canvas Height">
                    </div>
                </div>
                <!-- Hidden Input -->
                <input type="file" id="image-input" accept="image/*" class="hidden">
                <div class="tool-group">
                    <span id="save-status">Saved</span>
                </div>
            </div>
            
            <div id="canvas-wrapper">
                <div id="empty-state">Select a note to start writing</div>
                <div id="note-container" class="hidden">
                    <canvas id="drawing-canvas"></canvas>
                    <div id="widgets-layer">
                        <!-- Text/Image Widgets overlay -->
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

<script src="https://accounts.google.com/gsi/client" async defer></script>
<script src="assets/app.js?v=<?= $v ?>"></script>
</body>
</html>
