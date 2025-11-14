#!/usr/bin/env bash
#
# convert_to_webp.sh
# 現在のディレクトリ内の画像ファイル（jpg, jpeg, png, gif, bmp, tiff）をWebP形式に一括変換します。
# 
# 使い方:
#   ./convert_to_webp.sh [quality]
#   
# 引数:
#   quality - WebPの品質 (0-100, デフォルト: 100)
#
# 必要条件:
#   - cwebp コマンド (webp パッケージ) がインストールされていること
#     Ubuntu/Debian: sudo apt install webp
#     macOS: brew install webp
#
# 注意:
#   - 元の画像ファイルは削除されず、.webp拡張子の新しいファイルが生成されます。
#   - 既に同名の .webp ファイルが存在する場合はスキップされます。

set -euo pipefail

# デフォルトの品質設定
QUALITY="${1:-100}"

# 色付き出力のための変数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# cwebp コマンドの確認
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}エラー: cwebp コマンドが見つかりません。${NC}"
    echo -e "${YELLOW}以下のコマンドでインストールしてください:${NC}"
    echo "  Ubuntu/Debian: sudo apt install webp"
    echo "  macOS: brew install webp"
    exit 1
fi

# 品質パラメータの検証
if ! [[ "$QUALITY" =~ ^[0-9]+$ ]] || [ "$QUALITY" -lt 0 ] || [ "$QUALITY" -gt 100 ]; then
    echo -e "${RED}エラー: 品質は 0 から 100 の整数で指定してください。${NC}"
    exit 1
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}WebP 一括変換スクリプト${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "品質設定: ${GREEN}${QUALITY}${NC}"
echo ""

# 変換対象の拡張子
EXTENSIONS=("jpg" "jpeg" "png" "gif" "bmp" "tiff" "tif")

# カウンター
total=0
converted=0
skipped=0
failed=0

# 各拡張子について処理
for ext in "${EXTENSIONS[@]}"; do
    # 大文字小文字を区別しない検索
    shopt -s nocaseglob
    for file in *."${ext}"; do
        # ファイルが実際に存在するか確認（パターンマッチしなかった場合の対策）
        [ -f "$file" ] || continue
        
        total=$((total + 1))
        
        # 出力ファイル名を生成
        base_name="${file%.*}"
        output_file="${base_name}.webp"
        
        # 既に WebP ファイルが存在する場合はスキップ
        if [ -f "$output_file" ]; then
            echo -e "${YELLOW}[スキップ]${NC} $file (既に $output_file が存在)"
            skipped=$((skipped + 1))
            continue
        fi
        
        # WebP に変換
        echo -e "${BLUE}[変換中]${NC} $file → $output_file"
        if cwebp -q "$QUALITY" "$file" -o "$output_file" > /dev/null 2>&1; then
            # ファイルサイズを比較
            original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            webp_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "0")
            
            if [ "$original_size" -gt 0 ] && [ "$webp_size" -gt 0 ]; then
                reduction=$(( (original_size - webp_size) * 100 / original_size ))
                echo -e "${GREEN}[完了]${NC} 圧縮率: ${reduction}% 削減 ($(numfmt --to=iec-i --suffix=B "$original_size" 2>/dev/null || echo "${original_size}B") → $(numfmt --to=iec-i --suffix=B "$webp_size" 2>/dev/null || echo "${webp_size}B"))"
            else
                echo -e "${GREEN}[完了]${NC}"
            fi
            converted=$((converted + 1))
        else
            echo -e "${RED}[失敗]${NC} $file の変換に失敗しました"
            failed=$((failed + 1))
        fi
        echo ""
    done
    shopt -u nocaseglob
done

# 結果サマリー
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}変換結果${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "対象ファイル数: ${total}"
echo -e "${GREEN}変換成功: ${converted}${NC}"
echo -e "${YELLOW}スキップ: ${skipped}${NC}"
echo -e "${RED}失敗: ${failed}${NC}"
echo ""

if [ "$total" -eq 0 ]; then
    echo -e "${YELLOW}変換対象の画像ファイルが見つかりませんでした。${NC}"
    exit 0
fi

if [ "$converted" -gt 0 ]; then
    echo -e "${GREEN}✓ 変換が完了しました！${NC}"
    exit 0
else
    echo -e "${YELLOW}変換されたファイルはありません。${NC}"
    exit 0
fi
