import { Logo } from "./Logo";

export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background">
      <div className="relative">
        <Logo className="w-12 h-12" />
        <span className="absolute -inset-3 rounded-2xl bg-accent/10 animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">{label}...</span>
      </div>
    </div>
  );
}
