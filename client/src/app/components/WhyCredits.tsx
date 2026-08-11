import { motion } from "motion/react";
import { useState, useRef } from "react";
import { useInView } from "./useInView";
import {
  ArrowRight,
  Users,
  Repeat,
  Sparkles,
  Coins,
  Scale,
  Infinity as InfinityIcon,
  CheckCircle2,
} from "lucide-react";

function BenefitCard({
  benefit,
  index,
  inView,
}: {
  benefit: any;
  index: number;
  inView: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group cursor-default"
    >
      <div className="glass-strong rounded-3xl p-8 h-full border border-white/5 bg-neutral-900/40 relative overflow-hidden transition-all duration-500 group-hover:border-white/20 group-hover:bg-neutral-900/60 shadow-2xl">
        {/* Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${benefit.glow}, transparent 40%)`,
          }}
        />

        <div className="relative z-10">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{
              rotate: { duration: 1.5, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 300, damping: 20 },
            }}
            className={`w-16 h-16 rounded-2xl bg-white/5 ${benefit.color} flex items-center justify-center mb-6 group-hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20`}
          >
            <benefit.icon className="w-8 h-8" />
          </motion.div>

          <h3 className="text-2xl text-white font-bold mb-3 group-hover:text-brand-primary transition-colors">
            {benefit.title}
          </h3>

          <p className="text-neutral-400 text-base leading-relaxed font-medium">
            {benefit.description}
          </p>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${benefit.color} opacity-50`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              Verified System Benefit
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function WhyCredits() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="py-24 bg-neutral-950 relative overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-brand-primary/20 bg-brand-primary/5">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span className="text-brand-primary text-xs font-black tracking-widest uppercase">
              Value System
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl mb-6 text-white tracking-tighter font-black">
            Why Credits{" "}
            <span className="text-primary">
              Work.
            </span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
            A fair, decentralized economy built on mutual value exchange and
            shared knowledge.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Credit flow diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-strong rounded-[40px] p-8 md:p-16 mb-16 border border-white/10 bg-neutral-900/60 relative overflow-hidden shadow-2xl"
          >
            <div className="grid md:grid-cols-3 gap-12 items-center relative z-10">
              {/* Student A */}
              <motion.div
                animate={inView ? { y: [0, -10, 0] } : {}}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-center group"
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full scale-150 group-hover:bg-brand-primary/40 transition-colors duration-500" />
                  <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center relative z-10 shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500">
                    <Users className="w-16 h-16 text-neutral-950" />
                  </div>
                </div>
                <div className="text-white text-2xl font-black tracking-tight mb-1">
                  Student A
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-3">
                  Professional Dev
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-brand-primary font-black">
                    + 25 CREDITS
                  </span>
                </div>
              </motion.div>

              {/* Central Exchange Logic */}
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-center w-full">
                  <motion.div
                    animate={{ x: [0, 20, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-16 h-16 text-brand-primary" />
                  </motion.div>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-neutral-950/80 border border-white/5 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-5 h-5 text-brand-primary animate-spin-slow" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
                      Skills Exchange
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-full">
                  <motion.div
                    animate={{ x: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  >
                    <ArrowRight className="w-16 h-16 text-brand-secondary rotate-180" />
                  </motion.div>
                </div>
              </div>

              {/* Student B */}
              <motion.div
                animate={inView ? { y: [0, 10, 0] } : {}}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="text-center group"
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-brand-secondary/20 blur-2xl rounded-full scale-150 group-hover:bg-brand-secondary/40 transition-colors duration-500" />
                  <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-brand-secondary to-purple-600 flex items-center justify-center relative z-10 shadow-2xl -rotate-3 group-hover:rotate-0 transition-all duration-500">
                    <Users className="w-16 h-16 text-neutral-950" />
                  </div>
                </div>
                <div className="text-white text-2xl font-black tracking-tight mb-1">
                  Student B
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-brand-secondary mb-3">
                  Creative Designer
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-brand-secondary font-black">
                    - 25 CREDITS
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Subtext info */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center">
              <p className="text-neutral-500 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                In this ecosystem, <span className="text-white">Student A</span>{" "}
                earns credits by sharing expertise, which they then use to learn
                from <span className="text-white">Student B</span>. No cash,
                just knowledge.
              </p>
            </div>
          </motion.div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Coins,
                title: "No Money Required",
                description:
                  "Learn premium skills without spending real money. Use your expertise as currency.",
                color: "text-amber-400",
                glow: "rgba(251, 191, 36, 0.15)",
              },
              {
                icon: Scale,
                title: "Fair Exchange",
                description:
                  "Everyone's knowledge has equal value. Credits ensure a balanced ecosystem for all.",
                color: "text-blue-400",
                glow: "rgba(96, 165, 250, 0.15)",
              },
              {
                icon: InfinityIcon,
                title: "Self-Sustaining",
                description:
                  "Teach to earn, learn to grow - a limitless cycle of knowledge sharing and community.",
                color: "text-purple-400",
                glow: "rgba(192, 132, 252, 0.15)",
              },
            ].map((benefit, idx) => (
              <BenefitCard
                key={idx}
                benefit={benefit}
                index={idx}
                inView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
