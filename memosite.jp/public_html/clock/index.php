<?php
require_once 'includes/head.php';
require_once 'includes/common.php';
require_once 'includes/ad-a8.php';

$title = 'タイムマネージャ - ローカル時計とアラーム';
$description = 'ユーザーの現在地に基づき正確な現在時刻を表示し、最大5件のアラームを設定・保存できるタイムマネージャ。カウントダウンと派手なアラート演出で時間を見逃しません。';
$keywords = '時計,アラーム,タイマー,SafeEar,時間管理';
$canonical = 'https://memosite.jp/timekeeper.php';

$serverUtcMs = (int) round(microtime(true) * 1000);
$serverOffsetSeconds = (int) date('Z');
$serverTimezone = date_default_timezone_get();

renderHead($title, $description, $keywords, $canonical);
?>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --tk-bg: #ffffff;
    --tk-primary: #000000;
    --tk-secondary: #000000;
    --tk-text: #000000;
    --tk-dim: #666666;
    --tk-surface: #f5f5f5;
    --tk-surface-border: #e0e0e0;
  }

  body {
    background-color: var(--tk-bg) !important;
    color: var(--tk-text) !important;
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
  }

  /* Override nav if needed to blend in, or leave as is. Assuming global nav is fine but maybe needs contrast fix if it was light */
  
  .tk-container {
    max-width: 100%;
    margin: 0;
    padding: 0;
    display: block;
  }

  /* Hero / Clock Section */
  .tk-clock-section {
    text-align: center;
    width: 100%;
    min-height: 100vh; /* Use min-height to allow expansion */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Center content vertically */
    align-items: center;
    position: relative;
    box-sizing: border-box;
    padding: 2rem 1rem;
    gap: 2rem; /* Add spacing between elements */
  }

  .tk-clock-display {
    font-family: 'Orbitron', monospace;
    font-size: 20vw; /* Reduced from 24vw to prevent overflow */
    font-weight: 700;
    color: var(--tk-primary);
    line-height: 1;
    margin-bottom: 0;
    letter-spacing: -0.04em;
    width: 100%;
    overflow-wrap: break-word; /* Ensure it wraps if somehow still huge, though vw should handle it */
  }

  .tk-date-display {
    font-size: clamp(1rem, 2.5vw, 2rem);
    color: var(--tk-text);
    margin: 0;
    font-weight: 500;
  }

  .tk-meta {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    font-size: 0.9rem;
    color: var(--tk-dim);
    flex-wrap: wrap;
    width: 100%;
    /* Removed absolute positioning to make it part of the flow */
  }
  
  .tk-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    background: #f5f5f5;
    padding: 0.2rem 0.8rem;
    border-radius: 12px;
  }
  
  .tk-chip::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--tk-secondary);
  }
  
  .ad-wrapper-hero {
    margin-top: auto; /* Push to bottom if space permits, or just flow */
    width: 100%;
    max-width: 728px;
    opacity: 0.9;
    padding-top: 1rem;
  }

  /* Alarms Section */
  .tk-alarms-section {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto 4rem;
    padding: 2rem;
    box-sizing: border-box;
    border-top: 1px solid var(--tk-surface-border); /* Separator */
  }

  .tk-section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
    color: var(--tk-text);
    margin-bottom: 2rem;
    border-left: 6px solid var(--tk-secondary);
    padding-left: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
  }

  .alarms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .alarm-card {
    background: #ffffff;
    border: 2px solid var(--tk-surface-border);
    border-radius: 12px;
    padding: 2rem;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .alarm-card:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    transform: translateY(-4px);
  }

  .alarm-card.is-active {
    border-color: var(--tk-primary);
    background-color: #fafafa;
  }

  .alarm-card.is-countdown {
    border-color: var(--tk-primary);
    background-color: #f0f0f0;
  }
  
  .alarm-card.is-triggered {
    animation: alarmPulse 1s infinite alternate;
    border-color: #ff0055;
    background-color: #fff0f5;
  }
  
  @keyframes alarmPulse {
    0% { box-shadow: 0 0 0 rgba(255, 0, 85, 0); }
    100% { box-shadow: 0 0 20px rgba(255, 0, 85, 0.2); }
  }

  .alarm-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .alarm-card-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--tk-text);
  }

  .alarm-card-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Custom Input Styling */
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .field span {
    font-size: 0.8rem;
    color: var(--tk-dim);
    font-weight: 600;
    text-transform: uppercase;
  }

  .field input[type="time"],
  .field input[type="text"] {
    background: #f5f5f5;
    border: 2px solid transparent;
    color: var(--tk-text);
    padding: 1rem;
    border-radius: 8px;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    outline: none;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  
  .field input[type="text"] {
    font-family: 'Inter', sans-serif;
    font-size: 1.2rem;
    background: #ffffff;
    border: 2px solid var(--tk-surface-border);
  }

  .field input:focus {
    border-color: var(--tk-primary);
    background: #ffffff;
  }

  /* Toggle Switch */
  .toggle {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 32px;
    cursor: pointer;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #e0e0e0;
    transition: .2s;
    border-radius: 32px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 24px;
    width: 24px;
    left: 4px;
    bottom: 4px;
    background-color: #fff;
    transition: .2s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .toggle input:checked + .toggle-slider {
    background-color: var(--tk-primary);
  }
  
  .toggle input:checked + .toggle-slider:before {
    transform: translateX(28px);
  }
  
  /* Status Chips */
  .alarm-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    font-size: 1rem;
  }
  
  .alarm-chip {
    padding: 0.4rem 1rem;
    border-radius: 20px;
    background: #f0f0f0;
    color: var(--tk-dim);
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .is-active .alarm-chip {
    color: #ffffff;
    background: var(--tk-primary);
  }
  
  .alarm-countdown {
    font-family: 'Orbitron', monospace;
    font-feature-settings: "tnum" on;
    color: var(--tk-primary);
    font-weight: 700;
    font-size: 1.2rem;
  }

  /* PWA Button - Minimal */
  .pwa-actions {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 100;
  }
  
  .install-button {
    background: #000000;
    color: #ffffff;
    border: none;
    padding: 1rem 2rem;
    border-radius: 40px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }
  
  .install-button:hover {
    transform: scale(1.05);
  }
  
  .install-hint {
    display: none; /* Hide hint to keep it clean */
  }

  /* Overlay */
  .alarm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  
  .alarm-overlay[aria-hidden="false"] {
    opacity: 1;
    pointer-events: auto;
  }
  
  .alarm-overlay-content {
    text-align: center;
    width: 100%;
  }
  
  .alarm-overlay h2 {
    font-size: 3rem;
    margin-bottom: 2rem;
    color: var(--tk-text);
  }
  
  .alarm-overlay-time {
    font-family: 'Orbitron', monospace;
    font-size: 25vw;
    color: var(--tk-primary);
    margin: 0 0 4rem;
    line-height: 1;
  }
  
  .alarm-stop-btn {
    background: #000000;
    border: none;
    color: #ffffff;
    font-size: 2rem;
    padding: 1.5rem 6rem;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Orbitron', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  
  .alarm-stop-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* A8 Ad customization if possible, or just wrap it */
  .ad-wrapper {
    margin: 4rem auto;
    text-align: center;
    opacity: 0.5;
  }
</style>

<body data-server-utc="<?php echo $serverUtcMs; ?>" data-server-offset="<?php echo $serverOffsetSeconds; ?>" data-server-tz="<?php echo htmlspecialchars($serverTimezone, ENT_QUOTES, 'UTF-8'); ?>">
<?php renderNavigation('timekeeper'); ?>

<main class="tk-container fade-in">
  <!-- Clock Section -->
  <section class="tk-clock-section">
    <div class="tk-clock-display" data-clock>00:00:00</div>
    <div class="tk-date-display" data-date>----年--月--日 (----)</div>
    
    <div class="tk-meta">
      <div class="tk-chip" data-timezone>Detecting...</div>
      <div class="tk-chip" data-location-status>Locating...</div>
      <div class="tk-chip">Server: <?php echo htmlspecialchars($serverTimezone, ENT_QUOTES, 'UTF-8'); ?></div>
    </div>

    <div class="ad-wrapper-hero">
       <?php renderA8Ad(); ?>
    </div>
  </section>

  <!-- PWA Install -->
  <div class="pwa-actions">
    <button type="button" class="install-button" data-install-button hidden>INSTALL APP</button>
    <span class="install-hint" data-install-hint></span>
  </div>

  <!-- Alarms Section -->
  <section class="tk-alarms-section">
    <h2 class="tk-section-title">Alarms</h2>
    
    <div class="alarms-grid" data-alarm-list></div>

    <template id="alarm-card-template">
      <div class="alarm-card" data-alarm-card>
        <div class="alarm-card-header">
          <h3>ALARM <span data-alarm-index>01</span></h3>
          <label class="toggle">
            <input type="checkbox" data-alarm-toggle />
            <span class="toggle-slider" aria-hidden="true"></span>
            <span class="sr-only">Enable Alarm</span>
          </label>
        </div>
        
        <div class="alarm-card-body">
          <label class="field">
            <span>Time</span>
            <input type="time" data-alarm-time required />
          </label>
          
          <label class="field">
            <span>Label</span>
            <input type="text" maxlength="60" placeholder="Task Name..." data-alarm-label />
          </label>
          
          <div class="alarm-status">
            <span class="alarm-chip" data-alarm-state>IDLE</span>
            <span class="alarm-countdown" data-alarm-countdown>--:--:--</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</main>

<div class="alarm-overlay" data-alarm-overlay hidden role="alertdialog" aria-modal="true" aria-hidden="true" tabindex="-1">
  <div class="alarm-overlay-content" role="document">
    <h2 data-alarm-message>ALARM</h2>
    <p class="alarm-overlay-time" data-alarm-overlay-time>00:00</p>
    <button type="button" class="alarm-stop-btn" data-stop-button>STOP</button>
  </div>
</div>


<script defer src="/assets/js/timekeeper.js"></script>
</body>
</html>
