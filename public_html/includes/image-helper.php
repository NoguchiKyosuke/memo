<?php
/**
 * 画像ヘルパー関数
 * WebP対応の<picture>タグを簡単に生成
 */

/**
 * WebP対応のレスポンシブ画像タグを生成
 * 
 * @param string $imagePath 画像のパス（拡張子含む）
 * @param string $alt 代替テキスト
 * @param string $class CSSクラス（オプション）
 * @param string $style インラインスタイル（オプション）
 * @return string HTML picture要素
 */
function renderResponsiveImage($imagePath, $alt = '', $class = '', $style = '') {
    // 拡張子を取得
    $pathInfo = pathinfo($imagePath);
    $extension = strtolower($pathInfo['extension']);
    $basePath = $pathInfo['dirname'] . '/' . $pathInfo['filename'];
    
    // WebPパスを生成
    $webpPath = $basePath . '.webp';
    
    // 属性を組み立て
    $attributes = [];
    if ($alt !== '') {
        $attributes[] = 'alt="' . htmlspecialchars($alt, ENT_QUOTES, 'UTF-8') . '"';
    }
    if ($class !== '') {
        $attributes[] = 'class="' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') . '"';
    }
    if ($style !== '') {
        $attributes[] = 'style="' . htmlspecialchars($style, ENT_QUOTES, 'UTF-8') . '"';
    }
    
    $attrString = implode(' ', $attributes);
    
    // WebPファイルが存在する場合はpictureタグで出力
    $webpFullPath = $_SERVER['DOCUMENT_ROOT'] . $webpPath;
    if (file_exists($webpFullPath)) {
        return sprintf(
            '<picture><source srcset="%s" type="image/webp"><img src="%s" %s loading="lazy"></picture>',
            htmlspecialchars($webpPath, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($imagePath, ENT_QUOTES, 'UTF-8'),
            $attrString
        );
    }
    
    // WebPが存在しない場合は通常のimgタグ
    return sprintf(
        '<img src="%s" %s loading="lazy">',
        htmlspecialchars($imagePath, ENT_QUOTES, 'UTF-8'),
        $attrString
    );
}

/**
 * 簡易版: スタイル付き画像タグを生成
 * 
 * @param string $imagePath 画像のパス
 * @param string $alt 代替テキスト
 * @return string HTML picture/img要素
 */
function renderImage($imagePath, $alt = '') {
    return renderResponsiveImage(
        $imagePath,
        $alt,
        '',
        'max-width:100%;border:1px solid var(--border);border-radius:8px;margin-top:1rem;'
    );
}
?>
