import { useEffect, useRef } from "react";
import { startLoop, stopLoop } from "./loop";
import { initInput } from "./input";

export default function Game() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    initInput();
    startLoop(ctx);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
