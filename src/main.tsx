import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GroupTripProvider } from "./context/GroupTripContext.tsx";
import { GuideAvatarProvider } from "./pages/Guide-Dashboard/GuideAvatarContext.tsx";
import { AdminPlatformProvider } from "./context/AdminPlatformContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <GroupTripProvider>
        <GuideAvatarProvider>
          <AdminPlatformProvider>
            <App />
          </AdminPlatformProvider>
        </GuideAvatarProvider>
      </GroupTripProvider>
    </AuthProvider>
  </BrowserRouter>,
);
