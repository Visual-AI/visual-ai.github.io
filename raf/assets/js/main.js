document.querySelectorAll('[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-copy-target');
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      const old = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = old; }, 1400);
    } catch (_) {
      btn.textContent = 'Select BibTeX below';
    }
  });
});

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('error', () => {
    const hint = document.createElement('div');
    hint.className = 'caption';
    hint.textContent = 'Video file not found. Copy the corresponding .mp4 into assets/videos/.';
    video.parentElement.appendChild(hint);
  }, { once: true });
});

function rafTryAutoplay(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  const promise = video.play();
  if (promise && typeof promise.catch === 'function') promise.catch(() => {});
}

function rafAutoplayAllVideos() {
  document.querySelectorAll('video').forEach((video) => {
    rafTryAutoplay(video);
    video.addEventListener('loadeddata', () => rafTryAutoplay(video), { once: true });
    video.addEventListener('canplay', () => rafTryAutoplay(video), { once: true });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rafAutoplayAllVideos);
} else {
  rafAutoplayAllVideos();
}
window.addEventListener('load', rafAutoplayAllVideos);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) rafAutoplayAllVideos();
});
