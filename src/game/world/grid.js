export const TILE_SIZE = 40;

const tiles = new Map();

function tileKey(x, y) {
  return `${x},${y}`;
}

export function getTile(tx, ty) {
  const key = tileKey(tx, ty);

  if (!tiles.has(key)) {
    tiles.set(key, {
        confidence: Math.random() * 0.3,
        flickerSeed: Math.random() * 1000,
        collapsed: false,
        type: null, // resolved on collapse
        }
);
  }

  return tiles.get(key);
}
