# WebP 画像運用ガイド

このプロジェクトでは、画像を WebP 形式で統一し、パフォーマンスとSEOを最適化しています。

## 実施済みの最適化

### 1. `.htaccess` での最適化
- **WebP キャッシュ設定**: `image/webp` タイプを 1 年間キャッシュ（他の形式より長期）
- **SVG 圧縮**: `image/svg+xml` を gzip 圧縮対象に追加

### 2. 画像ヘルパー関数（`includes/image-helper.php`）
全ページで利用可能な画像出力用のPHP関数を用意しました。

#### 使い方

```php
<?php
require_once '../includes/image-helper.php';

// 基本的な使い方（自動で <picture> タグを生成）
echo renderImage('./images/sample.png', 'サンプル画像');

// カスタムスタイルやクラスを指定
echo renderResponsiveImage(
    './images/sample.png',
    'サンプル画像',
    'custom-class',
    'max-width:600px;border-radius:12px;'
);
?>
```

これらの関数は：
- WebP ファイルが存在すれば `<picture>` タグで出力
- 存在しなければ従来の `<img>` タグにフォールバック
- 自動で `loading="lazy"` を付与してパフォーマンス向上

### 3. 画像変換スクリプト（`voice/images/convert_to_webp.sh`）
既存の PNG/JPG/GIF などを WebP に一括変換するスクリプトを用意。

```bash
cd /path/to/images
./convert_to_webp.sh [品質]  # 品質のデフォルトは 80
```

## 今後の画像追加フロー

### 新しい画像を追加する際の手順

1. **画像を配置**
   ```bash
   # 例: voice/images/ ディレクトリに配置
   cp new-image.png public_html/voice/images/
   ```

2. **WebP に変換**
   ```bash
   cd public_html/voice/images/
   ./convert_to_webp.sh
   ```

3. **PHP ファイルで使用**
   ```php
   <?php
   require_once '../includes/image-helper.php';
   ?>
   
   <!-- 本文中で -->
   <?php echo renderImage('./images/new-image.png', '説明文'); ?>
   ```

### ベストプラクティス

- **元ファイルは残す**: WebP 変換後も PNG/JPG は削除せず、フォールバックとして保持
- **alt 属性を必ず設定**: アクセシビリティとSEOのため
- **適切な品質を選択**:
  - スクリーンショット: 品質 75-85
  - 写真: 品質 80-90
  - アイコン・図表: 品質 85-95

## トラブルシューティング

### WebP が表示されない場合
1. ファイルパスが正しいか確認
2. WebP ファイルが実際に生成されているか確認
3. ブラウザがWebPに対応しているか確認（Chrome, Firefox, Edge, Safari 14+ は対応）

### 変換スクリプトが動かない場合
```bash
# cwebp がインストールされているか確認
which cwebp

# インストールされていなければ
sudo apt install webp  # Ubuntu/Debian
brew install webp      # macOS
```

## 参考リンク
- [WebP 公式サイト](https://developers.google.com/speed/webp)
- [Can I use WebP?](https://caniuse.com/webp)
