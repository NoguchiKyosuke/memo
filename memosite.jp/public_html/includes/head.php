<?php
/**
 * 共通ヘッダー部分
 * @param string $title ページタイトル
 * @param string $description ページの説明（SEO用）
 * @param string $keywords キーワード（SEO用）
 * @param string $canonical 正規URL
 */
function renderHead($title = 'メモ帳', $description = '情報系のメモを中心に記録しているメモブログです。', $keywords = '音声解析,機械学習,メモ', $canonical = '') {
  $baseUrl = 'https://memosite.jp';
    if (empty($canonical)) {
        $canonical = $baseUrl . $_SERVER['REQUEST_URI'];
    }
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta name="keywords" content="<?php echo htmlspecialchars($keywords, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta name="author" content="メモ帳" />
  <meta name="robots" content="index,follow" />
  <meta name="theme-color" content="#0066cc" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="<?php echo htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:site_name" content="メモ帳" />
  <meta property="og:locale" content="ja_JP" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta name="twitter:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="<?php echo htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'); ?>" />
  <link rel="manifest" href="/static/manifest.json" />
  
  <title><?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  
  <!-- Styles -->
  <link rel="stylesheet" href="/assets/css/app.css" />
  <link rel="stylesheet" href="/assets/css/custom.css" />
  <script defer src="/assets/js/code-enhancer.js"></script>
  
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9731395870548647"
    crossorigin="anonymous"></script>
  
  <!-- 構造化データ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "メモ帳",
    "url": "<?php echo $baseUrl; ?>",
    "description": "<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>",
    "inLanguage": "ja",
    "author": {
      "@type": "Organization",
      "name": "メモ帳"
    }
  }
  </script>
</head>
<?php
}
?>