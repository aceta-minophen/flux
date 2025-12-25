import { joystick } from "../state/joystick";
import { JOYSTICK_RADIUS } from "../configs";

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

export function renderJoystick(ctx) {
  if (!isTouchDevice || !joystick.active) return;

  ctx.save();

  // Base
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(joystick.baseX, joystick.baseY, JOYSTICK_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  // Thumb
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(joystick.x, joystick.y, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}