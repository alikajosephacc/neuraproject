import React, { useRef, useCallback } from 'react';

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

/**
 * ClickSpark (from React Bits)
 * Renders high-performance canvas spark particles radiating on user interaction.
 * Clean physical hardware feedback for buttons, answers, and checks.
 */
export const ClickSpark: React.FC<ClickSparkProps> = ({
  children,
  sparkColor = '#10b981',
  sparkSize = 10,
  sparkRadius = 24,
  sparkCount = 8,
  duration = 450,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparksRef.current = sparksRef.current.filter((spark) => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= duration) return false;

      const progress = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const distance = easeOut * sparkRadius;
      const opacity = 1 - progress;

      const currentX = spark.x + Math.cos(spark.angle) * distance;
      const currentY = spark.y + Math.sin(spark.angle) * distance;

      ctx.save();
      ctx.beginPath();
      ctx.arc(currentX, currentY, (1 - progress) * (sparkSize / 2), 0, 2 * Math.PI);
      ctx.fillStyle = sparkColor;
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.restore();

      return true;
    });

    if (sparksRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  }, [duration, sparkColor, sparkRadius, sparkSize]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount + (Math.random() - 0.5) * 0.4,
      startTime: now,
    }));

    sparksRef.current.push(...newSparks);

    if (!animationFrameRef.current || sparksRef.current.length === newSparks.length) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="pointer-events-none absolute inset-0 z-50 h-full w-full overflow-visible"
      />
      {children}
    </div>
  );
};
