import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Search, MessageSquare, Zap, Check } from "lucide-react";

export function SmartMatching() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-32 text-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="md:w-1/2 mb-10">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Intelligent Connections
          </h2>
          <p className="text-xl text-neutral-400 font-light leading-relaxed">
            Stop searching for the right person. Our system automatically <span className="text-white font-medium">pairs you</span> with peers who have the skills you need and need the skills you have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Match Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-[#0A0A0B] p-8 h-[500px] relative overflow-hidden group hover:border-white/20 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Matching Visualization */}
            <div className="relative mt-12 flex justify-center items-center h-72 md:h-64">
                {/* User A */}
                <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.2 }}
                    className="absolute left-0 md:left-[6%] top-0 md:top-1/2 md:-translate-y-1/2 bg-[#1A1A1C] p-3 md:p-4 rounded-xl border border-white/10 w-36 md:w-48 shadow-2xl z-10"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">A</div>
                        <div>
                            <div className="text-sm font-medium">Alex</div>
                            <div className="text-[10px] text-neutral-500">Full Stack Dev</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Teaching</div>
                        <div className="flex flex-wrap gap-1">
                             <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">React</span>
                             <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">Node</span>
                        </div>
                    </div>
                </motion.div>

                 {/* Connection Line */}
                 <div className="absolute w-full flex justify-center items-center z-0">
                    <svg width="300" height="60" viewBox="0 0 300 60" overflow="visible" className="w-[250px] sm:w-[300px] max-w-none">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                        <motion.path 
                            d="M 0,30 C 100,30 100,30 150,30 S 200,30 300,30"
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
                        />
                        
                        {/* Pulse Effect */}
                        <motion.circle 
                            cx="150" cy="30" r="20" 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="1"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={isInView ? { scale: 1.5, opacity: [0, 0.5, 0] } : {}}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />

                        {/* Center Node */}
                        <motion.circle 
                            cx="150" cy="30" r="16" 
                            fill="#0A0A0B" 
                            stroke="#3b82f6" 
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={isInView ? { scale: 1 } : {}}
                            transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
                        />
                        <motion.g
                            initial={{ opacity: 0, scale: 0 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 1.2, type: "spring" }}
                        >
                            <Check x="138" y="20" className="w-4 h-4 text-blue-500" strokeWidth={3} />
                        </motion.g>
                    </svg>
                 </div>

                {/* User B */}
                <motion.div 
                    initial={{ x: 30, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.4 }}
                    className="absolute right-0 md:right-[6%] bottom-0 md:top-1/2 md:-translate-y-1/2 bg-[#1A1A1C] p-3 md:p-4 rounded-xl border border-white/10 w-36 md:w-48 shadow-2xl z-10"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-500 flex items-center justify-center font-bold">S</div>
                        <div>
                            <div className="text-sm font-medium">Sarah</div>
                            <div className="text-[10px] text-neutral-500">Data Scientist</div>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Learning</div>
                        <div className="flex flex-wrap gap-1">
                             <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20">React</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-20">
               <h3 className="text-xl font-medium mb-2 flex items-center gap-2 text-white">
                    Direct Value Exchange
               </h3>
               <p className="text-sm text-neutral-300 font-light leading-relaxed">
                  Alex teaches React to Sarah. Sarah pays in credits (or teaches Python later). No ambiguity, just pure skill swapping.
               </p>
            </div>
          </motion.div>

          {/* Chat/Direct Connection Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-[#0A0A0B] p-8 h-[500px] relative overflow-hidden flex flex-col justify-end group hover:border-white/20 transition-colors"
          >
             {/* Chat Interface Mockup */}
             <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4/5 space-y-4">
                 <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3"
                 >
                     <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex-shrink-0 flex items-center justify-center text-xs">A</div>
                     <div className="bg-[#1A1A1C] border border-white/10 p-3 rounded-2xl rounded-tl-sm text-sm text-neutral-300 shadow-sm">
                        Hi Sarah! I noticed you're looking for React help. I'm free this Tuesday.
                     </div>
                 </motion.div>
                 
                 <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                    className="flex gap-3 flex-row-reverse"
                 >
                     <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-500 flex-shrink-0 flex items-center justify-center text-xs">S</div>
                     <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-2xl rounded-tr-sm text-sm text-blue-100 shadow-sm">
                        That would be perfect! I have 300 credits ready to use. 
                     </div>
                 </motion.div>
                 
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 1.2 }}
                    className="mx-auto w-max mt-6 bg-[#1A1A1C] border border-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
                 >
                    <Check className="w-3 h-3" />
                    Session Confirmed
                 </motion.div>
             </div>

             <div className="relative z-20 mt-auto">
                <h3 className="text-xl font-medium mb-2 flex items-center gap-2 text-white">
                     Hassle-free Scheduling
                </h3>
                <p className="text-sm text-neutral-300 font-light leading-relaxed">
                   Once matched, coordinate directly. Our platform handles the credit transfer automatically when the session ends.
                </p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
