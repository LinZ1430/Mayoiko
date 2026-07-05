// Navigation toggle
const navToggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
  });
});

// Hero parallax on scroll
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (heroBg && scrollY < window.innerHeight) {
    heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.3}px)`;
  }
});

// Nav background on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(10, 10, 10, 0.95)';
  } else {
    nav.style.background = 'rgba(10, 10, 10, 0.85)';
  }
});
