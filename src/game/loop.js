import { keys } from "./input";
import { TILE_SIZE, getTile } from "./world/grid";

/* ======================
   CONFIG
====================== */

const OBSERVATION_RADIUS = 180;
const PASSIVE_GAIN = 0.04;
const ACTIVE_GAIN = 0.35;
const COLLAPSE_THRESHOLD = 0.85;

const PLAYER_RADIUS = 6; // physical radius (IMPORTANT)
const MAX_SPEED = 220;

const MINIMAP_RADIUS = 70;
const MINIMAP_PADDING = 12;


/* ======================
   STATE
====================== */

let animationId;
let lastTime = 0;

const pickups = new Map();

const playerStats = {
  speed: 50,
  points: 0,
};


const player = {
  x: 0,
  y: 0,
  speed: playerStats.speed,
};

const camera = { x: 0, y: 0 };

const worldBounds = {
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
};

const joystick = {
  active: false,
  id: null,
  baseX: 0,
  baseY: 0,
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
};

const JOYSTICK_RADIUS = 40;
const JOYSTICK_DEADZONE = 6;

const isTouchDevice = true;
  // "ontouchstart" in window || navigator.maxTouchPoints > 0;

/* ======================
   LOOP
====================== */

export function startLoop(ctx) {
  function frame(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    update(dt, ctx);
    render(ctx);

    animationId = requestAnimationFrame(frame);
  }
  animationId = requestAnimationFrame(frame);
  const canvas = ctx.canvas;

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);
  canvas.addEventListener("touchcancel", onTouchEnd);

}

export function stopLoop() {
  cancelAnimationFrame(animationId);
}

/* ======================
   UPDATE
====================== */

function update(dt, ctx) {
  // --- Movement intent ---
  let dx = 0;
  let dy = 0;

  // Keyboard
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;
  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;

  // Touch joystick overrides keyboard
  if (joystick.active) {
    dx = joystick.dx;
    dy = joystick.dy;
  }

  // Deadzone
  if (Math.hypot(dx, dy) < JOYSTICK_DEADZONE / JOYSTICK_RADIUS) {
    dx = 0;
    dy = 0;
  }


  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
  }

  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;

  // --- Hard collision resolution ---
  for (let i = 0; i < 3; i++) {
    resolveWallPenetration();
  }

  // Camera
  camera.x = player.x - window.innerWidth / 2;
  camera.y = player.y - window.innerHeight / 2;

  updateObservation(dt, ctx);
  checkPickupCollision();

}

/* ======================
   OBSERVATION
====================== */

function updateObservation(dt, ctx) {
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
   HARD COLLISION (KEY)
====================== */

function resolveWallPenetration() {
  const tx = Math.floor(player.x / TILE_SIZE);
  const ty = Math.floor(player.y / TILE_SIZE);

  // Check surrounding tiles
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tile = getTile(tx + dx, ty + dy);
      const baseX = (tx + dx) * TILE_SIZE;
      const baseY = (ty + dy) * TILE_SIZE;

      if (tile.edges.n === "wall")
        pushFromLine(
          baseX,
          baseY,
          baseX + TILE_SIZE,
          baseY,
          0,
          -1
        );

      if (tile.edges.s === "wall")
        pushFromLine(
          baseX,
          baseY + TILE_SIZE,
          baseX + TILE_SIZE,
          baseY + TILE_SIZE,
          0,
          1
        );

      if (tile.edges.w === "wall")
        pushFromLine(
          baseX,
          baseY,
          baseX,
          baseY + TILE_SIZE,
          -1,
          0
        );

      if (tile.edges.e === "wall")
        pushFromLine(
          baseX + TILE_SIZE,
          baseY,
          baseX + TILE_SIZE,
          baseY + TILE_SIZE,
          1,
          0
        );
    }
  }
}

function pushFromLine(x1, y1, x2, y2) {
  const px = player.x;
  const py = player.y;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return;

  // Closest point on segment
  let t =
    ((px - x1) * dx + (py - y1) * dy) / lenSq;

  t = Math.max(0, Math.min(1, t));

  const cx = x1 + t * dx;
  const cy = y1 + t * dy;

  const vx = px - cx;
  const vy = py - cy;
  const dist = Math.hypot(vx, vy);

  if (dist === 0 || dist >= PLAYER_RADIUS) return;

  const penetration = PLAYER_RADIUS - dist;

  // 🔑 PUSH DIRECTLY AWAY FROM THE WALL
  player.x += (vx / dist) * penetration;
  player.y += (vy / dist) * penetration;
}

function checkPickupCollision() {
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


/* ======================
   RENDER
====================== */

function render(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderGrid(ctx);
  renderPickups(ctx);
  renderPlayer(ctx);
  renderHUD(ctx);
  renderMiniMap(ctx);
  renderJoystick(ctx);
}

function renderGrid(ctx) {
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

function renderPickups(ctx) {
  ctx.fillStyle = "rgba(80,160,255,0.9)";

  for (const [key, pickup] of pickups.entries()) {
    if (pickup.collected) continue;

    const [tx, ty] = key.split(",").map(Number);

    const wx = tx * TILE_SIZE + TILE_SIZE / 2;
    const wy = ty * TILE_SIZE + TILE_SIZE / 2;

    const sx = Math.round(wx - camera.x);
    const sy = Math.round(wy - camera.y);

    const size = 6;

    ctx.beginPath();
    const pulse =
      Math.sin(performance.now() * 0.005 + tx * 10) * 1.5;
    ctx.moveTo(sx, sy - size - pulse);
    ctx.lineTo(sx - size, sy + size);
    ctx.lineTo(sx + size, sy + size);
    ctx.closePath();
    ctx.fill();
  }
}


function renderPlayer(ctx) {
  const x = Math.round(player.x - camera.x);
  const y = Math.round(player.y - camera.y);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS - 1, 0, Math.PI * 2);
  ctx.fill();
}

function renderHUD(ctx) {
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

function renderMiniMap(ctx) {
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

function renderJoystick(ctx) {
  if (!isTouchDevice || !joystick.active) return;

  ctx.save();

  // Base
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(joystick.baseX, joystick.baseY, JOYSTICK_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  // Thumb
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(joystick.x, joystick.y, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
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

/* ======================
   TOUCH INPUT
====================== */
function onTouchStart(e) {
  if (!isTouchDevice) return;

  for (const t of e.changedTouches) {
    // Only bottom-right quadrant
    if (t.clientX > window.innerWidth * 0.5 &&
        t.clientY > window.innerHeight * 0.5) {

      joystick.active = true;
      joystick.id = t.identifier;
      joystick.baseX = t.clientX;
      joystick.baseY = t.clientY;
      joystick.x = t.clientX;
      joystick.y = t.clientY;
      joystick.dx = 0;
      joystick.dy = 0;

      e.preventDefault();
      break;
    }
  }
}

function onTouchMove(e) {
  if (!joystick.active) return;

  for (const t of e.changedTouches) {
    if (t.identifier === joystick.id) {
      const dx = t.clientX - joystick.baseX;
      const dy = t.clientY - joystick.baseY;

      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, JOYSTICK_RADIUS);

      const nx = dist > 0 ? dx / dist : 0;
      const ny = dist > 0 ? dy / dist : 0;

      joystick.dx = nx * (clamped / JOYSTICK_RADIUS);
      joystick.dy = ny * (clamped / JOYSTICK_RADIUS);

      joystick.x = joystick.baseX + nx * clamped;
      joystick.y = joystick.baseY + ny * clamped;

      e.preventDefault();
      break;
    }
  }
}

function onTouchEnd(e) {
  for (const t of e.changedTouches) {
    if (t.identifier === joystick.id) {
      joystick.active = false;
      joystick.id = null;
      joystick.dx = 0;
      joystick.dy = 0;
      break;
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
