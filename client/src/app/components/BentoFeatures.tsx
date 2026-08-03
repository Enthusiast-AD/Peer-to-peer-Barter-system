import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { 
  LineChart, 
  Wallet, 
  Bell, 
  Command, 
  Search, 
  MessageSquare, 
  Calendar,
  Video,
  Shield,
  Zap,
  Users
} from "lucide-react";

const BentoCard = ({ children, className, title, description, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={`group relative overflow-hidden rounded-2xl bg-[#0A0A0B] border border-white/5 p-8 ${className}`}
    >
      <div className="relative z-10 h-full flex flex-col">
        {children}
        <div className="mt-auto pt-6">
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          <p className="text-sm text-neutral-400 leading-relaxed font-light">{description}</p>
        </div>
      </div>
      
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

export function BentoFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="features" className="bg-black py-32 text-white relative overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-6 mb-24 max-w-5xl">
        <motion.div
           ref={ref}
           initial={{ opacity: 0, y: 20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           className="grid md:grid-cols-2 gap-12 items-end"
        >
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent mb-6">
              Who said learning has to be transactional?
            </h2>
          </div>
          <div>
            <p className="text-neutral-400 text-lg leading-relaxed font-light">
               With Peersy, managing your growth is fair, collaborative, and entirely credit-based. 
               Our platform brings clarity to your learning path, simplifies matchmaking, and puts the power of 
               peer exchange right at your fingertips. <strong className="text-white font-medium">Say no to expensive tutors and rigid courses.</strong>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
         {/* Bento Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
            {/* Insights Card */}
            <BentoCard 
              className="md:col-span-1"
              title="Track your Progress"
              description="Visualize your credit earnings and learning milestones in one dashboard."
              delay={0.1}
            >
               <div className="relative h-48 w-full bg-[#1A1A1C] rounded-xl border border-white/5 overflow-hidden mb-4 group-hover:border-white/10 transition-colors">
                  {/* Mock Chart */}
                  <div className="absolute inset-x-4 bottom-4 h-24 flex items-end justify-between gap-1">
                     {[40, 70, 45, 90, 60, 80, 50, 75, 55, 65].map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className="w-full bg-blue-500/20 rounded-t-sm group-hover:bg-blue-500/40 transition-colors" />
                     ))}
                  </div>
                  <div className="absolute top-4 left-4">
                     <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Credits Earned</div>
                     <div className="text-xl font-medium text-white flex items-center gap-2">
                        2,450 
                        <span className="text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
                     </div>
                  </div>
               </div>
            </BentoCard>

            {/* Mobile App Card */}
            <BentoCard 
              className="md:col-span-1"
              title="Learn anywhere"
              description="Connect with mentors and join sessions from any device, anytime."
              delay={0.2}
            >
               <div className="relative h-full w-full flex justify-center overflow-hidden">
                  <div className="w-40 h-[120%] bg-[#1A1A1C] border border-white/10 rounded-[2rem] p-3 shadow-2xl transform translate-y-8 absolute top-0 group-hover:translate-y-6 transition-transform duration-500">
                     <div className="w-full h-full bg-[#0A0A0B] rounded-[1.5rem] overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-6 bg-[#0A0A0B] z-10 flex justify-center pt-2">
                           <div className="w-12 h-4 bg-black rounded-b-xl" />
                        </div>
                        <div className="p-4 pt-10 space-y-3">
                           {/* Mobile Interface Mockup */}
                           <div className="flex justify-between items-center mb-4">
                              <div className="w-8 h-8 rounded-full bg-neutral-800" />
                              <div className="w-6 h-6 rounded-md bg-neutral-800" />
                           </div>
                           <div className="h-24 bg-gradient-to-br from-blue-900/20 to-blue-600/10 rounded-xl w-full border border-blue-500/20 p-3">
                              <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold mb-2">JS</div>
                              <div className="h-2 w-16 bg-neutral-800 rounded mb-1" />
                              <div className="h-1.5 w-10 bg-neutral-800 rounded" />
                           </div>
                           <div className="h-16 bg-[#1A1A1C] rounded-xl w-full border border-white/5" />
                        </div>
                     </div>
                  </div>
               </div>
            </BentoCard>

            {/* Notifications Card */}
            <BentoCard 
              className="md:col-span-1"
              title="Real-time alerts"
              description="Never miss a session request or a credit transfer. Stay in the loop instantly."
              delay={0.3}
            >
               <div className="space-y-3 mb-4">
                  <div className="bg-[#1A1A1C] rounded-lg p-3 border border-white/5 flex gap-3 transform group-hover:scale-105 transition-transform duration-300 shadow-lg">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center min-w-[2rem]">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                     </div>
                     <div>
                        <div className="text-xs text-white font-medium">New Match Request</div>
                        <div className="text-[10px] text-neutral-500">Sarah wants to learn Figma design</div>
                     </div>
                  </div>
                  <div className="bg-[#1A1A1C] rounded-lg p-3 border border-white/5 flex gap-3 transform scale-95 opacity-60">
                     <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center min-w-[2rem]">
                        <Wallet className="w-4 h-4 text-green-400" />
                     </div>
                     <div>
                        <div className="text-xs text-white font-medium">Credits Received</div>
                        <div className="text-[10px] text-neutral-500">+500 credits from John</div>
                     </div>
                  </div>
               </div>
            </BentoCard>

            {/* Integrations Card */}
            <BentoCard 
              className="md:col-span-2"
              title="Wide range of skills"
              description="From coding to design, marketing to music. Connect with experts across hundreds of categories."
              delay={0.4}
            >
               <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 mb-8">
                  {[
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", 
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg"
                  ].map((src, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-[#1A1A1C] border border-white/5 flex items-center justify-center p-3 hover:border-white/20 hover:bg-white/5 transition-all duration-300 group/icon">
                      <img 
                        src={src} 
                        alt="Skill" 
                        loading="lazy"
                        className={`w-full h-full object-contain filter grayscale opacity-40 group-hover/icon:grayscale-0 group-hover/icon:opacity-100 transition-all duration-300 ${src.includes('nextjs') || src.includes('rust') ? 'invert' : ''}`} 
                      />
                    </div>
                  ))}
               </div>
            </BentoCard>

            {/* Keyboard Control Card */}
            <BentoCard 
              className="md:col-span-1"
              title="You're in control"
              description="Lightning fast navigation. Find skills and mentors instantly with our command palette."
              delay={0.5}
            >
               <div className="flex items-center justify-center h-40 bg-[#1A1A1C] rounded-xl border border-white/5 mb-4 group-hover:bg-[#202022] transition-colors shadow-inner">
                  <div className="flex gap-2">
                     <div className="w-10 h-10 rounded bg-[#2A2A2C] border-b-2 border-[#151516] flex items-center justify-center text-neutral-400 font-mono text-lg shadow-lg">⌘</div>
                     <div className="w-10 h-10 rounded bg-[#2A2A2C] border-b-2 border-[#151516] flex items-center justify-center text-neutral-400 font-mono text-lg shadow-lg">K</div>
                  </div>
               </div>
            </BentoCard>
         </div>
      </div>
    </section>
  );
}
