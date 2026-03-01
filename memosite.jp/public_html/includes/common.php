<?php
/**
 * 共通関数
 */

/**
 * ナビゲーションバーを出力
 * 
 * @param string $active アクティブなセクション ('home', 'voice', 'speech', 'jspaw', etc.)
 */
function renderNavigation($active = 'home'): void
{
    $sections = [
        'home' => ['label' => 'ホーム', 'url' => '/'],
        'voice' => ['label' => 'メモ', 'url' => '/memo/'],
        'sdv' => ['label' => '時計', 'url' => '/clock/'],
        'speech' => ['label' => '単語帳', 'url' => '/vocabulary_app/'],
        'jspaw' => ['label' => 'ゲーム', 'url' => '/game/'],
        'timekeeper' => ['label' => 'ミニアプリ', 'url' => '/protype/'],
    ];
?>
<nav class="navbar" style="background-color: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 1rem 0;">
    <div class="container" style="max-width: 880px; margin: 0 auto; padding: 0 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <a href="/" style="text-decoration: none; color: #0066cc; font-weight: bold; font-size: 1.2rem;">メモ帳</a>
            <ul style="list-style: none; display: flex; gap: 2rem; margin: 0; padding: 0;">
<?php
    foreach ($sections as $key => $section) {
        if ($key === $active) {
            echo sprintf(
                '<li><a href="%s" style="text-decoration: none; color: #0066cc; font-weight: 600; border-bottom: 2px solid #0066cc; padding-bottom: 0.25rem;">%s</a></li>',
                htmlspecialchars($section['url'], ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($section['label'], ENT_QUOTES, 'UTF-8')
            );
        } else {
            echo sprintf(
                '<li><a href="%s" style="text-decoration: none; color: #555; transition: color 0.2s;">%s</a></li>',
                htmlspecialchars($section['url'], ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($section['label'], ENT_QUOTES, 'UTF-8')
            );
        }
    }
?>
            </ul>
        </div>
    </div>
</nav>
<?php
}

/**
 * フッターを出力
 */
function renderFooter(): void
{
?>
<footer style="background-color: #f8f9fa; border-top: 1px solid #dee2e6; margin-top: 3rem; padding: 2rem 0;">
    <div class="container" style="max-width: 880px; margin: 0 auto; padding: 0 2rem; text-align: center; color: #666;">
        <p style="margin: 0.5rem 0; font-size: 0.9rem;">
            &copy; 2024-2026 <a href="/" style="color: #0066cc; text-decoration: none;">メモ帳</a>
        </p>
        <p style="margin: 0.5rem 0; font-size: 0.85rem; color: #999;">
            <a href="/" style="color: #999; text-decoration: none; margin: 0 0.5rem;">ホーム</a> |
            <a href="/memo/" style="color: #999; text-decoration: none; margin: 0 0.5rem;">メモ</a> |
            <a href="/clock/" style="color: #999; text-decoration: none; margin: 0 0.5rem;">時計</a>
            <a href="/vocabulary_app/" style="color: #999; text-decoration: none; margin: 0 0.5rem;">単語帳</a> |
            <a href="/game/" style="color: #999; text-decoration: none; margin: 0 0.5rem;">ゲーム</a> |
            <a href="/protype/" style="color: #999; text-decoration: none; margin: 0 0.5rem;">ミニアプリ</a>
        </p>
    </div>
</footer>
<?php
}
?>
