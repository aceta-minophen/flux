import { playerStats } from "../state/player";

export function renderHUD(ctx) {
  ctx.save();

  ctx.font = "12px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const x = 10;
  let y = 10;
  const lineHeight = 16;

  ctx.fillText(`Speed: ${playerStats.speed.toFixed(0)}`, x, y);
  y += lineHeight;

  ctx.fillText(`Points: ${playerStats.points}`, x, y);
  y += lineHeight;

  ctx.restore();
}