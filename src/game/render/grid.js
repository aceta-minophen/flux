import { TILE_SIZE } from "../configs";
import { getTile } from "../../world/grid";
import { camera } from "../state/camera";

export function renderGrid(ctx) {
  const startX = Math.floor(camera.x / TILE_SIZE) - 1;
  const startY = Math.floor(camera.y / TILE_SIZE) - 1;
  const endX =
    Math.floor((camera.x + ctx.canvas.width) / TILE_SIZE) + 1;
  const endY =
    Math.floor((camera.y + ctx.canvas.height) / TILE_SIZE) + 1;

  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      const tile = getTile(tx, ty);

      const sx = Math.round(tx * TILE_SIZE - camera.x);
      const sy = Math.round(ty * TILE_SIZE - camera.y);

      const instability = 1 - tile.confidence;
      const flicker =
        0.02 +
        Math.abs(
          Math.sin(performance.now() * 0.003 + tile.flickerSeed)
        ) *
          instability *
          0.25;

      drawEdges(ctx, tile, sx, sy, flicker);
    }
  }
}

/* ======================
   EDGES
====================== */

function drawEdges(ctx, tile, x, y, flicker) {
  edge(ctx, tile.edges.n, x, y, x + TILE_SIZE, y, flicker);
  edge(ctx, tile.edges.e, x + TILE_SIZE, y, x + TILE_SIZE, y + TILE_SIZE, flicker);
  edge(ctx, tile.edges.s, x, y + TILE_SIZE, x + TILE_SIZE, y + TILE_SIZE, flicker);
  edge(ctx, tile.edges.w, x, y, x, y + TILE_SIZE, flicker);
}

function edge(ctx, state, x1, y1, x2, y2, flicker) {
  if (state === "open") return;

  ctx.strokeStyle =
    state === "wall"
      ? "rgba(255,255,255,0.25)"
      : `rgba(255,255,255,${flicker})`;

  ctx.lineWidth = state === "wall" ? 2 : 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}