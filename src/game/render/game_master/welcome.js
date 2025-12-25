import { gameState } from "../../state/gameState";

/* ======================
   INTERNAL STATE
====================== */

const playButtonState = {
  pressed: false,
};

/* ======================
   LAYOUT
====================== */

export function getWelcomeLayout(canvas) {
  const cardW = 260;
  const cardH = 140;

  const cardX = (canvas.width - cardW) / 2;
  const cardY = (canvas.height - cardH) / 2;

  const buttonW = 80;
  const buttonH = 22;

  const buttonX = canvas.width / 2 - buttonW / 2;
  const buttonY = cardY + 100;

  return {
    card: { x: cardX, y: cardY, w: cardW, h: cardH },
    button: { x: buttonX, y: buttonY, w: buttonW, h: buttonH },
  };
}

/* ======================
   INPUT HANDLERS
====================== */

export function onWelcomePress(x, y, canvas) {
  if (gameState.started) return;

  const { button } = getWelcomeLayout(canvas);

  if (
    x >= button.x &&
    x <= button.x + button.w &&
    y >= button.y &&
    y <= button.y + button.h
  ) {
    playButtonState.pressed = true;
  }
}

export function onWelcomeRelease(x, y, canvas) {
  if (gameState.started) return;

  const { button } = getWelcomeLayout(canvas);

  const inside =
    x >= button.x &&
    x <= button.x + button.w &&
    y >= button.y &&
    y <= button.y + button.h;

  if (inside && playButtonState.pressed) {
    gameState.started = true;
  }

  playButtonState.pressed = false;
}

/* ======================
   RENDER
====================== */

export function renderWelcome(ctx) {
  if (gameState.started) return;

  const { width, height } = ctx.canvas;
  const { card, button } = getWelcomeLayout(ctx.canvas);

  ctx.save();

  // Dim background
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, width, height);

  // Card
  ctx.fillStyle = "rgba(10,10,10,0.9)";
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(card.x, card.y, card.w, card.h, 8);
  ctx.fill();
  ctx.stroke();

  // Title text
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("WELCOME TO THE FLUX", width / 2, card.y + 35);

  ctx.font = "12px monospace";
  ctx.fillText("Observe carefully.", width / 2, card.y + 60);
  ctx.fillText("Movement creates structure.", width / 2, card.y + 78);
//   ctx.fillText("Something about press the button to bear a weapon.", width / 2, card.y + 96);

  // Button animation
  const pressOffset = playButtonState.pressed ? 2 : 0;
  const alpha = playButtonState.pressed ? 0.9 : 0.6;

  // Button fill (only when pressed)
  if (playButtonState.pressed) {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(
      button.x + pressOffset,
      button.y + pressOffset,
      button.w,
      button.h
    );
  }

  // Button border
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.strokeRect(
    button.x + pressOffset,
    button.y + pressOffset,
    button.w,
    button.h
  );

  // Button text
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fillText(
    "PLAY",
    width / 2 + pressOffset,
    button.y + button.h / 2 + pressOffset
  );

  ctx.restore();
}
