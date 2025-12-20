// Infinite tile store
const tiles = new Map();

export const TILE_SIZE = 40;

/* ======================
   ROOM GENERATION
====================== */

const rooms = [];
const ROOM_COUNT = 5;

function createRoom(cx, cy, w, h) {
  rooms.push({ cx, cy, w, h });
}

function isInRoom(tx, ty) {
  return rooms.some(
    r =>
      tx >= r.cx &&
      tx < r.cx + r.w &&
      ty >= r.cy &&
      ty < r.cy + r.h
  );
}

// Generate rooms once
(function generateRooms() {
  for (let i = 0; i < ROOM_COUNT; i++) {
    const w = 5 + Math.floor(Math.random() * 4); // 5–20
    const h = 5 + Math.floor(Math.random() * 4);

    const cx = Math.floor(Math.random() * 50) - 25;
    const cy = Math.floor(Math.random() * 50) - 25;

    createRoom(cx, cy, w, h);
  }
})();

/* ======================
   TILE ACCESS
====================== */

function key(x, y) {
  return `${x},${y}`;
}

export function getTile(tx, ty) {
  const k = key(tx, ty);
  if (tiles.has(k)) return tiles.get(k);

  const zone = isInRoom(tx, ty) ? "room" : "corridor";

  const tile = {
    confidence: 0,
    flickerSeed: Math.random() * 1000,
    zone,
    edges: {
      n: "unknown",
      e: "unknown",
      s: "unknown",
      w: "unknown",
    },
  };

  // Rooms are always open
  if (zone === "room") {
    tile.edges.n = "open";
    tile.edges.e = "open";
    tile.edges.s = "open";
    tile.edges.w = "open";
  }

  tiles.set(k, tile);
  return tile;
}
