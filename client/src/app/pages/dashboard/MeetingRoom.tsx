import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ExternalLink, Clock, Video } from 'lucide-react';
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
    // Open the standalone meeting in a new tab.
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md p-8 border-border bg-card text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-5">
          <Video className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight mb-1">{session?.topic || 'Session'}</h1>
        {scheduledAt && (
          <p className="text-sm text-muted-foreground mb-1">
            {scheduledAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-6 flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {session?.durationMinutes || 60} minutes
        </p>

        {opened ? (
          <p className="text-sm text-accent mb-4">
            The meeting opened in a new tab. Return here after it ends to leave a review.
          </p>
        ) : canJoin ? (
          <>
            <Button onClick={openMeeting} className="w-full mb-2">
              <ExternalLink className="w-4 h-4 mr-2" /> Open meeting in new tab
            </Button>
            <p className="text-xs text-muted-foreground">
              The meeting opens full-screen in a separate tab.
            </p>
          </>
        ) : joinWindow && now < joinWindow.start ? (
          <p className="text-sm text-amber-500">
            Join opens {joinWindow.start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        ) : joinWindow && now > joinWindow.end ? (
          <p className="text-sm text-amber-500">This session window has passed.</p>
        ) : (
          <p className="text-sm text-muted-foreground">This session is not open for joining.</p>
        )}
      </Card>
    </div>
  );
}
