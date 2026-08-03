// Generates a downloadable .ics file for a scheduled session.
export function downloadICS({ topic, description, start, durationMinutes, url }) {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + (durationMinutes || 60) * 60000);
  const fmt = (d) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Peersy//Peersy//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@peersy`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(startDate)}`,
    `DTEND:${fmt(endDate)}`,
    `SUMMARY:${escapeICS(topic)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `peersy-${topic.replace(/\s+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

const escapeICS = (s) => (s || '').replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
