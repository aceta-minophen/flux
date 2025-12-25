import { player } from "../state/player";
import { camera } from "../state/camera";
import { PLAYER_RADIUS } from "../configs";

export function renderPlayer(ctx) {
  const x = Math.round(player.x - camera.x);
  const y = Math.round(player.y - camera.y);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS - 1, 0, Math.PI * 2);
  ctx.fill();
}