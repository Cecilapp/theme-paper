/*! Paper theme for Cecil | https://github.com/Cecilapp/theme-paper */
(function () {
  'use strict';

  var labels = document.documentElement.dataset;

  /* Mobile menu */
  function toggleNav() {
    var menuBtn = document.getElementById('menu-btn');
    var menuItems = document.getElementById('menu-items');
    var menuIcon = document.getElementById('menu-icon');
    var closeIcon = document.getElementById('close-icon');
    if (!menuBtn || !menuItems || !menuIcon || !closeIcon) return;

    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
      menuBtn.setAttribute('aria-label', open ? menuBtn.dataset.labelOpen : menuBtn.dataset.labelClose);
      menuItems.classList.toggle('hidden');
      menuItems.classList.toggle('grid');
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });
  }

  /* Skip to content */
  function handleSkipToContent() {
    var skipLink = document.getElementById('skip-to-content');
    if (!skipLink) return;
    skipLink.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var target = document.getElementById('main-content');
      if (!target) return;
      e.preventDefault();
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', function () {
        target.removeAttribute('tabindex');
      }, { once: true });
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* "Go back" button: back to the last visited list */
  function backUrl() {
    var main = document.getElementById('main-content');
    try {
      if (main && main.dataset.backUrl) {
        sessionStorage.setItem('backUrl', main.dataset.backUrl);
      }
      var backButton = document.getElementById('back-button');
      var url = sessionStorage.getItem('backUrl');
      if (backButton && url) {
        backButton.href = url;
      }
    } catch (e) {
      // storage unavailable
    }
  }

  /* Reading progress bar (posts) */
  function progressBar() {
    if (!document.getElementById('article')) return;
    var container = document.createElement('div');
    container.className = 'progress-container fixed top-0 z-10 h-1 w-full bg-background';
    var bar = document.createElement('div');
    bar.className = 'progress-bar h-1 w-0 bg-accent';
    container.appendChild(bar);
    document.body.appendChild(container);
    document.addEventListener('scroll', function () {
      var root = document.documentElement;
      var height = root.scrollHeight - root.clientHeight;
      bar.style.width = (height > 0 ? (root.scrollTop / height) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* Back to top button (posts) */
  function backToTop() {
    var root = document.documentElement;
    var container = document.getElementById('btt-btn-container');
    var button = document.querySelector('[data-button="back-to-top"]');
    var indicator = document.getElementById('progress-indicator');
    if (!container || !button || !indicator) return;

    button.addEventListener('click', function () {
      document.body.scrollTop = 0;
      root.scrollTop = 0;
    });

    var lastVisible = null;
    function handleScroll() {
      var total = root.scrollHeight - root.clientHeight;
      var percent = total > 0 ? Math.floor((root.scrollTop / total) * 100) : 0;
      indicator.style.setProperty('background-image', 'conic-gradient(var(--accent), var(--accent) ' + percent + '%, transparent ' + percent + '%)');
      var visible = total > 0 && root.scrollTop / total > 0.3;
      if (visible !== lastVisible) {
        container.classList.toggle('opacity-100', visible);
        container.classList.toggle('translate-y-0', visible);
        container.classList.toggle('opacity-0', !visible);
        container.classList.toggle('translate-y-14', !visible);
        lastVisible = visible;
      }
    }

    var ticking = false;
    document.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* Collapsible table of contents (`[toc]`) */
  function collapseToc() {
    var toc = document.querySelector('#article #toc');
    if (!toc) return;
    var details = document.createElement('details');
    details.className = 'paper-toc';
    var summary = document.createElement('summary');
    summary.textContent = labels.paperToc || 'Table of contents';
    toc.parentNode.insertBefore(details, toc);
    details.append(summary, toc);
  }

  /* Copy buttons of code blocks */
  function copyButtons() {
    var article = document.getElementById('article');
    if (!article || !navigator.clipboard) return;
    var copyLabel = labels.paperCopy || 'Copy';
    var copiedLabel = labels.paperCopied || 'Copied';
    article.querySelectorAll('pre').forEach(function (block) {
      var wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code absolute end-3 -top-3 rounded bg-muted border border-muted px-2 py-1 text-xs leading-4 text-foreground font-medium';
      button.textContent = copyLabel;
      block.setAttribute('tabindex', '0');
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);
      wrapper.appendChild(button);
      button.addEventListener('click', function () {
        var code = block.querySelector('code');
        navigator.clipboard.writeText((code || block).innerText).then(function () {
          button.textContent = copiedLabel;
          setTimeout(function () {
            button.textContent = copyLabel;
          }, 700);
        });
      });
    });
  }

  /* Accessible lightbox for article images */
  function lightbox() {
    var article = document.getElementById('article');
    if (!article) return;
    var overlay = null;
    var lastFocused = null;
    var zoomLabel = labels.paperZoom || 'Zoom image';
    var closeLabel = labels.paperClose || 'Close image preview';

    requestAnimationFrame(function () {
      article.querySelectorAll('img').forEach(function (image) {
        if (image.closest('a')) return;
        image.setAttribute('role', 'button');
        image.setAttribute('tabindex', '0');
        image.setAttribute('aria-haspopup', 'dialog');
        image.setAttribute('aria-label', image.alt ? zoomLabel + ': ' + image.alt : zoomLabel);
      });
    });

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'Tab') {
        e.preventDefault(); // the close button is the only focusable element
      }
    }

    function open(image) {
      if (overlay) return;
      lastFocused = image;
      overlay = document.createElement('div');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', image.alt || zoomLabel);
      overlay.className = 'fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-200 motion-reduce:transition-none';
      var closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.setAttribute('aria-label', closeLabel);
      closeButton.className = 'absolute end-4 top-4 rounded p-2 text-3xl leading-none text-white';
      closeButton.innerHTML = '&#10005;';
      closeButton.addEventListener('click', close);
      var preview = document.createElement('img');
      preview.src = image.currentSrc || image.src;
      preview.alt = '';
      preview.className = 'max-h-[90dvh] max-w-[90dvw] cursor-default object-contain';
      overlay.append(closeButton, preview);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyDown);
      requestAnimationFrame(function () {
        if (overlay) overlay.classList.add('opacity-100');
      });
      closeButton.focus();
    }

    function close() {
      if (!overlay) return;
      var el = overlay;
      overlay = null;
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
      lastFocused = null;
      var remove = function () {
        el.remove();
      };
      el.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 250);
      el.classList.remove('opacity-100');
    }

    function trigger(e) {
      var image = e.target.closest && e.target.closest('img');
      return image && article.contains(image) && !image.closest('a') ? image : null;
    }

    article.addEventListener('click', function (e) {
      var image = trigger(e);
      if (!image) return;
      e.preventDefault();
      open(image);
    });
    article.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var image = trigger(e);
      if (!image) return;
      e.preventDefault();
      open(image);
    });
  }

  function init() {
    toggleNav();
    handleSkipToContent();
    backUrl();
    progressBar();
    backToTop();
    collapseToc();
    copyButtons();
    lightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
