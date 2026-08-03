import { useState, useEffect } from 'react';
import { Coins, Video, Clock, ArrowRight, Calendar, Scale, MessageSquare } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import { Link } from 'react-router-dom';
import api from "../../services/api";
import { format } from 'date-fns';

interface Session {
  id: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  mode: 'BARTER' | 'CREDITS';
  topic: string;
  scheduledAt?: string | null;
  durationMinutes?: number;
  teacherId?: string;
  learnerId?: string;
  teacher?: { id: string; name: string; avatar?: string };
  learner?: { id: string; name: string; avatar?: string };
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/sessions');
        if (res.data.success) setSessions(res.data.data);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedCount = sessions.filter((s) => s.status === 'COMPLETED').length;
  const scheduledCount = sessions.filter((s) => s.status === 'SCHEDULED').length;
  const pendingCount = sessions.filter((s) => s.status === 'PENDING').length;
  const earnedCount = sessions.filter((s) => s.status === 'COMPLETED' && s.teacherId === user?.id).length * 60;
  const spentCount = sessions.filter((s) => s.status === 'COMPLETED' && s.learnerId === user?.id).length * 60;
  const upcoming = sessions.find((s) => s.status === 'SCHEDULED');
  const pending = pendingCount;
  const isTeacher = (s: Session) => s.teacher?.id === user?.id;

  const recentSessions = [...sessions].slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            {upcoming ? 'You have a session coming up.' : pending > 0 ? `${pending} request${pending > 1 ? 's' : ''} awaiting a response.` : 'Ready for your next session?'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard/sessions"><Calendar className="w-4 h-4" /> Sessions</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/matching">Find Match <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Credits - hero stat */}
        <Card className="p-6 bg-card border-border relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-[13px] font-medium">
              <Coins className="w-4 h-4" /> Credit balance
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Peersy credits</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight leading-none tabular-nums">{user?.credits ?? 0}</span>
            <span className="text-sm text-muted-foreground mb-0.5">credits</span>
          </div>
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Earned</p>
              <p className="text-sm font-semibold tabular-nums">{earnedCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground font-medium">Spent</p>
              <p className="text-sm font-semibold tabular-nums">{spentCount}</p>
            </div>
          </div>
        </Card>

        {/* Session stats - inline distribution */}
        <Card className="p-6 bg-card border-border lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-medium text-muted-foreground">Sessions</h3>
            <Link to="/dashboard/sessions" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted mb-5">
            <div className="bg-primary/80 transition-all" style={{ width: `${sessions.length ? (scheduledCount / sessions.length) * 100 : 0}%` }} />
            <div className="bg-amber-500/80 transition-all" style={{ width: `${sessions.length ? (pendingCount / sessions.length) * 100 : 0}%` }} />
            <div className="bg-foreground/25 transition-all" style={{ width: `${sessions.length ? (completedCount / sessions.length) * 100 : 0}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Scheduled', value: scheduledCount, color: 'bg-primary/80', icon: Clock },
              { label: 'Pending', value: pendingCount, color: 'bg-amber-500/80', icon: MessageSquare },
              { label: 'Completed', value: completedCount, color: 'bg-foreground/25', icon: Video },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={2} />
                    <span className="text-xl font-semibold tracking-tight tabular-nums">{s.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming + Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming */}
          {upcoming ? (
            <Card className="p-5 sm:p-6 border-border bg-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[13px] font-medium mb-1.5">
                    <Clock className="w-4 h-4" /> Upcoming session
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{upcoming.topic}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    with {isTeacher(upcoming) ? upcoming.learner?.name : upcoming.teacher?.name}
                    {upcoming.scheduledAt && <> • {format(new Date(upcoming.scheduledAt), 'MMM d, h:mm a')}</>}
                    {" "}• {upcoming.durationMinutes || 60} min
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{upcoming.mode === 'BARTER' ? 'Barter' : 'Credit-paid'}</Badge>
                    {upcoming.mode === 'BARTER' && <Badge variant="outline" className="text-xs"><Scale className="w-3 h-3 mr-1" /> Skill exchange</Badge>}
                  </div>
                </div>
                <Button asChild>
                  <Link to={`/dashboard/session/${upcoming.id}`}>Open session</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-dashed border-border flex flex-col items-center justify-center text-center py-12">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-[15px]">No upcoming sessions</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                {pending > 0 ? `${pending} request${pending > 1 ? 's' : ''} waiting on a response.` : "Request a session to start chatting, scheduling, and learning."}
              </p>
              <Button variant="outline" asChild className="mt-4">
                <Link to="/dashboard/matching">Find a match</Link>
              </Button>
            </Card>
          )}

          {/* Recent sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold tracking-tight">Recent sessions</h3>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link to="/dashboard/sessions">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
            {recentSessions.length === 0 ? (
              <Card className="p-5 border-border text-muted-foreground text-sm text-center">
                No sessions yet. Request your first session to get started.
              </Card>
            ) : (
              <div className="rounded-lg border border-border divide-y divide-border">
                {recentSessions.map((s) => {
                  const other = isTeacher(s) ? s.learner?.name : s.teacher?.name;
                  return (
                    <Link key={s.id} to={`/dashboard/session/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.topic}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          with {other}
                          {s.scheduledAt ? ` • ${format(new Date(s.scheduledAt), 'MMM d, h:mm a')}` : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-xs ${
                        s.status === 'COMPLETED' ? 'border-accent/30 text-accent' :
                        s.status === 'SCHEDULED' ? 'border-foreground/20 text-foreground' :
                        s.status === 'PENDING' ? 'border-amber-500/40 text-amber-500' :
                        'border-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {s.status.toLowerCase()}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-5 border-border bg-card">
            <h3 className="text-[15px] font-semibold tracking-tight mb-4">Your profile</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center text-base font-semibold text-accent">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Credits</dt>
                <dd className="font-medium">{user?.credits ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Skills listed</dt>
                <dd className="font-medium">{(user?.skills ?? []).length}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5 border-border bg-card">
            <h3 className="text-[15px] font-semibold tracking-tight mb-3">How barter works</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sessions can be <span className="text-foreground">barter</span> — each person teaches a skill in exchange — or{" "}
              <span className="text-foreground">credit-paid</span>. Credits are escrowed at request and billed by the actual time you meet.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
