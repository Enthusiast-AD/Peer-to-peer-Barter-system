# API Documentation

> **Interactive docs:** When the backend is running, open `http://localhost:8000/api/docs` for the live Swagger UI (OpenAPI 3.0).

Base URL: `http://localhost:8000/api`

## Authentication

### Register
- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: `201 Created`

### Login
- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` (Returns token and user object)

### Google Login
- **Endpoint**: `/auth/google`
- **Method**: `GET`
- **Description**: Redirects to Google Login. After login, redirects to `http://localhost:5173/oauth/callback?token=...`

## Users

### Get Profile
- **Endpoint**: `/users/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Update Profile
- **Endpoint**: `/users/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "bio": "I love coding",
    "skillsToTeach": ["React", "Node.js"],
    "skillsToLearn": ["Python"]
  }
  ```

## Skills / Matching

### Search Skills
- **Endpoint**: `/skills/search`
- **Method**: `GET`
- **Query Params**: 
  - `query`: String (e.g., "Python")
  - `type`: "TEACH" | "LEARN" (optional)
- **Response**: `200 OK` (Returns users offering/wanting this skill)

## Sessions

### Create Session Request
- **Endpoint**: `/sessions/request`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "teacherId": "uuid",
    "skillId": "uuid",
    "topic": "Intro to Python",
    "scheduledAt": "2023-12-25T10:00:00Z",
    "durationMinutes": 60,
    "mode": "BARTER"
  }
  ```
- **Notes**: `mode` is `"BARTER"` (skill exchange, no credits) or `"CREDITS"` (credit-paid).
  For CREDITS, the full cost (durationMinutes credits) is escrowed from the requester's balance at request time.
  The teacher is notified by email with the requester's details and what they can teach in exchange.

### Get My Sessions
- **Endpoint**: `/sessions`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Get Session by ID
- **Endpoint**: `/sessions/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Accept Session (teacher / organizer)
- **Endpoint**: `/sessions/:id/accept`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "mode": "BARTER",
    "scheduledAt": "2023-12-25T10:00:00Z"
  }
  ```
- **Notes**: Only the teacher can accept. The teacher picks the final arrangement.
  If CREDITS, escrow happens now (if not already escrowed). If switching to BARTER, any escrow is refunded.

### Update Session Status
- **Endpoint**: `/sessions/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "COMPLETED"
  }
  ```
- **Notes**: `status` can be `"COMPLETED"` or `"CANCELLED"`.
  On COMPLETED, the actual elapsed time (tracked via join/leave or LiveKit webhook) is billed to the learner
  and paid to the teacher; the unused escrow remainder is refunded. On CANCELLED, the escrow is fully refunded.

### Record Join / Leave (time tracking)
- **Endpoint**: `/sessions/:id/join` and `/sessions/:id/leave`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Notes**: Called by the MeetingRoom when the participant connects/disconnects.
  Elapsed time is computed server-side from these timestamps.

### Report No-Show (teacher / organizer)
- **Endpoint**: `/sessions/:id/no-show`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "reason": "optional note" }`
- **Notes**: Only the teacher can report. The report can only be filed **2 minutes after the scheduled start time**.
  It is **not applied automatically** - an admin must review it (approve issues a warning; a second approval bans).

## Admin

### Admin Access
- Admin accounts are **bootstrapped from `.env`** (`ADMIN_EMAIL` + `ADMIN_PASSWORD`) on server start.
  Log in with those credentials on the login page.
- All admin endpoints require `Authorization: Bearer <admin token>`.

### Admin Dashboard Stats
- **Endpoint**: `GET /admin/dashboard`
- **Summary**: User/session/review/pending counts.

### List Users
- **Endpoint**: `GET /admin/users?q=&page=&pageSize=`
- **Summary**: Search and paginate users; includes warnings/banned/admin flags.

### Ban / Unban User
- **Endpoint**: `PUT /admin/users/:userId/ban`
- **Body**: `{ "banned": true }`

### Reset Warnings
- **Endpoint**: `PUT /admin/users/:userId/reset-warnings`

### List No-Show Reports
- **Endpoint**: `GET /admin/reports`
- **Summary**: All reports with session/teacher/learner details and status.

### Review No-Show Report
- **Endpoint**: `PUT /admin/reports/:reportId/review`
- **Body**: `{ "approve": true }`
- **Notes**: On approval the reported user gets a warning (or ban on second) and the teacher
  keeps escrowed credits. On rejection the session's no-show flags are cleared.

### LiveKit Webhook
- **Endpoint**: `POST /api/livekit/webhook`
- **Method**: `POST`
- **Headers**: `webhook-signature: <signature>`
- **Notes**: Configure this URL in your LiveKit project settings so the server can track
  real participant join/leave times. Raw body required (signed).

## Session Chat & Time Scheduling

### Get Messages
- **Endpoint**: `/sessions/:sessionId/messages`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Send Message
- **Endpoint**: `/sessions/:sessionId/messages`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "content": "Hi, can we meet at 3pm?" }`

### Get Time Proposals
- **Endpoint**: `/sessions/:sessionId/proposals`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Propose a Time
- **Endpoint**: `/sessions/:sessionId/proposals`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "proposedAt": "2023-12-25T15:00:00Z" }`

### Respond to a Proposal
- **Endpoint**: `/sessions/:sessionId/proposals/:proposalId/respond`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "accept": true }`
- **Notes**: When accepted, the session is automatically scheduled at that time and all
  other pending proposals are declined. Both parties must agree.

### Add Review
- **Endpoint**: `/sessions/:sessionId/review`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "rating": 5,
    "comment": "Great session!"
  }
  ```
