import { keys } from "../input/keyboard";
import { joystick } from "../state/joystick";
import { player } from "../state/player";
import { camera } from "../state/camera";
import { updateObservation } from "./observation";
import { resolveWallPenetration } from "./collision";
import { checkPickupCollision } from "./pickups";
import { JOYSTICK_DEADZONE, JOYSTICK_RADIUS } from "../configs";

export function update(dt, ctx) {
  // --- Movement intent ---
  let dx = 0;
  let dy = 0;

  // Keyboard
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;
  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;

  // Touch joystick overrides keyboard
  if (joystick.active) {
    dx = joystick.dx;
    dy = joystick.dy;
  }

  // Deadzone
  if (Math.hypot(dx, dy) < JOYSTICK_DEADZONE / JOYSTICK_RADIUS) {
    dx = 0;
    dy = 0;
  }


  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
  }

  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;

  // --- Hard collision resolution ---
  for (let i = 0; i < 3; i++) {
    resolveWallPenetration();
  }

  // Camera
  camera.x = player.x - window.innerWidth / 2;
  camera.y = player.y - window.innerHeight / 2;

  updateObservation(dt, ctx);
  checkPickupCollision();

}