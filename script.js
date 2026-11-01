const email = 'george.nicholson1998@gmail.com';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const video = document.getElementById('traffic-replay');
const replayControl = document.getElementById('replay-control');
let replayPaused = reducedMotion.matches;
let replayInView = false;
document.getElementById('year').textContent = new Date().getFullYear();

// Native video controls remain available if this script cannot run.
video.controls = false;
replayControl.hidden = false;
function updateReplayLabel() {
  replayControl.innerHTML = video.paused
    ? 'Play replay <span aria-hidden="true">▷</span>'
    : 'Pause replay <span aria-hidden="true">Ⅱ</span>';
}
function syncReplay() {
  const previewVisible = !document.getElementById('melbourne-preview').hidden;
  if (replayInView && previewVisible && !replayPaused && !document.hidden) {
    video.play().catch(updateReplayLabel);
  } else {
    video.pause();
  }
  updateReplayLabel();
}
video.addEventListener('play', updateReplayLabel);
video.addEventListener('pause', updateReplayLabel);
replayControl.addEventListener('click', () => {
  replayPaused = !video.paused;
  syncReplay();
});
new IntersectionObserver(entries => {
  replayInView = entries[0].isIntersecting;
  syncReplay();
}, {threshold: 0.05}).observe(video);
reducedMotion.addEventListener('change', event => {
  replayPaused = event.matches;
  syncReplay();
});
document.addEventListener('visibilitychange', syncReplay);

function selectTab(tab) {
  const group = tab.closest('[role="tablist"]');
  group.querySelectorAll('[role="tab"]').forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  replayControl.hidden = document.getElementById('melbourne-preview').hidden;
  syncReplay();
}
document.querySelectorAll('[role="tab"]').forEach(tab => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    let target;
    if (event.key === 'ArrowRight') target = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(tabs.indexOf(tab) - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); selectTab(target); target.focus(); }
  });
});

const menu = document.getElementById('main-nav');
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.hidden = false;
menu.dataset.collapsible = 'true';
function closeMenu() {
  menu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
});
menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('header')) closeMenu();
});
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

let copyReset;
document.getElementById('copy-email').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText(email);
    status.textContent = 'Email copied';
    copyReset = setTimeout(() => { status.textContent = ''; }, 4000);
  } catch {
    status.textContent = 'Select the email address above to copy it.';
  }
});
let scheduled = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.scroll-progress').style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
  let active = '';
  ['work', 'experience', 'background', 'contact'].forEach(id => {
    if (document.getElementById(id).getBoundingClientRect().top <= 170) active = id;
  });
  document.querySelectorAll('nav a').forEach(link => {
    const current = link.getAttribute('href') === `#${active}`;
    link.classList.toggle('active', current);
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
}, {passive:true});
addEventListener('resize', updateScroll);
updateScroll();
