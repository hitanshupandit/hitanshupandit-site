/* Theme toggle — persists across every page via localStorage. */
(function () {
  var root = document.documentElement;

  function saved() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem('theme', v); } catch (e) {}
  }
  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function current() {
    return root.getAttribute('data-theme') || (systemDark() ? 'dark' : 'light');
  }
  function paint(mode) {
    root.setAttribute('data-theme', mode);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.textContent = mode === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label',
        mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  var initial = saved() || (systemDark() ? 'dark' : 'light');
  paint(initial);

  document.addEventListener('DOMContentLoaded', function () {
    paint(current());
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      store(next);
      paint(next);
    });
  });
})();

/* Hero particle network — only runs if the canvas is on the page. */
document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var W, H, dots = [];

  function accent() {
    var c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return c || '#1a4fa0';
  }
  function rand(a, b) { return Math.random() * (b - a) + a; }

  function size() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    dots = [];
    var n = Math.min(45, Math.floor((W * H) / 22000));
    for (var i = 0; i < n; i++) {
      dots.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.085, 0.085), vy: rand(-0.085, 0.085),
        r: rand(0.9, 1.8), a: rand(0.25, 0.6)
      });
    }
  }
  size(); seed();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { size(); seed(); }, 150);
  });

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function frame() {
    var rgb = hexToRgb(accent());
    var base = rgb[0] + ',' + rgb[1] + ',' + rgb[2];
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < dots.length; i++) {
      var p = dots[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + base + ',' + (p.a * 0.3) + ')';
      ctx.fill();

      for (var j = i + 1; j < dots.length; j++) {
        var q = dots[j];
        var dx = p.x - q.x, dy = p.y - q.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 115) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(' + base + ',' + ((1 - d / 115) * 0.09) + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
});
