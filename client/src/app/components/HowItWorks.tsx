import { motion } from "motion/react";
import { useInView } from "./useInView";
import { ArrowRight } from "lucide-react";


const Step1Graphic = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
     <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-transparent" />
     <div className="bg-[#1A1A1C] border border-white/10 p-4 rounded-xl shadow-2xl relative z-10 w-2/3">
         <div className="h-2 w-1/3 bg-neutral-700 rounded-full mb-3" />
         <div className="space-y-2">
             <div className="h-8 w-full bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                <span className="text-white text-[10px] font-medium">Create Profile</span>
             </div>
         </div>
         {/* Mouse Cursor */}
         <svg className="absolute -bottom-4 -right-4 w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
             <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35z" />
         </svg>
     </div>
  </div>
);

const Step2Graphic = () => (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-900/10 to-transparent" />
        <div className="relative z-10 flex items-center gap-4">
             <div className="w-12 h-16 bg-[#1A1A1C] border border-white/10 rounded-lg shadow-xl flex flex-col p-2 gap-2">
                <div className="w-full h-2 bg-neutral-700 rounded-full" />
                <div className="w-2/3 h-2 bg-neutral-800 rounded-full" />
             </div>
             
             <div className="flex-1 w-12 h-[1px] bg-gradient-to-r from-blue-500 to-purple-500 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0A0A0B] border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
             </div>

             <div className="w-12 h-16 bg-[#1A1A1C] border border-white/10 rounded-lg shadow-xl flex flex-col p-2 gap-2">
                <div className="w-full h-2 bg-neutral-700 rounded-full" />
                <div className="w-2/3 h-2 bg-neutral-800 rounded-full" />
             </div>
        </div>
    </div>
);

const Step3Graphic = () => (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-900/10 to-transparent" />
       <div className="bg-[#1A1A1C] border border-white/10 px-6 py-3 rounded-xl shadow-2xl relative z-10 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
           </div>
           <div>
               <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Live Session</div>
               <div className="text-white text-sm font-medium">+ 15 Credits</div>
           </div>
       </div>
    </div>
);


const steps = [
  {
    graphic: Step1Graphic,
    stepLabel: "STEP 1",
    title: "Create your profile",
    description:
      "Sign up and list the skills you can teach and the ones you want to learn. No fluff, just skills.",
  },
  {
    graphic: Step2Graphic,
    stepLabel: "STEP 2",
    title: "Get Matched",
    description:
      "Our matching engine instantly finds peers with complementary needs. Connect in one click.",
  },
  {
    graphic: Step3Graphic,
    stepLabel: "STEP 3",
    title: "Start Swapping",
    description:
      "Launch a live video session to teach or learn. Credits transfer automatically when you're done.",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref, inView } = useInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 * index }}
      className="flex flex-col h-full bg-[#0A0A0B] border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-colors group"
    >
      {/** Graphic Area (Top Half) */}
      <div className="h-48 w-full border-b border-neutral-800 bg-[#050505] relative group-hover:bg-[#080808] transition-colors">
          <step.graphic />
      </div>

      {/** Content Area (Bottom Half) */}
      <div className="p-8 flex flex-col flex-1">
         <div className="text-xs font-bold text-neutral-500 mb-3 tracking-widest">{step.stepLabel}</div>
         <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
         <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
             {step.description}
         </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const { ref, inView } = useInView();

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-32 bg-black relative"
    >
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            Get started with Peersy
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <StepCard key={idx} step={step} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
