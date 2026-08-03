import { useState, useEffect } from 'react';
import { Search, Scale, Coins, RefreshCw, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Matching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedDefaults, setHasLoadedDefaults] = useState(false);
  const [requestingTutor, setRequestingTutor] = useState<any>(null);
  const [requestMode, setRequestMode] = useState<'BARTER' | 'CREDITS'>('BARTER');
  const [requestTopic, setRequestTopic] = useState('');
  const [requestSending, setRequestSending] = useState(false);

  const groupedTutors = results.reduce((acc: any[], skillMatch: any) => {
    const tutor = skillMatch.user || skillMatch.User;
    if (!tutor?.id) return acc;
    const existing = acc.find((item) => item.id === tutor.id);
    if (existing) {
      if (!existing.matchedSkills.includes(skillMatch.name)) existing.matchedSkills.push(skillMatch.name);
      return acc;
    }
    acc.push({
      id: tutor.id,
      name: tutor.name,
      avatar: tutor.avatar,
      credits: tutor.credits,
      bio: tutor.bio,
      matchedSkills: [skillMatch.name],
      firstSkillId: skillMatch.id
    });
    return acc;
  }, []);

  useEffect(() => {
    if (user?.skills && !hasLoadedDefaults) {
      const skillsToLearn = user.skills.filter((s: any) => s.type === 'LEARN').map((s: any) => s.name);
      if (skillsToLearn.length > 0) {
        setQuery(skillsToLearn.join(', '));
        fetchMultipleMatches(skillsToLearn);
      }
      setHasLoadedDefaults(true);
    }
    // eslint-disable-next-line
  }, [user, hasLoadedDefaults]);

  const fetchMultipleMatches = async (skills: string[]) => {
    setLoading(true);
    try {
      const allResults: any[] = [];
      const seen = new Set();
      for (const skill of skills) {
        const response = await api.get('/skills/search', { params: { query: skill.trim(), type: 'TEACH' } });
        if (response.data.success) {
          const matches = Array.isArray(response.data.data) ? response.data.data : (response.data.data?.data || []);
          for (const match of matches) {
            if (!seen.has(match.id)) { seen.add(match.id); allResults.push(match); }
          }
        }
      }
      setResults(allResults);
    } catch (error) {
      console.error(error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const skills = query.split(',').map((s) => s.trim()).filter(Boolean);
    if (skills.length > 0) fetchMultipleMatches(skills);
    else setResults([]);
  };

  const handleRequestSession = (teacherId: string, skillId: string, topic: string) => {
    setRequestingTutor({ teacherId, skillId, topic });
    setRequestTopic(`Learning ${topic}`);
    setRequestMode('BARTER');
  };

  const submitRequest = async () => {
    if (!requestingTutor) return;
    setRequestSending(true);
    try {
      const response = await api.post('/sessions/request', {
        teacherId: requestingTutor.teacherId,
        skillId: requestingTutor.skillId,
        topic: requestTopic,
        durationMinutes: 60,
        mode: requestMode
      });
      if (response.data.success) {
        toast.success('Request sent! The teacher has been notified by email.');
        setRequestingTutor(null);
        navigate('/dashboard/sessions');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request session');
    } finally {
      setRequestSending(false);
    }
  };

  const myTeachSkills = (user?.skills || []).filter((s: any) => s.type === 'TEACH').map((s: any) => s.name);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Find matches</h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">Search people who can teach what you want to learn.</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="What do you want to learn today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      <div className="space-y-3">
        {groupedTutors.map((tutor) => (
          <Card key={tutor.id} className="p-5 border-border bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="w-11 h-11 border border-border">
                  <AvatarImage src={tutor.avatar} />
                  <AvatarFallback>{tutor.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold tracking-tight">{tutor.name}</h3>
                    {tutor.credits != null && <span className="text-xs text-muted-foreground">· {tutor.credits} credits</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{tutor.bio || 'No bio added yet.'}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {tutor.matchedSkills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs border-accent/25 text-accent">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => navigate(`/dashboard/users/${tutor.id}`, { state: { initialProfile: { id: tutor.id, name: tutor.name, avatar: tutor.avatar, bio: tutor.bio, credits: tutor.credits, skills: tutor.matchedSkills.map((name: string, idx: number) => ({ id: `${tutor.id}-${idx}`, name, type: 'TEACH' })) } } })}>
                  Profile
                </Button>
                <Button onClick={() => handleRequestSession(tutor.id, tutor.firstSkillId, tutor.matchedSkills[0])}>
                  Request session
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {!loading && groupedTutors.length === 0 && query && (
          <p className="text-center text-muted-foreground text-sm py-10">No matching tutors found.</p>
        )}
      </div>

      {/* Request dialog */}
      <Dialog open={!!requestingTutor} onOpenChange={(open) => !open && setRequestingTutor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a session</DialogTitle>
            <DialogDescription>with {requestingTutor?.name} · {requestingTutor?.topic}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label>
              <Input value={requestTopic} onChange={(e) => setRequestTopic(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">How do you want to pay?</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRequestMode('BARTER')}
                  className={`p-4 rounded-lg border text-left transition-colors ${requestMode === 'BARTER' ? 'border-accent bg-accent/5' : 'border-border bg-card hover:bg-muted/40'}`}>
                  <Scale className="w-5 h-5 text-accent mb-2" />
                  <p className="font-semibold text-sm">Barter</p>
                  <p className="text-xs text-muted-foreground mt-1">Teach a skill in exchange</p>
                  {myTeachSkills.length > 0
                    ? <p className="text-xs text-accent mt-1">You can teach: {myTeachSkills.join(', ')}</p>
                    : <p className="text-xs text-amber-500 mt-1">No teach skills listed yet</p>}
                </button>
                <button type="button" onClick={() => setRequestMode('CREDITS')}
                  className={`p-4 rounded-lg border text-left transition-colors ${requestMode === 'CREDITS' ? 'border-accent bg-accent/5' : 'border-border bg-card hover:bg-muted/40'}`}>
                  <Coins className="w-5 h-5 text-accent mb-2" />
                  <p className="font-semibold text-sm">Credits</p>
                  <p className="text-xs text-muted-foreground mt-1">Pay 60 credits for 60 minutes</p>
                  <p className="text-xs text-muted-foreground mt-1">Balance: {user?.credits ?? 0}</p>
                </button>
              </div>
              {requestMode === 'CREDITS' && (user?.credits ?? 0) < 60 && (
                <p className="text-xs text-amber-500">Insufficient credits for a 60-minute session.</p>
              )}
            </div>
            <Button onClick={submitRequest} disabled={requestSending || (requestMode === 'CREDITS' && (user?.credits ?? 0) < 60)} className="w-full">
              {requestSending ? 'Sending...' : 'Send request'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">The teacher is notified by email. You can chat and agree on a time in Sessions.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
