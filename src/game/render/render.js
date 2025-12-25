import { renderGrid } from "./grid";
import { renderPickups } from "./pickups";
import { renderPlayer } from "./player";
import { renderRoomLabels } from "./room";
import { renderHUD } from "./hud";
import { renderMiniMap } from "./minimap";
import { renderJoystick } from "./joystick";
import { renderWelcome } from "./game_master/welcome";

export function render(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderGrid(ctx);
  renderPickups(ctx);
  renderPlayer(ctx);
  renderRoomLabels(ctx);
  renderHUD(ctx);
  renderMiniMap(ctx);
  renderJoystick(ctx);

  renderWelcome(ctx);
}