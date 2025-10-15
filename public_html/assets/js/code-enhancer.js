(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function copyToClipboard(text, onSuccess, onError) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
        fallbackCopy(text, onSuccess, onError);
      });
      return;
    }
    fallbackCopy(text, onSuccess, onError);
  }

  function fallbackCopy(text, onSuccess, onError) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  function formatLanguage(codeEl) {
    var className = codeEl.className || '';
    var match = className.match(/language-([\w+-]+)/i);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    var langAttr = codeEl.getAttribute('data-lang') || codeEl.getAttribute('lang');
    if (langAttr) {
      return langAttr.toUpperCase();
    }
    return 'CODE';
  }

  function enhanceBlock(codeEl, index) {
    var preEl = codeEl.parentElement;
    if (!preEl || preEl.dataset.codeEnhanced === 'true') {
      return;
    }

    preEl.dataset.codeEnhanced = 'true';

    var wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    wrapper.dataset.codeIndex = index;

    var legacyButtons = preEl.parentElement ? preEl.parentElement.querySelectorAll('button[onclick^="copyCode"], #copyButton') : null;
    if (legacyButtons && legacyButtons.length) {
      Array.prototype.forEach.call(legacyButtons, function (btn) {
        btn.style.display = 'none';
      });
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'code-block__toolbar';

    var label = document.createElement('span');
    label.className = 'code-block__label';
    label.textContent = formatLanguage(codeEl);

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'code-block__btn code-block__btn--copy';
    copyBtn.setAttribute('aria-label', 'コードをコピー');
    copyBtn.textContent = 'コピー';

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'code-block__btn code-block__btn--toggle';
    toggleBtn.setAttribute('aria-label', 'コードを折りたたむ');
    toggleBtn.textContent = '折りたたむ';

    preEl.classList.add('code-block__pre');

    var parent = preEl.parentNode;
    parent.insertBefore(wrapper, preEl);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(preEl);

    toolbar.appendChild(label);
    toolbar.appendChild(toggleBtn);
    toolbar.appendChild(copyBtn);

    var isCollapsible = preEl.textContent.split('\n').length > 16 || preEl.scrollHeight > 360;
    if (!isCollapsible) {
      toggleBtn.style.display = 'none';
    }

    copyBtn.addEventListener('click', function () {
      copyBtn.disabled = true;
      copyToClipboard(codeEl.textContent, function () {
        copyBtn.textContent = 'コピー済み';
        setTimeout(function () {
          copyBtn.textContent = 'コピー';
          copyBtn.disabled = false;
        }, 2000);
      }, function () {
        copyBtn.textContent = '失敗';
        setTimeout(function () {
          copyBtn.textContent = 'コピー';
          copyBtn.disabled = false;
        }, 2000);
      });
    });

    toggleBtn.addEventListener('click', function () {
      var collapsed = wrapper.classList.toggle('is-collapsed');
      toggleBtn.textContent = collapsed ? '展開' : '折りたたむ';
      toggleBtn.setAttribute('aria-label', collapsed ? 'コードを展開' : 'コードを折りたたむ');
    });

  }

  function normalizePreElements() {
    var preEls = document.querySelectorAll('pre');
    preEls.forEach(function (pre) {
      if (pre.dataset.codeEnhanced === 'true') {
        return;
      }
      var firstElement = pre.firstElementChild;
      if (!firstElement || firstElement.tagName.toLowerCase() !== 'code') {
        var codeWrapper = document.createElement('code');
        while (pre.firstChild) {
          codeWrapper.appendChild(pre.firstChild);
        }
        pre.appendChild(codeWrapper);
      }
    });
  }

  function enhanceAll() {
    normalizePreElements();
    var blocks = document.querySelectorAll('pre code');
    blocks.forEach(function (codeEl, idx) {
      enhanceBlock(codeEl, idx);
    });
  }

  onReady(function () {
    enhanceAll();
    var observer = new MutationObserver(function () {
      enhanceAll();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
