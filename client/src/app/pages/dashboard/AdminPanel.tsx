import { useState, useEffect } from 'react';
import { Users, Video, Coins, Star, Clock, Shield, Ban, RotateCcw, Search } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import api from '../../services/api';
import { format } from 'date-fns';

interface Stat { icon: any; label: string; value: number; }
interface AdminUser {
  id: string; name: string; email: string; credits: number;
  warnings: number; banned: boolean; isAdmin: boolean; createdAt: string;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'users' | 'sessions' | 'reports'>('users');
  const [sessions, setSessions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, usersRes, sessRes, repRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users?pageSize=50'),
          api.get('/admin/sessions'),
          api.get('/admin/reports')
        ]);
        if (dash.data.success) setStats(dash.data.data.stats);
        if (usersRes.data.success) setUsers(usersRes.data.data.data);
        if (sessRes.data.success) setSessions(sessRes.data.data);
        if (repRes.data.success) setReports(repRes.data.data);
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const searchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { q, pageSize: 50 } });
      if (res.data.success) setUsers(res.data.data.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Search failed');
    }
  };

  const reviewReport = async (reportId: string, approve: boolean) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/review`, { approve });
      if (res.data.success) {
        toast.success(res.data.message);
        setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: approve ? 'APPROVED' : 'REJECTED' } : r));
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to review report');
    }
  };

  const toggleBan = async (u: AdminUser) => {
    try {
      const res = await api.put(`/admin/users/${u.id}/ban`, { banned: !u.banned });
      if (res.data.success) {
        setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, banned: res.data.data.banned } : x));
        toast.success(res.data.message);
      }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const resetWarnings = async (u: AdminUser) => {
    try {
      const res = await api.put(`/admin/users/${u.id}/reset-warnings`);
      if (res.data.success) {
        setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, warnings: 0 } : x));
        toast.success('Warnings reset');
      }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const statCards: Stat[] = stats ? [
    { icon: Users, label: 'Users', value: stats.users },
    { icon: Video, label: 'Sessions', value: stats.sessions },
    { icon: Star, label: 'Reviews', value: stats.reviews },
    { icon: Clock, label: 'Pending', value: stats.pendingSessions },
    { icon: Coins, label: 'Skills', value: stats.skills },
  ] : [];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" /> Admin
        </h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">Manage users, sessions, and no-show reports.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-[13px] font-medium">{s.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['users', 'sessions', 'reports'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'users' ? 'Users' : t === 'sessions' ? 'Sessions' : 'No-show reports'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUsers()} />
            <Button onClick={searchUsers} variant="outline"><Search className="w-4 h-4" /></Button>
          </div>
          <Card className="border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      {u.isAdmin && <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">admin</Badge>}
                      {u.banned && <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">banned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email} · {u.credits} credits · joined {format(new Date(u.createdAt), 'MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">{u.warnings} warning{u.warnings === 1 ? '' : 's'}</Badge>
                    {u.warnings > 0 && (
                      <Button size="sm" variant="outline" onClick={() => resetWarnings(u)} title="Reset warnings">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant={u.banned ? 'outline' : 'destructive'} onClick={() => toggleBan(u)}>
                      <Ban className="w-3.5 h-3.5 mr-1" /> {u.banned ? 'Unban' : 'Ban'}
                    </Button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'sessions' && (
        <Card className="border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {sessions.map((s) => (
              <div key={s.id} className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{s.topic}</p>
                  <Badge variant="outline" className="text-[10px]">{s.status.toLowerCase()}</Badge>
                  <Badge variant="outline" className="text-[10px]">{s.mode === 'BARTER' ? 'barter' : 'credits'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {s.teacher?.name} → {s.learner?.name} · {s.scheduledAt ? format(new Date(s.scheduledAt), 'MMM d, h:mm a') : 'no time'}
                </p>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No sessions.</p>}
          </div>
        </Card>
      )}

      {tab === 'reports' && (
        <Card className="border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {reports.map((r) => {
              const s = r.session || {};
              return (
                <div key={r.id} className="px-4 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{s.topic || 'Session'}</p>
                    <Badge variant="outline" className={`text-[10px] ${
                      r.status === 'PENDING' ? 'border-amber-500/40 text-amber-500' :
                      r.status === 'APPROVED' ? 'border-accent/40 text-accent' :
                      'border-muted-foreground/40 text-muted-foreground'
                    }`}>{r.status.toLowerCase()}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.teacher?.name} reported {s.learner?.name}
                    {r.reason ? ` · "${r.reason}"` : ''} · {format(new Date(r.createdAt), 'MMM d, h:mm a')}
                  </p>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-accent text-accent-foreground" onClick={() => reviewReport(r.id, true)}>
                        Approve · issue warning
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reviewReport(r.id, false)}>
                        Dismiss
                      </Button>
                    </div>
                  )}
                  {r.status !== 'PENDING' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {r.status === 'APPROVED' ? 'Warning issued · report approved' : 'Report dismissed'}
                    </p>
                  )}
                </div>
              );
            })}
            {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No no-show reports.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
