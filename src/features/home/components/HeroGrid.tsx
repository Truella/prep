"use client";

import { useEffect, useRef } from "react";

const DOT_SPACING = 28;
const IMPACT_RADIUS = 100;
const REST_ALPHA = 0.3;
const EFFECT_DURATION = 600;
const THEME_TRANSITION_DURATION = 300;

function resolveColor(value: string): [number, number, number] | null {
  const resolver = document.createElement("canvas");
  resolver.width = 1;
  resolver.height = 1;
  const resolverContext = resolver.getContext("2d");
  if (!resolverContext) return null;

  resolverContext.fillStyle = "#010203";
  resolverContext.fillStyle = value;
  resolverContext.fillRect(0, 0, 1, 1);
  const resolved = resolverContext.getImageData(0, 0, 1, 1).data;
  return [resolved[0], resolved[1], resolved[2]];
}

function colorString([red, green, blue]: [number, number, number]) {
  return `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
}

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
    const initialColor: [number, number, number] = [153, 153, 168];
    let colorFrom = initialColor;
    let colorTo = initialColor;
    let colorTransitionStarted = -Infinity;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let visible = true;
    let running = false;
    let effect = 0;
    let effectTarget = 0;

    const draw = (elapsed: number) => {
      context.clearRect(0, 0, width, height);
      const colorProgress = Math.min(
        1,
        Math.max(0, (elapsed - colorTransitionStarted) / THEME_TRANSITION_DURATION),
      );
      const resolvedColor: [number, number, number] = [
        colorFrom[0] + (colorTo[0] - colorFrom[0]) * colorProgress,
        colorFrom[1] + (colorTo[1] - colorFrom[1]) * colorProgress,
        colorFrom[2] + (colorTo[2] - colorFrom[2]) * colorProgress,
      ];
      context.fillStyle = colorString(resolvedColor);

      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          const proximity = Math.max(0, 1 - distance / IMPACT_RADIUS);
          const falloff = proximity * proximity * (3 - 2 * proximity);
          const strength = falloff * effect;
          const wobble = strength * 7.5;
          const angle = elapsed / 150 + (x + y) * 0.025;

          context.beginPath();
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
      startAnimation();
    };

    const clearPointer = () => {
      effectTarget = 0;
      startAnimation();
    };

    const updateColor = () => {
      const nextColor = resolveColor(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-text-secondary")
          .trim(),
      );
      if (!nextColor) return;

      const now = performance.now();
      if (reducedMotion) {
        colorFrom = nextColor;
        colorTo = nextColor;
        colorTransitionStarted = now - THEME_TRANSITION_DURATION;
        draw(now);
        return;
      }

      const progress = Math.min(
        1,
        Math.max(0, (now - colorTransitionStarted) / THEME_TRANSITION_DURATION),
      );
      colorFrom = [
        colorFrom[0] + (colorTo[0] - colorFrom[0]) * progress,
        colorFrom[1] + (colorTo[1] - colorFrom[1]) * progress,
        colorFrom[2] + (colorTo[2] - colorFrom[2]) * progress,
      ];
      colorTo = nextColor;
      colorTransitionStarted = now;

      if (visible) startAnimation();
      else draw(now);
    };

    const animate = (time: number) => {
      const delta = Math.min(time - lastFrame, 50);
      lastFrame = time;
      effect += (effectTarget - effect) * (1 - Math.exp(-delta / (EFFECT_DURATION / 4)));
      if (Math.abs(effectTarget - effect) < 0.001) effect = effectTarget;
      draw(time);

      const effectSettled = effect === effectTarget;
      const colorSettled = time - colorTransitionStarted >= THEME_TRANSITION_DURATION;
      if (visible && (!effectSettled || !colorSettled)) {
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
    updateColor();
    resize();
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement ?? canvas);
    visibilityObserver.observe(canvas.parentElement ?? canvas);
    window.addEventListener("theme-change", updateColor);

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
      window.removeEventListener("theme-change", updateColor);
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
