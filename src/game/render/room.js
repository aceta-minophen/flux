import { camera } from "../state/camera";
import { TILE_SIZE } from "../configs";
import { getAllRooms } from "../../world/grid";

export function renderRoomLabels(ctx) {
  ctx.save();
  ctx.font = "14px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (const room of getAllRooms()) {
    const x = Math.round(room.cx * TILE_SIZE - camera.x + 4);
    const y = Math.round(room.cy * TILE_SIZE - camera.y + 4);

    ctx.fillText(`Room ${room.id}`, x, y);
  }

  ctx.restore();
}