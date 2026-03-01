<?php
/**
 * a8.net 広告ブロック
 *
 * 提供された AMP タグは通常の HTML では動作しないため、
 * 通常のバナータグに差し替えて読み込む。
 * 複数の広告からランダムに1つを表示する。
 */
function renderA8Ad(): void
{
    // 広告の配列を定義
    $ads = [
        [
            'clickUrl' => 'https://px.a8.net/svt/ejp?a8mat=45G9TK+30CWVM+348+1C71F5',
            'imageUrl' => 'https://www23.a8.net/svt/bgt?aid=251022008182&wid=001&eno=01&mid=s00000000404008095000&mc=1',
            'pixelUrl' => 'https://www10.a8.net/0.gif?a8mat=45G9TK+30CWVM+348+1C71F5'
        ],
        [
            'clickUrl' => 'https://px.a8.net/svt/ejp?a8mat=45G9TK+2ZRH9U+348+6CHB5',
            'imageUrl' => 'https://www27.a8.net/svt/bgt?aid=251022008181&wid=001&eno=01&mid=s00000000404001066000&mc=1',
            'pixelUrl' => 'https://www15.a8.net/0.gif?a8mat=45G9TK+2ZRH9U+348+6CHB5'
        ],
        [
            'clickUrl' => 'https://px.a8.net/svt/ejp?a8mat=45I5TM+B89CJ6+1J3M+NY1Y9',
            'imageUrl' => 'https://www26.a8.net/svt/bgt?aid=251110138679&wid=001&eno=01&mid=s00000007141004022000&mc=1',
            'pixelUrl' => 'https://www13.a8.net/0.gif?a8mat=45I5TM+B89CJ6+1J3M+NY1Y9'
        ]
    ];

    // ランダムに1つの広告を選択
    $selectedAd = $ads[array_rand($ads)];
    $clickUrl = $selectedAd['clickUrl'];
    $imageUrl = $selectedAd['imageUrl'];
    $pixelUrl = $selectedAd['pixelUrl'];
?>
<div class="ad-slot ad-slot--a8" role="complementary" aria-label="広告" style="position:relative;">
  <a class="ad-slot__link" href="<?php echo htmlspecialchars($clickUrl, ENT_QUOTES, 'UTF-8'); ?>" target="_blank" rel="nofollow noopener">
    <img src="<?php echo htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'); ?>" width="728" height="90" alt="" border="0" loading="lazy" decoding="async">
  </a>
  <img src="<?php echo htmlspecialchars($pixelUrl, ENT_QUOTES, 'UTF-8'); ?>" alt="" width="1" height="1" border="0" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;border:0;">
</div>
<?php
}
?>
