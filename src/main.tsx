import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./auth/Login.tsx";
import Register from "./auth/Register.tsx";
import Services from "./pages/Services.tsx";
import Contact from "./pages/Contact.tsx";

const router = createBrowserRouter([  
  {
    path: "/",
    element: <App />,
  },
  { path: "/services", element: <Services /> },
  { path: "/contact", element: <Contact /> },
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/register", element: <Register /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
