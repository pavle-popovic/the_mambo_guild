"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaMusic, FaCompactDisc, FaMicrophone } from "react-icons/fa";
import { GiSaxophone, GiTrumpet, GiGrandPiano } from "react-icons/gi";

export default function StarryBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Jazz Constellation Elements (Floating Icons)
    // We'll overlay these using Framer Motion for smoother complex movement than canvas if we want interaction,
    // but canvas is better for many items. We'll use a few "Hero" constellation items.

    useEffect(() => {
        if (typeof window === "undefined") return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let nebulas: Nebula[] = [];

        // Colors
        const colors = {
            mamboBlue: "rgba(59, 130, 246, 0.1)", // mambo-blue equivalent
            brass: "rgba(212, 175, 55, 0.1)", // brass DEFAULT
            deepSpace: "#0a0a0a",
        };

        const updateDimensions = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
            init();
        };

        class Star {
            x: number;
            y: number;
            size: number;
            opacity: number;
            speed: number;
            twinkleSpeed: number;
            bgHelper: boolean; // if true, it's a Note or simple visual

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 1.5;
                this.opacity = Math.random();
                this.speed = Math.random() * 0.05;
                this.twinkleSpeed = Math.random() * 0.02 + 0.005;
                this.bgHelper = Math.random() > 0.95; // 5% chance to be a music note
            }

            update() {
                this.opacity += this.twinkleSpeed;
                if (this.opacity > 1 || this.opacity < 0.3) {
                    this.twinkleSpeed = -this.twinkleSpeed;
                }
                this.y -= this.speed; // Slight upward drift
                if (this.y < 0) this.y = canvas!.height;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;

                if (this.bgHelper) {
                    // Draw tiny note
                    ctx.font = `${this.size * 8}px serif`;
                    ctx.fillText("♪", this.x, this.y);
                } else {
                    // Draw star
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        class Nebula {
            x: number;
            y: number;
            radius: number;
            color: string;
            vx: number;
            vy: number;

            constructor(color: string) {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.radius = Math.random() * 300 + 200;
                this.color = color;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges (softly)
                if (this.x < -200 || this.x > canvas!.width + 200) this.vx *= -1;
                if (this.y < -200 || this.y > canvas!.height + 200) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, "transparent");

                ctx.fillStyle = gradient;
                ctx.globalCompositeOperation = "screen"; // Additive blending for glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = "source-over"; // Reset
            }
        }

        const init = () => {
            stars = [];
            nebulas = []; // Reset on resize

            // Create Stars
            for (let i = 0; i < 200; i++) {
                stars.push(new Star());
            }

            // Create Nebulas (Mambo Blue & Brass)
            // Create Nebulas (Mambo Blue & Brass) - More Gas!
            for (let i = 0; i < 5; i++) {
                nebulas.push(new Nebula(colors.mamboBlue));
                nebulas.push(new Nebula(colors.brass));
            }
        };

        const animate = () => {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Nebulas
            nebulas.forEach(n => {
                n.update();
                n.draw();
            });

            // Draw Stars
            stars.forEach(s => {
                s.update();
                s.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener("resize", updateDimensions);
        updateDimensions();
        animate();

        return () => {
            window.removeEventListener("resize", updateDimensions);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Floating Jazz Elements
    const floatingIcons = [
        { Icon: GiSaxophone, color: "text-mambo-gold", size: "text-9xl", top: "20%", left: "80%", delay: 0 },
        { Icon: GiTrumpet, color: "text-mambo-gold", size: "text-8xl", top: "60%", left: "10%", delay: 2 },
        { Icon: GiGrandPiano, color: "text-mambo-blue", size: "text-[10rem]", top: "80%", left: "70%", delay: 4 },
        { Icon: FaMicrophone, color: "text-mambo-gold", size: "text-7xl", top: "15%", left: "20%", delay: 1 },
        { Icon: FaCompactDisc, color: "text-mambo-blue", size: "text-6xl", top: "40%", left: "90%", delay: 3 },
    ];

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-mambo-dark">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

            {/* Art Deco Floating Elements (Constellations) */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {floatingIcons.map((item, index) => (
                    <motion.div
                        key={index}
                        animate={{
                            rotate: [0, 5, -5, 0],
                            y: [0, 20, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 10 + index, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                        className={`absolute ${item.color} ${item.size} blur-sm`}
                        style={{ top: item.top, left: item.left }}
                    >
                        <item.Icon />
                    </motion.div>
                ))}

                {/* Random Notes */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={`note-${i}`}
                        animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
                        className="absolute text-mambo-text text-4xl blur-[1px]"
                        style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`
                        }}
                    >
                        <FaMusic />
                    </motion.div>
                ))}

                {/* Constellation Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                    <line x1="10%" y1="10%" x2="20%" y2="20%" stroke="#D4AF37" strokeWidth="1" />
                    <circle cx="10%" cy="10%" r="2" fill="#D4AF37" />
                    <circle cx="20%" cy="20%" r="2" fill="#D4AF37" />

                    <line x1="80%" y1="80%" x2="70%" y2="60%" stroke="#3b82f6" strokeWidth="1" />
                    <circle cx="80%" cy="80%" r="2" fill="#3b82f6" />
                    <circle cx="70%" cy="60%" r="2" fill="#3b82f6" />
                </svg>
            </div>
        </div>
    );
}
