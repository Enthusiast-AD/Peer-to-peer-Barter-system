# Peersy - Student Skill Barter System

Peersy is a peer-to-peer skill exchange platform designed for students. It facilitates the sharing of knowledge without monetary transactions, allowing users to teach a skill they possess in exchange for learning something new.

![Peersy Banner](client/src/assets/banner.svg)

## 🚀 Features

-   **User Authentication**: Secure sign-up and login with JWT and Google OAuth integration.
-   **Skill Management**: Users can list skills they can teach and skills they want to learn.
-   **Smart Matching**: The system suggests potential barter partners based on complementary skills.
-   **Real-time Communication**: Integrated chat and video conferencing for seamless sessions.
-   **Session Scheduling**: Organize and manage learning sessions efficiently.
-   **Reputation System**: Rate and review partners to build trust within the community.
-   **Dashboard**: A personalized hub for managing sessions, requests, and progress.
-   **Modern UI**: A clean, responsive interface built with React and Tailwind CSS v4.

## 🛠️ Tech Stack

### Client
-   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
-   **State Management**: React Context API
-   **HTTP Client**: Axios

### Server
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
-   **Authentication**: [Passport.js](https://www.passportjs.org/) (Google Strategy), JWT
-   **Video**: [LiveKit](https://livekit.io/) (open-source, self-hostable)

## 📦 Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18+ recommended)
*   PostgreSQL
*   npm or pnpm

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/peersy.git
cd peersy
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
# or
pnpm install
```

Create a `.env` file in the `backend` directory based on the `.env.example` (or use the variables below):

```env
PORT=8000
DATABASE_URL=postgres://user:password@localhost:5432/peersy_db
JWT_SECRET=your_long_random_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173

# LiveKit (required for video sessions) - get from https://cloud.livekit.io
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

Run database migrations and generate the Prisma client:

```bash
npm run db:generate
npm run db:migrate
```

Start the backend server:

```bash
npm run dev
```

The server will start at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
# or
pnpm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```
barter-system/
├── backend/                # Express.js API Gateway & Logic
│   ├── controllers/        # Request handlers (User, Auth, Session, Skill)
│   ├── db/                 # Database connection config
│   ├── middlewares/        # Custom middlewares (Auth, Error handling)
│   ├── models/             # Sequelize models (User, Skill, Session, Review)
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions (ApiError, ApiResponse)
│   ├── index.js            # Server entry point
│   └── passport.js         # Passport.js strategy configuration
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Reusable UI components (Navbar, Footer, Shadcn UI)
│   │   │   ├── context/    # React Context providers (AuthContext)
│   │   │   ├── pages/      # Application views/pages
│   │   │   └── services/   # API integration services (Axios)
│   │   ├── assets/         # Static assets (Images, SVGs)
│   │   ├── styles/         # Global styles & Tailwind layers
│   │   └── main.tsx        # React entry point
│   ├── index.html          # HTML template
│   ├── postcss.config.mjs  # PostCSS configuration
│   └── vite.config.ts      # Vite bundler configuration
└── README.md
```

## 🤝 Contributing

Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
