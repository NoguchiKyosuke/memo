<?php
require_once 'includes/head.php';
require_once 'includes/common.php';
require_once 'includes/ad.php';

$title = 'SDV (Software Defined Vehicle) - メモ帳';
$description = 'Software Defined Vehicle (SDV) に関する技術解説。従来の車との違い、アーキテクチャ、利点と課題、今後の展望について詳しく説明します。';
$keywords = 'SDV,Software Defined Vehicle,車載ソフトウェア,ECU,OTA,アップデート,自動運転,V2X';

renderHead($title, $description, $keywords);
?>
<body>
<?php renderNavigation('sdv'); ?>

<main class="container fade-in" style="max-width:880px;margin:0 auto;padding:2.2rem 0 3rem;">
  <article>
    <header>
      <h1>Software Defined Vehicle (SDV)</h1>
      <p class="lead">車載ソフトウェアとアーキテクチャに関するノート。</p>
    </header>
    
    <?php renderAdBanner(); ?>
    
    <section>
      <h2>SDVとは</h2>
      <p>スマートフォンのアプリの様に車に搭載したソフトウェアを随時更新することで、車と日常をつなげることを目的とした技術。</p>
      <p>一つの大きなコンピュータシステムを搭載することによって、従来のハードウェアごとの制御機能を代替することができる。</p>
      <p>また、コンピュータシステムによる制御は車の特徴や機能をハードウェアと切り離すことができる。そのため、製造工場から出荷された後でも車の機能をソフト的にアップデートすることができる。</p>
    </section>

    <section>
      <h2>従来の車との差異</h2>
      <ul>
        <li>
          <h3>従来の車</h3>
          <p>Electronic Control Unit (ECU) を搭載することで、例えばエンジンコントロールや窓の開け閉めなどを制御していた。</p>
          <p>ECU は車の中に数 10 ~ 100 個搭載されており、それらは工場で生産されるため、車のほとんどの性能は製造時に決まってしまう。</p>
        </li>
        <li>
          <h3>SDV</h3>
          <p>コンピュータによって中央集権型で管理する。また、HPCs と呼ばれる数台の高性能コンピュータによって車の「ゾーン」を管理することがある。</p>
          <p>HPCs によって車を全体として機能強化することが可能になる。</p>
          <p>Over-the-Air (OTA) updates によって、車のソフトウェアをリモートで更新することができる。</p>
        </li>
      </ul>
    </section>

    <section>
      <h2>SDVのアーキテクチャについて</h2>
      <ul>
        <li>
          <h3>Centralized Computing</h3>
          <p>強力な中心的コンピュータか小数の高性能コンピュータ群から構成される。</p>
          <p>これによりセンサやシステムから生成された大量データを統合的に処理できる。</p>
        </li>
        <li>
          <h3>Zonal Architecture</h3>
          <p>車を物理ゾーンに分割し、各ゾーンのローカルコントローラがセンサやアクチュエータを管理する。</p>
          <p>ゾーンのコンピュータは中央コンピュータを介して通信する。</p>
        </li>
        <li>
          <h3>Vehicle Operating System (OS)</h3>
          <p>スマートフォンの OS のように、車内アプリケーション開発者向けの共通プラットフォームを提供する。</p>
        </li>
        <li>
          <h3>Cloud Connectivity</h3>
          <p>OTA アップデートやリモート機能のために堅牢で低遅延な通信が必要。</p>
        </li>
        <li>
          <h3>Sensors and Actuators</h3>
          <p>LiDAR / カメラ / レーダ などで周囲環境を認識し、アクチュエータ制御でブレーキ・アクセル等を操作する。</p>
        </li>
      </ul>
    </section>

    <section>
      <h2>SDVの利点と課題</h2>
      <ul>
        <li>
          <h3>利点</h3>
          <p>常に機能をアップデートできることで、サブスクリプション型の機能や流行に左右した機能を提供することができる。</p>
          <p>乗車する個人に合わせた機能を提供することができる。</p>
          <p>発売後に拡張機能を提供することが可能であるため、最低限の開発段階でリリースすることが可能である。そのため、発売までの開発を早期に完了することができる。</p>
        </li>
        <li>
          <h3>課題</h3>
          <p>サイバーセキュリティの対策をする必要がある。</p>
          <p>ソフトウェアの開発が複雑になりやすい。そのため、ソフトウェア工学の知識の活用が必要である。</p>
          <p>ソフトウェアをアップデートする際に、本人かどうかを確認する仕組みが必要である。また、システムの権限(開発者、所有者、ゲスト など)を適切に設定する必要がある。</p>
          <p>現状で開発段階の技術であるため、企業は専門的なエンジニアや固有の部品や設備などに投資する必要がある。</p>
        </li>
      </ul>
    </section>

    <section>
      <h2>今後の展望</h2>
      <p>現在はテスラをはじめ、世界各国の自動車メーカー大手がソフトウェアの開発に投資している。</p>
      <p>また、AIや機械学習を取り入れることで運転をアシストしたり、車を利用者に最適化したりすることが期待される。</p>
      <p>また、SDVは自動運転技術の発展には欠かせない技術である。</p>
      <p>Vehicle-to-Everything (V2X)通信を活用することで、他の自動車と連携することができる。そうすることで、交通の安全性や渋滞の緩和を見込むことができる。</p>
    </section>

    <footer style="margin-top:3rem;font-size:.7rem;color:#6b7280;">
      <p>更新日時: <?php echo date('Y年m月d日 H:i', filemtime(__FILE__)); ?></p>
    </footer>
  </article>
</main>

<?php renderFooter(); ?>

<!-- 構造化データ（記事） -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Software Defined Vehicle (SDV)",
  "description": "<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>",
  "author": {
    "@type": "Organization",
    "name": "メモ帳"
  },
  "datePublished": "2025-01-01",
  "dateModified": "<?php echo date('c', filemtime(__FILE__)); ?>",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://memo-site.com/sdv.php"
  },
  "about": [
    {
      "@type": "Thing",
      "name": "Software Defined Vehicle"
    },
    {
      "@type": "Thing", 
      "name": "車載ソフトウェア"
    }
  ]
}
</script>

<!-- パンくずリスト -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://memo-site.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "SDV",
      "item": "https://memo-site.com/sdv.php"
    }
  ]
}
</script>

</body>
</html>