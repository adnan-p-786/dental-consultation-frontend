import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Login from "./auth/Login.tsx";
import Register from "./auth/Register.tsx";
import DashboardDoctor from "./doctor/pages/Dashboard.tsx";
import DashboardAdmin from "./admin/pages/Dashboard.tsx";
import PatientPortal from "./pages/PatientPortal.tsx";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Appointment from "./pages/Appointment.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "/services", element: <Navigate to="/" replace /> },
  { path: "/about", element: <Navigate to="/" replace /> },
  { path: "/contact", element: <Navigate to="/" replace /> },
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/register", element: <Register /> },
  {
    path: "/appointment",
    element: (
      <ProtectedRoute>
        <Appointment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/appointments",
    element: (
      <ProtectedRoute>
        <Appointment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <DashboardDoctor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
        <DashboardAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/portal",
    element: (
      <ProtectedRoute allowedRoles={["patient", "admin", "superadmin"]}>
        <PatientPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["patient", "admin", "superadmin"]}>
        <PatientPortal />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  </StrictMode>,
);
