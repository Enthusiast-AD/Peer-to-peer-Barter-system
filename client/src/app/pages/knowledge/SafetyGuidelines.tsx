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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <SEO
        title="Safety Guidelines"
        description="Peersy safety guidelines: verify profiles, keep sessions on-platform, report issues, and protect your privacy during skill exchanges."
        path="/safety"
      />

      <main className="pt-32 pb-24 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Trust &amp; Safety</p>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Safety Guidelines
          </h1>
          <p className="text-neutral-400 text-lg font-light mb-16 leading-relaxed">
            Your security is our highest priority. We've built technical
            safeguards and community protocols to ensure every skill exchange is
            safe and productive.
          </p>

          <div className="space-y-6">
            {guidelines.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-2xl border border-neutral-800 bg-[#0A0A0B] p-7 flex flex-col md:flex-row gap-6 items-start md:items-center transition-colors hover:border-neutral-700"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-neutral-800 shrink-0 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                    <p className="text-neutral-400 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
