import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Clock, Calendar, Video, User as UserIcon,
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Scale, Coins, Star
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { SchedulePicker } from '../../components/SchedulePicker';
import { downloadICS } from '../../utils/ics';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

interface Proposal {
  id: string;
  proposedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  proposedBy: { id: string; name: string };
  respondedBy?: { id: string; name: string } | null;
  createdAt: string;
}

interface SessionDetail {
  id: string;
  topic: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  mode: 'BARTER' | 'CREDITS';
  scheduledAt?: string | null;
  durationMinutes?: number;
  creditsReserved?: number;
  actualDurationMinutes?: number | null;
  meetingLink?: string | null;
  teacher: { id: string; name: string; avatar?: string; bio?: string };
  learner: { id: string; name: string; avatar?: string; bio?: string };
  reviews?: any[];
  myReview?: any;
}

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [otherSlots, setOtherSlots] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [acceptMode, setAcceptMode] = useState<'BARTER' | 'CREDITS'>('BARTER');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isTeacher = session?.teacher?.id === user?.id;
  const otherPerson = isTeacher ? session?.learner : session?.teacher;

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sessionId]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const load = async () => {
    try {
      const [sessionRes, messagesRes, proposalsRes] = await Promise.all([
        api.get(`/sessions/${sessionId}`),
        api.get(`/sessions/${sessionId}/messages`),
        api.get(`/sessions/${sessionId}/proposals`)
      ]);
      if (sessionRes.data.success) setSession(sessionRes.data.data);
      if (messagesRes.data.success) setMessages(messagesRes.data.data);
      if (proposalsRes.data.success) setProposals(proposalsRes.data.data);

      // Load the other participant's availability slots for scheduling.
      const otherId = sessionRes.data.data?.teacher?.id === user?.id
        ? sessionRes.data.data?.learner?.id
        : sessionRes.data.data?.teacher?.id;
      if (otherId) {
        try {
          const slotsRes = await api.get(`/availability/user/${otherId}`);
          if (slotsRes.data.success) setOtherSlots(slotsRes.data.data);
        } catch (e) { /* noop */ }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const content = messageText.trim();
    if (!content) return;
    setSending(true);
    try {
      const res = await api.post(`/sessions/${sessionId}/messages`, { content });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setMessageText('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const proposeTime = async () => {
    if (!selectedDate || !selectedTime) { toast.error('Pick a day and a time'); return; }
    const [h, m] = selectedTime.split(':').map(Number);
    const proposed = new Date(selectedDate);
    proposed.setHours(h, m, 0, 0);
    try {
      const res = await api.post(`/sessions/${sessionId}/proposals`, { proposedAt: proposed.toISOString() });
      if (res.data.success) { toast.success('Time proposed'); setSelectedDate(null); setSelectedTime(''); load(); }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to propose time');
    }
  };

  const respondToProposal = async (proposalId: string, accept: boolean) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/proposals/${proposalId}/respond`, { accept });
      if (res.data.success) { toast.success(res.data.message); load(); }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to respond');
    }
  };

  const acceptSession = async () => {
    try {
      const res = await api.put(`/sessions/${sessionId}/accept`, { mode: acceptMode });
      if (res.data.success) { toast.success(res.data.message); load(); }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    }
  };

  const reportNoShow = async () => {
    if (!window.confirm('Report this participant as a no-show? This is sent to an admin for review before any warning is issued.')) return;
    try {
      const res = await api.post(`/sessions/${sessionId}/no-show`, { reason: 'Learner did not join the meeting' });
      if (res.data.success) { toast.success(res.data.message); load(); }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report');
    }
  };

  const now = new Date();

  const reportWindow = session?.scheduledAt ? {
    openAt: new Date(new Date(session.scheduledAt).getTime() + 2 * 60 * 1000)
  } : null;
  const reportAvailable = session?.scheduledAt && now >= reportWindow!.openAt;

  const joinWindow = session?.status === 'SCHEDULED' && session.scheduledAt ? {
    start: new Date(new Date(session.scheduledAt).getTime() - 10 * 60 * 1000),
    end: new Date(new Date(session.scheduledAt).getTime() + (session.durationMinutes || 60) * 60 * 1000)
  } : null;
  const joinAvailable = joinWindow && now >= joinWindow.start && now <= joinWindow.end;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <p className="text-muted-foreground">Session not found.</p>;
  }

  const statusText = session.status.toLowerCase();

  return (
    <div className="space-y-6 pb-12">
      <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/sessions')} className="text-muted-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to sessions
      </Button>

      {/* Header */}
      <Card className="p-6 border-border bg-card">
        <div className="flex flex-col md:flex-row justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className={`text-xs border-border ${
                session.status === 'SCHEDULED' ? 'bg-accent/10 text-accent border-accent/20' :
                session.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                session.status === 'COMPLETED' ? 'text-foreground' : 'text-muted-foreground'
              }`}>{statusText}</Badge>
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {session.mode === 'BARTER' ? <><Scale className="w-3 h-3 mr-1" /> Barter</> : <><Coins className="w-3 h-3 mr-1" /> Credit-paid</>}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{session.topic}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2 text-sm">
              <UserIcon className="w-4 h-4" strokeWidth={1.8} />
              <span>{otherPerson?.name}</span>
              <span>•</span>
              <span>{session.durationMinutes || 60} min</span>
            </div>
            {session.scheduledAt && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <Calendar className="w-4 h-4 text-accent" strokeWidth={1.8} />
                <span className="font-medium">{format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a')}</span>
                {joinWindow && now < joinWindow.start && (
                  <span className="text-xs text-muted-foreground">(join opens {format(joinWindow.start, 'h:mm a')})</span>
                )}
              </div>
            )}
            {session.mode === 'CREDITS' && (session.creditsReserved ?? 0) > 0 && (
              <p className="text-xs text-accent mt-2">{session.creditsReserved} credits reserved · actual time billed on completion</p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:items-end shrink-0">
            {session.status === 'PENDING' && isTeacher && (
              <div className="space-y-2 w-full md:w-60">
                <p className="text-xs text-muted-foreground">You organize this session. Choose the arrangement:</p>
                <div className="flex gap-2">
                  <Button size="sm" variant={acceptMode === 'BARTER' ? 'default' : 'outline'} className="flex-1" onClick={() => setAcceptMode('BARTER')}>Barter</Button>
                  <Button size="sm" variant={acceptMode === 'CREDITS' ? 'default' : 'outline'} className="flex-1" onClick={() => setAcceptMode('CREDITS')}>Credits</Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {acceptMode === 'BARTER' ? `${otherPerson?.name} teaches you a skill in return.` : `${otherPerson?.name} pays ${session.durationMinutes || 60} credits.`}
                </p>
                <Button className="w-full" onClick={acceptSession}><CheckCircle2 className="w-4 h-4 mr-2" /> Accept request</Button>
              </div>
            )}
            {joinAvailable && (
              <Button onClick={() => window.open(`/meet/${session.id}`, '_blank', 'noopener,noreferrer')}><Video className="w-4 h-4 mr-2" /> Join meeting</Button>
            )}
            {session.status === 'SCHEDULED' && session.scheduledAt && (
              <Button variant="outline" onClick={() => downloadICS({
                topic: session.topic,
                description: `Peersy session with ${otherPerson?.name}`,
                start: session.scheduledAt,
                durationMinutes: session.durationMinutes || 60,
                url: window.location.href
              })}>
                <Calendar className="w-4 h-4 mr-2" /> Add to calendar
              </Button>
            )}
            {session.status === 'SCHEDULED' && joinWindow && !joinAvailable && now > joinWindow.end && (
              <p className="text-xs text-amber-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Session window has passed</p>
            )}
            {session.status === 'COMPLETED' && !session.myReview && (
              <Button variant="outline" className="text-accent border-accent/30 hover:bg-accent/10" onClick={() => navigate(`/dashboard/session/${session.id}/review`)}>
                <Star className="w-4 h-4 mr-2" /> Leave review
              </Button>
            )}
            {session.status === 'COMPLETED' && session.myReview && (
              <p className="text-xs text-accent flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> You rated {session.myReview.rating}/5</p>
            )}
            {session.status === 'SCHEDULED' && isTeacher && !session.noShowReportedAt && (
              reportAvailable ? (
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={reportNoShow}>
                  <ShieldAlert className="w-4 h-4 mr-2" /> Report no-show
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> No-show report opens 2 min after start
                </p>
              )
            )}
            {session.noShowReportedAt && (
              <p className="text-xs text-amber-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> No-show report submitted for review
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Time proposals */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" /> Schedule a time
        </h3>
        {session.status === 'PENDING' || session.status === 'SCHEDULED' ? (
          <>
            <div className="mb-4">
              <SchedulePicker
                slots={otherSlots}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={(d) => { setSelectedDate(d); setSelectedTime(''); }}
                onTimeChange={setSelectedTime}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={proposeTime}><Calendar className="w-4 h-4 mr-2" /> Propose time</Button>
              </div>
            </div>
            <div className="space-y-2">
              {proposals.length === 0 && (
                <p className="text-sm text-muted-foreground">No times proposed yet. Propose a time and both parties must agree.</p>
              )}
              {proposals.map((p) => (
                <div key={p.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between gap-3 ${
                  p.status === 'ACCEPTED' ? 'bg-accent/5 border-accent/25' :
                  p.status === 'DECLINED' ? 'bg-muted/40 border-border' :
                  'border-border'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Calendar className="w-4 h-4 text-accent" />
                      {format(new Date(p.proposedAt), 'MMM d, yyyy h:mm a')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      proposed by {p.proposedBy.name} · {p.status === 'PENDING' ? 'awaiting response' : p.status === 'ACCEPTED' ? 'agreed' : 'declined'}
                    </p>
                  </div>
                  {p.status === 'PENDING' && p.proposedBy.id !== user?.id && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => respondToProposal(p.id, true)}><CheckCircle2 className="w-4 h-4 mr-1" /> Agree</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => respondToProposal(p.id, false)}><XCircle className="w-4 h-4 mr-1" /> Decline</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{session.status === 'COMPLETED' ? 'This session is complete.' : 'This session was cancelled.'}</p>
        )}
      </Card>

      {/* Chat */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-[15px] font-semibold tracking-tight mb-4">Chat with {otherPerson?.name}</h3>
        <div className="h-72 overflow-y-auto space-y-3 mb-4 pr-2">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center pt-8">No messages yet. Say hello and agree on a time.</p>
          )}
          {messages.map((m) => {
            const mine = m.sender.id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3.5 py-2 rounded-lg border ${
                  mine ? 'bg-primary text-primary-foreground border-transparent' : 'bg-muted/40 border-border'
                }`}>
                  <p className={`text-[11px] font-medium mb-0.5 ${mine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{m.sender.name}</p>
                  <p className="text-sm">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>{format(new Date(m.createdAt), 'h:mm a')}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Message ${otherPerson?.name}...`}
          />
          <Button onClick={sendMessage} disabled={sending}><Send className="w-4 h-4 mr-2" /> Send</Button>
        </div>
      </Card>
    </div>
  );
}
