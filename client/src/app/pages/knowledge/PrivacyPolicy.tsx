import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { SEO } from "../../components/SEO";

const sections = [
  {
    title: "What we collect",
    body: "We collect only the information needed to run the platform: your name, email address, the skills you list, your session history, and optional profile details such as your bio and avatar.",
  },
  {
    title: "How we protect it",
    body: "All data is transmitted over encrypted connections and stored securely. Passwords are hashed, and session metadata is encrypted. We never sell your personal data to third parties.",
  },
  {
    title: "Communication",
    body: "We may send you transactional emails related to your account, such as session reminders and notification digests. You can unsubscribe from non-essential communications at any time.",
  },
  {
    title: "Your rights",
    body: "You may request a copy of your data, correct inaccuracies, or delete your account at any time from your profile settings. To exercise any of these rights, contact us through the platform.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <SEO
        title="Privacy Policy"
        description="How Peersy collects, uses, and protects your data. Our commitment to student privacy, data encryption, and no-data-selling principles."
        path="/privacy"
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
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-lg font-light mb-16 leading-relaxed">
            We take your privacy seriously. Here is how Peersy handles the data
            you share with us.
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
