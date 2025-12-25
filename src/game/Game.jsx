import { useEffect, useRef } from "react";
import { startLoop, stopLoop } from "./index";
import { initInput } from "./input/keyboard";

export default function Game() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // --- DPR-aware resize (fixes grey edges) ---
    function resize() {
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);

      // Reset + scale correctly (no accumulation)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    // --- Input ---
    initInput();
    startLoop(ctx);

    // --- Enter fullscreen on first touch (mobile only) ---
    function enterFullscreen() {
      const el = document.documentElement;

      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

      // iOS Safari fallback: force resize after UI hides
      setTimeout(resize, 300);

      window.removeEventListener("touchstart", enterFullscreen);
    }

    window.addEventListener("touchstart", enterFullscreen, {
      once: true,
      passive: true,
    });

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("touchstart", enterFullscreen);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        background: "black",
        touchAction: "none", // prevents scroll / zoom gestures
      }}
    />
  );
}
