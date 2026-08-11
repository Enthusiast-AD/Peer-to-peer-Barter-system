import React from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 text-neutral-500 py-12 text-xs font-light tracking-wide">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-white/5 pb-12">
           <div className="text-white font-medium text-lg">
              © 2026 Peersy Inc.
           </div>
           
           <div className="flex gap-8 flex-wrap text-neutral-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
           </div>

           <div className="flex gap-4 text-neutral-400">
              <a href="https://github.com/Enthusiast-AD/Peer-to-peer-Barter-system" target="_blank" rel="noopener noreferrer" aria-label="Peersy on GitHub" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
           </div>
        </div>

        <div className="max-w-4xl space-y-4 text-neutral-600">
           <p>
              Peersy is a video-based skill exchange platform, connecting people to teach and learn through live one-on-one sessions. Any trademarks are the property of their respective owners. Unless otherwise noted, use of third party logos does not imply endorsement of, sponsorship of, or affiliation with Peersy.
           </p>
           <p>
              Peersy is a technology company, not a university. Educational services are provided by community members.
           </p>
        </div>
      </div>
    </footer>
  );
}
