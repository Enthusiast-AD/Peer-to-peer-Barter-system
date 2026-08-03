import { useState } from 'react';
import { KeyRound, User as UserIcon, ShieldCheck, Mail, Coins, CalendarDays, AlertTriangle, LogOut } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/users/profile/password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const hasPassword = Boolean(user && 'password' in user);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">Manage your account and security.</p>
      </div>

      {/* Account overview */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-muted-foreground" /> Account
        </h3>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-lg font-semibold text-accent shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</p>
            {user?.isAdmin && (
              <p className="text-xs text-accent flex items-center gap-1.5 mt-1"><ShieldCheck className="w-3.5 h-3.5" /> Administrator</p>
            )}
          </div>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
          <div>
            <dt className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="w-3 h-3" /> Credits</dt>
            <dd className="text-sm font-medium mt-0.5">{user?.credits ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Joined</dt>
            <dd className="text-sm font-medium mt-0.5">{user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Member since</dt>
            <dd className="text-sm font-medium mt-0.5">{user?.createdAt ? format(new Date(user.createdAt), 'd MMM yyyy') : '—'}</dd>
          </div>
        </dl>
      </Card>

      {/* Change password */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-muted-foreground" /> Change password
        </h3>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <p className="text-xs text-muted-foreground">At least 8 characters, with a letter and a number.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update password'}</Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" /> Account
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Log out</p>
            <p className="text-xs text-muted-foreground mt-0.5">End your session and return to the sign-in page.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border p-4 mt-3">
          <div>
            <p className="text-sm font-medium">Delete your account</p>
            <p className="text-xs text-muted-foreground mt-0.5">This permanently removes your profile, skills, and reviews.</p>
          </div>
          <Button variant="destructive" disabled>Coming soon</Button>
        </div>
      </Card>
    </div>
  );
}
