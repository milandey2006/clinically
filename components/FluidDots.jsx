"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function FluidDots() {
    const canvasRef = useRef(null);
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let mouseX = -1000;
        let mouseY = -1000;

        const currentTheme = theme === 'system' ? systemTheme : theme;
        const isDark = currentTheme === 'dark';

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        handleResize();

        const dots = [];
        const spacing = 50;
        const rows = Math.ceil(window.innerHeight / spacing);
        const cols = Math.ceil(window.innerWidth / spacing);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                dots.push({
                    x: i * spacing,
                    y: j * spacing,
                    baseX: i * spacing,
                    baseY: j * spacing,
                    vx: 0,
                    vy: 0,
                });
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Drawing
            ctx.fillStyle = isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(66, 133, 244, 0.5)"; // Lighter blue for dark mode

            dots.forEach((dot) => {
                const dx = mouseX - dot.x;
                const dy = mouseY - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 300;

                // Physics
                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * 5; // Push strength
                    const directionY = forceDirectionY * force * 5;

                    dot.vx -= directionX;
                    dot.vy -= directionY;
                }

                // Friction and Return to base
                const friction = 0.9;
                const returnSpeed = 0.1;

                dot.vx *= friction;
                dot.vy *= friction;

                dot.x += dot.vx;
                dot.y += dot.vy;

                const returnX = (dot.baseX - dot.x) * returnSpeed;
                const returnY = (dot.baseY - dot.y) * returnSpeed;

                dot.x += returnX;
                dot.y += returnY;

                // Draw dot
                let size = 1.5;
                if (distance < 200) {
                    size = 1.5 + (200 - distance) / 100;
                }

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Regenerate dots on resize
        const regenerateDots = () => {
            dots.length = 0;
            const rows = Math.ceil(canvas.height / spacing);
            const cols = Math.ceil(canvas.width / spacing);
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push({
                        x: i * spacing,
                        y: j * spacing,
                        baseX: i * spacing,
                        baseY: j * spacing,
                        vx: 0,
                        vy: 0,
                    });
                }
            }
        };

        window.removeEventListener("resize", handleResize);
        window.addEventListener("resize", () => {
            handleResize();
            regenerateDots();
        });

        regenerateDots();
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, systemTheme, mounted]);

    if (!mounted) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none bg-white dark:bg-gray-950 transition-colors duration-500"
        />
    );
}
