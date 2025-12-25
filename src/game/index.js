import { update } from "./systems/movement";
import { render } from "./render/render";
import { gameState } from "./state/gameState";

import {
  onWelcomePress,
  onWelcomeRelease,
} from "./render/game_master/welcome";

import {
  onTouchStart,
  onTouchMove,
  onTouchEnd,
} from "./input/touch";

let animationId;
let lastTime = 0;

/* ======================
   GAME LOOP
====================== */

export function startLoop(ctx) {
  const canvas = ctx.canvas;

  function frame(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    update(dt, ctx);
    render(ctx);

    animationId = requestAnimationFrame(frame);
  }

  animationId = requestAnimationFrame(frame);

  /* ======================
     WELCOME SCREEN INPUT
     (EXPLICIT PLAY ONLY)
  ====================== */

  canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    onWelcomePress(
      e.clientX - rect.left,
      e.clientY - rect.top,
      canvas
    );
  });

  canvas.addEventListener("mouseup", e => {
    const rect = canvas.getBoundingClientRect();
    onWelcomeRelease(
      e.clientX - rect.left,
      e.clientY - rect.top,
      canvas
    );
  });

  canvas.addEventListener("touchstart", e => {
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();

    onWelcomePress(
      t.clientX - rect.left,
      t.clientY - rect.top,
      canvas
    );
  }, { passive: false });

  canvas.addEventListener("touchend", e => {
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();

    onWelcomeRelease(
      t.clientX - rect.left,
      t.clientY - rect.top,
      canvas
    );
  });

  /* ======================
     JOYSTICK INPUT
     (ALWAYS ACTIVE)
  ====================== */

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);
  canvas.addEventListener("touchcancel", onTouchEnd);
}

/* ======================
   STOP LOOP
====================== */

export function stopLoop() {
  cancelAnimationFrame(animationId);
}
