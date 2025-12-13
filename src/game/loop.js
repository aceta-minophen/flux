import { keys } from "./input";
import { TILE_SIZE, getTile } from "./world/grid";


/* ======================
   GAME STATE
====================== */

let animationId;
let lastTime = 0;

const player = {
  x: 100,
  y: 100,
  speed: 200, // pixels per second
};

const camera = {
  x: 0,
  y: 0,
};

const OBSERVATION_RADIUS = 180; // pixels
const PASSIVE_GAIN = 0.05;     // per second
const ACTIVE_GAIN = 0.4;       // per second

const COLLAPSE_THRESHOLD = 0.85;

const TILE_TYPES = [
  { type: "empty", weight: 0.7 },
  { type: "wall", weight: 0.3 },
];


/* ======================
   LOOP CONTROL
====================== */

export function startLoop(ctx) {
  function frame(time) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    update(delta, ctx);
    render(ctx);

    animationId = requestAnimationFrame(frame);
  }

  animationId = requestAnimationFrame(frame);
}

export function stopLoop() {
  cancelAnimationFrame(animationId);
}

/* ======================
   UPDATE
====================== */

function update(dt, ctx) {
  // Movement
  if (keys.w) player.y -= player.speed * dt;
  if (keys.s) player.y += player.speed * dt;
  if (keys.a) player.x -= player.speed * dt;
  if (keys.d) player.x += player.speed * dt;

  const tx = Math.floor(player.x / TILE_SIZE);
  const ty = Math.floor(player.y / TILE_SIZE);
  const tile = getTile(tx, ty);

  if (tile.collapsed && tile.type === "wall") {
    // simple rollback (cheap & effective)
    if (keys.w) player.y += player.speed * dt;
    if (keys.s) player.y -= player.speed * dt;
    if (keys.a) player.x += player.speed * dt;
    if (keys.d) player.x -= player.speed * dt;
  }

  // Camera follows player
  camera.x = player.x - window.innerWidth / 2;
  camera.y = player.y - window.innerHeight / 2;

  updateObservation(dt, ctx);

}

/* ======================
   RENDER
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

      const tileCenterX = tx * TILE_SIZE + TILE_SIZE / 2;
      const tileCenterY = ty * TILE_SIZE + TILE_SIZE / 2;

      const d = distance(
        player.x,
        player.y,
        tileCenterX,
        tileCenterY
      );

      if (d < OBSERVATION_RADIUS) {
        const factor = 1 - d / OBSERVATION_RADIUS;
        tile.confidence += ACTIVE_GAIN * factor * dt;
      } else if (d < OBSERVATION_RADIUS * 1.8) {
        tile.confidence += PASSIVE_GAIN * dt;
      }

      tile.confidence = Math.min(tile.confidence, 1);

      if (!tile.collapsed && tile.confidence >= COLLAPSE_THRESHOLD) {
        tile.collapsed = true;
        tile.type = resolveTileType();
      }

    }
  }
}



function render(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderGrid(ctx);
  renderPlayer(ctx);

  // ctx.strokeStyle = "rgba(233, 24, 24, 1)";
  // ctx.beginPath();
  // ctx.arc(
  //   ctx.canvas.width / 2,
  //   ctx.canvas.height / 2,
  //   OBSERVATION_RADIUS,
  //   0,
  //   Math.PI * 2
  // );
  // ctx.stroke();


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

      const wx = tx * TILE_SIZE;
      const wy = ty * TILE_SIZE;
      const { x, y } = worldToScreen(wx, wy);
      const sx = Math.round(x);
      const sy = Math.round(y);

      if (tile.collapsed) {
        if (tile.type === "wall") {
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
        }
      } else {
        const instability = 1 - tile.confidence;

        const flicker =
          0.02 +
          Math.abs(
            Math.sin(performance.now() * 0.003 + tile.flickerSeed)
          ) *
            instability *
            0.3;

        ctx.strokeStyle = `rgba(255,255,255,${flicker})`;
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
      }

    }
  }
}


function renderPlayer(ctx) {
  const { x, y } = worldToScreen(player.x, player.y);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

/* ======================
   HELPERS
====================== */

function worldToScreen(wx, wy) {
  return {
    x: wx - camera.x,
    y: wy - camera.y,
  };
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function resolveTileType() {
  const r = Math.random();
  let acc = 0;

  for (const t of TILE_TYPES) {
    acc += t.weight;
    if (r <= acc) return t.type;
  }

  return TILE_TYPES[0].type;
}
