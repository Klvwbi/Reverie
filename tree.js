// ===========================
// Stage Configuration
// ===========================

const StageConfig = {
  width: 1100,
  height: 680
};

// The original tree space is kept. The teddy image is drawn in that same
// area, then the whole static canvas moves right exactly like the old tree.
const TreeShape = {
  seed: {
    x: StageConfig.width / 2 - 20,
    color: "#111111",
    scale: 2
  },
  bloom: { num: 0 },
  footer: { width: 1200, height: 5, speed: 10 }
};

// ===========================
// Seed — the initial clickable heart
// ===========================

class Seed {
  constructor(tree, point, scale = 1, color = "#111111", config = {}) {
    this.tree = tree;
    this.config = config;
    this.heart = { point, scale, color, figure: new Heart() };
    this.circle = { point: new Point(point.x, point.y), scale, color, radius: 5 };
  }

  draw() {
    this.drawHeart();
    this.drawText();
  }

  canMove() { return this.circle.point.y < this.tree.height + 20; }
  canScale() { return this.heart.scale > 0.2; }

  move(x, y) {
    this.clear();
    this.drawCircle();
    const { point } = this.circle;
    point.set(point.x + x, point.y + y);
  }

  scale(s) {
    this.clear();
    this.drawCircle();
    this.drawHeart();
    this.heart.scale *= s;
  }

  drawHeart() {
    const { ctx } = this.tree;
    const { point, color, scale, figure } = this.heart;
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(point.x, point.y);
    ctx.scale(scale, scale);
    ctx.fill(figure.path);
    ctx.restore();
  }

  drawCircle() {
    const { ctx } = this.tree;
    const { point, color, scale, radius } = this.circle;
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(point.x, point.y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  drawText() {
    const { ctx } = this.tree;
    const { point, color, scale } = this.heart;
    const text = this.config.seedText || "I'll miss you";
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.translate(point.x, point.y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(15, 15);
    ctx.lineTo(60, 15);
    ctx.stroke();
    ctx.moveTo(0, 0);
    ctx.scale(0.75, 0.75);
    ctx.font = "12px sans-serif";
    ctx.fillText(text, 23, 10);
    ctx.restore();
  }

  clear() {
    const { ctx } = this.tree;
    const { point, scale } = this.circle;
    const w = 26 * scale;
    const h = 26 * scale;
    ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
  }

  hover(x, y) {
    const dpr = window.devicePixelRatio || 1;
    const pixel = this.tree.ctx.getImageData(x * dpr, y * dpr, 1, 1);
    return pixel.data[3] === 255;
  }
}

// ===========================
// Footer — unchanged ground line
// ===========================

class Footer {
  constructor(tree, width, height, speed = 2) {
    this.tree = tree;
    this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.length = 0;
  }

  draw(ctx) {
    ctx = ctx || this.tree.groundCtx;
    const { point, height, length, width } = this;
    ctx.save();
    ctx.strokeStyle = "rgb(35, 31, 32)";
    ctx.lineWidth = height;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.translate(point.x, point.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length / 2, 0);
    ctx.lineTo(-length / 2, 0);
    ctx.stroke();
    ctx.restore();
    if (length < width) this.length += this.speed;
  }
}

// ===========================
// Falling flower petals
// ===========================

class FlowerPetal {
  constructor(tree, point, color, alpha, scale) {
    this.tree = tree;
    this.point = point;
    this.color = color;
    this.alpha = alpha;
    this.scale = scale;
    this.angle = randomFloat(0, Math.PI * 2);
    this.vx = randomFloat(-0.55, 0.55);
    this.vy = randomFloat(0.45, 1.05);
    this.wind = randomFloat(-0.75, 0.2);
    this.swing = randomFloat(0.01, 0.03);
    this.swingAmp = randomFloat(0.45, 1.15);
    this.phase = randomFloat(0, Math.PI * 2);
    this.spin = randomFloat(-0.02, 0.02);
  }

  drawOn(ctx) {
    const x = this.point.x;
    const y = this.point.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color === "#111111" ? "#111111" : "#fff";
    ctx.lineWidth = 1.4;

    // Five rounded petals so they read as flowers, not dots/hearts.
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -5.5, 3.1, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 2.3, 0, Math.PI * 2);
    ctx.fillStyle = this.color === "#111111" ? "#fff" : "#111111";
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.restore();
  }

  fall(dt) {
    const f = dt / 16;
    const sway = Math.sin(this.phase + this.point.y * this.swing) * this.swingAmp * f;

    this.point.set(
      this.point.x + (this.vx + this.wind * 0.12) * f + sway,
      this.point.y + this.vy * f
    );
    this.vy += 0.006 * f;
    this.angle += this.spin * f;

    this.drawOn(this.tree.dynamicCtx);
  }

  get offscreen() {
    return this.point.y > this.tree.height + 45 ||
      this.point.x < -45 ||
      this.point.x > this.tree.width + 45;
  }
}

// ===========================
// Teddy image replacing the tree
// ===========================

function getTreeShiftX() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--tree-shift-x");
  return parseFloat(value) || AnimationConfig.TREE_SHIFT_X;
}

class Tree {
  constructor(staticCanvas, dynamicCanvas, groundCanvas, width, height, opt = {}, config = {}) {
    this.staticCanvas = staticCanvas;
    this.ctx = staticCanvas.getContext("2d");
    this.dynamicCanvas = dynamicCanvas;
    this.dynamicCtx = dynamicCanvas.getContext("2d");
    this.groundCanvas = groundCanvas;
    this.groundCtx = groundCanvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.opt = opt;
    this.config = config;

    this.initSeed();
    this.initFooter();
    this.initTeddies();
    this.initBloom();
  }

  initSeed() {
    const { x = this.width / 2, y = this.height / 2, color = "#111111", scale = 1 } = this.opt.seed || {};
    this.seed = new Seed(this, new Point(x, y), scale, color, this.config);
  }

  initFooter() {
    const { width = this.width, height = 5, speed = 2 } = this.opt.footer || {};
    this.footer = new Footer(this, width, height, speed);
  }

  initTeddies() {
    this.imageReady = false;
    this.imageProgress = 0;
    this.teddyImage = new Image();
    this.teddyImage.onload = () => {
      this.imageReady = true;
    };
    this.teddyImage.onerror = () => {
      // Do not crash the whole animation if the image is missing.
      this.imageReady = true;
      this.imageProgress = 1;
    };
    this.teddyImage.src = "teddies.png";
  }

  initBloom() {
    this.blooms = [];
    this.bloomsCache = [];
    this.fallingBlooms = [];
  }

  // The existing animation flow still calls these methods. The only visual
  // growth phase is now the teddy picture appearing in the old tree space.
  canGrow() {
    return !this.imageReady || this.imageProgress < 1;
  }

  grow() {
    if (!this.imageReady) return;

    this.imageProgress = Math.min(1, this.imageProgress + 0.025);
    this.drawTeddies(this.imageProgress);
  }

  drawTeddies(progress = 1) {
    if (!this.teddyImage.complete || !this.teddyImage.naturalWidth) return;

    const ctx = this.ctx;
    const p = progress;

    // Same visual area as the old tree before its canvas shifts right.
    const centerX = 550;
    const centerY = 390;
    const targetW = 590;
    const targetH = 470;
    const scale = 0.94 + p * 0.06;
    const drawW = targetW * scale;
    const drawH = targetH * scale;
    const dx = centerX - drawW / 2;
    const dy = centerY - drawH / 2;

    // Crop the empty margins from the generated image while keeping the
    // teddy drawing itself exactly as the supplied image.
    const sw = this.teddyImage.naturalWidth * 0.86;
    const sh = this.teddyImage.naturalHeight * 0.82;
    const sx = (this.teddyImage.naturalWidth - sw) / 2;
    const sy = this.teddyImage.naturalHeight * 0.10;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.globalAlpha = p;
    ctx.drawImage(this.teddyImage, sx, sy, sw, sh, dx, dy, drawW, drawH);
    ctx.restore();
  }

  canFlower() {
    return false;
  }

  flower() {}

  createFallingBloom() {
    // Spawn from across the upper part of the teddy area after it has shifted.
    const centerX = 550 + getTreeShiftX();
    const centerY = 390;
    const color = Math.random() < 0.5 ? "#111111" : "#ffffff";

    return new FlowerPetal(
      this,
      new Point(
        centerX + randomFloat(-260, 250),
        centerY + randomFloat(-220, 40)
      ),
      color,
      randomFloat(0.72, 1),
      randomFloat(0.72, 1.15)
    );
  }

  resetFallingBlooms() {
    this.blooms = [];
    this.fallingBlooms = [];
  }

  jump(dt) {
    for (let i = this.fallingBlooms.length - 1; i >= 0; i--) {
      const bloom = this.fallingBlooms[i];
      bloom.fall(dt);
      if (bloom.offscreen) this.fallingBlooms.splice(i, 1);
    }

    if (
      this.fallingBlooms.length < AnimationConfig.MAX_FALLING_HEARTS &&
      Math.random() < AnimationConfig.FALLING_SPAWN_CHANCE
    ) {
      this.fallingBlooms.push(this.createFallingBloom());
    }
  }
}
