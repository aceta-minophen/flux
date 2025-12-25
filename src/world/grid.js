import { TILE_SIZE, ROOM_COUNT } from "../game/configs";

// Infinite tile store
const tiles = new Map();


/* ======================
   ROOM GENERATION
====================== */

const rooms = [];

function createRoom(id, cx, cy, w, h) {
  rooms.push({ id, cx, cy, w, h });
}


function getRoomAt(tx, ty) {
  return rooms.find(
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
    const w = 5 + Math.floor(Math.random() * 4);
    const h = 5 + Math.floor(Math.random() * 4);

    const cx = Math.floor(Math.random() * 50) - 25;
    const cy = Math.floor(Math.random() * 50) - 25;

    createRoom(i + 1, cx, cy, w, h); // room numbers start at 1
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

  const room = getRoomAt(tx, ty);
  const zone = room ? "room" : "corridor";

  const tile = {
    confidence: 0,
    flickerSeed: Math.random() * 1000,
    zone,
    roomId: room ? room.id : null,
    edges: {
      n: "unknown",
      e: "unknown",
      s: "unknown",
      w: "unknown",
    },
  };

  if (room) {
    const left   = tx === room.cx;
    const right  = tx === room.cx + room.w - 1;
    const top    = ty === room.cy;
    const bottom = ty === room.cy + room.h - 1;

    tile.edges.n = top    ? "wall" : "open";
    tile.edges.s = bottom ? "wall" : "open";
    tile.edges.w = left   ? "wall" : "open";
    tile.edges.e = right  ? "wall" : "open";
  }


  tiles.set(k, tile);
  return tile;
}

export function getAllRooms() {
  return rooms;
}
