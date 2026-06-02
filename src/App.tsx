
import { Route, Routes } from "react-router"
import UserLayout from "./layout/UserLayout"
import ListUsers from "./pages/ListUsers"
import UserForm from "./pages/UserForm"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

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

      </Route>
     </Routes>
    </>
  )
}

export default App
