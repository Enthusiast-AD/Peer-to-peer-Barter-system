import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  useTracks,
  RoomAudioRenderer,
  useRoomContext,
  useLocalParticipant,
  VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import {
  MessageCircle,
  X,
  PhoneOff,
  Clock,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Users,
  Pin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../../components/LoadingScreen';
import { toast } from 'sonner';
import api from '../../services/api';

type PinnedRef = { identity: string; source: Track.Source } | null;

function initials(name?: string) {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function VideoTile({
  trackRef,
  isStage,
  isPinned,
  onPinToggle,
  live,
}: {
  trackRef: any;
  isStage?: boolean;
  isPinned?: boolean;
  onPinToggle?: () => void;
  live?: boolean;
}) {
  const participant = trackRef.participant;
  const isSelf = Boolean(participant.isLocal);
  const hasVideo = Boolean(trackRef.publication?.videoTrack);
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-[#121214] border transition-colors ${
        isPinned ? 'border-blue-500/60' : 'border-white/10'
      } ${isStage ? 'h-full w-full' : ''}`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className={`w-full h-full ${isStage ? 'object-contain' : 'object-cover'}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#18181c] to-[#0d0d10]">
          <div className={`rounded-full bg-neutral-700 flex items-center justify-center font-semibold text-neutral-300 ${isStage ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm'}`}>
            {initials(participant.name || participant.identity)}
          </div>
          {isStage && (
            <span className="text-xs text-neutral-500 font-medium">
              {isSelf ? 'You are off camera' : `${participant.name || participant.identity} is off camera`}
            </span>
          )}
        </div>
      )}

      {/* Speaking ring */}
      {isSpeaking && live && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500/70 pointer-events-none" />
      )}

      {/* Name + source badge */}
      <div className="absolute bottom-0 inset-x-0 p-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white max-w-[70%]">
            <span className="truncate">
              {isSelf ? 'You' : participant.name || participant.identity}
            </span>
            {trackRef.source === Track.Source.ScreenShare && (
              <span className="text-blue-400 text-[10px]">• presenting</span>
            )}
          </div>
          {isStage && onPinToggle && live && (
            <button
              onClick={(e) => { e.stopPropagation(); onPinToggle(); }}
              title={isPinned ? 'Unpin' : 'Pin to stage'}
              className={`p-1.5 rounded-md bg-black/60 backdrop-blur-sm transition-colors ${
                isPinned ? 'text-blue-400' : 'text-white/70 hover:text-white'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const room = useRoomContext();
  const [messages, setMessages] = useState<{ from: string; text: string; ts: number }[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (payload: Uint8Array, participant?: any) => {
      const text = new TextDecoder().decode(payload);
      const from = participant?.name || participant?.identity || 'You';
      setMessages((prev) => [...prev, { from, text, ts: Date.now() }]);
    };
    room.on('dataReceived', handle);
    return () => {
      room.off('dataReceived', handle);
    };
  }, [room]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    room.localParticipant.publishData(new TextEncoder().encode(text), { reliable: true });
    setMessages((prev) => [...prev, { from: 'You', text, ts: Date.now() }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0c0c0e] border-l border-white/10">
      <div className="flex items-center justify-between px-4 h-12 border-b border-white/10 shrink-0">
        <span className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" /> Class chat
        </span>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500 text-center pt-6">No messages yet.</p>
        )}
        {messages.map((m, i) => {
          const mine = m.from === 'You';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${mine ? 'bg-white text-black' : 'bg-white/10 border border-white/10'}`}>
                <p className={`text-[10px] mb-0.5 font-medium ${mine ? 'text-black/50' : 'text-neutral-400'}`}>{m.from}</p>
                <p className={`break-words leading-snug ${mine ? 'text-black' : 'text-white'}`}>{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={send}
            className="px-3 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function PresenceWatcher({
  teacherId,
  learnerId,
  onPresence,
}: {
  teacherId: string;
  learnerId: string;
  onPresence: (teacherPresent: boolean, learnerPresent: boolean) => void;
}) {
  const room = useRoomContext();

  useEffect(() => {
    const update = () => {
      const localId = room.localParticipant.identity;
      const teacherPresent = localId === teacherId || room.remoteParticipants.has(teacherId);
      const learnerPresent = localId === learnerId || room.remoteParticipants.has(learnerId);
      onPresence(teacherPresent, learnerPresent);
    };
    update();
    room.on('participantConnected', update);
    room.on('participantDisconnected', update);
    return () => {
      room.off('participantConnected', update);
      room.off('participantDisconnected', update);
    };
  }, [room, teacherId, learnerId, onPresence]);

  return null;
}

function ClassRoom({
  session,
  isTeacher,
  teacherId,
  learnerId,
  userId,
  onLiveChange,
  onLeave,
}: {
  session: any;
  isTeacher: boolean;
  teacherId: string;
  learnerId: string;
  userId: string;
  onLiveChange: (live: boolean) => void;
  onLeave: () => void;
}) {
  const [pinned, setPinned] = useState<PinnedRef>(null);
  const [teacherPresent, setTeacherPresent] = useState(false);
  const [learnerPresent, setLearnerPresent] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } =
    useLocalParticipant();

  const live = isTeacher ? learnerPresent : teacherPresent;

  useEffect(() => {
    onLiveChange(live);
  }, [live, onLiveChange]);

  const handlePresence = useCallback((t: boolean, l: boolean) => {
    setTeacherPresent(t);
    setLearnerPresent(l);
  }, []);

  // Elapsed timer, only while the class is live.
  useEffect(() => {
    if (!live) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [live]);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const cameraTracks = tracks.filter((t: any) => t.source === Track.Source.Camera);
  const screenTracks = tracks.filter((t: any) => t.source === Track.Source.ScreenShare);

  // Auto-stage: teacher's screen > teacher's camera > first remote camera > local camera.
  const teacherCam = cameraTracks.find((t: any) => t.participant.identity === teacherId);
  const teacherScreen = screenTracks.find((t: any) => t.participant.identity === teacherId);
  const remoteCam = cameraTracks.find((t: any) => t.participant.identity !== userId);
  const localCam = cameraTracks.find((t: any) => t.participant.identity === userId);

  let stage: any =
    (pinned && tracks.find((t: any) => t.participant.identity === pinned.identity && t.source === pinned.source)) ||
    teacherScreen ||
    teacherCam ||
    remoteCam ||
    localCam ||
    null;

  const stageParticipantId = stage?.participant?.identity;
  const stageSource = stage?.source;

  const railTracks = tracks.filter((t: any) => {
    const same = t.participant.identity === stageParticipantId;
    if (same && t.source === stageSource) return false;
    if (same && stageSource === Track.Source.Camera && t.source === Track.Source.Camera) return false;
    if (same && stageSource === Track.Source.ScreenShare && t.source === Track.Source.ScreenShare) return false;
    return true;
  });

  // Clear the pin if the pinned participant leaves.
  useEffect(() => {
    if (pinned && !tracks.some((t: any) => t.participant.identity === pinned.identity)) {
      setPinned(null);
    }
  }, [tracks, pinned]);

  const togglePin = (identity: string, source: Track.Source) => {
    setPinned((prev) =>
      prev?.identity === identity && prev.source === source ? null : { identity, source },
    );
  };

  const fmtElapsed = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  const otherName = isTeacher ? session?.learner?.name : session?.teacher?.name;

  return (
    <div className="relative h-full flex flex-col">
      <PresenceWatcher
        teacherId={teacherId}
        learnerId={learnerId}
        onPresence={handlePresence}
      />

      {/* Stage + rail region */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {/* Stage */}
        <div className="flex-1 min-h-0 p-3 md:p-4">
          <div className="h-full w-full">
            {stage ? (
              <VideoTile
                trackRef={stage}
                isStage
                isPinned={Boolean(pinned && stage.participant.identity === pinned.identity && stage.source === pinned.source)}
                onPinToggle={() => togglePin(stage.participant.identity, stage.source)}
                live={live}
              />
            ) : (
              <div className="h-full w-full rounded-xl border border-white/10 bg-[#121214] flex items-center justify-center text-neutral-500 text-sm">
                Connecting video...
              </div>
            )}
          </div>
        </div>

        {/* Participant rail */}
        {railTracks.length > 0 && (
          <div className="shrink-0 px-3 pb-3 md:px-4 md:pb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar h-24 md:h-32">
              {railTracks.map((t: any) => (
                <div key={`${t.participant.identity}-${t.source}`} className="h-full w-36 md:w-48 shrink-0">
                  <VideoTile
                    trackRef={t}
                    isPinned={pinned?.identity === t.participant.identity && pinned.source === t.source}
                    onPinToggle={() => togglePin(t.participant.identity, t.source)}
                    live={live}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting overlay - covers stage + rail, keeps controls usable */}
        {!live && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-blue-500/15 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isTeacher ? 'Waiting for your student' : 'Waiting for your host'}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                {isTeacher
                  ? `${otherName || 'The learner'} hasn't joined yet. The class will start automatically when they arrive.`
                  : `${otherName || 'Your host'} will start the class as soon as they join. Please stay on this page.`}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                <Clock className="w-3.5 h-3.5" /> Session starts when the host joins
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="shrink-0 border-t border-white/10 bg-[#0c0c0e] px-3 py-3 flex items-center justify-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            title={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isMicrophoneEnabled
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500/90 text-white hover:bg-red-600'
            }`}
          >
            {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
            title={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isCameraEnabled
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500/90 text-white hover:bg-red-600'
            }`}
          >
            {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
            title={isScreenShareEnabled ? 'Stop presenting' : 'Present your screen'}
            className={`h-10 px-3.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors ${
              isScreenShareEnabled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MonitorUp className="w-4 h-4" />
            <span className="hidden sm:inline">{isScreenShareEnabled ? 'Stop presenting' : 'Present'}</span>
          </button>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            title="Toggle chat"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showChat ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-full bg-white/10 text-xs text-neutral-300"
            title="Participants"
          >
            <Users className="w-3.5 h-3.5" />
            {isTeacher ? (learnerPresent ? '2' : '1') : teacherPresent ? '2' : '1'}
          </div>
          {live && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-full bg-white/10 text-xs text-neutral-300 tabular-nums">
              <Clock className="w-3.5 h-3.5" /> {fmtElapsed(elapsed)}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

        <button
          onClick={onLeave}
          className="h-10 px-4 rounded-full bg-red-500/90 hover:bg-red-600 text-white text-xs font-medium flex items-center gap-2 transition-colors"
        >
          <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">Leave class</span>
        </button>
      </div>

      {/* Chat panel */}
      {showChat && (
        <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[88vw] z-30">
          <ChatPanel onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
}

export default function StandaloneMeeting() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const liveStartedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionRes, tokenRes] = await Promise.all([
          api.get(`/sessions/${sessionId}`),
          api.get(`/sessions/${sessionId}/token`),
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

  const endMeeting = useCallback(
    (goToReview = true) => {
      if (endedRef.current) return;
      endedRef.current = true;
      let duration = 0;
      if (startTimeRef.current)
        duration = Math.ceil((Date.now() - startTimeRef.current) / 60000);
      api.post(`/sessions/${sessionId}/leave`).catch(() => {});
      if (goToReview) navigate(`/dashboard/session/${sessionId}/review?duration=${duration}`);
      // eslint-disable-next-line
    },
    [sessionId],
  );

  const handleConnected = useCallback(() => {
    startTimeRef.current = Date.now();
    setConnected(true);
    api.post(`/sessions/${sessionId}/join`).catch(() => {});
    // eslint-disable-next-line
  }, [sessionId]);

  const handleLiveChange = useCallback(
    (live: boolean) => {
      if (!live || liveStartedRef.current) return;
      liveStartedRef.current = true;
      const durationMs = (session?.durationMinutes || 60) * 60 * 1000;
      setTimeout(() => {
        if (!endedRef.current) {
          toast.info('Session time is up!');
          endMeeting();
        }
      }, durationMs);
      if (durationMs > 5 * 60 * 1000) {
        setTimeout(() => {
          if (!endedRef.current) toast.warning('5 minutes remaining in session.');
        }, durationMs - 5 * 60 * 1000);
      }
    },
    [session, endMeeting],
  );

  const isTeacher = Boolean(user?.id && session?.teacher?.id === user.id);
  const teacherId = session?.teacher?.id;

  const handleTeacherLeft = useCallback(() => {
    if (!endedRef.current) {
      toast.info('The teacher ended the session.');
      endMeeting();
    }
  }, [endMeeting]);

  if (loading || !user) return <LoadingScreen label="Joining class" />;

  return (
    <div className="h-[100dvh] flex flex-col bg-black text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 bg-[#0c0c0e] border-b border-white/10 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <img src="/peersyLogo.png" alt="Peersy" className="w-5 h-5 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">{session?.topic || 'Session'}</h1>
            <p className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {session?.durationMinutes || 60} minutes
              {isTeacher && <span className="text-blue-400">• Host</span>}
            </p>
          </div>
        </div>
        {connected && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[11px] text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Connected
          </div>
        )}
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
                <ClassRoom
                  session={session}
                  isTeacher={isTeacher}
                  teacherId={teacherId}
                  learnerId={session?.learner?.id}
                  userId={user.id}
                  onLiveChange={handleLiveChange}
                  onLeave={() => endMeeting()}
                />
                <RoomAudioRenderer />
                <PresenceLeftWatcher
                  teacherId={isTeacher ? undefined : teacherId}
                  onTeacherLeft={handleTeacherLeft}
                />
              </div>
            </LiveKitRoom>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              Video room is unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PresenceLeftWatcher({
  teacherId,
  onTeacherLeft,
}: {
  teacherId?: string;
  onTeacherLeft: () => void;
}) {
  const room = useRoomContext();

  useEffect(() => {
    if (!teacherId) return;
    const handle = (participant: any) => {
      if (participant.identity === teacherId) onTeacherLeft();
    };
    room.on('participantDisconnected', handle);
    return () => {
      room.off('participantDisconnected', handle);
    };
  }, [room, teacherId, onTeacherLeft]);

  return null;
}
