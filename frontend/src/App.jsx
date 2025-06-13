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
import { TeacherProfile } from "./pages/TeacherProfile";
import { SchoolAdminDashboard } from "./components/school-admin/SchoolAdminDashboard";
import TeacherLayout from "./components/teacher/TeacherLayout";
import { SchoolAdminLayout } from "./components/school-admin/SchoolAdminLayout";

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
              <TeacherLayout>
                <Students />
              </TeacherLayout>
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
              <TeacherLayout>
                <Events />
              </TeacherLayout>
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
          path="/teacher/profile"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <TeacherProfile />
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
          path="/school"
          element={
            <PrivateRoute allowedRoles={["School_Admin"]}>
              <SchoolAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/school/students"
          element={
            <PrivateRoute allowedRoles={["School_Admin"]}>
              <SchoolAdminLayout>
                <Students />
              </SchoolAdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/school/events"
          element={
            <PrivateRoute allowedRoles={["Teacher"]}>
              <SchoolAdminLayout>
                <Events />
              </SchoolAdminLayout>
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
