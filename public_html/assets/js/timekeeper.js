(function () {
  'use strict';

  var MAX_ALARMS = 5;
  var STORAGE_KEY = 'memo-timekeeper-alarms-v1';
  var COUNTDOWN_THRESHOLD_MS = 3600000;
  var TRIGGER_WINDOW_MS = 15000;
  var RESYNC_INTERVAL_MS = 5 * 60 * 1000;
  var TIME_API_ENDPOINTS = ['https://worldtimeapi.org/api/ip'];

  var dom = {
    clock: null,
    date: null,
    timezone: null,
    locationStatus: null,
    alarmList: null,
    alarmTemplate: null,
    overlay: null,
    overlayMessage: null,
    overlayTime: null,
    stopButton: null
  };

  var statusMessages = { location: '', time: '' };
  var alarms = [];
  var alarmCards = [];
  var activeAlarmId = null;
  var clockTimer = null;
  var soundTimer = null;
  var overlayTimer = null;
  var audioContext = null;
  var syncTimer = null;

  var timeState = {
    baseUtcMs: null,
    baseOffsetMs: 0,
    timezone: '',
    source: '',
    lastSyncLocalMs: null,
    apiUrl: '',
    failureCount: 0
  };

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

  function formatDisplayTime(localDate, includeSeconds) {
    var hours = pad(localDate.getUTCHours());
    var minutes = pad(localDate.getUTCMinutes());
    if (!includeSeconds) {
      return hours + ':' + minutes;
    }
    var seconds = pad(localDate.getUTCSeconds());
    return hours + ':' + minutes + ':' + seconds;
  }

  function formatDisplayDate(localDate) {
    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    var year = localDate.getUTCFullYear();
    var month = pad(localDate.getUTCMonth() + 1);
    var day = pad(localDate.getUTCDate());
    var weekday = weekdays[localDate.getUTCDay()] || '';
    return year + '年' + month + '月' + day + '日 (' + weekday + ')';
  }

  function formatOffset(offsetSeconds) {
    if (!Number.isFinite(offsetSeconds)) {
      offsetSeconds = 0;
    }
    var sign = offsetSeconds >= 0 ? '+' : '-';
    var abs = Math.abs(offsetSeconds);
    var hours = Math.floor(abs / 3600);
    var minutes = Math.floor((abs % 3600) / 60);
    return 'UTC' + sign + pad(hours) + ':' + pad(minutes);
  }

  function parseOffsetString(offsetStr) {
    if (typeof offsetStr !== 'string') {
      return null;
    }
    var match = offsetStr.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!match) {
      return null;
    }
    var sign = match[1] === '-' ? -1 : 1;
    var hours = parseInt(match[2], 10);
    var minutes = parseInt(match[3], 10);
    return sign * (hours * 3600 + minutes * 60);
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
      targetUtc: null,
      triggered: false
    };
  }

  function ensureAlarmRuntimeFields(alarm) {
    if (!alarm) {
      return;
    }
    if (typeof alarm.targetUtc === 'undefined') {
      alarm.targetUtc = null;
    }
    if (typeof alarm.triggered === 'undefined') {
      alarm.triggered = false;
    }
  }

  function parseTimeValue(value) {
    if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
      return null;
    }
    var parts = value.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) {
      return null;
    }
    return { hours: hours, minutes: minutes };
  }

  function refreshStatus() {
    if (!dom.locationStatus) {
      return;
    }
    var parts = [];
    if (statusMessages.location) {
      parts.push(statusMessages.location);
    }
    if (statusMessages.time) {
      parts.push(statusMessages.time);
    }
    dom.locationStatus.textContent = parts.join(' / ');
  }

  function setLocationStatus(message) {
    statusMessages.location = message || '';
    refreshStatus();
  }

  function setTimeStatus(message) {
    statusMessages.time = message || '';
    refreshStatus();
  }

  function updateTimezoneChip() {
    if (!dom.timezone) {
      return;
    }
    var offsetSeconds = Math.round(getOffsetMs() / 1000);
    if (timeState.timezone) {
      dom.timezone.textContent = timeState.timezone + ' (' + formatOffset(offsetSeconds) + ')';
    } else {
      dom.timezone.textContent = 'タイムゾーンを検出しています...';
    }
  }

  function getOffsetMs() {
    if (typeof timeState.baseOffsetMs === 'number') {
      return timeState.baseOffsetMs;
    }
    return -new Date().getTimezoneOffset() * 60000;
  }

  function setTimeSource(utcMs, offsetSeconds, timezone, sourceLabel) {
    if (!Number.isFinite(utcMs)) {
      return;
    }
    var offsetSecs = Number.isFinite(offsetSeconds) ? offsetSeconds : 0;
    timeState.baseUtcMs = Math.round(utcMs);
    timeState.baseOffsetMs = offsetSecs * 1000;
    timeState.timezone = typeof timezone === 'string' ? timezone : '';
    timeState.source = sourceLabel || '';
    timeState.lastSyncLocalMs = Date.now();
    timeState.failureCount = 0;

    updateTimezoneChip();

    var descriptor = timeState.timezone ? timeState.timezone + ' / ' + formatOffset(offsetSecs) : formatOffset(offsetSecs);
    var label = sourceLabel || 'サーバー';
    setTimeStatus('時間ソース: ' + label + ' (' + descriptor + ')');

    recalculateAlarms(getCurrentUtcMs());
    updateAlarms(getCurrentUtcMs());
  }

  function scheduleResync() {
    if (syncTimer) {
      clearTimeout(syncTimer);
    }
    syncTimer = setTimeout(fetchRemoteTime, RESYNC_INTERVAL_MS);
  }

  function getCurrentUtcMs() {
    if (timeState.baseUtcMs === null || timeState.lastSyncLocalMs === null) {
      return Date.now();
    }
    return timeState.baseUtcMs + (Date.now() - timeState.lastSyncLocalMs);
  }

  function getLocalDateFromUtc(utcMs) {
    return new Date(utcMs + getOffsetMs());
  }

  function updateClock() {
    var nowUtc = getCurrentUtcMs();
    var localDate = getLocalDateFromUtc(nowUtc);
    if (dom.clock) {
      dom.clock.textContent = formatDisplayTime(localDate, true);
    }
    if (dom.date) {
      dom.date.textContent = formatDisplayDate(localDate);
    }
    updateAlarms(nowUtc);
  }

  function scheduleAlarm(alarm, referenceUtcMs) {
    if (!alarm || !alarm.enabled || !alarm.time) {
      alarm.targetUtc = null;
      alarm.triggered = false;
      return;
    }
    var parsed = parseTimeValue(alarm.time);
    if (!parsed) {
      alarm.targetUtc = null;
      alarm.triggered = false;
      return;
    }

    var offsetMs = getOffsetMs();
    var localReference = new Date(referenceUtcMs + offsetMs);
    var year = localReference.getUTCFullYear();
    var month = localReference.getUTCMonth();
    var day = localReference.getUTCDate();

    var targetUtc = Date.UTC(year, month, day, parsed.hours, parsed.minutes, 0, 0) - offsetMs;
    var diff = targetUtc - referenceUtcMs;

    if (diff <= -TRIGGER_WINDOW_MS) {
      var nextDayUtc = Date.UTC(year, month, day + 1, parsed.hours, parsed.minutes, 0, 0) - offsetMs;
      targetUtc = nextDayUtc;
    }
    if (targetUtc <= referenceUtcMs) {
      targetUtc += 86400000;
    }

    alarm.targetUtc = targetUtc;
    alarm.triggered = false;
  }

  function recalculateAlarms(referenceUtcMs) {
    for (var i = 0; i < alarms.length; i += 1) {
      var alarm = alarms[i];
      ensureAlarmRuntimeFields(alarm);
      if (alarm.enabled && alarm.time) {
        scheduleAlarm(alarm, referenceUtcMs);
      } else {
        alarm.targetUtc = null;
      }
    }
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

  function showOverlay(alarm, nowUtcMs) {
    if (!dom.overlay || !alarm) {
      return;
    }
    dom.overlay.hidden = false;
    dom.overlay.setAttribute('aria-hidden', 'false');
    try {
      if (typeof dom.overlay.focus === 'function') {
        dom.overlay.focus({ preventScroll: true });
      }
    } catch (err) {
      // noop
    }
    if (dom.overlayMessage) {
      dom.overlayMessage.textContent = alarm.label ? alarm.label + ' の時間です' : 'アラーム';
    }
    if (dom.overlayTime) {
      var localDate = getLocalDateFromUtc(nowUtcMs);
      dom.overlayTime.textContent = formatDisplayTime(localDate, false);
    }
    playAlarmSound();
    if (overlayTimer) {
      clearTimeout(overlayTimer);
    }
    overlayTimer = setTimeout(function () {
      overlayTimer = null;
    }, 60000);
  }

  function hideOverlay() {
    if (!dom.overlay) {
      return;
    }
    dom.overlay.hidden = true;
    dom.overlay.setAttribute('aria-hidden', 'true');
    stopAlarmSound();
    activeAlarmId = null;
  }

  function applyAlarmState(alarm, card, nowUtcMs) {
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
        toggleInput.checked = false;
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
      alarm.targetUtc = null;
      alarm.triggered = false;
      return;
    }

    if (toggleInput) {
      toggleInput.checked = true;
    }
    card.classList.add('is-active');

    if (typeof alarm.targetUtc !== 'number') {
      scheduleAlarm(alarm, nowUtcMs);
    }

    var diff = typeof alarm.targetUtc === 'number' ? alarm.targetUtc - nowUtcMs : null;

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
      showOverlay(alarm, nowUtcMs);
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
    var nowUtc = getCurrentUtcMs();
    for (var i = 0; i < alarms.length; i += 1) {
      if (alarms[i].id === activeAlarmId) {
        alarms[i].triggered = false;
        scheduleAlarm(alarms[i], nowUtc + 1000);
        applyAlarmState(alarms[i], alarmCards[i], nowUtc);
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
          alarm.targetUtc = null;
          alarm.triggered = false;
        } else {
          alarm.time = value;
          alarm.targetUtc = null;
          alarm.triggered = false;
          if (alarm.enabled && value) {
            scheduleAlarm(alarm, getCurrentUtcMs());
          }
        }
        saveAlarms();
        applyAlarmState(alarm, card, getCurrentUtcMs());
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
          alarm.targetUtc = null;
          alarm.triggered = false;
          if (timeInput) {
            timeInput.focus();
          }
          saveAlarms();
          applyAlarmState(alarm, card, getCurrentUtcMs());
          return;
        }
        alarm.enabled = toggleInput.checked;
        if (alarm.enabled) {
          scheduleAlarm(alarm, getCurrentUtcMs());
        } else {
          alarm.targetUtc = null;
          alarm.triggered = false;
        }
        saveAlarms();
        applyAlarmState(alarm, card, getCurrentUtcMs());
      });
    }
  }

  function renderAlarms() {
    if (!dom.alarmTemplate || !dom.alarmList) {
      return;
    }
    dom.alarmList.innerHTML = '';
    alarmCards = [];

    for (var i = 0; i < alarms.length; i += 1) {
      ensureAlarmRuntimeFields(alarms[i]);
      var fragment = dom.alarmTemplate.content ? dom.alarmTemplate.content.cloneNode(true) : null;
      var card = fragment ? fragment.querySelector('[data-alarm-card]') : null;
      if (!card && dom.alarmTemplate.firstElementChild) {
        card = dom.alarmTemplate.firstElementChild.cloneNode(true);
      }
      if (!card) {
        continue;
      }
      card.dataset.alarmId = alarms[i].id;
      bindAlarmEvents(alarms[i], card, i);
      dom.alarmList.appendChild(card);
      alarmCards.push(card);
    }
  }

  function updateAlarms(nowUtcMs) {
    for (var i = 0; i < alarms.length; i += 1) {
      ensureAlarmRuntimeFields(alarms[i]);
      applyAlarmState(alarms[i], alarmCards[i], nowUtcMs);
    }
  }

  function startClockLoop() {
    if (clockTimer) {
      clearInterval(clockTimer);
    }
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  function initElements() {
    dom.clock = document.querySelector('[data-clock]');
    dom.date = document.querySelector('[data-date]');
    dom.timezone = document.querySelector('[data-timezone]');
    dom.locationStatus = document.querySelector('[data-location-status]');
    dom.alarmList = document.querySelector('[data-alarm-list]');
    dom.alarmTemplate = document.getElementById('alarm-card-template');
    dom.overlay = document.querySelector('[data-alarm-overlay]');
    dom.overlayMessage = dom.overlay ? dom.overlay.querySelector('[data-alarm-message]') : null;
    dom.overlayTime = dom.overlay ? dom.overlay.querySelector('[data-alarm-overlay-time]') : null;
    dom.stopButton = dom.overlay ? dom.overlay.querySelector('[data-stop-button]') : null;
  }

  function bindOverlay() {
    if (!dom.overlay) {
      return;
    }
    dom.overlay.addEventListener('click', function (event) {
      if (event.target === dom.overlay) {
        handleStopButtonClick();
      }
    });
    if (dom.stopButton) {
      dom.stopButton.addEventListener('click', handleStopButtonClick);
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        handleStopButtonClick();
      }
    });
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('ブラウザが位置情報APIに対応していません。タイムゾーンのみを利用します。');
      return;
    }
    setLocationStatus('現在地の解析中です。');
    navigator.geolocation.getCurrentPosition(function (position) {
      var coords = position.coords || {};
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
        setLocationStatus('現在地の取得に成功しました。');
      } else {
        setLocationStatus('現在地の推定: ' + parts.join(' / '));
      }
    }, function (err) {
      if (!err) {
        setLocationStatus('位置情報の取得に失敗しました。');
        return;
      }
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setLocationStatus('位置情報の利用が拒否されました。ブラウザの許可設定をご確認ください。');
          break;
        case err.POSITION_UNAVAILABLE:
          setLocationStatus('位置情報が取得できませんでした。ネットワーク状態をご確認ください。');
          break;
        case err.TIMEOUT:
          setLocationStatus('位置情報の取得がタイムアウトしました。再度お試しください。');
          break;
        default:
          setLocationStatus('位置情報の取得に失敗しました。');
          break;
      }
    }, {
      enableHighAccuracy: false,
      maximumAge: 600000,
      timeout: 7000
    });
  }

  function handleWorldTimeApi(data, url) {
    if (!data || typeof data.utc_datetime !== 'string') {
      throw new Error('Invalid response');
    }
    var utcMs = Date.parse(data.utc_datetime);
    if (!Number.isFinite(utcMs)) {
      throw new Error('Invalid UTC datetime');
    }

    var offsetSeconds = 0;
    if (typeof data.raw_offset === 'number') {
      offsetSeconds += data.raw_offset;
    }
    if (typeof data.dst_offset === 'number') {
      offsetSeconds += data.dst_offset;
    } else if (typeof data.utc_offset === 'string') {
      var parsedOffset = parseOffsetString(data.utc_offset);
      if (parsedOffset !== null) {
        offsetSeconds = parsedOffset;
      }
    }

    var timezone = typeof data.timezone === 'string' ? data.timezone : '';
    timeState.apiUrl = url;
    setTimeSource(utcMs, offsetSeconds, timezone, 'worldtimeapi.org');
    scheduleResync();
  }

  function fetchRemoteTime() {
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }

    var index = 0;
    setTimeStatus('時刻情報をAPIから取得しています...');

    function attempt() {
      if (index >= TIME_API_ENDPOINTS.length) {
        timeState.failureCount += 1;
        if (timeState.failureCount > 3) {
          setTimeStatus('時間ソース: サーバー (' + formatOffset(Math.round(getOffsetMs() / 1000)) + ')');
        } else {
          setTimeStatus('時刻APIの取得に失敗しました。サーバー時刻で継続します。');
        }
        scheduleResync();
        return;
      }

      var url = TIME_API_ENDPOINTS[index];
      index += 1;

      fetch(url, { cache: 'no-store', credentials: 'omit' })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          if (url.indexOf('worldtimeapi') !== -1) {
            handleWorldTimeApi(data, url);
          }
        })
        .catch(function () {
          attempt();
        });
    }

    attempt();
  }

  function initializeTimeFromServer() {
    var dataset = document.body ? document.body.dataset : null;
    var serverUtc = dataset && dataset.serverUtc ? parseInt(dataset.serverUtc, 10) : NaN;
    var serverOffset = dataset && dataset.serverOffset ? parseInt(dataset.serverOffset, 10) : NaN;
    var serverTz = dataset && dataset.serverTz ? dataset.serverTz : '';

    if (Number.isFinite(serverUtc)) {
      setTimeSource(serverUtc, Number.isFinite(serverOffset) ? serverOffset : 0, serverTz, 'サーバー');
    } else {
      var localUtc = Date.now();
      var localOffsetSeconds = -new Date().getTimezoneOffset() * 60;
      var fallbackTz = '';
      try {
        fallbackTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      } catch (err) {
        fallbackTz = '';
      }
      setTimeSource(localUtc, localOffsetSeconds, fallbackTz, 'ローカル');
    }
  }

  function initialize() {
    initElements();
    if (!dom.clock || !dom.alarmList || !dom.alarmTemplate) {
      return;
    }

    statusMessages.location = '現在地の解析中です。';
    statusMessages.time = '時刻情報を取得しています...';
    refreshStatus();

    var stored = loadAlarms();
    alarms = [];
    for (var i = 0; i < MAX_ALARMS; i += 1) {
      if (stored[i]) {
        alarms.push({
          id: typeof stored[i].id === 'number' ? stored[i].id : i,
          time: typeof stored[i].time === 'string' ? stored[i].time : '',
          label: typeof stored[i].label === 'string' ? stored[i].label : '',
          enabled: Boolean(stored[i].enabled),
          targetUtc: null,
          triggered: false
        });
      } else {
        alarms.push(createDefaultAlarm(i));
      }
    }

    renderAlarms();
    initializeTimeFromServer();
    updateClock();
    detectLocation();
    bindOverlay();
    startClockLoop();
    fetchRemoteTime();

    window.addEventListener('focus', function () {
      if (!timeState.lastSyncLocalMs || Date.now() - timeState.lastSyncLocalMs > RESYNC_INTERVAL_MS) {
        fetchRemoteTime();
      }
    });
  }

  onReady(initialize);
})();
