<?php
require_once 'includes/head.php';
require_once 'includes/common.php';

$title = 'タイムマネージャ - ローカル時計とアラーム';
$description = 'ユーザーの現在地に基づき正確な現在時刻を表示し、最大5件のアラームを設定・保存できるタイムマネージャ。カウントダウンと派手なアラート演出で時間を見逃しません。';
$keywords = '時計,アラーム,タイマー,SafeEar,時間管理';
$canonical = 'https://memosite.jp/timekeeper.php';

$serverUtcMs = (int) round(microtime(true) * 1000);
$serverOffsetSeconds = (int) date('Z');
$serverTimezone = date_default_timezone_get();

renderHead($title, $description, $keywords, $canonical);
?>
<body data-server-utc="<?php echo $serverUtcMs; ?>" data-server-offset="<?php echo $serverOffsetSeconds; ?>" data-server-tz="<?php echo htmlspecialchars($serverTimezone, ENT_QUOTES, 'UTF-8'); ?>">
<?php renderNavigation('timekeeper'); ?>

<main class="container fade-in" style="max-width:980px;margin:0 auto;padding:2.4rem 0 3.6rem;">
  <section class="timekeeper-hero">
    <h1>ローカルタイムマネージャ</h1>
    <p class="hero-lead">ブラウザが検出した現在地のタイムゾーンに合わせて時刻を表示し、最大5件のアラームを日次で運用できます。アラーム設定はブラウザに保存され、次回アクセス時も保持されます。</p>
    <div class="clock-panel" aria-live="polite">
      <div class="clock-display" data-clock>00:00:00</div>
      <div class="date-display" data-date>----年--月--日 (----)</div>
      <div class="timezone-display">
        <span class="timezone-chip" data-timezone>タイムゾーンを検出しています...</span>
        <span class="location-status" data-location-status>現在地の解析中です。</span>
      </div>
    </div>
  </section>

  <section class="alarms-section">
    <h2>アラーム設定</h2>
    <p class="section-lead">最大5件までアラームを登録できます。同時に有効化できるアラームは5件です。指定時刻が近づくとカウントダウンが始まり、時刻になるとサウンドと画面演出で通知します。</p>

    <div class="alarms-grid" data-alarm-list></div>

    <template id="alarm-card-template">
      <div class="alarm-card" data-alarm-card>
        <div class="alarm-card-header">
          <h3>アラーム <span data-alarm-index>1</span></h3>
          <label class="toggle">
            <input type="checkbox" data-alarm-toggle />
            <span class="toggle-slider" aria-hidden="true"></span>
            <span class="sr-only">このアラームを有効化</span>
          </label>
        </div>
        <div class="alarm-card-body">
          <label class="field">
            <span>時刻</span>
            <input type="time" data-alarm-time required />
          </label>
          <label class="field">
            <span>メモ (任意)</span>
            <input type="text" maxlength="60" placeholder="例: 会議 / 休憩" data-alarm-label />
          </label>
          <div class="alarm-status">
            <span class="alarm-chip" data-alarm-state>待機中</span>
            <span class="alarm-countdown" data-alarm-countdown>--:--:--</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</main>

<div class="alarm-overlay" data-alarm-overlay hidden role="alertdialog" aria-modal="true" aria-hidden="true" tabindex="-1" aria-labelledby="alarm-overlay-title" aria-describedby="alarm-overlay-time">
  <div class="alarm-overlay-content" role="document">
    <h2 id="alarm-overlay-title" data-alarm-message>アラーム</h2>
    <p id="alarm-overlay-time" class="alarm-overlay-time" data-alarm-overlay-time>00:00</p>
    <button type="button" class="alarm-stop-btn" data-stop-button>アラームを停止</button>
  </div>
</div>

<script defer src="/assets/js/timekeeper.js"></script>
</body>
</html>
