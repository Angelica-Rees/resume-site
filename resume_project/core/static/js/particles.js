// Initialize particle animations for all buttons
function initializeButtonAnimation(canvasId, buttonId) {
  const canvas = document.getElementById(canvasId);
  const button = document.getElementById(buttonId);

  if (!canvas || !button) {
    console.warn(`Skipping animation: canvas ${canvasId} or button ${buttonId} not found`);
    return;
  }

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  let particles = [];
  let running = false;
  let hover = false;
  let lastTime = 0;

  function resizeCanvas() {
    // Canvas fills the parent container
    const rect = container.getBoundingClientRect();

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // High-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  class Particle {
    constructor(centerX, centerY, radius, speed, size, color, phase) {
      this.centerX = centerX;
      this.centerY = centerY;
      this.radius = radius;
      this.speed = speed;
      this.angle = phase;
      this.size = size;
      this.color = color;
      this.alpha = 0;
      this.targetAlpha = 1;
    }

    update(dt) {
      this.angle += this.speed * dt;
      this.x = this.centerX + Math.cos(this.angle) * this.radius;
      this.y = this.centerY + Math.sin(this.angle) * this.radius;

      const fadeSpeed = 2;
      if (this.alpha < this.targetAlpha) {
        this.alpha = Math.min(this.alpha + fadeSpeed * dt, this.targetAlpha);
      } else if (this.alpha > this.targetAlpha) {
        this.alpha = Math.max(this.alpha - fadeSpeed * dt, this.targetAlpha);
      }
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createParticles() {
    particles = [];

    const containerRect = container.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();

    // Calculate button center relative to container
    const centerX = (btnRect.left - containerRect.left) + (btnRect.width / 2);
    const centerY = (btnRect.top - containerRect.top) + (btnRect.height / 2);

    const numRings = 3;
    const particlesPerRing = 16;
    const baseRadius = Math.min(btnRect.width, btnRect.height) * 0.6;

    for (let ring = 0; ring < numRings; ring++) {
      const radius = baseRadius + ring * 15;
      const speedBase = 0.6 + ring * 0.25;

      for (let i = 0; i < particlesPerRing; i++) {
        const phase = (i / particlesPerRing) * Math.PI * 2;
        const speed = (Math.random() * 0.5 + 0.75) * speedBase;
        const size = Math.random() * 2 + 1.2;

        const colors = ['#b46a3b', '#c47a4a', '#d7b8a2', '#c45e4a', '#c44a4a'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const p = new Particle(centerX, centerY, radius, speed, size, color, phase);
        p.alpha = 0;
        particles.push(p);
      }
    }
  }

  function startAnimation() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stopAnimation() {
    particles.forEach(p => (p.targetAlpha = 0));
    hover = false;
  }

  function loop(timestamp) {
    if (!running) return;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    particles.forEach(p => {
      p.update(dt);
      p.draw(ctx);
    });

    if (!hover && particles.every(p => p.alpha <= 0.01)) {
      running = false;
      return;
    }

    requestAnimationFrame(loop);
  }

  // Initialize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', resizeCanvas);

  button.addEventListener('mouseenter', () => {
    hover = true;
    createParticles();
    particles.forEach(p => (p.targetAlpha = 1));
    startAnimation();
  });

  button.addEventListener('mouseleave', () => {
    stopAnimation();
  });

  console.log(`Initialized animation for ${buttonId}`);
}

// Initialize all button animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing particle animations...');
  // Initialize only primary buttons (1 and 3)
  initializeButtonAnimation('orbitCanvas1', 'orbitButton1');
  initializeButtonAnimation('orbitCanvas3', 'orbitButton3');
});
