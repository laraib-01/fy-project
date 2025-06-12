import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import { LandingPage } from "./components/LandingPage";
import { RegisterPage } from "./components/RegisterPage";
import PrivateRoute from "./components/PrivateRoute";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { ParentDashboard } from "./components/parent/ParentDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import Students from "./components/teacher/Students";
import Events from "./components/teacher/Events";
import { Assignments } from "./components/teacher/Assignments";
import { Announcements } from "./components/teacher/Announcements";
import AdminSchools from "./components/admin/Schools";

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
              <AdminSchools />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const AppWrapper = () => <App />;

export default AppWrapper;
