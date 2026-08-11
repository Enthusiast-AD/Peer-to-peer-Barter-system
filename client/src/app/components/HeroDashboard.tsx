import React, { useState } from "react";
import {
  LayoutDashboard,
  User,
  Users,
  Video,
  Coins,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Play,
  Plus,
  Pencil,
} from "lucide-react";

type DashboardView = "overview" | "profile" | "matches" | "sessions" | "credits";

const NAV_ITEMS: { key: DashboardView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "Skill Profile", icon: User },
  { key: "matches", label: "Find Matches", icon: Users },
  { key: "sessions", label: "Sessions", icon: Video },
  { key: "credits", label: "Credits", icon: Coins },
];

function StatCard({
  icon,
  value,
  label,
  hint,
  tone = "default",
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
  hint?: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4 sm:p-5 group hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start mb-3">
        {icon ? (
          <div className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400">
            {icon}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 text-xs font-bold">
            C
          </div>
        )}
        {hint}
      </div>
      <div className="text-2xl sm:text-3xl font-bold mb-1 tabular-nums">{value}</div>
      <div className="text-[11px] text-neutral-500">{label}</div>
    </div>
  );
}

function OverviewView() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">Good evening, ansh</h2>
          <p className="text-xs sm:text-sm text-neutral-500">You have a session coming up today.</p>
        </div>
        <div className="flex gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 text-xs font-medium text-neutral-300">
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium">
            <Search className="w-3.5 h-3.5" /> Find Match
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={<Coins className="w-3.5 h-3.5" />}
          value="259"
          label="Credit balance"
          hint={<span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>}
        />
        <StatCard
          icon={<Video className="w-3.5 h-3.5" />}
          value="4"
          label="Completed sessions"
          hint={<span className="text-[10px] text-neutral-500">all time</span>}
        />
        <div className="col-span-2 lg:col-span-1 bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4 sm:p-5">
          <div className="text-[11px] text-neutral-500 mb-2">Sessions this week</div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-neutral-800 mb-2">
            <div className="bg-blue-500/80 w-1/3" />
            <div className="bg-amber-500/80 w-1/4" />
            <div className="bg-neutral-600 w-[42%]" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />2 scheduled</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />1 pending</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />4 done</span>
          </div>
        </div>
      </div>

      {/* Upcoming session */}
      <div className="bg-gradient-to-r from-[#111111] to-[#0A0A0A] border border-neutral-800 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-1">
            <Clock className="w-3 h-3" /> Upcoming session
          </div>
          <h3 className="text-sm sm:text-base font-bold mb-0.5 truncate">Python Basics with Sarah</h3>
          <div className="text-xs text-neutral-500">Today, 3:00 PM • 60 mins</div>
        </div>
        <div className="shrink-0 bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
          <Play className="w-3 h-3" /> Join
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-300">Recent sessions</span>
          <span className="text-[11px] text-neutral-500 flex items-center gap-0.5">View all <ArrowRight className="w-3 h-3" /></span>
        </div>
        <div className="rounded-lg border border-neutral-800 divide-y divide-neutral-800">
          {[
            { topic: "React Hooks Masterclass", with: "with Alex", when: "2 hours ago", status: "Completed", tone: "text-green-500 border-green-500/30 bg-green-500/10" },
            { topic: "JavaScript Fundamentals", with: "with Rahul", when: "Yesterday", status: "Scheduled", tone: "text-blue-500 border-blue-500/30 bg-blue-500/10" },
            { topic: "Figma Design Basics", with: "with Priya", when: "2 days ago", status: "Pending", tone: "text-amber-500 border-amber-500/30 bg-amber-500/10" },
          ].map((row) => (
            <div key={row.topic} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-white/[0.02]">
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{row.topic}</p>
                <p className="text-[11px] text-neutral-500 truncate">{row.with} • {row.when}</p>
              </div>
              <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${row.tone}`}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  const column = (title: string, subtitle: string, skills: string[]) => (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-[11px] text-neutral-500 mb-4">{subtitle}</p>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span key={s} className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[11px] border border-blue-500/20">{s}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">Your skill profile</h2>
          <p className="text-xs sm:text-sm text-neutral-500">6 skills listed • 4.9 avg rating</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 text-xs font-medium text-neutral-300">
          <Pencil className="w-3.5 h-3.5" /> Edit profile
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {column("Skills I can teach", "Earn credits for every hour you teach", ["React", "Node.js", "Web Design"])}
        {column("Skills I want to learn", "Spend credits on sessions from experts", ["Python", "Data Science", "Figma"])}
      </div>
      <div className="flex items-center gap-2 text-xs text-neutral-400 bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4">
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        Your profile is complete. You appear in search results and match suggestions.
      </div>
    </div>
  );
}

function MatchesView() {
  const matchCard = ({ name, role, initial, tone, teaching, learning }: { name: string; role: string; initial: string; tone: string; teaching: string[]; learning: string[] }) => (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${tone} flex items-center justify-center font-bold text-sm shrink-0`}>{initial}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-[11px] text-neutral-500">{role}</div>
        </div>
        <div className="ml-auto text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">92% match</div>
      </div>
      <div className="space-y-2 text-[11px]">
        <div className="flex items-start gap-2">
          <span className="text-neutral-500 w-16 shrink-0">Teaches</span>
          <span className="flex flex-wrap gap-1">
            {teaching.map((s) => <span key={s} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{s}</span>)}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-neutral-500 w-16 shrink-0">Wants</span>
          <span className="flex flex-wrap gap-1">
            {learning.map((s) => <span key={s} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{s}</span>)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2 mt-4 rounded-lg bg-white text-black text-xs font-medium w-max">
        <MessageSquare className="w-3.5 h-3.5" /> Send request
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">People who match your goals</h2>
          <p className="text-xs sm:text-sm text-neutral-500">Based on your teach &amp; learn skills.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {matchCard({ name: "Sarah Khan", role: "Data Scientist", initial: "S", tone: "bg-purple-600/20 text-purple-500", teaching: ["Python", "Data Science"], learning: ["React"] })}
        {matchCard({ name: "Alex Chen", role: "Full Stack Dev", initial: "A", tone: "bg-blue-600/20 text-blue-500", teaching: ["React", "Node"], learning: ["Figma"] })}
      </div>
    </div>
  );
}

function SessionsView() {
  const rows = [
    { topic: "Python Basics", with: "Sarah Khan", when: "Today, 3:00 PM", status: "Scheduled", tone: "text-blue-500 border-blue-500/30 bg-blue-500/10" },
    { topic: "JavaScript Fundamentals", with: "Rahul Verma", when: "Tomorrow, 11:00 AM", status: "Scheduled", tone: "text-blue-500 border-blue-500/30 bg-blue-500/10" },
    { topic: "Figma Design Basics", with: "Priya Patel", when: "Requested • 2 days ago", status: "Pending", tone: "text-amber-500 border-amber-500/30 bg-amber-500/10" },
    { topic: "React Hooks Masterclass", with: "Alex Chen", when: "Completed • last week", status: "Completed", tone: "text-green-500 border-green-500/30 bg-green-500/10" },
    { topic: "Intro to Node.js", with: "Maya Singh", when: "Completed • last month", status: "Completed", tone: "text-green-500 border-green-500/30 bg-green-500/10" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">Your sessions</h2>
          <p className="text-xs sm:text-sm text-neutral-500">Schedule, join, and review your meetings.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium">
          <Plus className="w-3.5 h-3.5" /> New request
        </div>
      </div>
      <div className="rounded-lg border border-neutral-800 divide-y divide-neutral-800">
        {rows.map((row) => (
          <div key={row.topic} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
                {row.with.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{row.topic}</p>
                <p className="text-[11px] text-neutral-500 truncate">with {row.with} • {row.when}</p>
              </div>
            </div>
            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${row.tone}`}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreditsView() {
  const rows = [
    { label: "Taught Web Design", meta: "with Priya Patel", amount: "+60", tone: "text-green-500" },
    { label: "Learned React Hooks", meta: "with Alex Chen", amount: "-45", tone: "text-red-500" },
    { label: "Sign-up bonus", meta: "Welcome to Peersy", amount: "+50", tone: "text-green-500" },
    { label: "Taught Node.js", meta: "with Maya Singh", amount: "+60", tone: "text-green-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">Credits</h2>
          <p className="text-xs sm:text-sm text-neutral-500">Earn by teaching, spend by learning.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard icon={<Coins className="w-3.5 h-3.5" />} value="259" label="Available balance" hint={<span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>} />
        <StatCard icon={<TrendingUp className="w-3.5 h-3.5" />} value="120" label="Earned this month" />
      </div>
      <div>
        <span className="text-xs font-medium text-neutral-300 mb-2 block">Transaction history</span>
        <div className="rounded-lg border border-neutral-800 divide-y divide-neutral-800">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div>
                <p className="text-xs font-medium text-white">{row.label}</p>
                <p className="text-[11px] text-neutral-500">{row.meta}</p>
              </div>
              <span className={`text-xs font-semibold tabular-nums ${row.amount}`}>{row.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroDashboard() {
  const [view, setView] = useState<DashboardView>("overview");

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl bg-black border border-neutral-800">
      {/* Window bar */}
      <div className="flex items-center gap-3 px-4 h-10 border-b border-neutral-800 bg-[#0A0A0A]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-800/60 text-[10px] text-neutral-400 w-full max-w-xs sm:max-w-sm">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 1 1 8 0v4" />
            </svg>
            <span className="truncate">peersy.app/dashboard</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-[420px] sm:min-h-[440px] lg:min-h-[480px]">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex flex-col w-52 border-r border-neutral-800 p-4 bg-black shrink-0">
          <div className="flex items-center gap-2 px-2 mb-6">
            <img src="/peersyLogo.png" alt="Peersy" className="w-6 h-6 object-contain" />
            <span className="font-semibold text-sm tracking-tight">Peersy</span>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    active ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2.5 px-2 pt-5 border-t border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-medium text-xs">a</div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">ansh</div>
              <div className="text-[10px] text-neutral-500 truncate">259 credits</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 bg-black">
          {view === "overview" && <OverviewView />}
          {view === "profile" && <ProfileView />}
          {view === "matches" && <MatchesView />}
          {view === "sessions" && <SessionsView />}
          {view === "credits" && <CreditsView />}
        </div>
      </div>

      {/* Mobile nav - bottom tab bar */}
      <div className="lg:hidden flex border-t border-neutral-800 bg-[#0A0A0A]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-medium transition-colors ${
                active ? "text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span className="truncate max-w-full">{item.label.replace("Skill Profile", "Profile").replace("Find Matches", "Matches")}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive hint */}
      <div className="hidden md:flex items-center justify-center gap-1.5 py-2 bg-black border-t border-neutral-900 text-[10px] text-neutral-600">
        <ChevronRight className="w-3 h-3" />
        Try the sidebar - it&apos;s interactive
      </div>
    </div>
  );
}
