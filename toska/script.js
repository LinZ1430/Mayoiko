const pages = document.getElementById('pages');
const dots = document.querySelectorAll('.dot');
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const splash = document.getElementById('splash');
const totalPages = 7;

// ── Splash Screen ─────────────────────────────────────────────
const splashBar = document.getElementById('splash-bar');
const splashPct = document.getElementById('splash-pct');
const images = [...document.images];
const totalImages = images.length || 1;
let loadedCount = images.filter(i => i.complete).length;
const startedAt = Date.now();
const BAR_DURATION = 1000;
let imgProgress = totalImages > 0 ? (loadedCount / totalImages) * 100 : 100;

function renderBar(timeProgress) {
  const p = Math.min(timeProgress, imgProgress);
  splashBar.style.width = `${p}%`;
  splashPct.textContent = `${Math.round(p)}%`;
}

// Track remaining images
images.forEach(img => {
  if (img.complete) return;
  img.addEventListener('load', () => {
    loadedCount++;
    imgProgress = (loadedCount / totalImages) * 100;
  });
  img.addEventListener('error', () => {
    loadedCount++;
    imgProgress = (loadedCount / totalImages) * 100;
  });
});

let windowLoaded = false;
window.addEventListener('load', () => { windowLoaded = true; });

function dismissSplash() {
  splashBar.style.width = '100%';
  splashPct.textContent = '100%';
  setTimeout(() => {
    splash.classList.add('out');
    setTimeout(() => splash.remove(), 1200);
  }, 200);
}

function tick() {
  const elapsed = Date.now() - startedAt;
  const timeProgress = (elapsed / BAR_DURATION) * 100;
  renderBar(timeProgress);

  const allImgLoaded = loadedCount >= totalImages;
  if (timeProgress >= 100 && allImgLoaded && windowLoaded) {
    dismissSplash();
    return;
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

let current = 0;
let busy = false;

// ── Navigation ────────────────────────────────────────────────
function goTo(index) {
  if (index < 0 || index >= totalPages || index === current || busy) return;
  busy = true;
  current = index;

  pages.style.transform = `translateY(-${current * 100}vh)`;

  // Reset scroll position of the new page to top
  const nextPage = document.querySelector(`.page[data-page="${current}"]`);
  if (nextPage) nextPage.scrollTop = 0;

  // Update dots
  dots.forEach((d, i) => d.classList.toggle('active', i === current));

  // Update nav
  nav.classList.toggle('scrolled', current > 0);

  setTimeout(() => { busy = false; }, 750);
}

function getPageEl() {
  return document.querySelector(`.page[data-page="${current}"]`);
}

function isAtTop() {
  const p = getPageEl();
  return p && p.scrollTop <= 2;
}

function isAtBottom() {
  const p = getPageEl();
  return p && p.scrollTop + p.clientHeight >= p.scrollHeight - 5;
}

// ── Wheel ─────────────────────────────────────────────────────
window.addEventListener('wheel', (e) => {
  if (e.deltaY > 20) {
    if (!isAtBottom()) return;
    e.preventDefault();
    goTo(current + 1);
  } else if (e.deltaY < -20) {
    if (!isAtTop()) return;
    e.preventDefault();
    goTo(current - 1);
  }
}, { passive: false });

// ── Touch ─────────────────────────────────────────────────────
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', (e) => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) <= 40) return;

  if (dy > 0) {
    if (!isAtBottom()) return;
    goTo(current + 1);
  } else {
    if (!isAtTop()) return;
    goTo(current - 1);
  }
}, { passive: true });

// ── Keyboard ──────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   goTo(current - 1);
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End')  goTo(totalPages - 1);
});

// ── Dots click ────────────────────────────────────────────────
dots.forEach(dot => {
  dot.addEventListener('click', () => goTo(parseInt(dot.dataset.page)));
});

// ── Nav links click ───────────────────────────────────────────
document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', (e) => {
    const target = parseInt(el.dataset.page);
    if (!isNaN(target)) {
      e.preventDefault();
      goTo(target);
      nav.classList.remove('open');
    }
  });
});

// ── Mobile toggle ─────────────────────────────────────────────
navToggle.addEventListener('click', () => nav.classList.toggle('open'));
