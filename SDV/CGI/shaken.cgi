#!/bin/bash -vx
#
# shaken.cgi - SDV 車検活用ページ配信用 CGI
#
# written by Noguchi Kyosuke (auto-generated helper) 2025/08/28

homd=/home/k_noguchi2005/WEB
logd=$homd/LOG
apid=$homd/SDV
htmd=$apid/HTML

tmp=/tmp/tmp_$$

# エラーログ出力先 (既存 sdv.cgi と同様の命名スタイル)
exec 2> $logd/LOG.shaken.cgi.$(date +%Y%m%d_%H%M%S)

# 対象 HTML をテンポラリにコピー
cat "$htmd/shaken.html" > "$tmp-html"

# HTTP ヘッダ
printf '%s\n' 'Content-Type: text/html'
printf '\n'

# 本文
cat "$tmp-html"

rm -f "$tmp-html"
exit 0
