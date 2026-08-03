import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import api from '../services/api';
import { format } from 'date-fns';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const QUICK_PRESETS: { label: string; start: string; end: string }[] = [
  { label: 'Morning', start: '09:00', end: '12:00' },
  { label: 'Afternoon', start: '13:00', end: '17:00' },
  { label: 'Evening', start: '18:00', end: '21:00' },
];

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const parseMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export default function AvailabilitySlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(1);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/availability/mine').then((res) => {
      if (res.data.success) setSlots(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const add = async (startTime = start, endTime = end, d = day) => {
    if (parseMin(endTime) <= parseMin(startTime)) {
      toast.error('End time must be after the start time');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/availability', { dayOfWeek: d, startTime, endTime });
      if (res.data.success) {
        setSlots((prev) => [...prev, res.data.data].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
        toast.success('Slot added');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add slot');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await api.delete(`/availability/${id}`);
      if (res.data.success) {
        setSlots((prev) => prev.filter((s) => s.id !== id));
        toast.success('Slot removed');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to remove slot');
    }
  };

  const fmt = (t: string) => format(new Date(`2000-01-01T${t}:00`), 'h:mm a');

  const grouped = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    for (const s of slots) (map[s.dayOfWeek] = map[s.dayOfWeek] || []).push(s);
    return map;
  }, [slots]);

  const totalWeeklyHours = useMemo(() => {
    let mins = 0;
    for (const s of slots) mins += parseMin(s.endTime) - parseMin(s.startTime);
    return (mins / 60).toFixed(1);
  }, [slots]);

  return (
    <Card className="p-6 border-border bg-card">
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" /> Availability
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Set weekly times you're free. Matches can pick from these when scheduling.
        </p>
        {slots.length > 0 && (
          <p className="text-xs text-accent font-medium mt-2">
            {slots.length} slot{slots.length > 1 ? 's' : ''} · {totalWeeklyHours} hrs / week
          </p>
        )}
      </div>

      {/* Add slot form */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add a time slot</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="px-3 py-2 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
              className="px-3 py-2 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
              className="px-3 py-2 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <Button onClick={() => add()} disabled={saving} className="shrink-0"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Quick add:</span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setStart(p.start); setEnd(p.end); add(p.start, p.end); }}
              disabled={saving}
              className="px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-accent/5 transition-colors disabled:opacity-50"
            >
              {p.label} · {p.start.slice(0, 5)}–{p.end.slice(0, 5)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8 rounded-xl border border-dashed border-border">
          <CalendarDays className="w-6 h-6 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No availability set yet. Add your first slot above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {DAYS.map((dayName, dayIdx) => {
            const daySlots = grouped[dayIdx] || [];
            if (daySlots.length === 0) return null;
            return (
              <div key={dayName} className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{DAY_SHORT[dayIdx]}</p>
                <div className="space-y-1.5">
                  {daySlots.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border/70">
                      <span className="text-[13px] font-medium text-foreground">
                        {fmt(s.startTime)} – {fmt(s.endTime)}
                      </span>
                      <button onClick={() => remove(s.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
