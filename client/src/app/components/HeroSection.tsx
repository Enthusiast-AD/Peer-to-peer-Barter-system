import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroDashboard } from "./HeroDashboard";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const fadeOut = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center pt-28 sm:pt-32 pb-20 sm:pb-32 overflow-hidden bg-[#050505] text-white"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505]" />

        {/* Ambient glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] bg-blue-600/[0.07] rounded-full blur-[140px]" />

        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 0.5 }}
            animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.5, 1, 0.5] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ opacity: fadeOut, y }}
        className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-5xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-blue-500/20 blur-3xl rounded-full opacity-20" />
          <h1 className="relative text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 sm:mb-8 bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Exchange Skills. <br />
            <span className="text-white">Grow Together.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 sm:mb-12 font-light leading-relaxed px-2"
        >
          A community-driven platform where knowledge is the only currency.
          Teach what you know, earn credits, and master new skills from real experts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-14 sm:mb-20 w-full sm:w-auto"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-all text-sm flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto h-12 px-8 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
          >
            How it works
          </button>
        </motion.div>
      </motion.div>

      {/* Interactive Dashboard Preview */}
      <motion.div
        style={{ scale }}
        className="container mx-auto px-4 relative z-10 w-full max-w-7xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-x-4 -inset-y-8 bg-blue-500/10 blur-3xl rounded-[3rem] -z-10" />
          <HeroDashboard />
        </motion.div>
      </motion.div>
    </section>
  );
}
