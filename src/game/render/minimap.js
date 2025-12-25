import { MINIMAP_PADDING, MINIMAP_RADIUS, TILE_SIZE } from "../configs";
import { worldBounds } from "../state/worldBounds";
import { pickups } from "../systems/pickups";
import { getTile } from "../../world/grid";
import { player } from "../state/player";

export function renderMiniMap(ctx) {
  const cx = ctx.canvas.width - MINIMAP_RADIUS - MINIMAP_PADDING;
  const cy = MINIMAP_RADIUS + MINIMAP_PADDING;

  const width = worldBounds.maxX - worldBounds.minX + 1;
  const height = worldBounds.maxY - worldBounds.minY + 1;

  if (width <= 0 || height <= 0) return;

  const scale = Math.min(
    (MINIMAP_RADIUS * 2) / width,
    (MINIMAP_RADIUS * 2) / height
  );

  ctx.save();


  // 🔑 Reset transform so minimap is drawn in screen space
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // --- Circular mask ---
  ctx.beginPath();
  ctx.arc(cx, cy, MINIMAP_RADIUS, 0, Math.PI * 2);
  ctx.clip();

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(
    cx - MINIMAP_RADIUS,
    cy - MINIMAP_RADIUS,
    MINIMAP_RADIUS * 2,
    MINIMAP_RADIUS * 2
  );

  // --- Pickups on minimap ---
  for (const [key, pickup] of pickups.entries()) {
    if (pickup.collected) continue;

    const [tx, ty] = key.split(",").map(Number);

    const x =
      cx +
      (tx - worldBounds.minX) * scale -
      MINIMAP_RADIUS +
      scale / 2;

    const y =
      cy +
      (ty - worldBounds.minY) * scale -
      MINIMAP_RADIUS +
      scale / 2;

    ctx.fillStyle = "rgba(80,160,255,0.2)";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1.5, scale * 0.3), 0, Math.PI * 2);
    ctx.fill();
  }
  // --- Draw tiles ---
  for (let ty = worldBounds.minY; ty <= worldBounds.maxY; ty++) {
    for (let tx = worldBounds.minX; tx <= worldBounds.maxX; tx++) {
      const tile = getTile(tx, ty);

      const x =
        cx +
        (tx - worldBounds.minX) * scale -
        MINIMAP_RADIUS;
      const y =
        cy +
        (ty - worldBounds.minY) * scale -
        MINIMAP_RADIUS;

      if (tile.zone === "room") {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(x, y, scale, scale);
      }

      // Collapsed corridor edges
      if (tile.zone === "corridor") {
        const intensity =
          Object.values(tile.edges).some(e => e === "wall")
            ? 0.4
            : 0.03;

        ctx.fillStyle = `rgba(255,255,255,${intensity})`;
        ctx.fillRect(x, y, scale, scale);
      }
    }
  }

  // --- Player ---
  const px =
    cx +
    (player.x / TILE_SIZE - worldBounds.minX) * scale -
    MINIMAP_RADIUS;
  const py =
    cy +
    (player.y / TILE_SIZE - worldBounds.minY) * scale -
    MINIMAP_RADIUS;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(px, py, 2.5, 0, Math.PI * 2);
  ctx.fill();



  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, MINIMAP_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}