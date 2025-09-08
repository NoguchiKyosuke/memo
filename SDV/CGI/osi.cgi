#!/bin/bash -vx
#
# osi.cgi
#
# written by Noguchi Kyosuke (k.noguchi2005@gmail.com) 2025/8/31

homd=/home/k_noguchi2005/WEB
logd=$homd/LOG
apid=$homd/SDV
htmd=$apid/HTML

tmp=/tmp/tmp_$$

exec 2> $logd/LOG.${basename $0}.$(date +%Y%m%d_%H%M%S)

cat $htmd/osi.html > $tmp-html

echo "Content-Type: text/html"
echo ""
cat $tmp-html

rm -rf $tmp-*
exit 0