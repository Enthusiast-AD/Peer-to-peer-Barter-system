import { prisma } from '../db/index.js';
import { WebhookReceiver } from 'livekit-server-sdk';
import { ApiResponse } from '../utils/ApiResponse.js';

// LiveKit webhook receiver - verifies requests come from LiveKit.
// The SDK uses the `Authorization` header (JWT signed with api key/secret).
let receiver = null;
const getReceiver = () => {
  if (process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
    receiver = new WebhookReceiver(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
  }
  return receiver;
};

// LiveKit sends webhooks for room/participant events. We use them to track the
// real meeting start/end so credit settlement reflects actual elapsed time.
const handleLiveKitWebhook = async (req, res) => {
  const rcv = getReceiver();
  if (!rcv) {
    return res.status(503).json({ success: false, message: 'LiveKit webhook not configured' });
  }

  let event;
  try {
    // LiveKit signs with the `Authorization` header. express.raw gives a Buffer,
    // and the SDK expects a string body. Always await - rejections must not
    // escape this handler or they crash the process.
    const body = req.body?.toString?.() || '';
    event = await rcv.receive(body, req.headers['authorization'] || '');
  } catch (err) {
    console.error('Invalid LiveKit webhook signature:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  const eventType = event.event;
  const roomName = event.room?.name || '';

  // Room name format: peersy-<sessionId>
  if (!roomName || !roomName.startsWith('peersy-')) {
    return res.json(new ApiResponse(200, { received: true }, 'Ignored'));
  }
  const sessionId = roomName.replace('peersy-', '');

  // Validate sessionId is a real UUID before querying.
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(sessionId)) {
    return res.json(new ApiResponse(200, { received: true }, 'Ignored'));
  }

  try {
    if (eventType === 'room_started') {
      await prisma.session.updateMany({
        where: { id: sessionId },
        data: { startedAt: new Date() }
      });
    } else if (eventType === 'participant_joined') {
      await prisma.session.updateMany({
        where: { id: sessionId, startedAt: null },
        data: { startedAt: new Date() }
      });
    } else if (eventType === 'room_finished' || eventType === 'participant_left') {
      const session = await prisma.session.findUnique({ where: { id: sessionId } });
      if (session && session.startedAt && !session.endedAt) {
        const endedAt = new Date();
        const ms = endedAt.getTime() - session.startedAt.getTime();
        const minutes = Math.max(1, Math.ceil(ms / 60000));
        await prisma.session.update({
          where: { id: sessionId },
          data: { endedAt, actualDurationMinutes: minutes }
        });
      }
    }
  } catch (error) {
    console.error('LiveKit webhook handler error:', error);
  }

  res.json(new ApiResponse(200, { received: true }, 'OK'));
};

export { handleLiveKitWebhook };
