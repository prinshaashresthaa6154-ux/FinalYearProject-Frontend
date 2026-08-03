import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GroupTripProvider } from "./context/GroupTripContext.tsx";
import { GuideAvatarProvider } from "./pages/Guide-Dashboard/GuideAvatarContext.tsx";
<<<<<<< HEAD
import { AdminPlatformProvider } from "./context/AdminPlatformContext.tsx";
=======
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <GroupTripProvider>
        <GuideAvatarProvider>
<<<<<<< HEAD
          <AdminPlatformProvider>
            <App />
          </AdminPlatformProvider>
=======
          <App />
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
        </GuideAvatarProvider>
      </GroupTripProvider>
    </AuthProvider>
  </BrowserRouter>,
);
