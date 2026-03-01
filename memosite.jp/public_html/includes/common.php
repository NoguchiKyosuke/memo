<?php
/**
 * 共通関数
 */

/**
 * ナビゲーションバーを出力
 *
 * @param string $active アクティブなセクション
 *   'home' | 'memo' | 'clock' | 'vocabulary' | 'game' | 'protype'
 */
function renderNavigation($active = 'home'): void
{
    $sections = [
        'home'       => ['label' => 'ホーム',     'url' => '/'],
        'memo'       => ['label' => 'メモ',       'url' => '/memo/'],
        'clock'      => ['label' => '時計',       'url' => '/clock/'],
        'vocabulary' => ['label' => '単語帳',     'url' => '/vocabulary_app/'],
        'game'       => ['label' => 'ゲーム',     'url' => '/game/'],
        'protype'    => ['label' => 'ミニアプリ', 'url' => '/protype/'],
    ];
?>
<header class="site-header">
    <div class="container flex-between" style="position:relative;">
        <a href="/" class="brand">メモ帳</a>
        <button class="nav-toggle" aria-label="メニュー" onclick="document.querySelector('.main-nav').classList.toggle('is-open')">☰</button>
        <nav class="main-nav">
<?php foreach ($sections as $key => $section): ?>
            <a href="<?php echo htmlspecialchars($section['url'], ENT_QUOTES, 'UTF-8'); ?>"<?php echo $key === $active ? ' class="active"' : ''; ?>><?php echo htmlspecialchars($section['label'], ENT_QUOTES, 'UTF-8'); ?></a>
<?php endforeach; ?>
        </nav>
    </div>
</header>
<?php
}

/**
 * フッターを出力
 */
function renderFooter(): void
{
?>
<footer class="site-footer">
    <div class="container" style="text-align:center;">
        <p style="margin:.5rem 0;font-size:.9rem;">
            &copy; 2024-<?php echo date('Y'); ?> <a href="/">メモ帳</a>
        </p>
        <p style="margin:.5rem 0;font-size:.82rem;color:var(--text-dim);">
            <a href="/" style="color:var(--text-dim);">ホーム</a> |
            <a href="/memo/" style="color:var(--text-dim);">メモ</a> |
            <a href="/clock/" style="color:var(--text-dim);">時計</a> |
            <a href="/vocabulary_app/" style="color:var(--text-dim);">単語帳</a> |
            <a href="/game/" style="color:var(--text-dim);">ゲーム</a> |
            <a href="/protype/" style="color:var(--text-dim);">ミニアプリ</a>
        </p>
    </div>
</footer>
<?php
}
?>
