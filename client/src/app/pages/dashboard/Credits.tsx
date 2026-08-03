import { useState, useEffect } from 'react';
import { Coins, History, ArrowUpRight, ArrowDownRight, Clock, Calendar, Scale, Star } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  partner: string;
  date: string;
}

interface Session {
  id: string;
  status: string;
  teacherId: string;
  learnerId: string;
  teacher?: { name: string };
  learner?: { name: string };
  updatedAt: string;
}

export default function Credits() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/sessions');
        if (response.data.success) {
          const sessions: Session[] = response.data.data;
          const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
          const history: Transaction[] = completedSessions.map((s) => {
            const isTeacher = s.teacherId === user?.id || s.teacher?.id === user?.id;
            return {
              id: s.id,
              type: isTeacher ? 'earned' : 'spent',
              amount: 60,
              description: isTeacher ? 'Teaching session' : 'Learning session',
              partner: isTeacher ? s.learner?.name : s.teacher?.name,
              date: new Date(s.updatedAt).toLocaleDateString()
            };
          });
          setTransactions(history);
          setTotalEarned(history.filter((t) => t.type === 'earned').reduce((a, c) => a + c.amount, 0));
          setTotalSpent(history.filter((t) => t.type === 'spent').reduce((a, c) => a + c.amount, 0));
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  const stats = [
    { icon: Coins, label: "Balance", value: user?.credits ?? 0 },
    { icon: ArrowUpRight, label: "Earned", value: totalEarned },
    { icon: ArrowDownRight, label: "Spent", value: totalSpent },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Credits</h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">Your balance and session history.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-[13px] font-medium">{stat.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card p-6">
            <h3 className="text-[15px] font-semibold tracking-tight mb-5 flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" /> Transaction history
            </h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No completed sessions yet. Complete a session to see your credit transactions here.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        t.type === 'earned' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>
                        {t.type === 'earned' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.description}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.date}{t.partner ? ` · ${t.partner}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'earned' ? 'text-accent' : 'text-foreground'}`}>
                      {t.type === 'earned' ? '+' : '-'}{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card p-6">
            <h3 className="text-[15px] font-semibold tracking-tight mb-4">Ways to earn</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Scale className="w-4 h-4 text-accent" /></div>
                <div>
                  <h4 className="text-sm font-medium">Teach a session</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Earn 60 credits per hour by teaching your skills.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0"><Star className="w-4 h-4 text-muted-foreground" /></div>
                <div>
                  <h4 className="text-sm font-medium">Get rated 5 stars</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Bonus 10 credits for excellent reviews.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0"><Coins className="w-4 h-4 text-muted-foreground" /></div>
                <div>
                  <h4 className="text-sm font-medium">New user bonus</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Start with 60 free credits when you join.</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="border-border bg-card p-6">
            <h3 className="text-[15px] font-semibold tracking-tight mb-3">How credits work</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Credits are escrowed when you request a credit-paid session and billed by the actual time you meet. Barter sessions exchange skills instead — no credits involved.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
