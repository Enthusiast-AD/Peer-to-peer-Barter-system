import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ChevronDown, Calendar, Search, Users, Video, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const fadeOut = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section ref={ref} className="relative min-h-[140vh] flex flex-col items-center pt-32 pb-40 overflow-hidden bg-[#050505] text-white">
      {/* Background with stars/grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505]" />
         
         {/* Subtle Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
         
         {/* Stars */}
         {[...Array(20)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0.1, scale: 0.5 }}
              animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.5, 1, 0.5] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
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
          <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Exchange Skills. <br />
            <span className="text-white">Grow Together.</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 font-light leading-relaxed"
        >
          A community-driven platform where knowledge is the only currency. 
          Teach what you know, earn credits, and master new skills from real experts.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-24"
        >
           <Link to="/signup">
             <button className="h-12 px-8 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-all text-sm flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
               Get Started
               <ArrowRight className="w-4 h-4 ml-2" />
             </button>
           </Link>
           <button 
             onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
             className="h-12 px-8 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
           >
             How it works
           </button>
        </motion.div>
      </motion.div>

      {/* Hero Image / Dashboard Mockup */}
      <motion.div
        style={{ scale }} 
        className="container mx-auto px-4 relative z-10 w-full max-w-7xl"
      >
        <motion.div 
           initial={{ opacity: 0, y: 100, rotateX: 20 }}
           animate={{ opacity: 1, y: 0, rotateX: 0 }}
           transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
           className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#000000] border border-neutral-800 aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/10] group"
        >
           <div className="flex h-full text-white font-sans">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-64 border-r border-neutral-800 p-6 bg-black">
                <div className="flex items-center gap-2 mb-10">
                   <img src="/peersyLogo.png" alt="Peersy" className="w-8 h-8 object-contain" />
                   <span className="font-semibold text-lg tracking-tight">Peersy</span>
                </div>
                
                <div className="flex flex-col gap-1 mb-auto">
                   <div className="px-4 py-3 rounded-lg bg-[#1A1A1A] text-white text-sm font-medium flex items-center gap-3">
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-white rounded-[1px]"/><div className="bg-white rounded-[1px]"/><div className="bg-white rounded-[1px]"/><div className="bg-white rounded-[1px]"/></div>
                      Dashboard
                   </div>
                   <div className="px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors text-sm font-medium flex items-center gap-3">
                      <Users className="w-4 h-4" />
                      Skill Profile
                   </div>
                   <div className="px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors text-sm font-medium flex items-center gap-3">
                      <Search className="w-4 h-4" />
                      Find Matches
                   </div>
                   <div className="px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors text-sm font-medium flex items-center gap-3">
                      <Video className="w-4 h-4" />
                      Sessions
                   </div>
                   <div className="px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors text-sm font-medium flex items-center gap-3">
                      <div className="w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-current rounded-full">C</div>
                      Credits
                   </div>
                </div>

                <div className="mt-auto border-t border-neutral-800 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-medium">a</div>
                        <div>
                             <div className="text-sm font-medium text-white">ansh</div>
                             <div className="text-xs text-neutral-500">ansh@gmail.com</div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 bg-black overflow-hidden relative">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h2 className="text-3xl font-semibold mb-1">Good Evening, ansh</h2>
                       <p className="text-neutral-400">Ready to learn something new today?</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg border border-neutral-700 text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Find Match
                        </button>
                    </div>
                 </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-4 gap-6 mb-8">
                     {/* Card 1 */}
                     <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 relative group hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 text-xs font-bold">C</div>
                            <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">259</div>
                        <div className="text-xs text-neutral-500">Total Credits</div>
                     </div>
                     {/* Card 2 */}
                     <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 relative group hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <Users className="w-5 h-5 text-neutral-400" />
                            <span className="text-[10px] text-neutral-500">Current</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">4</div>
                        <div className="text-xs text-neutral-500">Active Sessions</div>
                     </div>
                     {/* Card 3 */}
                     <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 relative group hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <Video className="w-5 h-5 text-neutral-400" />
                            <span className="text-[10px] text-neutral-500">All time</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">7</div>
                        <div className="text-xs text-neutral-500">Completed</div>
                     </div>
                     {/* Card 4 */}
                     <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 relative group hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <TrendingUp className="w-5 h-5 text-neutral-400" />
                            <span className="text-[10px] text-neutral-500">This week</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">25</div>
                        <div className="text-xs text-neutral-500">Profile Views</div>
                     </div>
                 </div>

                 <div className="grid grid-cols-3 gap-8">
                     {/* Main Column */}
                     <div className="col-span-2 space-y-8">
                         {/* Upcoming Session */}
                         <div className="bg-gradient-to-r from-[#111111] to-[#0A0A0A] border border-neutral-800 rounded-xl p-6 flex justify-between items-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                             <div>
                                 <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                                     <Clock className="w-3 h-3" />
                                     Upcoming Session
                                 </div>
                                 <h3 className="text-xl font-bold mb-1">Python Basics with Sarah</h3>
                                 <div className="text-sm text-neutral-500">Today, 3:00 PM • 60 mins</div>
                             </div>
                             <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors relative z-10">
                                 Join Meeting
                             </button>
                         </div>

                         {/* Learning Path */}
                         <div>
                             <div className="flex items-center gap-2 text-sm font-medium mb-4 text-neutral-300 cursor-pointer hover:text-white transition-colors">
                                 Learning Path <ArrowRight className="w-3 h-3" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 bg-blue-900/20 text-blue-500 rounded-lg flex items-center justify-center font-bold text-xs">JS</div>
                                         <div>
                                            <div className="font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors">JavaScript Fundamentals</div>
                                            <div className="h-1 w-24 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full w-2/3 bg-blue-600 rounded-full" />
                                            </div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 bg-green-900/20 text-green-500 rounded-lg flex items-center justify-center font-bold text-xs">Py</div>
                                         <div>
                                            <div className="font-medium text-sm mb-1 group-hover:text-green-400 transition-colors">Python Data Science</div>
                                            <div className="h-1 w-24 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full w-1/3 bg-green-600 rounded-full" />
                                            </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Right Sidebar Activity */}
                     <div className="col-span-1 bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 h-full">
                         <h3 className="text-sm font-medium mb-6">Recent Activity</h3>
                         <div className="relative pl-4 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-[2px] before:bg-neutral-800">
                             <div className="relative">
                                 <div className="absolute -left-[16px] top-1 w-3 h-3 rounded-full border-2 border-neutral-600 bg-black" />
                                 <div className="text-xs font-medium text-white mb-0.5">Completed session</div>
                                 <div className="text-[10px] text-neutral-400 mb-1">React Hooks Masterclass</div>
                                 <div className="text-[10px] text-neutral-600">2 hours ago</div>
                             </div>
                             <div className="relative">
                                 <div className="absolute -left-[16px] top-1 w-3 h-3 rounded-full border-2 border-neutral-700 bg-black" />
                                 <div className="text-xs font-medium text-white mb-0.5">New match request</div>
                                 <div className="text-[10px] text-neutral-400 mb-1">Alex wants to learn Figma</div>
                                 <div className="text-[10px] text-neutral-600">5 hours ago</div>
                             </div>
                             <div className="relative">
                                 <div className="absolute -left-[16px] top-1 w-3 h-3 rounded-full border-2 border-green-900 bg-black" />
                                 <div className="text-xs font-medium text-white mb-0.5">Earned 50 Credits</div>
                                 <div className="text-[10px] text-neutral-400 mb-1">Teaching Web Design</div>
                                 <div className="text-[10px] text-neutral-600">Yesterday</div>
                             </div>
                         </div>
                     </div>
                 </div>

              </div>
           </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
