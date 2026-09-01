// ===========================
// Show Letter & Start Clock
// ===========================

async function showLoveLetter() {
  const letter = document.getElementById("letter");
  const clockBox = document.getElementById("clock-box");
  await typewriter(letter);
  clockBox.classList.add("clock-box--visible");
}

function startClock(config) {
  const startMs = new Date(config.memorialDate).getTime();
  const digits = createClockDOM(config);
  timeElapse(startMs, digits);
  setInterval(() => timeElapse(startMs, digits), AnimationConfig.TIME_UPDATE_INTERVAL);
}

// ===========================
// Main Initialization
// ===========================

async function startApp() {
  initContent(CONFIG);

  const staticCanvas = initCanvas("static-canvas");
  const groundCanvas = initCanvas("ground-canvas");
  const dynamicCanvas = initCanvas("canvas");

  const tree = new Tree(
    staticCanvas,
    dynamicCanvas,
    groundCanvas,
    StageConfig.width,
    StageConfig.height,
    TreeShape,
    CONFIG
  );
  const { seed, footer } = tree;

  scaleContent();

  seed.draw();

  await waitForUserClick(seed, dynamicCanvas);
  const bgm = document.getElementById("bgm");

bgm.volume = 0.5;
bgm.currentTime = 0;

try {
  await bgm.play();
} catch (error) {
  console.log("Music error:", error);
}
  await animateSeedShrink(seed);
  await animateSeedMove(seed, footer);
  await animateTreeGrow(tree);
  await animateFlowerBloom(tree);
  tree.resetFallingBlooms();

  footer.draw();
  await animateTreeMove(staticCanvas);

  await showLoveLetter();
  startHeartJumpAnimation(tree);
  startClock(CONFIG);
}

document.addEventListener("DOMContentLoaded", () => {
  startApp().catch((error) => {
    console.error("Love Letter failed to start:", error);

    const message = document.createElement("div");
    message.className = "app-error";
    message.textContent = "Something went wrong while starting the animation. Please reopen the page.";
    document.body.appendChild(message);
  });
});
