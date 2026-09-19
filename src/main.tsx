import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./auth/Login.tsx";
import Register from "./auth/Register.tsx";
import Services from "./pages/Services.tsx";
import Contact from "./pages/Contact.tsx";
import About from "./pages/About.tsx";
import DashboardDoctor from "./doctor/pages/Dashboard.tsx";
import DashboardAdmin from "./admin/pages/Dashboard.tsx";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "/services", element: <Services /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/register", element: <Register /> },
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
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardAdmin />
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
