// ===========================
// Clock Display
// ===========================

function createClockDOM(config) {
  const clock = document.getElementById("clock");
  const cfg = config.time;
  const digits = {};
  clock.textContent = "";

  function addText(text) {
    clock.appendChild(document.createTextNode(text));
  }

  function addDigit(key) {
    const span = document.createElement("span");
    span.className = "digit";
    clock.appendChild(span);
    digits[key] = span;
    return span;
  }

  addText(cfg.prefix);
  addDigit("days");
  addText(` ${cfg.day} `);
  addDigit("hours");
  addText(` ${cfg.hour} `);
  addDigit("minutes");
  addText(` ${cfg.minute} `);
  addDigit("seconds");
  addText(` ${cfg.second}`);

  return digits;
}

function timeElapse(startMs, digits) {
  const secondsPerMinute = 60;
  const secondsPerHour = secondsPerMinute * 60;
  const secondsPerDay = secondsPerHour * 24;

  function twoDigits(value) {
    return String(value).padStart(2, "0");
  }

  // Keep the counter stable even if the configured date is in the future
  // or contains an invalid value.
  const safeStartMs = Number.isFinite(startMs) ? startMs : Date.now();
  const totalSeconds = Math.max(0, Math.floor((Date.now() - safeStartMs) / 1000));
  const todaySeconds = totalSeconds % secondsPerDay;
  const days = Math.floor(totalSeconds / secondsPerDay);

  const hours = Math.floor(todaySeconds / secondsPerHour);
  const minutes = Math.floor((todaySeconds % secondsPerHour) / secondsPerMinute);
  const seconds = todaySeconds % secondsPerMinute;

  digits.days.textContent = String(days);
  digits.hours.textContent = twoDigits(hours);
  digits.minutes.textContent = twoDigits(minutes);
  digits.seconds.textContent = twoDigits(seconds);
}

// ===========================
// Responsive Scaling
// ===========================

function scaleContent() {
  const viewport = document.getElementById("viewport");
  const main = document.getElementById("main");

  function resize() {
    const scale = Math.min(
      window.innerWidth / StageConfig.width,
      window.innerHeight / StageConfig.height,
      1
    );
    viewport.style.width = `${StageConfig.width * scale}px`;
    viewport.style.height = `${StageConfig.height * scale}px`;
    main.style.transform = `scale(${scale})`;
  }

  resize();
  window.addEventListener("resize", resize);
}

// ===========================
// Content Initialization
// ===========================

function initContent(config) {
  const letter = document.getElementById("letter");
  letter.textContent = "";

  function addParagraph(lines) {
    lines.forEach(line => {
      const p = document.createElement("p");
      p.textContent = line;
      letter.appendChild(p);
    });
  }

  function createName(text) {
    const span = document.createElement("span");
    span.className = "name";
    span.textContent = text;
    return span;
  }

  const paragraphs = [
    config.letter.paragraph1,
    config.letter.paragraph2,
    config.letter.paragraph3
  ];
  paragraphs.forEach((lines, index) => {
    if (index > 0) letter.appendChild(document.createElement("br"));
    addParagraph(lines);
  });

  const clockText = document.getElementById("clock-text");
  clockText.textContent = "";
  clockText.appendChild(createName(config.couple.name1));
  clockText.appendChild(document.createTextNode(` ${config.couple.connector} `));
  clockText.appendChild(createName(config.couple.name2));
  clockText.appendChild(document.createTextNode(` ${config.couple.together}`));
}

// ===========================
// Canvas Initialization
// ===========================

function initCanvas(id) {
  const canvas = document.getElementById(id);
  const { width: w, height: h } = StageConfig;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  const ctx = canvas.getContext("2d");
  // Reset the transform before scaling so this function remains safe
  // if the canvas is ever re-initialized.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return canvas;
}
