import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  useTracks,
  GridLayout,
  ParticipantTile,
  ControlBar,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { MessageCircle, X, PhoneOff, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../../components/LoadingScreen';
import { toast } from 'sonner';
import api from '../../services/api';

// Renders a 2x1 grid for a 1:1 meeting: local + remote video.
function MeetingTiles() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  return (
    <GridLayout tracks={tracks}>
      <ParticipantTile />
    </GridLayout>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const room = useRoomContext();
  const [messages, setMessages] = useState<{ from: string; text: string; ts: number }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const handle = (payload: Uint8Array, participant?: any) => {
      const text = new TextDecoder().decode(payload);
      const from = participant?.name || participant?.identity || 'You';
      setMessages((prev) => [...prev, { from, text, ts: Date.now() }]);
    };
    room.on('dataReceived', handle);
    return () => { room.off('dataReceived', handle); };
  }, [room]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    room.localParticipant.publishData(new TextEncoder().encode(text), { reliable: true });
    setMessages((prev) => [...prev, { from: 'You', text, ts: Date.now() }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0c0c0e] border-l border-white/10">
      <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
        <span className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-accent" /> Chat
        </span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500 text-center pt-6">No messages yet.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-1.5 rounded-lg text-sm ${
              m.from === 'You' ? 'bg-white text-black' : 'bg-white/10 border border-white/10'
            }`}>
              <p className={`text-[10px] mb-0.5 ${m.from === 'You' ? 'text-black/60' : 'text-neutral-400'}`}>{m.from}</p>
              <p className="break-words text-white">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button onClick={send} className="px-3 py-2 rounded-md bg-white text-black text-sm font-medium">Send</button>
        </div>
      </div>
    </div>
  );
}

// Watches participant join/leave inside the room and reports to the parent.
function RoomWatcher({ onTeacherLeft, teacherId }: { onTeacherLeft: () => void; teacherId?: string }) {
  const room = useRoomContext();

  useEffect(() => {
    const handle = (participant: any) => {
      if (teacherId && participant.identity === teacherId) {
        onTeacherLeft();
      }
    };
    room.on('participantDisconnected', handle);
    return () => { room.off('participantDisconnected', handle); };
  }, [room, teacherId, onTeacherLeft]);

  return null;
}

export default function StandaloneMeeting() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionRes, tokenRes] = await Promise.all([
          api.get(`/sessions/${sessionId}`),
          api.get(`/sessions/${sessionId}/token`)
        ]);
        if (sessionRes.data.success && tokenRes.data.success) {
          setSession(sessionRes.data.data);
          setToken(tokenRes.data.data.token);
        } else {
          toast.error('Session not found');
          navigate('/dashboard/sessions');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load session');
        navigate('/dashboard/sessions');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, [sessionId]);

  const endMeeting = useCallback((goToReview = true) => {
    if (endedRef.current) return;
    endedRef.current = true;
    let duration = 0;
    if (startTimeRef.current) duration = Math.ceil((Date.now() - startTimeRef.current) / 60000);
    api.post(`/sessions/${sessionId}/leave`).catch(() => {});
    if (goToReview) navigate(`/dashboard/session/${sessionId}/review?duration=${duration}`);
    // eslint-disable-next-line
  }, [sessionId]);

  const handleConnected = () => {
    startTimeRef.current = Date.now();
    api.post(`/sessions/${sessionId}/join`).catch(() => {});
    // Use the session's configured duration (default 60 min) so timers match.
    const durationMs = (session?.durationMinutes || 60) * 60 * 1000;
    setTimeout(() => { if (!endedRef.current) { toast.info('Session time is up!'); endMeeting(); } }, durationMs);
    if (durationMs > 5 * 60 * 1000) {
      setTimeout(() => { toast.warning('5 minutes remaining in session.'); }, durationMs - (5 * 60 * 1000));
    }
  };

  const isTeacher = Boolean(user?.id && session?.teacher?.id === user.id);
  const teacherId = session?.teacher?.id;

  const handleTeacherLeft = useCallback(() => {
    toast.info('The teacher ended the session.');
    endMeeting();
  }, [endMeeting]);

  if (loading || !user) return <LoadingScreen label="Joining session" />;

  return (
    <div className="h-[100dvh] flex flex-col bg-black text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 bg-neutral-950/90 border-b border-white/10 shrink-0">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold truncate">{session?.topic || 'Session'}</h1>
          <p className="text-xs text-neutral-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {session?.durationMinutes || 60} minutes</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-md border transition-colors ${showChat ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 text-neutral-300 hover:bg-white/5'}`}
            title="Toggle chat"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => endMeeting()}
            className="px-3 py-1.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 flex items-center gap-2 text-sm"
          >
            <PhoneOff className="w-4 h-4" /> End
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 relative">
          {token ? (
            <LiveKitRoom
              token={token}
              serverUrl={import.meta.env.VITE_LIVEKIT_URL}
              connect={true}
              onConnected={handleConnected}
              audio={true}
              video={true}
              options={{ adaptiveStream: true, dynacast: true }}
            >
              <div className="h-full w-full">
                <div className="h-full w-full pb-24">
                  <MeetingTiles />
                </div>
                <RoomAudioRenderer />
                <RoomWatcher onTeacherLeft={handleTeacherLeft} teacherId={isTeacher ? undefined : teacherId} />
                <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 z-10">
                  <ControlBar controls={{ camera: true, microphone: true, screenShare: true, chat: false, leave: false }} />
                </div>
                {showChat && (
                  <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] z-20">
                    <ChatPanel onClose={() => setShowChat(false)} />
                  </div>
                )}
              </div>
            </LiveKitRoom>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">Video room is unavailable.</div>
          )}
        </div>
      </div>
    </div>
  );
}
