import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? "py-4 bg-black/80 backdrop-blur-md border-b border-white/5" : "py-6 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity group">
                <div className="w-8 h-8 relative flex items-center justify-center">
                    <img src="/peersyLogo.png" alt="Peersy" className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold text-white text-lg tracking-tight">Peersy</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
                <button 
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    How it works
                </button>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                        Log in
                    </Link>
                    <Link to="/signup">
                        <button className="h-9 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                            Sign up
                        </button>
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden text-white p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden">
            <div className="flex flex-col gap-6 text-xl">
                 <button 
                    onClick={() => {
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-2 border-b border-white/10 text-neutral-400"
                >
                    How it works
                </button>
                <Link to="/login" className="py-2 border-b border-white/10 text-neutral-400">Log in</Link>
                <Link to="/signup" className="py-2 text-white">Sign up</Link>
            </div>
        </div>
      )}
    </>
  );
}
