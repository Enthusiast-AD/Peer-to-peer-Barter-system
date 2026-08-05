import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { SEO } from "../../components/SEO";
import { Scale, FileText, CheckCircle2 } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <SEO
        title="Terms of Service"
        description="Peersy terms of service: the rules of the skill exchange protocol, credit policy, user privacy, and platform conduct for students."
        path="/terms"
      />

      <main className="pt-32 pb-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-blue-500/20 bg-blue-500/5">
            <Scale className="w-4 h-4 text-blue-500" />
            <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">
              Legal Protocol
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Terms of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
              Service.
            </span>
          </h1>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <FileText className="text-blue-500 w-8 h-8" />
                1. Acceptance of Terms
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                By accessing or using Peersy, you agree to comply with and
                be bound by these Terms of Service. This platform is designed
                strictly for student skill exchange and knowledge sharing.
              </p>
            </section>

            <section className="p-8 glass-strong rounded-3xl border border-white/5 bg-neutral-900/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-brand-primary w-6 h-6" />
                The Exchange Protocol
              </h2>
              <ul className="space-y-4 text-neutral-300">
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold">01.</span>
                  No monetary transactions are allowed within the platform.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold">02.</span>
                  Credits are non-transferable and have no real-world cash
                  value.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold">03.</span>
                  Users must respect the time and effort of their peers.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-primary font-bold">04.</span>
                  Providing false skill credentials will result in permanent
                  account suspension.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6">2. User Privacy</h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                We are committed to protecting your data. Your educational
                credentials are only used for verification purposes and are
                never sold to third parties. All session metadata is encrypted.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
