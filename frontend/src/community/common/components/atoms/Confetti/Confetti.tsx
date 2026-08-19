import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = [];
    const particleCount = 200;

    const colors = ["#D64550", "#EF8D42", "#2A61A0"];

    class ConfettiParticle {
      x: number;
      y: number;
      size: number;
      velocity: { x: number; y: number };
      color: string;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = canvas ? Math.random() * canvas.width : 0;
        this.y = canvas ? Math.random() * canvas.height - canvas.height : 0;
        this.size = Math.random() * 10 + 5;
        this.velocity = {
          x: Math.random() * 4 - 2,
          y: Math.random() * 6 + 12
        };
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;

        if (canvas && this.y > canvas.height) {
          const index = particles.indexOf(this);
          if (index > -1) particles.splice(index, 1);
        }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new ConfettiParticle());
    }

    let animationFrameId: number;
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: ZIndexEnums.MAX
      }}
    />,
    document.body
  );
};

export default Confetti;
