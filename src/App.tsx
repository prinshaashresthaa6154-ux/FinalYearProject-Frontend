import { Route, Routes } from "react-router";
import UserLayout from "./layout/UserLayout";
import ListUsers from "./pages/ListUsers";
import UserForm from "./pages/UserForm";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DestinationDetail from "./pages/Destination";
import EverestBooking from "./pages/TripDetails";
import OAuthSuccess from "./pages/0AuthSuccess";
import SuperAdminDashboard from "./pages/Super-Admin/SuperAdmin";
import AllAccountsPanel from "./pages/Super-Admin/sub-pages/AllAccount";
import SystemLogsPanel from "./pages/Super-Admin/sub-pages/SystemLog";
import SystemOverview from "./pages/Super-Admin/sub-pages/SystemOverview";
import EverestTravelerDetails from "./pages/TravelerInfo";
import OtpVerification from "./pages/OtpVerification";
import BookGuide from "./pages/BookGuide";
import GuideProfile from "./pages/GuideProfile";
import GuideBooking from "./pages/GuideBooking";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/list-users" element={<ListUsers />} />
          <Route path="/user-form" element={<UserForm />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OtpVerification />} />
          <Route path="/destinations" element={<DestinationDetail />} />
          <Route path="/guide" element={<BookGuide />} />
          <Route path="/guide/:id/book" element={<GuideBooking />} />
          <Route path="/guide/:id" element={<GuideProfile />} />
          <Route path="/tripdetail" element={<EverestBooking />} />
          <Route path="/travelerinfo" element={<EverestTravelerDetails />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />}>
            <Route index element={<SystemOverview />} />
            <Route path="/superadmin" element={<SystemOverview />} />
            <Route
              path="/superadmin/allaccount"
              element={<AllAccountsPanel />}
            />
            <Route path="/superadmin/systemlog" element={<SystemLogsPanel />} />
          </Route>
        </Route>

        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </>
  );
}

export default App;
