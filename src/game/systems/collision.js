import { getTile } from "../../world/grid";
import { TILE_SIZE, PLAYER_RADIUS } from "../configs";
import { player } from "../state/player";

export function resolveWallPenetration() {
  const tx = Math.floor(player.x / TILE_SIZE);
  const ty = Math.floor(player.y / TILE_SIZE);

  // Check surrounding tiles
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tile = getTile(tx + dx, ty + dy);
      const baseX = (tx + dx) * TILE_SIZE;
      const baseY = (ty + dy) * TILE_SIZE;

      if (tile.edges.n === "wall")
        pushFromLine(
          baseX,
          baseY,
          baseX + TILE_SIZE,
          baseY,
          0,
          -1
        );

      if (tile.edges.s === "wall")
        pushFromLine(
          baseX,
          baseY + TILE_SIZE,
          baseX + TILE_SIZE,
          baseY + TILE_SIZE,
          0,
          1
        );

      if (tile.edges.w === "wall")
        pushFromLine(
          baseX,
          baseY,
          baseX,
          baseY + TILE_SIZE,
          -1,
          0
        );

      if (tile.edges.e === "wall")
        pushFromLine(
          baseX + TILE_SIZE,
          baseY,
          baseX + TILE_SIZE,
          baseY + TILE_SIZE,
          1,
          0
        );
    }
  }
}

function pushFromLine(x1, y1, x2, y2) {
  const px = player.x;
  const py = player.y;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return;

  // Closest point on segment
  let t =
    ((px - x1) * dx + (py - y1) * dy) / lenSq;

  t = Math.max(0, Math.min(1, t));

  const cx = x1 + t * dx;
  const cy = y1 + t * dy;

  const vx = px - cx;
  const vy = py - cy;
  const dist = Math.hypot(vx, vy);

  if (dist === 0 || dist >= PLAYER_RADIUS) return;

  const penetration = PLAYER_RADIUS - dist;

  // 🔑 PUSH DIRECTLY AWAY FROM THE WALL
  player.x += (vx / dist) * penetration;
  player.y += (vy / dist) * penetration;
}

