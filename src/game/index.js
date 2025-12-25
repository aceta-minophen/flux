import { update } from "./systems/movement";
import { render } from "./render/render";
import { onTouchStart, onTouchMove, onTouchEnd } from "./input/touch";

let animationId;
let lastTime = 0;

export function startLoop(ctx) {
  function frame(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    update(dt, ctx);
    render(ctx);

    animationId = requestAnimationFrame(frame);
  }
  animationId = requestAnimationFrame(frame);

  const canvas = ctx.canvas;

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);
  canvas.addEventListener("touchcancel", onTouchEnd);

}

export function stopLoop() {
  cancelAnimationFrame(animationId);
}
