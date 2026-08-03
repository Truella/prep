"use client";

import { useEffect, useRef } from "react";

const DOT_SPACING = 28;
const IMPACT_RADIUS = 100;
const REST_ALPHA = 0.3;
const EFFECT_DURATION = 600;

export default function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -Infinity, y: -Infinity };
    let width = 0;
    let height = 0;
    let color = "#9999A8";
    let animationFrame = 0;
    let lastFrame = performance.now();
    let visible = true;
    let running = false;
    let effect = 0;
    let effectTarget = 0;

    const draw = (elapsed: number) => {
      context.clearRect(0, 0, width, height);

      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          const proximity = Math.max(0, 1 - distance / IMPACT_RADIUS);
          const falloff = proximity * proximity * (3 - 2 * proximity);
          const strength = falloff * effect;
          const wobble = strength * 1.8;
          const angle = elapsed / 280 + (x + y) * 0.025;

          context.beginPath();
          context.fillStyle = color;
          context.globalAlpha = REST_ALPHA + strength * 0.3;
          context.arc(
            x + Math.cos(angle) * wobble,
            y + Math.sin(angle) * wobble,
            1.25 + strength * 1.1,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }

      context.globalAlpha = 1;
    };

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const bounds = canvas.parentElement?.getBoundingClientRect();
      width = bounds?.width ?? window.innerWidth;
      height = bounds?.height ?? window.innerHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(0);
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const insideHero =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (insideHero) {
        pointer.x = event.clientX - bounds.left;
        pointer.y = event.clientY - bounds.top;
        effectTarget = 1;
      } else {
        effectTarget = 0;
      }
    };

    const clearPointer = () => {
      effectTarget = 0;
    };

    const updateColor = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--color-text-secondary").trim() || color;
      if (reducedMotion || !visible) draw(0);
    };

    const animate = (time: number) => {
      const delta = Math.min(time - lastFrame, 50);
      lastFrame = time;
      effect += (effectTarget - effect) * (1 - Math.exp(-delta / (EFFECT_DURATION / 4)));
      draw(time);

      if (visible) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        running = false;
      }
    };

    const startAnimation = () => {
      if (reducedMotion || running || !visible) return;

      running = true;
      lastFrame = performance.now();
      animationFrame = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      cancelAnimationFrame(animationFrame);
      running = false;
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0 },
    );
    const themeObserver = new MutationObserver(updateColor);

    updateColor();
    resize();
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement ?? canvas);
    visibilityObserver.observe(canvas.parentElement ?? canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (!reducedMotion) {
      window.addEventListener("pointermove", updatePointer, { passive: true });
      window.addEventListener("pointerleave", clearPointer);
      startAnimation();
    }

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", clearPointer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 size-full max-w-full pointer-events-none"
    />
  );
}
