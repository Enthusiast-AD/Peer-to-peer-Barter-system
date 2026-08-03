import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Peersy API',
      version: '1.0.0',
      description:
        'Peer-to-peer skill exchange platform. Sessions can be BARTER (skill exchange) or CREDITS (paid with escrowed credits). Time is tracked via LiveKit; organizers (teachers) can report no-shows (warn -> ban).'
    },
    servers: [
      { url: '/api', description: 'API base' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [] // spec defined programmatically below
};

const sessionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    topic: { type: 'string' },
    status: { type: 'string', enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] },
    mode: { type: 'string', enum: ['BARTER', 'CREDITS'] },
    scheduledAt: { type: 'string', format: 'date-time', nullable: true },
    durationMinutes: { type: 'integer' },
    creditsReserved: { type: 'integer' },
    meetingLink: { type: 'string', nullable: true },
    actualDurationMinutes: { type: 'integer', nullable: true },
    teacher: { $ref: '#/components/schemas/UserBrief' },
    learner: { $ref: '#/components/schemas/UserBrief' }
  }
};

options.definition.components.schemas = {
  UserBrief: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      avatar: { type: 'string', nullable: true }
    }
  },
  Skill: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      type: { type: 'string', enum: ['TEACH', 'LEARN'] },
      user: { $ref: '#/components/schemas/UserBrief' }
    }
  },
  Session: sessionSchema,
  ChatMessage: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      content: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      sender: { $ref: '#/components/schemas/UserBrief' }
    }
  },
  TimeProposal: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      proposedAt: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'DECLINED'] },
      proposedBy: { $ref: '#/components/schemas/UserBrief' },
      respondedBy: { $ref: '#/components/schemas/UserBrief', nullable: true }
    }
  },
  Review: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      rating: { type: 'integer', minimum: 1, maximum: 5 },
      comment: { type: 'string', nullable: true }
    }
  },
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    }
  }
};

// --- Paths ---
const paths = {
  '/auth/register': {
    post: {
      summary: 'Register a new account',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } } } } }
      },
      responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } }
    }
  },
  '/auth/login': {
    post: {
      summary: 'Log in with email + password',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } }
      },
      responses: { '200': { description: 'Token + user' }, '401': { description: 'Invalid credentials' } }
    }
  },
  '/auth/google': {
    get: { summary: 'Start Google OAuth flow', tags: ['Auth'], responses: { '302': { description: 'Redirect to Google' } } }
  },
  '/auth/google/callback': {
    get: { summary: 'Google OAuth callback', tags: ['Auth'], responses: { '302': { description: 'Redirect to frontend with token' } } }
  },
  '/users/profile': {
    get: {
      summary: 'Get your profile',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Profile with skills' }, '401': { description: 'Unauthorized' } }
    },
    put: {
      summary: 'Update bio and skills',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { bio: { type: 'string' }, skillsToTeach: { type: 'array', items: { type: 'string' } }, skillsToLearn: { type: 'array', items: { type: 'string' } } } } } }
      },
      responses: { '200': { description: 'Updated profile' }, '400': { description: 'Validation error' } }
    }
  },
  '/users/{userId}/public': {
    get: {
      summary: 'Get a public profile',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Public profile' }, '404': { description: 'Not found' } }
    }
  },
  '/skills/search': {
    get: {
      summary: 'Search skills (case-insensitive, comma-separated, paginated)',
      tags: ['Skills'],
      parameters: [
        { in: 'query', name: 'query', schema: { type: 'string' }, description: 'Skill name(s), comma separated' },
        { in: 'query', name: 'type', schema: { type: 'string', enum: ['TEACH', 'LEARN'] } },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 20, maximum: 50 } }
      ],
      responses: { '200': { description: 'Paginated skill matches' } }
    }
  },
  '/sessions/request': {
    post: {
      summary: 'Request a session (escrows credits for CREDITS mode)',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['teacherId', 'topic'], properties: { teacherId: { type: 'string', format: 'uuid' }, skillId: { type: 'string', format: 'uuid' }, topic: { type: 'string' }, scheduledAt: { type: 'string', format: 'date-time' }, durationMinutes: { type: 'integer' }, mode: { type: 'string', enum: ['BARTER', 'CREDITS'] } } } } }
      },
      responses: { '201': { description: 'Session created' }, '400': { description: 'Insufficient credits / validation' } }
    }
  },
  '/sessions': {
    get: {
      summary: 'List your sessions',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Sessions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Session' } } } } } }
    }
  },
  '/sessions/{id}': {
    get: {
      summary: 'Get a session by id',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'Session' }, '403': { description: 'Not a participant' } }
    },
    put: {
      summary: 'Complete or cancel a session (settles escrow)',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['COMPLETED', 'CANCELLED'] }, actualDuration: { type: 'integer' } } } } }
      },
      responses: { '200': { description: 'Updated' }, '400': { description: 'Invalid transition' } }
    }
  },
  '/sessions/{id}/accept': {
    put: {
      summary: 'Teacher accepts a pending request and picks the arrangement',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { mode: { type: 'string', enum: ['BARTER', 'CREDITS'] }, scheduledAt: { type: 'string', format: 'date-time' } } } } }
      },
      responses: { '200': { description: 'Accepted' }, '403': { description: 'Only teacher' } }
    }
  },
  '/sessions/{id}/join': {
    post: { summary: 'Record participant joining (time tracking)', tags: ['Sessions'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Recorded' } } }
  },
  '/sessions/{id}/leave': {
    post: { summary: 'Record participant leaving (computes elapsed time)', tags: ['Sessions'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Recorded' } } }
  },
  '/sessions/{id}/no-show': {
    post: { summary: 'Teacher reports learner no-show (warning -> ban)', tags: ['Sessions'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Reported' }, '403': { description: 'Only teacher' } } }
  },
  '/sessions/{sessionId}/token': {
    get: {
      summary: 'Get a LiveKit token (join window enforced)',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { '200': { description: 'LiveKit token + room name' }, '400': { description: 'Outside join window' } }
    }
  },
  '/sessions/{sessionId}/review': {
    post: {
      summary: 'Leave a review for a completed session',
      tags: ['Sessions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['rating'], properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } } } }
      },
      responses: { '201': { description: 'Created' }, '409': { description: 'Already reviewed' } }
    }
  },
  '/sessions/{sessionId}/messages': {
    get: { summary: 'Get chat messages', tags: ['Chat'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Messages' } } },
    post: {
      summary: 'Send a chat message',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } } } } },
      responses: { '201': { description: 'Created' } }
    }
  },
  '/sessions/{sessionId}/proposals': {
    get: { summary: 'Get time proposals', tags: ['Chat'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Proposals' } } },
    post: {
      summary: 'Propose a time for the session',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['proposedAt'], properties: { proposedAt: { type: 'string', format: 'date-time' } } } } } },
      responses: { '201': { description: 'Created' } }
    }
  },
  '/sessions/{sessionId}/proposals/{proposalId}/respond': {
    post: {
      summary: 'Accept/decline a time proposal (accept auto-schedules)',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'sessionId', required: true, schema: { type: 'string', format: 'uuid' } },
        { in: 'path', name: 'proposalId', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['accept'], properties: { accept: { type: 'boolean' } } } } } },
      responses: { '200': { description: 'Responded' } }
    }
  },
  '/livekit/webhook': {
    post: {
      summary: 'LiveKit webhook for server-side time tracking',
      tags: ['Webhooks'],
      responses: { '200': { description: 'Acknowledged' }, '401': { description: 'Bad signature' } }
    }
  }
};

options.definition.paths = paths;

const spec = swaggerJsdoc(options);
export default spec;
