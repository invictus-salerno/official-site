document.querySelectorAll('[data-reel]').forEach(button => {
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.className = 'video-frame';
    frame.src = 'https://www.instagram.com/reel/' + encodeURIComponent(button.dataset.reel) + '/embed/';
    frame.title = button.getAttribute('aria-label').replace('Carica', '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    button.replaceWith(frame);
    frame.focus();
  });
});
