// @ts-nocheck
import React, { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");

    let fontSize = 16;
    let columns;
    let rainDrops;

    const alphabet =
      "アァカサタナハマヤャラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      columns = Math.floor(canvas.width / fontSize);
      rainDrops = Array(columns).fill(1);
    };

    const draw = () => {
      // Fondo MUY suave (más elegante)
      context.fillStyle = "rgba(0, 0, 0, 0.15)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(
          Math.floor(Math.random() * alphabet.length)
        );

        // 🔥 Verde más oscuro y con alpha
        context.fillStyle =
          Math.random() > 0.985
            ? "rgba(255,255,255,0.8)"
            : "rgba(0, 230, 118, 0.35)";

        context.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (
          rainDrops[i] * fontSize > canvas.height &&
          Math.random() > 0.97
        ) {
          rainDrops[i] = 0;
        }

        rainDrops[i]++;
      }
    };

    let animationFrameId;

    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default MatrixRain;
