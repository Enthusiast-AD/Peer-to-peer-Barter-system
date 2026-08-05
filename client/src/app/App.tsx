import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingScreen } from "./components/LoadingScreen";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GoogleCallback from "./pages/GoogleCallback";
import HelpCenter from "./pages/knowledge/HelpCenter";
import SafetyGuidelines from "./pages/knowledge/SafetyGuidelines";
import TermsOfService from "./pages/knowledge/TermsOfService";
import PrivacyPolicy from "./pages/knowledge/PrivacyPolicy";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import SkillProfile from "./pages/dashboard/SkillProfile";
import Matching from "./pages/dashboard/Matching";
import Sessions from "./pages/dashboard/Sessions";
import Credits from "./pages/dashboard/Credits";
import MeetingRoom from "./pages/dashboard/MeetingRoom";
import SessionReview from "./pages/dashboard/SessionReview";
import SessionDetail from "./pages/dashboard/SessionDetail";
import AdminPanel from "./pages/dashboard/AdminPanel";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import Inbox from "./pages/dashboard/Inbox";
import StandaloneMeeting from "./pages/meet/StandaloneMeeting";
import UserPublicProfile from "./pages/dashboard/UserPublicProfile";

/**
 * Peersy - Peer-to-Peer Skill Exchange Platform
 *
 * Main application with routing for:
 * - Landing page
 * - Authentication (Login/Signup)
 * - Dashboard with skill matching, sessions, and credits
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SyncSiteHead() {
  useEffect(() => {
    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "https://peer-to-peer-barter-system.onrender.com/api";
    const feedUrl = `${apiUrl}/feeds/skills.rss`;
    let link = document.head.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][type="application/rss+xml"]'
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.type = "application/rss+xml";
      document.head.appendChild(link);
    }
    link.title = "Peersy - Latest Skills";
    link.href = feedUrl;
  }, []);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <ScrollToTop />
        <SyncSiteHead />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth/callback" element={<GoogleCallback />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/safety" element={<SafetyGuidelines />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Standalone meeting (opens in a new tab, full-screen) */}
          <Route
            path="/meet/:sessionId"
            element={
              <ProtectedRoute>
                <StandaloneMeeting />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="profile" element={<SkillProfile />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route path="matching" element={<Matching />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="credits" element={<Credits />} />
            <Route path="user/:userId" element={<UserPublicProfile />} />
            <Route path="users/:userId" element={<UserPublicProfile />} />
            <Route path="room/:sessionId" element={<MeetingRoom />} />
            <Route path="session/:sessionId/room" element={<MeetingRoom />} />
            <Route path="session/:sessionId" element={<SessionDetail />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route
              path="session/:sessionId/review"
              element={<SessionReview />}
            />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
