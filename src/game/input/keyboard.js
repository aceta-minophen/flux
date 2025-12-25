export const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

export function initInput() {
  window.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
  });
}
