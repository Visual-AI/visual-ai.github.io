(() => {
  const video = document.getElementById('reflectopd-overview-video');
  if (!video) return;
  const chapters = [...document.querySelectorAll('[data-film-time]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, manuallyPaused = false, managedPause = false, ready = false;
  const pauseAutomatically = () => {
    if (!video.paused) { managedPause = true; video.pause(); }
  };
  const playAutomatically = () => {
    if (ready && visible && !document.hidden && !manuallyPaused && !reducedMotion.matches) video.play().catch(() => {});
  };
  // A local static server may omit byte-range support. A small cached Blob
  // keeps chapter seeking reliable in Safari as well as on hosted pages.
  const sourceURL = video.querySelector('source').src;
  video.addEventListener('loadedmetadata', () => {
    if (video.src.startsWith('blob:')) { ready = true; playAutomatically(); }
  });
  fetch(sourceURL).then(response => {
    if (!response.ok) throw new Error('Video request failed');
    return response.blob();
  }).then(blob => {
    video.src = URL.createObjectURL(blob);
    video.load();
  }).catch(() => { ready = true; playAutomatically(); });
  video.addEventListener('pause', () => {
    if (managedPause) managedPause = false;
    else manuallyPaused = true;
  });
  video.addEventListener('play', () => { manuallyPaused = false; });
  video.addEventListener('timeupdate', () => {
    chapters.forEach((button, i) => {
      const start = Number(button.dataset.filmTime);
      const end = i + 1 < chapters.length ? Number(chapters[i + 1].dataset.filmTime) : Infinity;
      if (video.currentTime >= start && video.currentTime < end) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  });
  chapters.forEach(button => button.addEventListener('click', () => {
    video.currentTime = Number(button.dataset.filmTime);
    manuallyPaused = false;
    video.play().catch(() => {});
  }));
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) playAutomatically(); else pauseAutomatically();
  }, { threshold: 0.3 }).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAutomatically(); else playAutomatically();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) pauseAutomatically(); else playAutomatically();
  });
})();
