// ── Splash Screen ─────────────────────────────────────────────
const splash = document.getElementById('splash');
const splashBar = document.getElementById('splash-bar');
const splashPct = document.getElementById('splash-pct');
const images = [...document.images];
const totalImages = images.length || 1;
let loadedCount = images.filter(i => i.complete).length;
const startedAt = Date.now();
const BAR_DURATION = 1000;
let imgProgress = totalImages > 0 ? (loadedCount / totalImages) * 100 : 100;
let windowLoaded = false;
window.addEventListener('load', () => { windowLoaded = true; });

function renderBar(timeProgress) {
  const p = Math.min(timeProgress, imgProgress);
  splashBar.style.width = `${p}%`;
  splashPct.textContent = `${Math.round(p)}%`;
}

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
