import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { SEO } from "../../components/SEO";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Peersy, you agree to comply with and be bound by these Terms of Service. This platform is designed strictly for student skill exchange and knowledge sharing.",
  },
  {
    title: "2. The Exchange Protocol",
    body: "No monetary transactions are allowed within the platform. Credits are non-transferable and have no real-world cash value. Users must respect the time and effort of their peers. Providing false skill credentials will result in permanent account suspension.",
  },
  {
    title: "3. User Privacy",
    body: "We are committed to protecting your data. Your educational credentials are only used for verification purposes and are never sold to third parties. All session metadata is encrypted.",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <SEO
        title="Terms of Service"
        description="Peersy terms of service: the rules of the skill exchange protocol, credit policy, user privacy, and platform conduct for students."
        path="/terms"
      />

      <main className="pt-32 pb-24 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-neutral-400 text-lg font-light mb-16 leading-relaxed">
            The rules that keep Peersy a fair, safe place to exchange skills.
          </p>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl md:text-2xl font-medium text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-neutral-400 leading-relaxed font-light">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
