<?php
/**
 * 広告バナー表示関数
 */
function renderAdBanner() {
?>
<div class="ad-slot" style="display:flex;justify-content:center;margin:1.5rem 0;min-height:100px;">
  <div class="admax-switch" data-admax-id="19c3c54f850070f4a1f2cdd122415e29" style="display:inline-block;width:100%;text-align:center;"></div>
</div>
<script type="text/javascript">
// AdMaxの初期化を確実に行う
(function() {
    // DOM要素が確実に読み込まれるまで待機
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdmax);
    } else {
        initAdmax();
    }
    
    function initAdmax() {
        // AdMaxのグローバル配列を初期化
        window.admaxads = window.admaxads || [];
        
        // 広告設定をプッシュ
        window.admaxads.push({
            admax_id: "19c3c54f850070f4a1f2cdd122415e29",
            type: "switch"
        });
        
        // AdMaxスクリプトを動的に読み込み（重複読み込み防止）
        if (!document.querySelector('script[src*="adm.shinobi.jp/st/t.js"]')) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.src = 'https://adm.shinobi.jp/st/t.js';
            script.async = true;
            script.onload = function() {
                console.log('AdMax script loaded successfully');
            };
            script.onerror = function() {
                console.error('Failed to load AdMax script');
                // フォールバック: 代替の広告表示または非表示
                var adSlots = document.querySelectorAll('.ad-slot');
                adSlots.forEach(function(slot) {
                    slot.style.display = 'none';
                });
            };
            document.head.appendChild(script);
        }
        
        // 広告が読み込まれない場合の対策
        setTimeout(function() {
            var adElements = document.querySelectorAll('.admax-switch');
            adElements.forEach(function(element) {
                if (element.innerHTML.trim() === '') {
                    // 広告が読み込まれていない場合、スロットを非表示にする
                    var parentSlot = element.closest('.ad-slot');
                    if (parentSlot) {
                        parentSlot.style.display = 'none';
                    }
                }
            });
        }, 3000); // 3秒後にチェック
    }
})();
</script>
<?php
}
?>