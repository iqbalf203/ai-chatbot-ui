import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import "./index.css";

import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "./components/Toast";


function RootContent() {
  const { isAuthenticated, isLoading } =
    useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100vh",
          background: "#0b0d10",
          color: "#f5f5f5",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
              animation:
                "float 3s ease-in-out infinite",
            }}
          >
            ✦
          </div>
          <p
            style={{
              margin: 0,
              color: "#a5abb4",
            }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <App />
      ) : (
        <AuthPage />
      )}
      <ToastContainer />
    </>
  );
}


createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  </StrictMode>
);