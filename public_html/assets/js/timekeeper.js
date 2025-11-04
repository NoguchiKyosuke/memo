(function () {
  'use strict';

  var MAX_ALARMS = 5;
  var STORAGE_KEY = 'memo-timekeeper-alarms-v1';
  var COUNTDOWN_THRESHOLD_MS = 3600000; // 1 hour
  var TRIGGER_WINDOW_MS = 15000; // 15 seconds tolerance

  var clockEl;
  var dateEl;
  var timezoneEl;
  var locationStatusEl;
  var alarmListEl;
  var alarmTemplate;
  var overlayEl;
  var overlayMessageEl;
  var overlayTimeEl;
  var stopButtonEl;

  var alarms = [];
  var alarmCards = [];
  var activeAlarmId = null;
  var clockTimer = null;
  var soundTimer = null;
  var audioContext = null;
  var overlayDismissTimer = null;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function pad(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function formatTime(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function formatTimeShort(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function formatCountdown(ms) {
    if (ms < 0) {
      ms = 0;
    }
    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
  }

  function formatDateString(date) {
    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return (
      date.getFullYear() + '年' +
      pad(date.getMonth() + 1) + '月' +
      pad(date.getDate()) + '日 (' + weekdays[date.getDay()] + ')'
    );
  }

  function safeLocalStorage() {
    try {
      if (!window.localStorage) {
        return null;
      }
      var key = '__memo_timekeeper_test__';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return window.localStorage;
    } catch (err) {
      return null;
    }
  }

  function loadAlarms() {
    var store = safeLocalStorage();
    if (!store) {
      return [];
    }
    try {
      var raw = store.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.slice(0, MAX_ALARMS).map(function (item, idx) {
        return {
          id: typeof item.id === 'number' ? item.id : idx,
          time: typeof item.time === 'string' ? item.time : '',
          label: typeof item.label === 'string' ? item.label : '',
          enabled: Boolean(item.enabled)
        };
      });
    } catch (err) {
      return [];
    }
  }

  function saveAlarms() {
    var store = safeLocalStorage();
    if (!store) {
      return;
    }
    try {
      var payload = alarms.map(function (alarm) {
        return {
          id: alarm.id,
          time: alarm.time,
          label: alarm.label,
          enabled: alarm.enabled
        };
      });
      store.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      // noop
    }
  }

  function createDefaultAlarm(index) {
    return {
      id: index,
      time: '',
      label: '',
      enabled: false,
      target: null,
      triggered: false
    };
  }

  function ensureAlarmRuntimeFields(alarm) {
    if (!alarm) {
      return;
    }
    if (typeof alarm.target === 'undefined') {
      alarm.target = null;
    }
    if (typeof alarm.triggered === 'undefined') {
      alarm.triggered = false;
    }
  }

  function parseTimeValue(value) {
    if (typeof value !== 'string') {
      return null;
    }
    if (!/^\d{2}:\d{2}$/.test(value)) {
      return null;
    }
    var parts = value.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    if (hours > 23 || minutes > 59) {
      return null;
    }
    return {
      hours: hours,
      minutes: minutes
    };
  }

  function computeNextTarget(alarm, reference) {
    var parsed = parseTimeValue(alarm.time);
    if (!parsed) {
      return null;
    }
    var base = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), parsed.hours, parsed.minutes, 0, 0);
    if (base.getTime() - reference.getTime() <= -TRIGGER_WINDOW_MS) {
      base.setDate(base.getDate() + 1);
    }
    if (base <= reference) {
      base.setDate(base.getDate() + 1);
    }
    return base;
  }

  function updateTimezone() {
    if (!timezoneEl) {
      return;
    }
    try {
      var parts = new Intl.DateTimeFormat('ja-JP', { timeZoneName: 'longOffset' }).formatToParts(new Date());
      var namePart = null;
      for (var i = 0; i < parts.length; i += 1) {
        if (parts[i].type === 'timeZoneName') {
          namePart = parts[i].value;
          break;
        }
      }
      if (namePart) {
        timezoneEl.textContent = namePart;
      } else {
        timezoneEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'タイムゾーンが取得できません。';
      }
    } catch (err) {
      timezoneEl.textContent = 'タイムゾーンが取得できません。';
    }
  }

  function detectLocation() {
    if (!locationStatusEl) {
      return;
    }
    if (!navigator.geolocation) {
      locationStatusEl.textContent = 'ブラウザが位置情報APIに対応していません。タイムゾーンのみを利用します。';
      return;
    }
    locationStatusEl.textContent = '位置情報を取得しています...';
    navigator.geolocation.getCurrentPosition(function (position) {
      var coords = position.coords;
      var parts = [];
      if (typeof coords.latitude === 'number') {
        parts.push('緯度 ' + coords.latitude.toFixed(3));
      }
      if (typeof coords.longitude === 'number') {
        parts.push('経度 ' + coords.longitude.toFixed(3));
      }
      if (typeof coords.accuracy === 'number') {
        parts.push('精度 ±' + Math.round(coords.accuracy) + 'm');
      }
      if (parts.length === 0) {
        locationStatusEl.textContent = '現在地の取得に成功しました。';
      } else {
        locationStatusEl.textContent = '現在地の推定: ' + parts.join(' / ');
      }
    }, function (err) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          locationStatusEl.textContent = '位置情報の利用が拒否されました。ブラウザのタイムゾーンを基準に表示します。';
          break;
        case err.POSITION_UNAVAILABLE:
          locationStatusEl.textContent = '位置情報が取得できませんでした。ネットワーク状態をご確認ください。';
          break;
        case err.TIMEOUT:
          locationStatusEl.textContent = '位置情報の取得がタイムアウトしました。再度お試しください。';
          break;
        default:
          locationStatusEl.textContent = '位置情報の取得に失敗しました。';
          break;
      }
    }, {
      enableHighAccuracy: false,
      maximumAge: 600000,
      timeout: 7000
    });
  }

  function updateClock(now) {
    if (clockEl) {
      clockEl.textContent = formatTime(now);
    }
    if (dateEl) {
      dateEl.textContent = formatDateString(now);
    }
  }

  function scheduleAlarm(alarm, reference) {
    if (!alarm || !alarm.enabled || !alarm.time) {
      alarm.target = null;
      alarm.triggered = false;
      return;
    }
    var next = computeNextTarget(alarm, reference);
    alarm.target = next;
    alarm.triggered = false;
  }

  function stopAlarmSound() {
    if (soundTimer) {
      clearInterval(soundTimer);
      soundTimer = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(function () {
        // noop
      });
      audioContext = null;
    }
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  }

  function playAlarmSound() {
    stopAlarmSound();
    if (typeof window.AudioContext !== 'function' && typeof window.webkitAudioContext !== 'function') {
      if (navigator.vibrate) {
        navigator.vibrate([300, 150, 300, 150, 300]);
      }
      return;
    }
    var Ctx = window.AudioContext || window.webkitAudioContext;
    try {
      audioContext = new Ctx();
    } catch (err) {
      audioContext = null;
      if (navigator.vibrate) {
        navigator.vibrate([300, 150, 300]);
      }
      return;
    }

    function beep() {
      if (!audioContext) {
        return;
      }
      if (audioContext.state === 'suspended' && typeof audioContext.resume === 'function') {
        audioContext.resume().catch(function () {
          // noop
        });
      }
      try {
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.9);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1.0);
      } catch (err) {
        // noop
      }
    }

    beep();
    soundTimer = setInterval(beep, 1800);
    if (navigator.vibrate) {
      navigator.vibrate([400, 180, 400, 180, 400]);
    }
  }

  function showOverlay(alarm, now) {
    if (!overlayEl || !alarm) {
      return;
    }
    overlayEl.hidden = false;
    overlayEl.setAttribute('aria-hidden', 'false');
    try {
      if (typeof overlayEl.focus === 'function') {
        overlayEl.focus({ preventScroll: true });
      }
    } catch (err) {
      // noop
    }
    if (overlayMessageEl) {
      overlayMessageEl.textContent = alarm.label ? alarm.label + ' の時間です' : 'アラーム';
    }
    if (overlayTimeEl) {
      overlayTimeEl.textContent = formatTimeShort(now);
    }
    playAlarmSound();
    if (overlayDismissTimer) {
      clearTimeout(overlayDismissTimer);
      overlayDismissTimer = null;
    }
    overlayDismissTimer = setTimeout(function () {
      overlayDismissTimer = null;
    }, 60000);
  }

  function hideOverlay() {
    if (!overlayEl) {
      return;
    }
    overlayEl.hidden = true;
    overlayEl.setAttribute('aria-hidden', 'true');
    stopAlarmSound();
    activeAlarmId = null;
  }

  function applyAlarmState(alarm, card, now) {
    if (!card) {
      return;
    }
    var chipEl = card.querySelector('[data-alarm-state]');
    var countdownEl = card.querySelector('[data-alarm-countdown]');
    var toggleInput = card.querySelector('[data-alarm-toggle]');
    var timeInput = card.querySelector('[data-alarm-time]');

    card.classList.remove('is-active', 'is-countdown', 'is-triggered');

    if (!alarm.enabled || !alarm.time) {
      if (toggleInput) {
        toggleInput.checked = alarm.enabled && Boolean(alarm.time);
      }
      if (chipEl) {
        chipEl.textContent = alarm.time ? '待機中' : '未設定';
      }
      if (countdownEl) {
        countdownEl.textContent = '--:--:--';
      }
      if (timeInput) {
        timeInput.disabled = false;
      }
      return;
    }

    card.classList.add('is-active');

    if (!alarm.target) {
      scheduleAlarm(alarm, now);
    }

    var diff = alarm.target ? alarm.target.getTime() - now.getTime() : null;

    if (diff !== null && diff <= 0 && diff >= -TRIGGER_WINDOW_MS && !alarm.triggered) {
      alarm.triggered = true;
      activeAlarmId = alarm.id;
      card.classList.add('is-triggered');
      if (chipEl) {
        chipEl.textContent = '発火中';
      }
      if (countdownEl) {
        countdownEl.textContent = '00:00:00';
      }
      showOverlay(alarm, now);
      return;
    }

    if (alarm.triggered) {
      card.classList.add('is-triggered');
      if (chipEl) {
        chipEl.textContent = '発火中';
      }
      if (countdownEl) {
        countdownEl.textContent = '00:00:00';
      }
      return;
    }

    if (diff !== null && diff <= COUNTDOWN_THRESHOLD_MS) {
      card.classList.add('is-countdown');
      if (chipEl) {
        chipEl.textContent = 'カウントダウン';
      }
      if (countdownEl) {
        countdownEl.textContent = formatCountdown(diff);
      }
    } else {
      if (chipEl) {
        chipEl.textContent = '待機中';
      }
      if (countdownEl) {
        countdownEl.textContent = diff !== null ? formatCountdown(diff) : '--:--:--';
      }
    }
  }

  function handleStopButtonClick() {
    if (activeAlarmId === null) {
      hideOverlay();
      return;
    }
    var now = new Date();
    for (var i = 0; i < alarms.length; i += 1) {
      if (alarms[i].id === activeAlarmId) {
        alarms[i].triggered = false;
        scheduleAlarm(alarms[i], new Date(now.getTime() + 1000));
        applyAlarmState(alarms[i], alarmCards[i], now);
        break;
      }
    }
    saveAlarms();
    hideOverlay();
  }

  function bindAlarmEvents(alarm, card, index) {
    var toggleInput = card.querySelector('[data-alarm-toggle]');
    var timeInput = card.querySelector('[data-alarm-time]');
    var labelInput = card.querySelector('[data-alarm-label]');
    var indexLabel = card.querySelector('[data-alarm-index]');

    if (indexLabel) {
      indexLabel.textContent = index + 1;
    }

    if (timeInput) {
      timeInput.value = alarm.time;
      timeInput.addEventListener('change', function () {
        var value = timeInput.value;
        var parsed = parseTimeValue(value);
        if (!parsed && value !== '') {
          timeInput.value = '';
          alarm.time = '';
          alarm.enabled = false;
          alarm.target = null;
          alarm.triggered = false;
        } else {
          alarm.time = value;
          alarm.target = null;
          alarm.triggered = false;
          if (alarm.enabled && value) {
            scheduleAlarm(alarm, new Date());
          }
        }
        saveAlarms();
        applyAlarmState(alarm, card, new Date());
      });
    }

    if (labelInput) {
      labelInput.value = alarm.label;
      labelInput.addEventListener('input', function () {
        alarm.label = labelInput.value.substring(0, 60);
        saveAlarms();
      });
    }

    if (toggleInput) {
      toggleInput.checked = alarm.enabled && Boolean(alarm.time);
      toggleInput.addEventListener('change', function () {
        if (!alarm.time) {
          toggleInput.checked = false;
          alarm.enabled = false;
          alarm.target = null;
          alarm.triggered = false;
          if (timeInput) {
            timeInput.focus();
          }
          saveAlarms();
          applyAlarmState(alarm, card, new Date());
          return;
        }
        alarm.enabled = toggleInput.checked;
        if (alarm.enabled) {
          scheduleAlarm(alarm, new Date());
        } else {
          alarm.target = null;
          alarm.triggered = false;
        }
        saveAlarms();
        applyAlarmState(alarm, card, new Date());
      });
    }
  }

  function renderAlarms() {
    if (!alarmTemplate || !alarmListEl) {
      return;
    }
    alarmListEl.innerHTML = '';
    alarmCards = [];

    for (var i = 0; i < alarms.length; i += 1) {
      ensureAlarmRuntimeFields(alarms[i]);
      var fragment = alarmTemplate.content ? alarmTemplate.content.cloneNode(true) : null;
      var card = null;
      if (fragment) {
        card = fragment.querySelector('[data-alarm-card]');
      }
      if (!card && alarmTemplate.firstElementChild) {
        card = alarmTemplate.firstElementChild.cloneNode(true);
      }
      if (!card) {
        continue;
      }
      card.dataset.alarmId = alarms[i].id;
      bindAlarmEvents(alarms[i], card, i);
      alarmListEl.appendChild(card);
      alarmCards.push(card);
    }
  }

  function updateAlarms(now) {
    for (var i = 0; i < alarms.length; i += 1) {
      ensureAlarmRuntimeFields(alarms[i]);
      applyAlarmState(alarms[i], alarmCards[i], now);
    }
  }

  function startClockLoop() {
    function tick() {
      var now = new Date();
      updateClock(now);
      updateAlarms(now);
    }
    tick();
    clockTimer = setInterval(tick, 1000);
  }

  function initElements() {
    clockEl = document.querySelector('[data-clock]');
    dateEl = document.querySelector('[data-date]');
    timezoneEl = document.querySelector('[data-timezone]');
    locationStatusEl = document.querySelector('[data-location-status]');
    alarmListEl = document.querySelector('[data-alarm-list]');
    alarmTemplate = document.getElementById('alarm-card-template');
    overlayEl = document.querySelector('[data-alarm-overlay]');
    overlayMessageEl = overlayEl ? overlayEl.querySelector('[data-alarm-message]') : null;
    overlayTimeEl = overlayEl ? overlayEl.querySelector('[data-alarm-overlay-time]') : null;
    stopButtonEl = overlayEl ? overlayEl.querySelector('[data-stop-button]') : null;
  }

  function bindOverlay() {
    if (!overlayEl) {
      return;
    }
    overlayEl.addEventListener('click', function (event) {
      if (event.target === overlayEl) {
        handleStopButtonClick();
      }
    });
    if (stopButtonEl) {
      stopButtonEl.addEventListener('click', handleStopButtonClick);
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        handleStopButtonClick();
      }
    });
  }

  function initialize() {
    initElements();
    if (!clockEl || !alarmListEl || !alarmTemplate) {
      return;
    }

    var stored = loadAlarms();
    alarms = [];
    for (var i = 0; i < MAX_ALARMS; i += 1) {
      if (stored[i]) {
        var alarm = stored[i];
        alarms.push({
          id: typeof alarm.id === 'number' ? alarm.id : i,
          time: typeof alarm.time === 'string' ? alarm.time : '',
          label: typeof alarm.label === 'string' ? alarm.label : '',
          enabled: Boolean(alarm.enabled),
          target: null,
          triggered: false
        });
      } else {
        alarms.push(createDefaultAlarm(i));
      }
    }

    renderAlarms();
    updateTimezone();
    detectLocation();
    bindOverlay();
    startClockLoop();
  }

  onReady(initialize);
})();
