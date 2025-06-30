import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./middleware/ProtectedRoute";
import RegisterParent from "./pages/RegisterParent";
import RegisterTherapist from "./pages/RegisterTherapist";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateTherapyModule from "./pages/CreateTherapyModule";
import ProgressReport from "./pages/ProgressReport";
import InteractiveSession from "./pages/InteractiveSession";
import ScheduleSession from "./pages/ScheduleSession";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import ProfileMenu from "./component/ProfileMenu";
import TherapyModules from "./pages/TherapyModules";
import ModuleDetail from "./pages/ModuleDetails";
import Navigation from "./component/Navigation";
import Footer from "./component/Footer";
import VerificationBanner from "./component/VerificationBanner";
import EmailVerificationSuccess from "./pages/EmailVerificationSuccess";
import TherapistDashboard from "./pages/TherapistDashboard";

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Navigation />
      {user &&
        !user.isVerified &&
        user.role !== "child" &&
        user.role !== "admin" && <VerificationBanner />}
      <div className="container mx-auto  bg-white ">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterParent />} />
          <Route path="/register/therapist" element={<RegisterTherapist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/therapy-modules" element={<TherapyModules />} />
          <Route path="/support" element={<Support />} />
          <Route path="/verify-email" element={<EmailVerificationSuccess />} />
          <Route
            path="/module/:moduleId"
            element={
              <ProtectedRoute
                allowedRoles={["parent", "child", "therapist", "admin"]}
              >
                <ModuleDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <ProtectedRoute
                allowedRoles={["parent", "child", "therapist", "admin"]}
              >
                <ProgressReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interactive-session"
            element={
              <ProtectedRoute allowedRoles={["parent", "child", "therapist"]}>
                <InteractiveSession />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule"
            element={
              <ProtectedRoute allowedRoles={["parent", "therapist", "child"]}>
                <ScheduleSession />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-therapy"
            element={
              <ProtectedRoute allowedRoles={["therapist"]}>
                <CreateTherapyModule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patientDashboard"
            element={
              <ProtectedRoute allowedRoles={["therapist"]}>
                <TherapistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
