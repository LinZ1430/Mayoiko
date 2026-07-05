const pages = document.getElementById('pages');
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

const allPages = document.querySelectorAll('.page');
const pageSlugs = ['index', 'about', 'info', 'content', 'register', 'faq', 'more'];
let current = 0;
let busy = false;

// ── Navigation ────────────────────────────────────────────────
function goTo(index, pushState = true) {
  if (index < 0 || index >= totalPages || index === current || busy) return;
  busy = true;
  const prev = current;
  current = index;

  const targetPage = allPages[current];
  const prevPage = allPages[prev];
  const forward = current > prev;
  const dir = forward ? 'fwd' : 'rev';

  // Reset target scroll
  if (targetPage) targetPage.scrollTop = 0;

  // Old page exits
  prevPage.classList.add('leaving', dir);
  prevPage.classList.remove('active');

  // New page enters
  targetPage.classList.add('entering', dir);

  // Cleanup after transition (use max of enter/exit speeds)
  const enterSpeed = parseFloat(getComputedStyle(targetPage).getPropertyValue('--enter-speed')) * 1000 || 700;
  const exitSpeed = parseFloat(getComputedStyle(prevPage).getPropertyValue('--exit-speed')) * 1000 || 500;
  const duration = Math.max(enterSpeed, exitSpeed);

  setTimeout(() => {
    allPages.forEach(p => {
      p.classList.remove('entering', 'leaving', 'fwd', 'rev');
      p.style.clipPath = '';
    });
    targetPage.classList.add('active');
    busy = false;
  }, duration + 50);

  // Update nav
  nav.classList.toggle('scrolled', current > 0);

  // URL hash
  if (pushState) {
    history.pushState({ page: current }, '', `#${pageSlugs[current]}`);
  }
}

// ── Hash routing ──────────────────────────────────────────────
function handleHash() {
  const hash = window.location.hash.replace('#', '');
  const idx = pageSlugs.indexOf(hash);
  if (idx >= 0 && idx !== current) goTo(idx, false);
}
window.addEventListener('hashchange', handleHash);
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page !== undefined) goTo(e.state.page, false);
});

// Init: activate correct page based on hash
if (window.location.hash) {
  const hash = window.location.hash.replace('#', '');
  const idx = pageSlugs.indexOf(hash);
  if (idx >= 0) {
    current = idx;
    allPages[idx].classList.add('active');
    nav.classList.toggle('scrolled', idx > 0);
  }
} else {
  allPages[0].classList.add('active');
  history.replaceState({ page: 0 }, '', '#index');
}

// ── Wheel ─────────────────────────────────────────────────────
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY > 20) goTo(current + 1);
  else if (e.deltaY < -20) goTo(current - 1);
}, { passive: false });

// ── Touch ─────────────────────────────────────────────────────
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', (e) => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) <= 40) return;
  if (dy > 0) goTo(current + 1);
  else goTo(current - 1);
}, { passive: true });

// ── Keyboard ──────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   goTo(current - 1);
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End')  goTo(totalPages - 1);
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
