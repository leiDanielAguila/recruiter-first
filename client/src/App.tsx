import "./App.css";
import { useEffect, type ReactElement } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";
import { DashboardLayout } from "@/components/layout";
import { JobUpload } from "@/components/pages/JobUpload";
import { useAuthStore } from "@/services/authStore";
import {
  LetterArchitect,
  SmartPdfEditor,
  JobPool,
  SettingsPage,
  TermsAndConditionsPage,
} from "@/components/pages";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const initialized = useAuthStore((state) => state.initialized);
  const status = useAuthStore((state) => state.status);

  if (!initialized || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Restoring session...
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute() {
  const initialized = useAuthStore((state) => state.initialized);
  const status = useAuthStore((state) => state.status);

  if (!initialized || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Restoring session...
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard/job-pool" replace />;
  }

  return <LandingPage />;
}

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/dashboard/job-pool" replace />}
          />
          <Route path="job-pool" element={<JobPool />} />
          <Route path="job-matcher" element={<JobUpload />} />
          <Route path="letter-architect" element={<LetterArchitect />} />
          <Route path="smart-pdf-editor" element={<SmartPdfEditor />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="terms" element={<TermsAndConditionsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
