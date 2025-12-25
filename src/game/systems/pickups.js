import { player, playerStats } from "../state/player";
import { TILE_SIZE, MAX_SPEED } from "../configs";

export const pickups = new Map();

export function checkPickupCollision() {
  const tx = Math.floor(player.x / TILE_SIZE);
  const ty = Math.floor(player.y / TILE_SIZE);
  const key = `${tx},${ty}`;

  const pickup = pickups.get(key);
  if (!pickup || pickup.collected) return;

  pickup.collected = true;
  player.speed = Math.min(player.speed + 1, MAX_SPEED);
  playerStats.points += 1;
  playerStats.speed = player.speed;
}