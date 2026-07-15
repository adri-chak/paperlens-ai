/* ==========================================================================
   PaperLens AI — script.js
   Vanilla JavaScript controller for theming, upload, chat, sources,
   toasts, keyboard shortcuts, mobile sidebar, and scroll reveal.

   Backend contract (already implemented server-side):
     POST /upload  (multipart/form-data, field "file")
       -> { status, filename, pages, chunks_created, stored_vectors,
            embedding_dimension, preview }
     POST /chat    (application/json, { question })
       -> { question, answer, sources: [{ text, page, source }] }
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Config                                                              */
  /* ------------------------------------------------------------------ */

  // If your backend is hosted elsewhere (e.g. a separate FastAPI server),
  // set this to that origin, e.g. "https://your-backend.example.com".
  // Leave empty to call /upload and /chat on the same origin as this page.
  const API_BASE_URL = '';

  const ENDPOINTS = {
    upload: API_BASE_URL + '/upload',
    chat: API_BASE_URL + '/chat',
  };

  const THEME_STORAGE_KEY = 'paperlens-theme';

  /* ------------------------------------------------------------------ */
  /* DOM references                                                     */
  /* ------------------------------------------------------------------ */

  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  const siteHeader = document.getElementById('site-header');

  const mobileSidebarBtn = document.getElementById('mobile-sidebar-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const docSidebar = document.getElementById('doc-sidebar');

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const uploadAnotherBtn = document.getElementById('upload-another-btn');

  const dzIdle = document.getElementById('dropzone-idle');
  const dzUploading = document.getElementById('dropzone-uploading');
  const dzSuccess = document.getElementById('dropzone-success');

  const uploadingFilenameEl = document.getElementById('uploading-filename');
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const successFilenameEl = document.getElementById('success-filename');

  const statsGrid = document.getElementById('stats-grid');

  const sidebarDocCard = document.getElementById('sidebar-doc-card');
  const sidebarDocName = document.getElementById('sidebar-doc-name');
  const sidebarPages = document.getElementById('sidebar-pages');
  const sidebarChunks = document.getElementById('sidebar-chunks');

  const chatContextLabel = document.getElementById('chat-context-label');
  const chatMessages = document.getElementById('chat-messages');
  const chatEmptyState = document.getElementById('chat-empty-state');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  const toastContainer = document.getElementById('toast-container');
  const footerYear = document.getElementById('footer-year');

  /* ------------------------------------------------------------------ */
  /* State                                                                */
  /* ------------------------------------------------------------------ */

  const state = {
    document: null, // { filename, pages, chunks, embeddingDim, vectors }
    isChatting: false,
  };

  /* ------------------------------------------------------------------ */
  /* Utilities                                                           */
  /* ------------------------------------------------------------------ */

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
      val /= 1024;
      i += 1;
    }
    return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function animateCount(el, target, opts) {
    const options = opts || {};
    const duration = options.duration || 900;
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(start + (target - start) * eased);
      el.textContent = String(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  /* Toast notifications                                                 */
  /* ------------------------------------------------------------------ */

  const TOAST_ICONS = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
  };

  const TOAST_TITLES = {
    success: 'Success',
    error: 'Something went wrong',
    info: 'Heads up',
  };

  function showToast(type, message, opts) {
    const options = opts || {};
    const toastType = TOAST_ICONS[type] ? type : 'info';

    const toast = document.createElement('div');
    toast.className = `toast toast-${toastType}`;
    toast.setAttribute('role', 'status');

    toast.innerHTML = `
      <i class="toast-icon ${TOAST_ICONS[toastType]}" aria-hidden="true"></i>
      <div class="toast-content">
        <p class="toast-title">${escapeHtml(options.title || TOAST_TITLES[toastType])}</p>
        <p class="toast-message">${escapeHtml(message)}</p>
      </div>
      <button class="toast-close" type="button" aria-label="Dismiss notification">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    `;

    toastContainer.appendChild(toast);

    function remove() {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 260);
    }

    toast.querySelector('.toast-close').addEventListener('click', remove);
    const timeout = options.duration || 4200;
    const timer = setTimeout(remove, timeout);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
  }

  /* ------------------------------------------------------------------ */
  /* Theme                                                                */
  /* ------------------------------------------------------------------ */

  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (err) {
      /* localStorage unavailable — fall back below */
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function applyTheme(theme, opts) {
    const persist = !opts || opts.persist !== false;
    body.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (err) {
        /* ignore persistence errors (private browsing, etc.) */
      }
    }
  }

  function initTheme() {
    applyTheme(getPreferredTheme(), { persist: false });
  }

  themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast('info', `${next === 'dark' ? 'Dark' : 'Light'} theme enabled`, { duration: 1800 });
  });

  /* ------------------------------------------------------------------ */
  /* Mobile sidebar                                                       */
  /* ------------------------------------------------------------------ */

  function openSidebar() {
    docSidebar.classList.add('is-open');
    sidebarOverlay.classList.add('is-active');
    mobileSidebarBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    docSidebar.classList.remove('is-open');
    sidebarOverlay.classList.remove('is-active');
    mobileSidebarBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  mobileSidebarBtn.addEventListener('click', openSidebar);
  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && docSidebar.classList.contains('is-open')) closeSidebar();
  });

  /* ------------------------------------------------------------------ */
  /* Button ripple micro-interaction                                     */
  /* ------------------------------------------------------------------ */

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .chat-send-btn, .icon-btn');
    if (!btn || btn.disabled) return;

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    const prevPosition = getComputedStyle(btn).position;
    if (prevPosition === 'static') btn.style.position = 'relative';

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 640);
  });

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                       */
  /* ------------------------------------------------------------------ */

  function initScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Header shrink-on-scroll                                              */
  /* ------------------------------------------------------------------ */

  function initHeaderScroll() {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      siteHeader.style.boxShadow = y > 8 ? 'var(--shadow-sm)' : 'none';
      lastY = y;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero stat counter                                                   */
  /* ------------------------------------------------------------------ */

  function initHeroCounter() {
    const el = document.querySelector('.hero-stat-value[data-count]');
    if (!el) return;
    const target = Number(el.getAttribute('data-count')) || 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(el, target, { duration: 1200 });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
  }

  /* ------------------------------------------------------------------ */
  /* Upload flow                                                         */
  /* ------------------------------------------------------------------ */

  function showDropzoneState(stateName) {
    [dzIdle, dzUploading, dzSuccess].forEach((el) => el.classList.add('is-hidden'));
    if (stateName === 'idle') dzIdle.classList.remove('is-hidden');
    if (stateName === 'uploading') dzUploading.classList.remove('is-hidden');
    if (stateName === 'success') dzSuccess.classList.remove('is-hidden');
  }

  function resetUploadUI() {
    showDropzoneState('idle');
    statsGrid.classList.add('is-hidden');
    fileInput.value = '';
    progressBar.style.width = '0%';
  }

  function validatePdf(file) {
    if (!file) return 'No file was selected.';
    const isPdfType = file.type === 'application/pdf';
    const isPdfExt = /\.pdf$/i.test(file.name);
    if (!isPdfType && !isPdfExt) return 'Only PDF files are supported.';
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) return 'File is too large. The limit is 25MB.';
    return null;
  }

  function setUploadingProgress(percent, label) {
    progressBar.style.width = `${Math.min(percent, 100)}%`;
    if (label) progressLabel.textContent = label;
  }

  async function uploadFile(file) {
    const validationError = validatePdf(file);
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    showDropzoneState('uploading');
    uploadingFilenameEl.textContent = `Processing ${file.name}…`;
    setUploadingProgress(6, 'Uploading…');
    browseBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await xhrUpload(ENDPOINTS.upload, formData, (percent) => {
        setUploadingProgress(percent * 0.7, 'Uploading…');
      });

      setUploadingProgress(85, 'Embedding & indexing…');
      await wait(350);
      setUploadingProgress(100, 'Finalizing…');
      await wait(250);

      if (!data || data.status !== 'success') {
        throw new Error((data && data.status) || 'Upload failed');
      }

      handleUploadSuccess(data, file);
    } catch (err) {
      console.error('Upload failed:', err);
      showDropzoneState('idle');
      showToast(
        'error',
        err && err.message
          ? `Upload failed: ${err.message}`
          : 'Could not reach the server. Please try again.',
      );
    } finally {
      browseBtn.disabled = false;
    }
  }

  function xhrUpload(url, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(new Error('Received an invalid response from the server.'));
          }
        } else {
          let message = `Server responded with status ${xhr.status}`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed && parsed.detail) message = parsed.detail;
            else if (parsed && parsed.error) message = parsed.error;
          } catch (err) {
            /* response wasn't JSON — keep default message */
          }
          reject(new Error(message));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error while uploading. Is the backend running?'));
      });

      xhr.send(formData);
    });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handleUploadSuccess(data, file) {
    showDropzoneState('success');
    successFilenameEl.textContent = data.filename || file.name;

    state.document = {
      filename: data.filename || file.name,
      pages: data.pages,
      chunks: data.chunks_created,
      embeddingDim: data.embedding_dimension,
      vectors: data.stored_vectors,
    };

    populateStats(state.document);
    populateSidebarDoc(state.document, file);
    enableChat(state.document);

    showToast('success', `${state.document.filename} indexed and ready to query.`, {
      title: 'Document ready',
    });
  }

  function populateStats(doc) {
    statsGrid.classList.remove('is-hidden');

    const map = {
      pages: doc.pages,
      chunks: doc.chunks,
      embeddings: doc.embeddingDim,
      vectors: doc.vectors,
    };

    Object.keys(map).forEach((key) => {
      const card = statsGrid.querySelector(`[data-stat="${key}"]`);
      if (!card) return;
      const valueEl = card.querySelector('.stat-value');
      const target = Number(map[key]) || 0;
      valueEl.textContent = '0';
      // Restart the entrance animation each time a new document is uploaded.
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        card.style.animation = '';
        animateCount(valueEl, target, { duration: 800 });
      });
    });
  }

  function populateSidebarDoc(doc, file) {
    sidebarDocCard.classList.add('has-doc');
    sidebarDocName.textContent = doc.filename;
    sidebarDocCard.querySelector('.sidebar-doc-sub').textContent = file
      ? formatBytes(file.size)
      : 'Indexed';
    sidebarPages.textContent = doc.pages ?? '—';
    sidebarChunks.textContent = doc.chunks ?? '—';
  }

  function enableChat(doc) {
    chatInput.disabled = false;
    chatSendBtn.disabled = false;
    chatContextLabel.textContent = `Chatting about “${doc.filename}”`;
    chatInput.focus();
  }

  /* Dropzone interactions */
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#browse-btn') || e.target.closest('#upload-another-btn')) return;
    if (!dzIdle.classList.contains('is-hidden')) fileInput.click();
  });

  dropzone.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !dzIdle.classList.contains('is-hidden')) {
      e.preventDefault();
      fileInput.click();
    }
  });

  browseBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) uploadFile(file);
  });

  uploadAnotherBtn.addEventListener('click', resetUploadUI);

  ['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      if (!dzIdle.classList.contains('is-hidden')) {
        dropzone.classList.add('is-dragover');
      }
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (!dzIdle.classList.contains('is-hidden')) {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) uploadFile(file);
    }
  });

  // Prevent the browser from navigating to a dropped file anywhere on the page.
  ['dragover', 'drop'].forEach((evt) => {
    window.addEventListener(evt, (e) => e.preventDefault());
  });

  /* ------------------------------------------------------------------ */
  /* Chat flow                                                           */
  /* ------------------------------------------------------------------ */

  function scrollChatToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendUserMessage(text) {
    chatEmptyState.classList.add('is-hidden');
    const row = document.createElement('div');
    row.className = 'chat-row chat-row-user';
    row.innerHTML = `
      <div class="chat-avatar" aria-hidden="true"><i class="fa-solid fa-user"></i></div>
      <div class="chat-bubble">${escapeHtml(text)}</div>
    `;
    chatMessages.appendChild(row);
    scrollChatToBottom();
  }

  function appendTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'chat-row chat-row-ai';
    row.id = 'typing-row';
    row.innerHTML = `
      <div class="chat-avatar" aria-hidden="true"><i class="fa-solid fa-sparkles"></i></div>
      <div class="chat-bubble">
        <span class="typing-indicator" aria-label="AI is typing">
          <span></span><span></span><span></span>
        </span>
      </div>
    `;
    chatMessages.appendChild(row);
    scrollChatToBottom();
    return row;
  }

  function appendAiMessage(answer, sources) {
    const row = document.createElement('div');
    row.className = 'chat-row chat-row-ai';

    const sourcesHtml = buildSourcesHtml(sources);

    row.innerHTML = `
      <div class="chat-avatar" aria-hidden="true"><i class="fa-solid fa-sparkles"></i></div>
      <div>
        <div class="chat-bubble"></div>
        ${sourcesHtml}
      </div>
    `;
    chatMessages.appendChild(row);
    scrollChatToBottom();

    typeOutText(row.querySelector('.chat-bubble'), answer);
    wireSourceToggles(row);
  }

  function appendErrorMessage(message) {
    const row = document.createElement('div');
    row.className = 'chat-row chat-row-ai';
    row.innerHTML = `
      <div class="chat-avatar" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <div class="chat-bubble is-error">${escapeHtml(message)}</div>
    `;
    chatMessages.appendChild(row);
    scrollChatToBottom();
  }

  function buildSourcesHtml(sources) {
    if (!sources || !sources.length) return '';

    const cards = sources
      .map((source, index) => {
        const filename = escapeHtml(source.source || 'Unknown source');
        const page = source.page != null ? escapeHtml(source.page) : '—';
        const text = escapeHtml(source.text || '');
        return `
          <div class="source-card" data-source-index="${index}">
            <button type="button" class="source-card-toggle" aria-expanded="false">
              <span class="source-card-toggle-left">
                <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
                <span class="source-filename">${filename}</span>
                <span class="source-page-badge">Page ${page}</span>
              </span>
              <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div class="source-card-body">
              <p class="source-card-text">${text}</p>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div class="sources-wrap">
        <p class="sources-label"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Retrieved Sources</p>
        ${cards}
      </div>
    `;
  }

  function wireSourceToggles(scope) {
    scope.querySelectorAll('.source-card-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.source-card');
        const isOpen = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  }

  function typeOutText(el, text) {
    const safe = String(text || '');
    if (!safe) {
      el.textContent = '(No answer returned.)';
      return;
    }

    let i = 0;
    const speed = safe.length > 400 ? 4 : 14; // ms per character, faster for long answers
    el.setAttribute('aria-live', 'polite');

    function step() {
      i += 1;
      el.textContent = safe.slice(0, i);
      if (i < safe.length) {
        setTimeout(step, speed);
      } else {
        scrollChatToBottom();
      }
    }
    step();
  }

  async function sendQuestion(question) {
    appendUserMessage(question);
    chatInput.value = '';
    autoGrowTextarea();

    setChatBusy(true);
    const typingRow = appendTypingIndicator();

    try {
      const res = await fetch(ENDPOINTS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        /* non-JSON response, fall through to status check below */
      }

      if (!res.ok) {
        const message = (data && (data.detail || data.error)) || `Server responded with status ${res.status}`;
        throw new Error(message);
      }

      typingRow.remove();
      appendAiMessage(data && data.answer, data && data.sources);
    } catch (err) {
      console.error('Chat request failed:', err);
      typingRow.remove();
      const message =
        err && err.message
          ? err.message
          : 'Could not reach the server. Please try again.';
      appendErrorMessage(message);
      showToast('error', message, { title: 'Chat failed' });
    } finally {
      setChatBusy(false);
    }
  }

  function setChatBusy(isBusy) {
    state.isChatting = isBusy;
    chatSendBtn.disabled = isBusy || chatInput.disabled;
    chatInput.disabled = isBusy || chatInput.hasAttribute('data-locked');
  }

  function autoGrowTextarea() {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 140)}px`;
  }

  chatInput.addEventListener('input', autoGrowTextarea);

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const question = chatInput.value.trim();
    if (!question || state.isChatting || chatInput.disabled) return;
    sendQuestion(question);
  });

  // Enter to send, Shift+Enter for newline.
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });

  clearChatBtn.addEventListener('click', () => clearChat());

  function clearChat() {
    chatMessages.querySelectorAll('.chat-row').forEach((row) => row.remove());
    chatEmptyState.classList.remove('is-hidden');
    showToast('info', 'Conversation cleared.', { duration: 1800 });
  }

  // Global keyboard shortcut: Ctrl+L (or Cmd+L) clears the chat.
  document.addEventListener('keydown', (e) => {
    const isClearShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l';
    if (isClearShortcut) {
      e.preventDefault();
      clearChat();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  function init() {
    initTheme();
    initScrollReveal();
    initHeaderScroll();
    initHeroCounter();
    footerYear.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
