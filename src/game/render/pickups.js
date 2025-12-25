import { camera } from "../state/camera";
import { TILE_SIZE } from "../configs";
import {pickups} from "../systems/pickups";

export function renderPickups(ctx) {
  ctx.fillStyle = "rgba(80, 159, 255, 0.59)";

  for (const [key, pickup] of pickups.entries()) {
    if (pickup.collected) continue;

    const [tx, ty] = key.split(",").map(Number);

    const wx = tx * TILE_SIZE + TILE_SIZE / 2;
    const wy = ty * TILE_SIZE + TILE_SIZE / 2;

    const sx = Math.round(wx - camera.x);
    const sy = Math.round(wy - camera.y);

    const size = 6;

    ctx.beginPath();
    const pulse =
      Math.sin(performance.now() * 0.005 + tx * 10) * 1.5;
    ctx.moveTo(sx, sy - size - pulse);
    ctx.lineTo(sx - size, sy + size);
    ctx.lineTo(sx + size, sy + size);
    ctx.closePath();
    ctx.fill();
  }
}