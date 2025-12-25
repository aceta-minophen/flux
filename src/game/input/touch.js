export function onTouchStart(e) {
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

export function onTouchMove(e) {
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

export function onTouchEnd(e) {
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