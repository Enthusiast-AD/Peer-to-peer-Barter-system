import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { SEO } from "../../components/SEO";
import { ShieldCheck, Eye, Lock, UserCheck } from "lucide-react";

const guidelines = [
  {
    title: "Verify Profiles",
    description:
      "Check user reviews and skill badges before starting a session. Always trust users with a high trust score.",
    icon: UserCheck,
  },
  {
    title: "On-Platform Sessions",
    description:
      "Use our integrated meeting rooms for all skill exchanges. Never share personal contact info like WhatsApp or Email.",
    icon: Lock,
  },
  {
    title: "Report Issues",
    description:
      "Our protocol relies on community integrity. Use the report button if a user is unprofessional or misrepresents their skills.",
    icon: Eye,
  },
  {
    title: "Secure Verification",
    description:
      "All student IDs are cryptographically hashed to ensure privacy while maintaining a secure peer network.",
    icon: ShieldCheck,
  },
];

export default function SafetyGuidelines() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <SEO
        title="Safety Guidelines"
        description="Peersy safety guidelines: verify profiles, keep sessions on-platform, report issues, and protect your privacy during skill exchanges."
        path="/safety"
      />

      <main className="pt-32 pb-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-green-500/20 bg-green-500/5">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-[10px] font-black tracking-widest uppercase">
              Safety Protocol
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Safety{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              First.
            </span>
          </h1>

          <p className="text-xl text-neutral-400 mb-16 leading-relaxed">
            Your security is our highest priority. We've built technical
            safeguards and community protocols to ensure every skill exchange is
            safe and productive.
          </p>

          <div className="space-y-6">
            {guidelines.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-strong rounded-3xl p-8 border border-white/5 bg-neutral-900/40 flex flex-col md:flex-row gap-8 items-start md:items-center hover:bg-neutral-900/60 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex-shrink-0 flex items-center justify-center border border-green-500/20">
                  <item.icon className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
