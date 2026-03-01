<?php
/**
 * 記事ヘルパー関数
 * 記事ページの共通ボイラープレートを簡略化します。
 */

/**
 * パンくずリストを出力
 *
 * @param array $items [['label' => '...', 'url' => '...'], ...] 最後の項目はリンクなし（現在地）
 *
 * 使用例:
 *   renderBreadcrumb([
 *       ['label' => 'ホーム', 'url' => '/'],
 *       ['label' => 'メモ', 'url' => '/memo/'],
 *       ['label' => '音声研究', 'url' => '/memo/voice/'],
 *       ['label' => '記事タイトル'],
 *   ]);
 */
function renderBreadcrumb(array $items): void
{
    $count = count($items);
    if ($count === 0) return;

    echo '<nav aria-label="パンくずリスト"><ol class="breadcrumb">';
    foreach ($items as $i => $item) {
        if ($i === $count - 1 || !isset($item['url'])) {
            echo '<li>' . htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') . '</li>';
        } else {
            echo '<li><a href="' . htmlspecialchars($item['url'], ENT_QUOTES, 'UTF-8') . '">'
                . htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') . '</a></li>';
        }
    }
    echo '</ol></nav>';
}

/**
 * 記事ヘッダーを出力（タイトル + リード文 + タグ + 更新日）
 *
 * @param string $title     記事タイトル
 * @param string $lead      リード文（HTML可）
 * @param array  $tags      タグ一覧
 * @param string $filePath  __FILE__ を渡すと更新日を自動表示
 */
function renderArticleHeader(string $title, string $lead = '', array $tags = [], string $filePath = ''): void
{
    echo '<header>';
    echo '<h1>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    if ($filePath !== '' && file_exists($filePath)) {
        echo ' <span class="update-info">' . date('Y年m月d日更新', filemtime($filePath)) . '</span>';
    }
    echo '</h1>';
    if ($lead !== '') {
        echo '<p class="lead">' . $lead . '</p>';
    }
    if (!empty($tags)) {
        echo '<div class="article-tags" style="margin-top:.8rem;">';
        foreach ($tags as $tag) {
            echo '<span class="tag">' . htmlspecialchars($tag, ENT_QUOTES, 'UTF-8') . '</span>';
        }
        echo '</div>';
    }
    echo '</header>';
}

/**
 * パンくずリストの構造化データ (JSON-LD) を出力
 *
 * @param array $items [['label' => '...', 'url' => 'https://...'], ...]
 */
function renderBreadcrumbJsonLd(array $items): void
{
    $listItems = [];
    foreach ($items as $i => $item) {
        $entry = [
            '@type' => 'ListItem',
            'position' => $i + 1,
            'name' => $item['label'],
        ];
        if (isset($item['url'])) {
            $url = $item['url'];
            if (strpos($url, 'http') !== 0) {
                $url = 'https://memosite.jp' . $url;
            }
            $entry['item'] = $url;
        }
        $listItems[] = $entry;
    }

    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => $listItems,
    ];

    echo '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
}
