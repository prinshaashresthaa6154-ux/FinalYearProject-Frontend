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
import PlatformSettings from "./pages/Super-Admin/sub-pages/PlatformSettings";
import Analytics from "./pages/Super-Admin/sub-pages/Analytics";
import EverestTravelerDetails from "./pages/TravelerInfo";
import OtpVerification from "./pages/OtpVerification";
import GroupTrips from "./pages/GroupTrips";
import GroupChat from "./pages/GroupChat";
import BookGuide from "./pages/BookGuide";
import GuideProfile from "./pages/GuideProfile";
import GuideBooking from "./pages/GuideBooking";
import TripDetailsStep from "./pages/guide-booking/TripDetailsStep";
import YourInfoStep from "./pages/guide-booking/YourInfoStep";
import PaymentStep from "./pages/guide-booking/PaymentStep";

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
          <Route path="/grouptrips" element={<GroupTrips />} />
          <Route path="/groupchat" element={<GroupChat />} />
          <Route path="/guide" element={<BookGuide />} />
          <Route path="/guidebook" element={<GuideBooking />}>
            <Route index element={<TripDetailsStep />} />
            <Route path="your-info" element={<YourInfoStep />} />
            <Route path="payment" element={<PaymentStep />} />
          </Route>
          <Route path="/guideprofile" element={<GuideProfile />} />
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
            <Route
              path="/superadmin/platformsettings"
              element={<PlatformSettings />}
            />
            <Route path="/superadmin/analytics" element={<Analytics />} />
          </Route>
        </Route>

        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </>
  );
}

export default App;
