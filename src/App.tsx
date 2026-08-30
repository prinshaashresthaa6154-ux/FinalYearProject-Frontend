import { Navigate, Route, Routes } from "react-router";
import { APP_ROLES } from "./auth/roles";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import VerificationRoute from "./components/VerificationRoute";
import AdminLayout from "./layout/AdminLayout";
import GuideLayout from "./layout/GuideLayout";
import PublicLayout from "./layout/PublicLayout";
import SuperAdminLayout from "./layout/SuperAdminLayout";
import UserLayout from "./layout/UserLayout";
import AdminBookings from "./pages/Admin/sub-pages/AdminBooking";
import AdminDestinations from "./pages/Admin/sub-pages/AdminDestinations";
import DestinationForm from "./pages/Admin/sub-pages/DestinationForm";
import AdminOverview from "./pages/Admin/sub-pages/AdminOverview";
import AdminProfile from "./pages/Admin/sub-pages/AdminProfile";
import AdminReviews from "./pages/Admin/sub-pages/AdminReview";
import AdminTrips from "./pages/Admin/sub-pages/AdminTrips";
import TripForm from "./pages/Admin/sub-pages/TripForm";
import AdminCategories from "./pages/Admin/sub-pages/AdminCategories";
import AdminSettlements from "./pages/Admin/sub-pages/AdminSettlements";
import CategoryForm from "./pages/Admin/sub-pages/CategoryForm";
import BookGuide from "./pages/BookGuide";
import DestinationDetail from "./pages/Destination";
import Destinations from "./pages/Destinations";
import ForgotPassword from "./pages/ForgotPassword";
import GroupChat from "./pages/GroupChat";
import GroupTrips from "./pages/GroupTrips";
import Earnings from "./pages/Guide-Dashboard/sub-pages/Earning";
import GroupRequests from "./pages/Guide-Dashboard/sub-pages/GroupRequests";
import GuideOverview from "./pages/Guide-Dashboard/sub-pages/Overview";
import GuideProfilePage from "./pages/Guide-Dashboard/sub-pages/GuideProfilePage";
import Messages from "./pages/Guide-Dashboard/sub-pages/Messages";
import MyTrips from "./pages/Guide-Dashboard/sub-pages/MyTrips";
import Reviews from "./pages/Guide-Dashboard/sub-pages/Reviews";
import GuideAvailability from "./pages/Guide-Dashboard/sub-pages/Availability";
import GuideProfile from "./pages/GuideProfile";
import Home from "./pages/Home";
import ListUsers from "./pages/ListUsers";
import Login from "./pages/Login";
import OAuthSuccess from "./pages/0AuthSuccess";
import OtpVerification from "./pages/OtpVerification";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AllAccountsPanel from "./pages/Super-Admin/sub-pages/AllAccount";
import Analytics from "./pages/Super-Admin/sub-pages/Analytics";
import PlatformSettings from "./pages/Super-Admin/sub-pages/PlatformSettings";
import SystemLogsPanel from "./pages/Super-Admin/sub-pages/SystemLog";
import SystemOverview from "./pages/Super-Admin/sub-pages/SystemOverview";
import EverestBooking from "./pages/TripDetails";
import EverestTravelerDetails from "./pages/TravelerInfo";
import UserForm from "./pages/UserForm";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import AdminVerificationStatusPage from "./pages/AdminVerificationStatus";
import ChangePassword from "./pages/ChangePassword";
import EmailVerification from "./pages/EmailVerification";
import GuideVerificationStatus from "./pages/GuideVerificationStatus";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import TripPage from "./pages/TripPage";
import TripSearch from "./pages/TripSearch";
import Checkout from "./pages/Checkout";
import BookingStatus from "./pages/BookingStatus";
import UserBookings from "./pages/UserBookings";
import PaymentResult from "./pages/PaymentResult";
import PaymentOperationsPage from "./pages/PaymentOperationsPage";
import UserGroups from "./pages/UserGroups";
import UserReviews from "./pages/UserReviews";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import FavoritesPage from "./pages/FavoritesPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import UserDashboard from "./pages/UserDashboard";
import PlatformResourcePage from "./pages/Super-Admin/PlatformResourcePage";
import VerificationPage from "./pages/Super-Admin/VerificationPage";
import AuditLogsPage from "./pages/Super-Admin/AuditLogsPage";
import UserManagementPage from "./pages/Super-Admin/UserManagementPage";
import ReportsDashboard from "./pages/ReportsDashboard";
import FreelanceGuides from "./pages/FreelanceGuides";
import FreelanceGuideDetail from "./pages/FreelanceGuideDetail";
import LegacyFreelanceProfile from "./pages/Guide-Dashboard/sub-pages/LegacyFreelanceProfile";
import TravelPackages from "./pages/TravelPackages";
import TravelPackageDetail from "./pages/TravelPackageDetail";
import GuideAccessRoute from "./components/GuideAccessRoute";
import BookingAccessRoute from "./components/BookingAccessRoute";
import GuideBookings from "./pages/GuideBookings";
import GuideBookingOperations from "./pages/GuideBookingOperations";
import SettlementsPage from "./pages/Super-Admin/SettlementsPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="register/admin"
        element={<Navigate to="/register?role=admin" replace />}
      />
      <Route
        path="register/guide"
        element={<Navigate to="/register?role=guide" replace />}
      />
      <Route
        path="guide/verification-status"
        element={<GuideVerificationStatus />}
      />
      <Route
        path="admin/verification-status"
        element={<AdminVerificationStatusPage />}
      />
      <Route
        path="pending-verification"
        element={<AdminVerificationStatusPage />}
      />
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<EmailVerification />} />
        <Route path="register" element={<Register />} />
        <Route path="otp" element={<OtpVerification />} />
        <Route path="verify-account" element={<OtpVerification />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="destinations/:slug" element={<DestinationDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:slug" element={<CategoryDetail />} />
        <Route path="trips/:slug" element={<TripPage />} />
        <Route path="trips" element={<TripSearch />} />
        <Route path="search" element={<TripSearch />} />
        <Route path="grouptrips" element={<GroupTrips />} />
        <Route path="guide" element={<BookGuide />} />
        <Route path="guides" element={<BookGuide />} />
        <Route path="guides/:id" element={<GuideProfile />} />
        <Route path="travel-packages" element={<TravelPackages />} />
        <Route path="travel-packages/:id" element={<TravelPackageDetail />} />
        <Route path="guideprofile/:id" element={<GuideProfile />} />
        <Route path="freelance-guides" element={<FreelanceGuides />} />
        <Route path="freelance-guides/:id" element={<FreelanceGuideDetail />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<ProfileEdit />} />
          <Route path="profile/change-password" element={<ChangePassword />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route element={<VerificationRoute />}>
          <Route element={<RoleRoute allowedRoles={[APP_ROLES.USER]} />}>
            <Route element={<UserLayout />}>
              <Route path="list-users" element={<ListUsers />} />
              <Route path="user-form" element={<UserForm />} />
              <Route path="groupchat" element={<GroupChat />} />
              <Route path="grouptrips/:tripId/chat" element={<GroupChat />} />
              <Route element={<BookingAccessRoute />}>
                <Route path="checkout" element={<Checkout />} />
                <Route path="booking/success" element={<BookingStatus />} />
                <Route path="booking/failed" element={<BookingStatus />} />
                <Route
                  path="payment/success"
                  element={<PaymentResult kind="success" />}
                />
                <Route
                  path="payment/failed"
                  element={<PaymentResult kind="failed" />}
                />
                <Route
                  path="payment/cancelled"
                  element={<PaymentResult kind="cancelled" />}
                />
                <Route path="booking/:id" element={<BookingStatus />} />
                <Route path="user/bookings" element={<UserBookings />} />
              </Route>
              <Route path="user/groups" element={<UserGroups />} />
              <Route path="user/guide-bookings" element={<GuideBookings />} />
              <Route path="user/reviews" element={<UserReviews />} />
              <Route path="user/messages" element={<MessagesPage />} />
              <Route
                path="user/notifications"
                element={<NotificationsPage />}
              />
              <Route path="user/favorites" element={<FavoritesPage />} />
              <Route
                path="user/recommendations"
                element={<RecommendationsPage />}
              />
              <Route path="user/profile" element={<Profile />} />
              <Route path="tripdetail" element={<EverestBooking />} />
              <Route path="travelerinfo" element={<EverestTravelerDetails />} />
              <Route path="user/dashboard" element={<UserDashboard />} />
            </Route>
          </Route>

          <Route
            element={<RoleRoute allowedRoles={[APP_ROLES.FREELANCE_GUIDE]} />}
          >
            <Route element={<GuideAccessRoute />}>
              <Route path="guide/dashboard" element={<GuideLayout />}>
                <Route index element={<GuideOverview />} />
              </Route>
              <Route path="guide" element={<GuideLayout />}>
                <Route path="profile" element={<GuideProfilePage />} />
                <Route
                  path="legacy-profile"
                  element={<LegacyFreelanceProfile />}
                />
                <Route path="availability" element={<GuideAvailability />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              <Route path="guidedashboard" element={<GuideLayout />}>
                <Route index element={<GuideOverview />} />
                <Route path="trips" element={<MyTrips />} />
                <Route path="requests" element={<GroupRequests />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="messages" element={<Messages />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="availability" element={<GuideAvailability />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<GuideProfilePage />} />
                <Route
                  path="legacy-profile"
                  element={<LegacyFreelanceProfile />}
                />
              </Route>
            </Route>
          </Route>

          <Route element={<VerificationRoute />}>
            <Route element={<RoleRoute allowedRoles={[APP_ROLES.ADMIN]} />}>
              <Route path="admin/dashboard" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
              </Route>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="guides" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="destinations" element={<AdminDestinations />} />
                <Route
                  path="destinations/create"
                  element={<DestinationForm />}
                />
                <Route
                  path="destinations/:id/edit"
                  element={<DestinationForm />}
                />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="categories/create" element={<CategoryForm />} />
                <Route path="categories/:id/edit" element={<CategoryForm />} />
                <Route path="trips" element={<AdminTrips />} />
                <Route path="trips/create" element={<TripForm />} />
                <Route path="trips/:id" element={<TripPage preview />} />
                <Route path="trips/:id/edit" element={<TripForm />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="guide-bookings" element={<GuideBookingOperations />} />
                <Route path="group-trips" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="groups" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route
                  path="reports"
                  element={<ReportsDashboard scope="admin" />}
                />
                <Route path="payments" element={<PaymentOperationsPage />} />
                <Route path="settlements" element={<AdminSettlements />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={[APP_ROLES.SUPERADMIN]} />}>
            <Route path="superadmin/dashboard" element={<SuperAdminLayout />}>
              <Route index element={<SystemOverview />} />
            </Route>
            <Route path="superadmin" element={<SuperAdminLayout />}>
              <Route index element={<SystemOverview />} />
              <Route path="verifications" element={<VerificationPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route
                path="admins"
                element={<PlatformResourcePage resource="admins" />}
              />
              <Route
                path="guides"
                element={<PlatformResourcePage resource="guides" />}
              />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/:id/edit" element={<CategoryForm />} />
              <Route path="destinations" element={<AdminDestinations />} />
              <Route
                path="destinations/:id/edit"
                element={<DestinationForm />}
              />
              <Route path="trips" element={<AdminTrips />} />
              <Route path="trips/:id/edit" element={<TripForm />} />
              <Route path="guide-bookings" element={<GuideBookingOperations />} />
              <Route
                path="payments"
                element={<PaymentOperationsPage superAdmin />}
              />
              <Route path="settlements" element={<SettlementsPage />} />
              <Route
                path="reports"
                element={<ReportsDashboard scope="superadmin" />}
              />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="allaccount" element={<AllAccountsPanel />} />
              <Route path="systemlog" element={<SystemLogsPanel />} />
              <Route path="platformsettings" element={<PlatformSettings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="oauth-success" element={<OAuthSuccess />} />
    </Routes>
  );
}
