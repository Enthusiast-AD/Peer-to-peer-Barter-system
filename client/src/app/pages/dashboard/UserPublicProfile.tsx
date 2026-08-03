import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Lightbulb, UserCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';
import { toast } from 'sonner';

export default function UserPublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialProfile = (location.state as any)?.initialProfile || null;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setLoading(false);
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${userId}/public`);
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        if (!initialProfile) {
          toast.error('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, initialProfile]);

  if (loading) {
    return <div className="text-neutral-300">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        <p className="text-neutral-400">Profile not found.</p>
      </div>
    );
  }

  const teachSkills = (profile.skills || profile.Skills || []).filter((s: any) => s.type === 'TEACH');
  const learnSkills = (profile.skills || profile.Skills || []).filter((s: any) => s.type === 'LEARN');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-start gap-4">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border border-border">
              <UserCircle className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{profile.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{profile.bio || 'No bio added yet.'}</p>
            <p className="text-xs text-muted-foreground mt-2">Credits: {profile.credits}</p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-border bg-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> Skills they teach</h2>
          <div className="flex flex-wrap gap-2">
            {teachSkills.length > 0 ? teachSkills.map((skill: any) => (
              <Badge key={skill.id} variant="outline" className="text-xs border-accent/25 text-accent py-1.5 px-3">{skill.name}</Badge>
            )) : <p className="text-sm text-muted-foreground">No teaching skills listed.</p>}
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-muted-foreground" /> Skills they want to learn</h2>
          <div className="flex flex-wrap gap-2">
            {learnSkills.length > 0 ? learnSkills.map((skill: any) => (
              <Badge key={skill.id} variant="outline" className="text-xs py-1.5 px-3">{skill.name}</Badge>
            )) : <p className="text-sm text-muted-foreground">No learning goals listed.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
