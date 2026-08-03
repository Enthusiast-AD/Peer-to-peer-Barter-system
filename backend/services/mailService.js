import { Resend } from 'resend';

let resendClient = null;

const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const isMailConfigured = () => {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
};

// Minimal, crafted email template matching the Peersy brand.
const wrapHtml = (title, bodyHtml) => `
  <div style="margin:0;padding:0;background-color:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f7;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">Peersy</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:32px 32px;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
              <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0 0 0;text-align:center;color:#a1a1aa;font-size:12px;line-height:1.6;">
              Peersy — peer-to-peer skill exchange<br/>You're receiving this because you're part of a session.
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>
`;

const sendSessionRequestEmail = async ({
  teacherEmail,
  teacherName,
  learnerName,
  learnerBio,
  learnerTeachSkills,
  topic,
  mode,
  durationMinutes
}) => {
  const client = getResend();

  if (!client || !isMailConfigured() || !teacherEmail) {
    return { skipped: true, reason: 'Mail provider not configured or recipient missing' };
  }

  const skillList = (learnerTeachSkills || []).length
    ? learnerTeachSkills.map((s) => `<li style="margin:2px 0;">${s}</li>`).join('')
    : '<li style="margin:2px 0;">None yet</li>';

  const arrangement = mode === 'BARTER'
    ? `<p style="margin:0 0 12px 0;color:#3f3f46;">This is a <strong>barter</strong> arrangement: <strong>${learnerName || 'The requester'}</strong> will teach you a skill in exchange for this session.</p>
       <p style="margin:0 0 6px 0;color:#3f3f46;"><strong>Skills they can teach:</strong></p>
       <ul style="margin:0 0 16px 0;color:#3f3f46;">${skillList}</ul>`
    : `<p style="margin:0 0 12px 0;color:#3f3f46;">This is a <strong>credit-paid</strong> arrangement: you will receive <strong>${durationMinutes || 60} credits</strong> for this ${durationMinutes || 60}-minute session.</p>`;

  const body = `
    <p style="margin:0 0 16px 0;color:#3f3f46;line-height:1.6;">Hi ${teacherName || 'there'},</p>
    <p style="margin:0 0 12px 0;color:#3f3f46;line-height:1.6;"><strong>${learnerName || 'Someone'}</strong> has requested a session with you for <strong>${topic}</strong>.</p>
    ${learnerBio ? `<p style="margin:0 0 12px 0;color:#3f3f46;line-height:1.6;">About them: ${learnerBio}</p>` : ''}
    ${arrangement}
    <a href="${process.env.CLIENT_URL || ''}/dashboard/sessions" style="display:inline-block;margin-top:8px;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px;">Open your sessions</a>
    <p style="margin:20px 0 0 0;color:#a1a1aa;font-size:13px;line-height:1.6;">Review this request, chat to agree on a time, and accept it from your dashboard.</p>
  `;

  const { error } = await client.emails.send({
    from: process.env.MAIL_FROM,
    to: [teacherEmail],
    subject: `Peersy: ${learnerName || 'Someone'} requested a session with you`,
    html: wrapHtml('New session request', body)
  });

  if (error) {
    console.error('Resend send error (request):', error);
    return { skipped: true, reason: error.message };
  }

  return { skipped: false };
};

const sendSessionScheduledEmail = async ({
  learnerEmail,
  learnerName,
  teacherName,
  skillName,
  scheduledAt,
  meetingLink
}) => {
  const client = getResend();

  if (!client || !isMailConfigured() || !learnerEmail) {
    return { skipped: true, reason: 'Mail provider not configured or recipient missing' };
  }

  const when = new Date(scheduledAt).toLocaleString();
  const safeSkill = skillName || 'your selected skill';

  const body = `
    <p style="margin:0 0 16px 0;color:#3f3f46;line-height:1.6;">Hi ${learnerName || 'there'},</p>
    <p style="margin:0 0 12px 0;color:#3f3f46;line-height:1.6;">${teacherName || 'Your tutor'} accepted your session for <strong>${safeSkill}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background:#f4f4f5;border-radius:12px;padding:16px;">
      <tr><td style="color:#3f3f46;font-size:14px;padding-bottom:4px;">Scheduled time</td></tr>
      <tr><td style="color:#18181b;font-size:16px;font-weight:600;">${when}</td></tr>
    </table>
    ${meetingLink ? `<a href="${process.env.CLIENT_URL || ''}/dashboard/session/${meetingLink.replace('peersy-', '')}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px;">Open session</a>` : ''}
    <p style="margin:20px 0 0 0;color:#a1a1aa;font-size:13px;line-height:1.6;">The meeting opens in your dashboard 10 minutes before the scheduled time.</p>
  `;

  const { error } = await client.emails.send({
    from: process.env.MAIL_FROM,
    to: [learnerEmail],
    subject: 'Peersy: Your session is scheduled',
    html: wrapHtml('Your session is scheduled', body)
  });

  if (error) {
    console.error('Resend send error (scheduled):', error);
    return { skipped: true, reason: error.message };
  }

  return { skipped: false };
};

// 10-minute reminder before a scheduled session. Sent to both participants.
const sendSessionReminderEmail = async ({
  toEmail,
  toName,
  otherName,
  topic,
  scheduledAt,
  durationMinutes,
  sessionUrl
}) => {
  const client = getResend();

  if (!client || !isMailConfigured() || !toEmail) {
    return { skipped: true, reason: 'Mail provider not configured or recipient missing' };
  }

  const when = new Date(scheduledAt).toLocaleString();

  const body = `
    <p style="margin:0 0 16px 0;color:#3f3f46;line-height:1.6;">Hi ${toName || 'there'},</p>
    <p style="margin:0 0 12px 0;color:#3f3f46;line-height:1.6;">Your session on <strong>${topic}</strong> with <strong>${otherName || 'your match'}</strong> starts in about <strong>10 minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background:#f4f4f5;border-radius:12px;padding:16px;">
      <tr><td style="color:#3f3f46;font-size:14px;padding-bottom:4px;">Scheduled time</td></tr>
      <tr><td style="color:#18181b;font-size:16px;font-weight:600;">${when}</td></tr>
      <tr><td style="color:#a1a1aa;font-size:13px;padding-top:4px;">${durationMinutes || 60} minutes · video call</td></tr>
    </table>
    <a href="${sessionUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px;">Join from the platform</a>
    <p style="margin:20px 0 0 0;color:#a1a1aa;font-size:13px;line-height:1.6;">Open the session in your Peersy dashboard to join the video meeting. It becomes available 10 minutes before the start time.</p>
  `;

  const { error } = await client.emails.send({
    from: process.env.MAIL_FROM,
    to: [toEmail],
    subject: 'Peersy: Your session starts in 10 minutes',
    html: wrapHtml('Your session starts soon', body)
  });

  if (error) {
    console.error('Resend send error (reminder):', error);
    return { skipped: true, reason: error.message };
  }

  return { skipped: false };
};

export { sendSessionRequestEmail, sendSessionScheduledEmail, sendSessionReminderEmail };
