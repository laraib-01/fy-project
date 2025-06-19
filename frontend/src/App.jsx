import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { Students } from "./pages/Students";
import { Assignments } from "./pages/Assignments";
import { Events } from "./pages/Events";
import { Announcements } from "./pages/Announcements";
import { Schools } from "./pages/Schools";
import { AnalyticsAndReport } from "./pages/reports/Reports";
import { AdminProfile } from "./pages/AdminProfile";
import { AdminSettings } from "./pages/AdminSettings";
import { TeacherProfile } from "./pages/TeacherProfile";
import { TeacherLayout } from "./layouts/TeacherLayout";
import { SchoolAdminLayout } from "./layouts/SchoolAdminLayout";
import { Subscriptions } from "./pages/subscriptions/Subscriptions";
import { Transactions } from "./pages/transactions/Transactions";
import { AdminLayout } from "./layouts/AdminLayout";
import { TeacherDashboard } from "./pages/dashboard/TeacherDashboard";
import ParentLayout from "./layouts/ParentLayout";
import { ParentDashboard } from "./pages/dashboard/ParentDashboard";
import { SchoolAdminDashboard } from "./pages/dashboard/SchoolAdminDashboard";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { Classes } from "./pages/classes/Classes";
import { Teachers } from "./pages/teachers/Teachers";

const AppWrapper = () => {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/teacher"
        element={
          <PrivateRoute allowedRoles={["Teacher"]}>
            <TeacherLayout>
              <TeacherDashboard />
            </TeacherLayout>
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
            <TeacherLayout>
              <Assignments />
            </TeacherLayout>
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
            <TeacherLayout>
              <Announcements />
            </TeacherLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <PrivateRoute allowedRoles={["Teacher"]}>
            <TeacherLayout>
              <TeacherProfile />
            </TeacherLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/parent"
        element={
          <PrivateRoute allowedRoles={["Parent"]}>
            <ParentLayout>
              <ParentDashboard />
            </ParentLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school"
        element={
          <PrivateRoute allowedRoles={["School_Admin"]}>
            <SchoolAdminLayout>
              <SchoolAdminDashboard />
            </SchoolAdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school/teachers"
        element={
          <PrivateRoute allowedRoles={["School_Admin"]}>
            <SchoolAdminLayout>
              <Teachers />
            </SchoolAdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school/classes"
        element={
          <PrivateRoute allowedRoles={["School_Admin"]}>
            <SchoolAdminLayout>
              <Classes />
            </SchoolAdminLayout>
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
          <PrivateRoute allowedRoles={["School_Admin"]}>
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
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/schools"
        element={
          <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
            <AdminLayout>
              <Schools />
            </AdminLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/subscriptions"
        element={
          <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
            <AdminLayout>
              <Subscriptions />
            </AdminLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/transactions"
        element={
          <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
            <AdminLayout>
              <Transactions />
            </AdminLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute allowedRoles={["EduConnect_Admin"]}>
            <AdminLayout>
              <AnalyticsAndReport />
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
