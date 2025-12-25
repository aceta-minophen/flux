import { OBSERVATION_RADIUS, TILE_SIZE, COLLAPSE_THRESHOLD, PASSIVE_GAIN, ACTIVE_GAIN } from "../configs";
import { worldBounds } from "../state/worldBounds";
import { getTile } from "../../world/grid";
import { camera } from "../state/camera";
import { player } from "../state/player";
import { pickups } from "../systems/pickups";

export function updateObservation(dt, ctx) {
  const startX = Math.floor(camera.x / TILE_SIZE) - 1;
  const startY = Math.floor(camera.y / TILE_SIZE) - 1;
  const endX =
    Math.floor((camera.x + ctx.canvas.width) / TILE_SIZE) + 1;
  const endY =
    Math.floor((camera.y + ctx.canvas.height) / TILE_SIZE) + 1;

  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      const tile = getTile(tx, ty);

      const cx = tx * TILE_SIZE + TILE_SIZE / 2;
      const cy = ty * TILE_SIZE + TILE_SIZE / 2;

      const d = Math.hypot(player.x - cx, player.y - cy);

      if (d < OBSERVATION_RADIUS) {
        tile.confidence +=
          ACTIVE_GAIN * (1 - d / OBSERVATION_RADIUS) * dt;
      } else if (d < OBSERVATION_RADIUS * 1.6) {
        tile.confidence += PASSIVE_GAIN * dt;
      }

      tile.confidence = Math.min(tile.confidence, 1);

      if (tile.zone === "corridor" && tile.confidence >= COLLAPSE_THRESHOLD) {
        collapseRandomEdge(tile);
        tile.confidence = 0.4;
      }

      // Update world bounds
      worldBounds.minX = Math.min(worldBounds.minX, tx);
      worldBounds.minY = Math.min(worldBounds.minY, ty);
      worldBounds.maxX = Math.max(worldBounds.maxX, tx);
      worldBounds.maxY = Math.max(worldBounds.maxY, ty);
      maybeSpawnPickup(tx, ty, tile);

    }
  }
}

/* ======================
   HELPERS
====================== */

function collapseRandomEdge(tile) {
  const unresolved = Object.entries(tile.edges)
    .filter(([, v]) => v === "unknown")
    .map(([k]) => k);

  if (!unresolved.length) return;

  const edge = unresolved[Math.floor(Math.random() * unresolved.length)];
  tile.edges[edge] = Math.random() < 0.25 ? "wall" : "open";
}

function maybeSpawnPickup(tx, ty, tile) {
  if (tile.zone !== "corridor") return;

  const key = `${tx},${ty}`;
  if (pickups.has(key)) return;

  // Low density spawn
  if (Math.random() < 0.03) {
    pickups.set(key, {
      collected: false,
    });
  }
}