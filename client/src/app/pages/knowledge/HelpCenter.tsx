import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { HelpCircle, BookOpen, MessageSquare, Zap } from "lucide-react";

const faqs = [
  {
    question: "How does the credit system work?",
    answer:
      "Every time you teach a skill, you earn credits. One hour of teaching equals 1 credit. You can then use these credits to learn from anyone else on the platform. It's a pure knowledge-for-knowledge exchange.",
    icon: Zap,
  },
  {
    question: "What skills can I barter?",
    answer:
      "Anything from programming and data science to graphic design, languages, or even cooking and music. As long as someone is willing to learn it and you can teach it, it's valid.",
    icon: BookOpen,
  },
  {
    question: "Is it really free?",
    answer:
      "Yes, Peersy is 100% free. Our protocol ensures value retention for the community without transaction fees. We believe knowledge should be accessible to all students.",
    icon: HelpCircle,
  },
  {
    question: "How do I schedule a session?",
    answer:
      "Once you find a match, you can use our built-in scheduler to agree on a time. The platform provides integrated video rooms and shared workspaces for the session.",
    icon: MessageSquare,
  },
];

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <main className="pt-32 pb-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-brand-primary/20 bg-brand-primary/5">
            <HelpCircle className="w-4 h-4 text-brand-primary" />
            <span className="text-brand-primary text-[10px] font-black tracking-widest uppercase">
              Support Protocol
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Help{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">
              Center.
            </span>
          </h1>

          <p className="text-xl text-neutral-400 mb-16 leading-relaxed">
            Everything you need to know about the Peersy ecosystem. Can't
            find what you're looking for? Reach out to our community support.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-strong rounded-2xl p-8 border border-white/5 bg-neutral-900/40 relative overflow-hidden group hover:border-brand-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20 group-hover:scale-110 transition-transform">
                  <faq.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
