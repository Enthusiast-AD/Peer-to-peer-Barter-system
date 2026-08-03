import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';
import { format, addMonths, startOfMonth, isSameMonth, isBefore } from 'date-fns';

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// 30-min granularity, merged from hourly buckets, de-duped.
function detailedTimesForDate(date: Date, slots: Slot[]): string[] {
  const day = date.getDay();
  const daySlots = slots.filter((s) => s.dayOfWeek === day);
  const times: string[] = [];
  for (const s of daySlots) {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    for (let m = startMin; m + 30 <= endMin; m += 30) {
      times.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
  }
  return [...new Set(times)];
}

interface SchedulePickerProps {
  slots: Slot[];
  selectedDate: Date | null;
  selectedTime: string;
  onDateChange: (d: Date | null) => void;
  onTimeChange: (t: string) => void;
}

export function SchedulePicker({ slots, selectedDate, selectedTime, onDateChange, onTimeChange }: SchedulePickerProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const availableDays = useMemo(() => new Set(slots.map((s) => s.dayOfWeek)), [slots]);
  const hasSlots = slots.length > 0;

  // Build a calendar matrix for the current month.
  const grid = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const firstDayIdx = monthStart.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDayIdx).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    return cells;
  }, [viewMonth]);

  const today = startOfMonth(new Date());
  const prevDisabled = isSameMonth(viewMonth, today) || isBefore(viewMonth, today);
  const nextMonth = addMonths(viewMonth, 1);
  const nextIsBeyond = viewMonth.getFullYear() > new Date().getFullYear() + 1 ||
    (viewMonth.getFullYear() === new Date().getFullYear() + 1 && viewMonth.getMonth() > new Date().getMonth());

  const availableTimes = useMemo(
    () => (selectedDate ? detailedTimesForDate(selectedDate, slots) : []),
    [selectedDate, slots]
  );

  useEffect(() => {
    if (selectedDate && !availableDays.has(selectedDate.getDay())) onDateChange(null);
    // eslint-disable-next-line
  }, [availableDays]);

  const fmtTime = (t: string) => format(new Date(`2000-01-01T${t}:00`), 'h:mm a');

  // Custom date cells
  const isPastDate = (d: Date) => {
    const t = new Date(); t.setHours(0,0,0,0);
    return d.getTime() < t.getTime();
  };

  return (
    <div className="space-y-4">
      {!hasSlots && (
        <div className="p-4 rounded-lg border border-amber-500/25 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
          <p className="font-medium">No availability set yet</p>
          <p className="text-xs mt-0.5">You can still propose any time below.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Month calendar */}
        <div className="rounded-xl border border-border bg-card p-3 select-none">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-sm font-semibold">
              {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                disabled={prevDisabled}
                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMonth(nextMonth)}
                disabled={nextIsBeyond}
                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const available = availableDays.has(d.getDay());
              const past = isPastDate(d);
              const selected = selectedDate && selectedDate.toDateString() === d.toDateString();
              const disabled = past || !available;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onDateChange(d); onTimeChange(''); }}
                  className={`relative aspect-square rounded-lg text-[13px] font-medium transition-colors ${
                    selected
                      ? 'bg-accent text-accent-foreground'
                      : disabled
                        ? 'text-muted-foreground/40 cursor-not-allowed'
                        : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {d.getDate()}
                  {available && !past && !selected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a day'}
            </span>
          </div>
          {!selectedDate ? (
            <div className="text-sm text-muted-foreground text-center py-10 flex flex-col items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground/50" />
              Pick an available day to see times.
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-10">
              No times available on this day. Pick another day.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTimeChange(t)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedTime === t
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-border hover:bg-muted/40 text-foreground'
                  }`}
                >
                  {fmtTime(t)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className="flex items-center gap-2 text-sm text-accent font-medium">
          <span className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-xs">✓</span>
          {format(selectedDate, 'EEEE, MMM d')} at {fmtTime(selectedTime)}
        </div>
      )}
    </div>
  );
}
