import { motion } from "motion/react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { SEO } from "../../components/SEO";
import { Zap, BookOpen, HelpCircle, MessageSquare } from "lucide-react";

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
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <SEO
        title="Help Center - FAQs"
        description="Answers to common questions about the Peersy credit system, how skill bartering works, scheduling sessions, and more."
        path="/help"
        jsonLd={faqJsonLd}
      />

      <main className="pt-32 pb-24 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Support</p>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Help Center
          </h1>
          <p className="text-neutral-400 text-lg font-light mb-16 leading-relaxed">
            Everything you need to know about the Peersy ecosystem. Can't find
            what you're looking for? Reach out to our community support.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => {
              const Icon = faq.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-2xl border border-neutral-800 bg-[#0A0A0B] p-7 transition-colors hover:border-neutral-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-neutral-800 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-3">{faq.question}</h3>
                  <p className="text-neutral-400 leading-relaxed font-light">{faq.answer}</p>
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
