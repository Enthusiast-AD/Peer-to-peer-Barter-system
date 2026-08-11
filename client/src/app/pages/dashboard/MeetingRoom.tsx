import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ExternalLink, Clock, Video, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export default function MeetingRoom() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}`);
        if (res.data.success) setSession(res.data.data);
        else { toast.error('Session not found'); navigate('/dashboard/sessions'); }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load session');
        navigate('/dashboard/sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
    // eslint-disable-next-line
  }, [sessionId]);

  const openMeeting = () => {
    setOpened(true);
    window.open(`/meet/${sessionId}`, '_blank', 'noopener,noreferrer');
  };

  if (loading || !user) return <LoadingScreen label="Checking session" />;

  const scheduledAt = session?.scheduledAt ? new Date(session.scheduledAt) : null;
  const joinWindow = scheduledAt ? {
    start: new Date(scheduledAt.getTime() - 10 * 60 * 1000),
    end: new Date(scheduledAt.getTime() + (session?.durationMinutes || 60) * 60 * 1000)
  } : null;
  const now = new Date();
  const canJoin = joinWindow && now >= joinWindow.start && now <= joinWindow.end;
  const isTeacher = user.id === session?.teacher?.id;

  const participant = (p: any, role: string) => (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-semibold text-accent shrink-0">
        {(p?.name || '?').charAt(0)}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm font-medium truncate">{p?.name || 'Unknown'}</p>
        <p className="text-[11px] text-muted-foreground">{role}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <Card className="w-full max-w-md p-8 border-border bg-card">
        <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-5">
          <Video className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-center mb-1">
          {session?.topic || 'Session'}
        </h1>
        {scheduledAt && (
          <p className="text-sm text-muted-foreground text-center mb-1">
            {scheduledAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-6 flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {session?.durationMinutes || 60} minutes
        </p>

        <div className="flex items-center justify-between gap-4 mb-6 px-2">
          {participant(session?.teacher, 'Host')}
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Video className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Live class</span>
          </div>
          {participant(session?.learner, 'Student')}
        </div>

        {opened ? (
          <p className="text-sm text-accent text-center mb-4">
            The class opened in a new tab. It starts when the host joins.
            Return here after it ends to leave a review.
          </p>
        ) : canJoin ? (
          <>
            <Button onClick={openMeeting} className="w-full mb-2">
              <ExternalLink className="w-4 h-4 mr-2" /> Open class in new tab
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {isTeacher
                ? 'You are the host. The class starts when you join - the student will see you once you arrive.'
                : 'The class starts automatically when the host joins. You can wait in the room in the meantime.'}
            </p>
          </>
        ) : joinWindow && now < joinWindow.start ? (
          <p className="text-sm text-amber-500 text-center">
            Join opens {joinWindow.start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        ) : joinWindow && now > joinWindow.end ? (
          <p className="text-sm text-amber-500 text-center">This session window has passed.</p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">This session is not open for joining.</p>
        )}

        {!canJoin && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" /> Sessions start 10 minutes before the scheduled time.
          </div>
        )}
      </Card>
    </div>
  );
}
