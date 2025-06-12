import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { RegisterPage } from "./pages/RegisterPage";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import { Students } from "./pages/Students";
import { Assignments } from "./pages/Assignments";
import { Events } from "./pages/Events";
import { Announcements } from "./pages/Announcements";
import { ParentDashboard } from "./components/parent/ParentDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { Schools } from "./pages/Schools";
import { AnalyticsAndReport } from "./pages/Reports";
import { AdminProfile } from "./pages/AdminProfile";
import { AdminSettings } from "./pages/AdminSettings";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/teacher"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <Students />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <Assignments />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/events"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/announcements"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <Announcements />
            </PrivateRoute>
          }
        />
        <Route
          path="/parent"
          element={
            <PrivateRoute allowedRoles={["Parent"]}>
              <ParentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/schools"
          element={
            <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
              <Schools />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
              <AdminSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
              <AdminProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
              <AnalyticsAndReport />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const AppWrapper = () => <App />;

export default AppWrapper;
