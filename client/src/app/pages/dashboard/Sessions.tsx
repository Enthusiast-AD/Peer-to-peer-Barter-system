import { useEffect, useState } from 'react';
import { Video, Calendar, Clock, User, ChevronRight, CheckCircle2, AlertCircle, MessageSquare, Scale, Coins } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface Session {
  id: string;
  status: string;
  mode: 'BARTER' | 'CREDITS';
  topic: string;
  scheduledAt?: string | null;
  durationMinutes?: number;
  actualDurationMinutes?: number | null;
  creditsReserved?: number;
  teacher?: { id: string; name: string; avatar?: string };
  learner?: { id: string; name: string; avatar?: string };
  skill?: { name: string };
  review?: any;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const [sessionsRes, unreadRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/sessions/unread-counts')
      ]);
      if (sessionsRes.data.success) setSessions(sessionsRes.data.data);
      if (unreadRes.data.success) setUnread(unreadRes.data.data);
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const canJoinNow = (s: Session) => {
    if (s.status !== 'SCHEDULED' || !s.scheduledAt) return false;
    const start = new Date(s.scheduledAt).getTime() - 10 * 60 * 1000;
    const end = new Date(s.scheduledAt).getTime() + (s.durationMinutes || 60) * 60 * 1000;
    const now = Date.now();
    return now >= start && now <= end;
  };

  const statusStyles: Record<string, string> = {
    SCHEDULED: 'bg-accent/10 text-accent border-accent/20',
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    COMPLETED: 'bg-foreground/5 text-foreground border-foreground/15',
    CANCELLED: 'bg-muted text-muted-foreground border-border',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">Chat, agree on a time, and manage your meetings.</p>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">No sessions yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-5">Request a session from a match to get started.</p>
            <Button onClick={() => navigate('/dashboard/matching')}>Find Matches <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </Card>
        ) : (
          sessions.map((session) => {
            const isRequester = session.learnerId === user?.id;
            const otherPerson = isRequester ? session.teacher : session.learner;
            const joinable = canJoinNow(session);

            return (
              <Card key={session.id} className="p-5 sm:p-6 border-border bg-card">
                <div className="flex flex-col lg:flex-row gap-5 lg:items-center justify-between">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                      {otherPerson?.avatar ? (
                        <img src={otherPerson.avatar} alt={otherPerson.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className={`text-xs ${statusStyles[session.status] || 'border-border text-muted-foreground'}`}>
                          {session.status.toLowerCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                          {session.mode === 'BARTER' ? <><Scale className="w-3 h-3 mr-1" /> Barter</> : <><Coins className="w-3 h-3 mr-1" /> Credit-paid</>}
                        </Badge>
                      </div>
                      <h3 className="font-semibold tracking-tight truncate">{session.topic}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        with {otherPerson?.name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                        {session.scheduledAt ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500/90">
                            <Clock className="w-3.5 h-3.5" /> Time not agreed yet
                          </span>
                        )}
                        {session.durationMinutes ? (
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {session.durationMinutes} min</span>
                        ) : null}
                      </div>
                      {session.status === 'COMPLETED' && session.actualDurationMinutes != null && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Ran {session.actualDurationMinutes} min
                          {session.mode === 'CREDITS' ? ` • billed ${Math.min(session.actualDurationMinutes, session.creditsReserved ?? session.actualDurationMinutes)} credits` : ' • barter'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end shrink-0">
                    <Button variant="outline" className="w-full lg:w-auto" onClick={() => navigate(`/dashboard/session/${session.id}`)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {session.status === 'PENDING' ? (isRequester ? 'Chat & schedule' : 'Review request') : 'Open session'}
                      {unread[session.id] ? (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold">
                          {unread[session.id]}
                        </span>
                      ) : null}
                    </Button>
                    {joinable && (
                      <Button className="w-full lg:w-auto" onClick={() => window.open(`/meet/${session.id}`, '_blank', 'noopener,noreferrer')}>
                        <Video className="w-4 h-4 mr-2" /> Join meeting
                      </Button>
                    )}
                    {session.status === 'SCHEDULED' && !joinable && session.scheduledAt && (
                      <p className="text-xs text-muted-foreground text-center lg:text-right">Join opens 10 min before start</p>
                    )}
                    {session.status === 'COMPLETED' && !session.myReview && (
                      <Button variant="outline" className="w-full lg:w-auto text-accent border-accent/30 hover:bg-accent/10" onClick={() => navigate(`/dashboard/session/${session.id}/review`)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Leave review
                      </Button>
                    )}
                    {session.status === 'COMPLETED' && session.myReview && (
                      <p className="text-xs text-accent flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Reviewed · {session.myReview.rating}/5</p>
                    )}
                    {session.status === 'PENDING' && isRequester && (
                      <p className="text-xs text-amber-500/90 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Awaiting teacher's response</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
