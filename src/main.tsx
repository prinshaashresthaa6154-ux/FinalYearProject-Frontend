import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GroupTripProvider } from "./context/GroupTripContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <GroupTripProvider>
        <App />
      </GroupTripProvider>
    </AuthProvider>
  </BrowserRouter>,
);
