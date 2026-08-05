import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { SEO } from "../../components/SEO";
import { Shield, Database, Mail, UserX } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <SEO
        title="Privacy Policy"
        description="How Peersy collects, uses, and protects your data. Our commitment to student privacy, data encryption, and no-data-selling principles."
        path="/privacy"
      />

      <main className="pt-32 pb-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-purple-500/20 bg-purple-500/5">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-purple-500 text-[10px] font-black tracking-widest uppercase">
              Privacy Protocol
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600">
              Policy.
            </span>
          </h1>

          <p className="text-xl text-neutral-400 mb-16 leading-relaxed">
            We take your privacy seriously. Here is how Peersy handles the data
            you share with us.
          </p>

          <div className="prose prose-invert max-w-none space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Database className="text-purple-500 w-8 h-8" />
                What we collect
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                We collect only the information needed to run the platform:
                your name, email address, the skills you list, your session
                history, and optional profile details such as your bio and
                avatar.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Shield className="text-purple-500 w-8 h-8" />
                How we protect it
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                All data is transmitted over encrypted connections and stored
                securely. Passwords are hashed, and session metadata is
                encrypted. We never sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Mail className="text-purple-500 w-8 h-8" />
                Communication
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                We may send you transactional emails related to your account,
                such as session reminders and notification digests. You can
                unsubscribe from non-essential communications at any time.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <UserX className="text-purple-500 w-8 h-8" />
                Your rights
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                You may request a copy of your data, correct inaccuracies, or
                delete your account at any time from your profile settings. To
                exercise any of these rights, contact us through the platform.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
