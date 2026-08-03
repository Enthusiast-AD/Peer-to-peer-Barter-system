import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Lightbulb, User, Settings2, ShieldCheck, BookOpen, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Textarea } from '../../components/ui/textarea';
import AvailabilitySlots from '../../components/AvailabilitySlots';

export default function SkillProfile() {
  const { user, setUser } = useAuth();
  const [skillsIKnow, setSkillsIKnow] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const [newSkillKnow, setNewSkillKnow] = useState('');
  const [newSkillLearn, setNewSkillLearn] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProfileConfigured, setIsProfileConfigured] = useState(false);
  const [hasResolvedInitialMode, setHasResolvedInitialMode] = useState(false);

  const hydrateProfileState = (profileUser: any) => {
    const skills = profileUser?.skills || profileUser?.Skills || [];
    const nextBio = profileUser?.bio || '';
    setSkillsIKnow(skills.filter((s: any) => s.type === 'TEACH').map((s: any) => s.name));
    setSkillsToLearn(skills.filter((s: any) => s.type === 'LEARN').map((s: any) => s.name));
    setBio(nextBio);

    const hasConfiguredProfile = Boolean(nextBio?.trim()) || skills.length > 0;
    setIsProfileConfigured(hasConfiguredProfile);
    return hasConfiguredProfile;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        if (response.data?.success) {
          const profileUser = response.data.data;
          setUser(profileUser);
          const configured = hydrateProfileState(profileUser);
          setIsEditing(!configured);
          setHasResolvedInitialMode(true);
          return;
        }
      } catch (error) {
        console.error('Failed to load profile for skill page', error);
      }

      const configured = hydrateProfileState(user);
      setIsEditing(!configured);
      setHasResolvedInitialMode(true);
      setIsInitialLoading(false);
    };

    loadProfile().finally(() => setIsInitialLoading(false));
    // eslint-disable-next-line
  }, [setUser]);

  useEffect(() => {
    if (isInitialLoading || !user) return;
    const configured = hydrateProfileState(user);
    if (!hasResolvedInitialMode) {
      setIsEditing(!configured);
      setHasResolvedInitialMode(true);
    }
    // eslint-disable-next-line
  }, [user, isInitialLoading, hasResolvedInitialMode]);

  const addSkillKnow = () => {
    if (newSkillKnow.trim() && !skillsIKnow.includes(newSkillKnow.trim())) {
      setSkillsIKnow([...skillsIKnow, newSkillKnow.trim()]);
      setNewSkillKnow('');
    }
  };

  const addSkillLearn = () => {
    if (newSkillLearn.trim() && !skillsToLearn.includes(newSkillLearn.trim())) {
      setSkillsToLearn([...skillsToLearn, newSkillLearn.trim()]);
      setNewSkillLearn('');
    }
  };

  const removeSkillKnow = (index: number) => {
    setSkillsIKnow(skillsIKnow.filter((_, i) => i !== index));
  };

  const removeSkillLearn = (index: number) => {
    setSkillsToLearn(skillsToLearn.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/users/profile', {
        bio,
        skillsToTeach: skillsIKnow,
        skillsToLearn: skillsToLearn
      });
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        setIsProfileConfigured(hydrateProfileState(updatedUser));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {isInitialLoading ? (
        <Card className="p-8 text-muted-foreground">Loading your profile...</Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Skill profile</h1>
              <p className="text-muted-foreground mt-1.5 text-[15px]">Define who you are and what you want to achieve.</p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Settings2 className="w-4 h-4" /> Edit profile
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {!isProfileConfigured && (
                  <div className="bg-accent/5 border border-accent/20 p-5 rounded-lg flex items-start gap-3">
                    <div className="p-2.5 bg-accent/10 rounded-full text-accent shrink-0">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px]">Welcome! Let's build your profile.</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Add a bio and the skills you can teach and learn. This takes less than a minute.</p>
                    </div>
                  </div>
                )}

                <Card className="p-6 border-border bg-card">
                  <h2 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> About me</h2>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself, your background, and your goals..."
                    className="min-h-[120px] resize-none"
                  />
                </Card>

                <div className="grid md:grid-cols-2 gap-5">
                  <Card className="p-6 border-border bg-card">
                    <div className="mb-4">
                      <h2 className="text-[15px] font-semibold tracking-tight flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> Skills to teach</h2>
                      <p className="text-xs text-muted-foreground mt-1">Add one skill at a time — press Enter or tap + to add it.</p>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="e.g. React, then add another..."
                        value={newSkillKnow}
                        onChange={(e) => setNewSkillKnow(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkillKnow()}
                      />
                      <Button onClick={addSkillKnow} className="px-3 shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {skillsIKnow.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-accent/25 text-accent gap-1.5 py-1.5 px-3">
                          {skill}
                          <button onClick={() => removeSkillKnow(index)} className="text-accent/50 hover:text-accent transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </Badge>
                      ))}
                      {skillsIKnow.length === 0 && <span className="text-sm text-muted-foreground/70 italic">No skills added yet.</span>}
                    </div>
                  </Card>

                  <Card className="p-6 border-border bg-card">
                    <div className="mb-4">
                      <h2 className="text-[15px] font-semibold tracking-tight flex items-center gap-2"><BookOpen className="w-4 h-4 text-muted-foreground" /> Skills to learn</h2>
                      <p className="text-xs text-muted-foreground mt-1">Add one skill at a time — press Enter or tap + to add it.</p>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="e.g. Python, then add another..."
                        value={newSkillLearn}
                        onChange={(e) => setNewSkillLearn(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkillLearn()}
                      />
                      <Button onClick={addSkillLearn} className="px-3 shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {skillsToLearn.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs gap-1.5 py-1.5 px-3">
                          {skill}
                          <button onClick={() => removeSkillLearn(index)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </Badge>
                      ))}
                      {skillsToLearn.length === 0 && <span className="text-sm text-muted-foreground/70 italic">No skills added yet.</span>}
                    </div>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={loading || (skillsIKnow.length === 0 && skillsToLearn.length === 0)}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Save profile'}
                  </Button>
                  {isProfileConfigured && (
                    <Button onClick={() => setIsEditing(false)} variant="outline" disabled={loading}>Cancel</Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <Card className="p-6 border-border bg-card">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border shrink-0 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                      ) : (
                        <User className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold tracking-tight">{user?.name}</h2>
                        <ShieldCheck className="w-4 h-4 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{user?.bio || <span className="italic">No bio provided.</span>}</p>
                    </div>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-5">
                  <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                      <Lightbulb className="w-4 h-4 text-accent" />
                      <h3 className="text-[15px] font-semibold tracking-tight">I can teach</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillsIKnow.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-accent/25 text-accent py-1.5 px-3">{s}</Badge>
                      ))}
                      {skillsIKnow.length === 0 && <span className="text-sm text-muted-foreground/70 italic">No teaching skills listed.</span>}
                    </div>
                  </Card>
                  <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-[15px] font-semibold tracking-tight">I want to learn</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillsToLearn.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-xs py-1.5 px-3">{s}</Badge>
                      ))}
                      {skillsToLearn.length === 0 && <span className="text-sm text-muted-foreground/70 italic">No learning goals listed.</span>}
                    </div>
                  </Card>
                </div>

                <AvailabilitySlots />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
