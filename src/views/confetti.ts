/*
Used perplexity: https://www.perplexity.ai/search/fae3593b-de1a-4c60-8052-d2c8cbe0339b

Then removed duplicated code and adjusted the details.
Took about one hour ... and another for more fine-tuning

Fun fact: perplexity.ai said to develop web apps you need to register, please continue here..
If you press escape the chat can be viewed without problems. Security by chatbot!
*/

export function startConfetti(targetElementId: string = "app", durationMs = 3500) {
  const canvas = document.createElement('canvas');
  const container = document.getElementById(targetElementId);
  //const container = document.querySelector(`.${targetElementClass}`);
  if (!container) {
    console.log('Target element not found');
    return;
  }
  container.style.position = 'relative';
  container.appendChild(canvas);
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 10000;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('2D context not available');
    return;
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize, { passive: true });

  // particle model
  type Particle = {
    x: number; y: number;
    vx: number; vy: number;
    size: number; color: string;
    rotate: number; vr: number;
  };

  const colors = [
    '#ffeb08',
    '#89291c',
    '#307030',
    '#99c0e6',
    '#c090d0',
    '#0f4f8a',
    '#facc9e',
    '#b060a0',
    '#80c090',
  ];
  const particles: Particle[] = [];

  // spawn particles
  const count = Math.min(220, Math.max(60, Math.floor(canvas.width / 8)));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - .5) * canvas.width * .7,
      y: (Math.random() - .5) * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.pow(Math.random(), 2.) * 10,
      size: Math.pow(Math.random(), 2.) * 20 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.5
    });
  }

  const start = performance.now();

  function loop(now: number) {
    const t = (now - start) / durationMs;
    const width = canvas.width, height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // simple gravity-like sway and ground bounce
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gravity-ish

      // wrap horizontally
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      // gentle bounce on bottom
      if (p.y > height - 10) {
        p.y = height - 10;
        p.vy *= -0.45;
        p.vx *= 0.92;
        p.vr *= -0.9;
        p.vr += Math.sign(p.vr) * .3;
      }

      p.rotate += p.vr;
      if (Math.abs(p.vr) >= .1) {
        p.vr *= .99;
      }
    }

    const alpha = Math.min(1., 2. - t);
    if (alpha <= 0) {
      window.removeEventListener('resize', resize);
      container.removeChild(canvas);
      return;
    }

    ctx.globalAlpha = alpha;
    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate);
      ctx.fillStyle = p.color;
      const w = p.size / 1.2;
      const h = p.size;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, p.size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

}
