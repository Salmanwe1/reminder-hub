import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthLayout from "./layout/AuthLayout";
import TeacherDashboardLayout from "./layout/TeacherDashboardLayout";
import StudentDashboardLayout from "./layout/StudentDashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateReminder from "./pages/CreateReminder";
import Settings from "./pages/Settings";
import LoadingSpinner from "./components/LoadingSpinner";
import PrivateRoute from "./components/PrivateRoute";
import CreateTeacherReminder from "./pages/CreateTeacherReminder";

function RoleBasedRedirect() {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" />;

  // Redirect based on the user's role
  return role === "teacher" ? (
    <Navigate to="/teacher/dashboard" />
  ) : (
    <Navigate to="/student/dashboard" />
  );
}

function App() {
  const { user, role, isLoading } = useAuth();

  // Show loading spinner while user authentication and role are being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Default Role-Based Redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Teacher Routes */}
        {user && role === "teacher" && (
          <Route
            path="/teacher/*"
            element={
              <PrivateRoute roleRequired="teacher">
                <TeacherDashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="create-reminder" element={<CreateTeacherReminder />}/>
          </Route>
        )}

        {/* Student Routes */}
        {user && role === "student" && (
          <Route
            path="/student/*"
            element={
              <PrivateRoute roleRequired="student">
                <StudentDashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="create-reminder" element={<CreateReminder />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        )}

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
