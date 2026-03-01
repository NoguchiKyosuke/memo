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
#   - 画像のリサイズに ImageMagick の convert (または magick) が利用可能であること
#     Ubuntu/Debian: sudo apt install webp imagemagick
#     macOS: brew install webp imagemagick
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

# convert/magick コマンドの確認（ピクセル数が閾値を超える場合にリサイズするため）
CONVERT_CMD=""
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
elif command -v convert &> /dev/null; then
    CONVERT_CMD="convert"
else
    echo -e "${YELLOW}警告: ImageMagick (convert/magick) が見つかりません。縦サイズの自動リサイズは行われません。${NC}"
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

        # WebP ファイルが既に存在していても、リサイズ仕様を反映するため常に再生成する
        if [ -f "$output_file" ]; then
            echo -e "${YELLOW}[再生成]${NC} 既存の $output_file を上書きします"
        fi

        # 一時ファイル（必要ならリサイズ結果を保存）
        temp_input="$file"
        temp_created=false

        # 画像の総ピクセル数を取得し、345600px (= 720x480 など) を超える場合はリサイズ
        if [ -n "$CONVERT_CMD" ]; then
            size_info=$($CONVERT_CMD "$file" -format "%w %h" info: 2>/dev/null || echo "")
            width=$(echo "$size_info" | awk '{print $1}')
            height=$(echo "$size_info" | awk '{print $2}')
            if [ -n "$width" ] && [ -n "$height" ] && [[ "$width" =~ ^[0-9]+$ ]] && [[ "$height" =~ ^[0-9]+$ ]]; then
                total_px=$((width * height))
                if [ "$total_px" -gt 345600 ] 2>/dev/null; then
                    temp_input="${base_name}_tmp_resize.${ext}"
                    echo -e "${BLUE}[リサイズ]${NC} $file (${width}x${height}px, ${total_px}px) → 総ピクセル数が約345600pxになるように縮小"
                    # アスペクト比を維持したまま、総ピクセル数が閾値を下回るように縮小
                    # ここでは長辺を基準に縮小する（実際の総ピクセル数は近似）
                    # 正しい縮小計算: scale = sqrt(345600 / (width*height))
                    scale=$(awk -v tot="$total_px" 'BEGIN{printf "%.8f", sqrt(345600 / tot)}')
                    # 新しい寸法を計算（整数）
                    new_width=$(awk -v w="$width" -v s="$scale" 'BEGIN{printf "%d", w*s}')
                    new_height=$(awk -v h="$height" -v s="$scale" 'BEGIN{printf "%d", h*s}')
                    if [ "$new_width" -lt 1 ]; then new_width=1; fi
                    if [ "$new_height" -lt 1 ]; then new_height=1; fi
                    echo -e "${BLUE}[リサイズ計算]${NC} scale=${scale}, new=${new_width}x${new_height}"
                    if $CONVERT_CMD "$file" -resize "${new_width}x${new_height}" "$temp_input" >/dev/null 2>&1; then
                        temp_created=true
                    else
                        echo -e "${RED}[失敗]${NC} $file のリサイズに失敗しました。元画像から変換を試みます。"
                        temp_input="$file"
                        temp_created=false
                    fi
                fi
            fi
        fi

        # WebP に変換
        echo -e "${BLUE}[変換中]${NC} $temp_input → $output_file"
        if cwebp -q "$QUALITY" "$temp_input" -o "$output_file" > /dev/null 2>&1; then
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
            # 一時ファイルを削除
            if [ "$temp_created" = true ] && [ -f "$temp_input" ]; then
                rm -f "$temp_input"
            fi
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
