"use client"; // This is a client component

import GameController from "./game/GameController";
import React, { useRef, useEffect } from 'react';

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const GC = new GameController(canvasRef.current)
  }, [])

  return (
    <div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <canvas id="render-canvas" ref={canvasRef}></canvas>
      </main>
    </div>);
}
