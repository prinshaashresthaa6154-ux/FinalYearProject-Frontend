
import { Route, Routes } from "react-router"
import UserLayout from "./layout/UserLayout"
import ListUsers from "./pages/ListUsers"
import UserForm from "./pages/UserForm"

function App() {

  return (
    <>
     <Routes>
      <Route path="/" element = {<UserLayout/> }>
      <Route path="/list-users" element={<ListUsers />} />
      <Route path="/user-form" element={<UserForm />} />

      </Route>
     </Routes>
    </>
  )
}

export default App
