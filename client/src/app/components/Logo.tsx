export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img src="/peersyLogo.png" alt="Peersy" className={`${className} object-contain`} />
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight ${className}`}>Peersy</span>
  );
}
