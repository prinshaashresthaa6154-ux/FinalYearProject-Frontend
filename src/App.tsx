
import { Route, Routes } from "react-router"
import UserLayout from "./layout/UserLayout"
import ListUsers from "./pages/ListUsers"
import UserForm from "./pages/UserForm"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import DestinationDetail from "./pages/Destination"
import EverestBooking from "./pages/TripDetails"
import OAuthSuccess from "./pages/0AuthSuccess"
import SuperAdminDashboard from "./pages/SuperAdmin"
import AllAccountsPanel from "./pages/AllAccount"
import SystemLogsPanel from "./pages/SystemLog"

function App() {

  return (
    <>
     <Routes>
      <Route path="/" element = {<UserLayout/> }>
      <Route path="/list-users" element={<ListUsers />} />
      <Route path="/user-form" element={<UserForm />} />
      <Route path="/homepage" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/destinations" element={<DestinationDetail/>}/>
      <Route path="/tripdetail" element={<EverestBooking/>}/>
      <Route path="/superadmin" element={<SuperAdminDashboard/>}/>
      <Route path="/allaccount" element={<AllAccountsPanel/>}/>
      <Route path="/systemlog" element={<SystemLogsPanel/>}/>
      

      </Route>

      <Route path="/oauth-success" element={<OAuthSuccess />} />
     </Routes>
    </>
  )
}

export default App
